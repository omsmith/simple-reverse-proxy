'use strict';

var http = require('http'),
	httpProxy = require('http-proxy');

module.exports = SimpleReverseProxy;

function SimpleReverseProxy (upstreams, options) {
	if (typeof upstreams === 'string') {
		upstreams = [upstreams];
	}

	var dispatch = upstreamer.bind(undefined, {
		proxy: httpProxy.createProxyServer(options),
		i: 0,
		upstreams: upstreams.slice()
	});

	dispatch.listen = function () {
		var server = http.createServer(dispatch);
		server.listen.apply(server, arguments);

		return dispatch;
	};

	return dispatch;
}

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
				upstreams.splice(index, 1);
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
