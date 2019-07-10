const mysql = require('mysql');
const sandbox = require("./sandbox")

let globalConnections = {};
const createPool = function (conf) {
  conf.connectionLimit = 10;
  const pool = mysql.createPool(conf);
  pool.on("connection", () => {
    sandbox.verbose() && console.log('[pool]pool connection');
  })
  pool.on('acquire', function (connection) {
    sandbox.verbose() && console.log('[pool]Connection %d acquired', connection.threadId);
  });

  pool.on('enqueue', function () {
    sandbox.verbose() && console.log('[pool]Waiting for available connection slot');
  });
  pool.on('release', function (connection) {
    sandbox.verbose() && console.log('[pool]Connection %d released', connection.threadId);
  });
  return pool
}

const setPoolEndTimeout = function (uniqueIndex) {

  return setTimeout(() => {
    globalConnections[uniqueIndex] && globalConnections[uniqueIndex].pool.end();
    globalConnections[uniqueIndex] = null;
    sandbox.verbose() && console.info("[pool]end  " + uniqueIndex);
  }, 10000)
}
const partitionPreviewSqlReg = /select\s+([a-z0-9_,\*`'"]+)\s+from\s+([a-z0-9_`'"]+)\s+where\s+([a-z0-9_`'"]+)\s+(=|in)\s+\((.*)\)\s*(.*)/i;

module.exports = {
  //分表查询
  queryByPartitions: function (conf) {
    return new Promise((resole, reject) => {
      let sql = conf.sql;
      let mod = conf.mod;
      let pool = null;

      const uniqueIndex = conf.user + '@' + conf.database;
      //获取连接池缓存
      if (globalConnections[uniqueIndex]) {
        sandbox.verbose() && console.info("[pool] reuse " + uniqueIndex);
        pool = globalConnections[uniqueIndex].pool
        clearTimeout(globalConnections[uniqueIndex].timeout);
        globalConnections[uniqueIndex].timeout = setPoolEndTimeout(uniqueIndex)
      } else {
        sandbox.verbose() && console.info("[pool] new " + uniqueIndex);
        pool = createPool(conf);
        globalConnections[uniqueIndex] = {
          pool: pool,
          timeout: setPoolEndTimeout(uniqueIndex)
        }
      }

      const regParse = partitionPreviewSqlReg.exec(sql);
      if (!regParse) {
        console.error("[sql]Reg Parse is null, sql: " + sql);
        return reject({
          errno: -1,
          code: 'SQL_REG_EXEC_IS_NULL'
        })
      }
      const fields = regParse[1];
      const tableName = regParse[2];
      const partitionId = regParse[3];
      const ids = regParse[5].split(',');
      const afterSql = regParse[6] ? regParse[6] : '';
      let partitionMap = {};
      let partitionCount = 0;
      let partitionDoneCount = 0;
      let partitionResult = [];
      let _p = 0;
      for (let _id of ids) {
        _p = _id % mod;
        if (!partitionMap[_p]) {
          partitionMap[_p] = [];
          partitionCount++;
        }
        partitionMap[_p].push(_id);
      }

      for (_p in partitionMap) {
        //块内定义 _sql，使下面的异步 _sql 为当前循环变量，否则异步有问题
        let _sql = `select ${fields} from ${tableName + '_' + _p} where ${partitionId} in (${partitionMap[_p].join(",")}) ${afterSql}`;
        sandbox.verbose() && console.log("[sql]", _sql);
        pool.getConnection(function (err, connection) {
          if (err) {
            console.error(err);
            reject(err);
          }

          connection.query(_sql, function (err, rows, fields) {
            connection.release()
            if (err) {
              console.error(err);
              reject(err);
            }
            partitionResult = partitionResult.concat(rows);
            partitionDoneCount++;
            if (partitionDoneCount >= partitionCount) {
              resole(partitionResult, fields)
            }
          });
        });
      }
    })
  },
  query: function (query) {
    return new Promise((resole, reject) => {
      let pool = createPool(conf);
      pool.getConnection(function (err, connection) {
        if (err) return reject(err);
        // connected! (unless `err` is set)
        connection.query(query, function (err, rows, fields) {
          if (err) return reject(err);
          resole(rows, fields)
          connection.release()
        });
      });
    })

  }
}

