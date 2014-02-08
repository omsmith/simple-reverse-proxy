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
	var i = ctx.i = (ctx.i + 1) % ctx.upstreams.length;

	ctx.proxy.web(req, res, {
		target: ctx.upstreams[i]
	});
}
