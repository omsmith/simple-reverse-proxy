'use strict';

var http = require('http'),
	httpProxy = require('http-proxy'),
	Router = require('./router');

module.exports = RoutingProxy;

function RoutingProxy (options) {
	this.proxy = httpProxy.createProxyServer(options);
	this.router = new Router();
	this.server = http.createServer(this.router.dispatch.bind(this.router));
}

RoutingProxy.prototype.listen = function () {
	this.server.listen.apply(this.server, arguments);
	return this;
};

RoutingProxy.prototype.when = function () {
	this.router.when.apply(this.router, arguments);
	return this;
};

RoutingProxy.prototype.upstream = function (route, _upstreams) {
	var upstreams = _upstreams;
	if (typeof upstreams === 'string') {
		upstreams = [upstreams];
	}

	this.router.when(route, upstreamer.bind(undefined, {
		proxy: this.proxy,
		upstreams: upstreams.slice(),
		i: 0
	}));

	return this;
};

function upstreamer (ctx, req, res) {
	var upstreams = ctx.upstreams;
	if (upstreams.length === 0) {
		send502();
		return;
	}

	ctx.i = (ctx.i + 1) % upstreams.length;
	var upstream = upstreams[ctx.i];

	ctx.proxy.web(req, res, {
		target: upstream
	}, function (err) {
		if (err.code === 'ECONNREFUSED' || err.code === 'EHOSTUNREACH') {
			var index = upstreams.indexOf(upstream);
			if (index !== -1) {
				upstreams.splice(upstreams.indexOf(upstream), 1);
				setTimeout(function () {
					upstreams.push(upstream);
				}, 5000);
			}

			send502();
			return;
		}

		if (err.code === 'ECONNRESET') {
			send502();
			return;
		}

		throw(err);
	});

	function send502 () {
		res.statusCode = 502;
		res.end();
	}
}
