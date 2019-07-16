# mysql-partitions-proxy

MySQL 数据库分表主键查询代理

## 运行环境

因为用到了 `Promise` 和 `async`, `await`

需要 node version 8 +

## 约束

1. 需要按照单一列主键分表，表名格式为 `{TableName}_{PartitionNumber}`

2. `where` 查询语句第一个条件项需要是主键

3. 查询语句不需要添加 Partition 序号，程序按照约定自动添加例如 `_1` 的序号

**例如**

表名: `user_info`

分表的名字: 按照 `user_id` mod 512 分表, 分表的名称为 `user_info_0`,`user_info_1`, ... , `user_info_511`

查询语句应为 
`select user_id,nickname,gender from user_info where user_id in (123,234)`

## 特性

1. 自动拆分查询语句的数据到对应分表
2. 并发异步查询并合并结果，同步返回结果
3. 采用MySQL Pool，默认 `connectionLimit:10`，默认`10`秒释放Pool

## 性能


1. 可能的内存增长

长期业务测试，内存使用率和QPS有相关关系，无明显内存泄漏情况

2. 可能的并发阻塞

未测试

## Install

```
npm install
```

## Dev

```
npm run dev
```

## Start

```
npm start
```

## Pm2 Deploy

### setup

```
pm2 deploy ecosystem.config.js development setup
```

### start

```
pm2 deploy ecosystem.config.js development 
```

##  Url Test

```
http://127.0.0.1:8828/query-by-partitions?host=host_domain&sql=select%20user_id%20from%20user_info%20where%20user_id%20in%20(123,234)&mod=512&user=root&password=&charset=utf8mb4_general_ci&database=user
```

## License

MIT