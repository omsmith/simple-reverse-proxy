# routing-proxy

A simple routing reverse-proxy build on top of node-http-proxy

## Example
```
var RoutingProxy = require('routing-proxy');

new RoutingProxy({ agent: false })
	.upstream('/', ['http://localhost:10001'])
	.upstream('/api', ['http://localhost:10002', 'http://localhost:10003'])
	.listen(10000);

startServer(10001);
startServer(10002);
startServer(10003);

function startServer (port) {
	require('http')
		.createServer(function (req, res) {
			res.statusCode = 200;
			res.end();

			console.log(port);
		})
		.listen(port);
}
```