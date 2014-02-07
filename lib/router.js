'use strict';

var url = require('url');

module.exports = Router;

function Router () {
	this.routes = [];
	this.handlers = {};
}

Router.prototype.when = function (_route, handler) {
	var route = _route,
		routes = this.routes;

	if (route[0] !== '/') {
		route = '/' + route;
	}

	if (routes.indexOf(route) === -1) {
		routes.push(route);

		if (routes.length > 1) {
			routes.sort(function (a, b) {
				return b.length - a.length;
			});
		}
	}

	this.handlers[route] = handler;

	return this;
};

Router.prototype.dispatch = function (req, res) {
	var reqPath = url.parse(req.url).pathname;

	var matchedRoute;
	this.routes.forEach(function (route) {
		if (route === reqPath || reqPath.slice(0, route.length + 1) === route + '/') {
			matchedRoute = route;
			return true;
		}

		return false;
	});

	var handler = this.handlers[matchedRoute || '/'];
	if (handler) {
		handler(req, res);
		return;
	}

	res.statusCode = 404;
	res.end();
};
