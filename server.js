const http = require("http");
const qs = require("querystring")
const url = require("url")
const M = require("./mysql")
const sandbox = require("./sandbox")
const heap = require("./heap")
const httpPort = 8828;

const cmd = process.argv;
const options = cmd.splice(2);
let verbose = false;
if (process.env.RUNTIME_ENVIRONMENT == 'DEV') {
  verbose = true;
}

switch (options[0]) {
  case '--verbose':
    verbose = true;
    break;
  default:
    break;
}
sandbox.setVerbose(verbose);
console.log("[verbose]", sandbox.verbose())
http.createServer(async function (request, response) {
  sandbox.verbose() && console.log("[url]", request.url);
  const urlParse = url.parse(request.url);
  const query = qs.parse(urlParse.query);
  sandbox.verbose() && console.log("[query]\n", query);
  const conf = {
    sql: query.sql,
    mod: query.mod,
    database: query.database,
    host: query.host,
    user: query.user,
    password: query.password,
    charset: query.charset,
  };
  if (urlParse.pathname == '/query-by-partitions') {
    try {

      const ret = await M.queryByPartitions(conf);
      ok(response, (ret))
    } catch (e) {
      exception(response, e.errno, e.code);
      console.error(e);
    }
    heap.memery();
  } else if (urlParse.pathname == '/memery') {
    ok(response, process.memoryUsage())
  } else if (urlParse.pathname == '/set-verbose') {
    if (sandbox.verbose()) {
      sandbox.setVerbose(false);
    } else {
      sandbox.setVerbose(true);
    }
    ok(response, {})
  } else if (urlParse.pathname == '/cache-keys') {
    ok(response, sandbox.cacheKeys())
  } else {
    notfound(response)
  }

}).listen(httpPort, '127.0.0.1');

const ok = (res, data = null) => {
  res.writeHead(200, { 'Content-Type': 'text/json' });
  res.end(JSON.stringify({ "errno": 0, "errmsg": "ok", "data": data }));
  res = null;
}
const error = (errno, errmsg) => {
  res.writeHead(200, { 'Content-Type': 'text/json' });
  res.end(JSON.stringify({ errno, errmsg }));
}

const notfound = (res) => {
  res.writeHead(404, { 'Content-Type': 'text/json' });
  res.end('not found');
}

const exception = (res, errno, errmsg) => {
  res.writeHead(500, { 'Content-Type': 'text/plain' });
  res.end(JSON.stringify({ errno, errmsg }));
}

console.log("[start]DB proxy http server start at port:" + httpPort, "env:" + process.env.RUNTIME_ENVIRONMENT);
