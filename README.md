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
