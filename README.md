# simple-reverse-proxy

A simple reverse proxy that takes care of managing upstream servers.

Built with [node-http-proxy](https://github.com/nodejitsu/node-http-proxy).

## Example
```
var SimpleReverseProxy = require('simple-reverse-proxy');

new SimpleReverseProxy([
		'http://localhost:10001',
		'http://localhost:10002',
		'http://localhost:10003'
	], {
		agent: false
	})
	.listen(10000);

[10001, 10002, 10003].forEach(function (port) {
	require('http')
		.createServer(function (req, res) {
			res.statusCode = 200;
			res.end();

			console.log(port);
		})
		.listen(port);
});
```

## Upgrading from v0.0.4

Previous versions of `simple-reverse-proxy` provided a path-based router which has been removed in v1.0.0. This functionality can be replaced with [simple-path-router](https://github.com/omsmith/simple-path-router). Also see [simple-virtual-hosts](https://github.com/omsmith/simple-virtual-hosts) to add host based routing/virtual hosts.
```
var SimpleReverseProxy = require('simple-reverse-proxy'),
	SimplePathRouter = require('simple-path-router');

new SimplePathRouter()
	.when('/', new SimpleReverseProxy(['http://localhost:10001']))
	.when('/api', new SimpleReverseProxy(['http://localhost:10002', 'http://localhost:10003']))
	.listen(10000);

[10001, 10002, 10003].forEach(function (port) {
	require('http')
		.createServer(function (req, res) {
			res.statusCode = 200;
			res.end();

			console.log(port);
		})
		.listen(port);
});
```
