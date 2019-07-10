const http = require("http");
const qs = require("querystring")
const url = require("url")
const M = require("./mysql")
const sandbox = require("./sandbox")
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
//http://127.0.0.1:8828/query-by-partitions?host=dx.berry.ifaceparty.com&sql=select%20group_id,msg_id%20from%20group_msg%20where%20group_id%20in%20(13505,11963)%20and%20create_time%20>%200&mod=128&user=root&password=&charset=utf8mb4_general_ci&database=dianxin_msg
http.createServer(async function (request, response) {
  // console.log(request);
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

      let ret = await M.queryByPartitions(conf);
      ok(response, (ret))
    } catch (e) {
      exception(response, e.errno, e.code);
      console.error(e);
    }

  } else {
    notfound(response)
  }

}).listen(httpPort, '127.0.0.1');

const ok = (res, data = null) => {
  res.writeHead(200, { 'Content-Type': 'text/json' });
  res.end(JSON.stringify({ "errno": 0, "errmsg": "ok", "data": data }));
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
