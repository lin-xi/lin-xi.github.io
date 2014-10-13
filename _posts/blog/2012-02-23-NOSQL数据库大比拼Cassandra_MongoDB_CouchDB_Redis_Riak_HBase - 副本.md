---
layout: post
title: NOSQL数据库大比拼Cassandra vs MongoDB vs CouchDB vs Redis vs Riak vs HBase
description: 
Cassandra  MongoDB  CouchDB  Redis  Riak  HBase
category: blog
---


## NOSQL数据库大比拼:Cassandra vs MongoDB vs CouchDB vs Redis vs Riak vs HBase

话说，尽管 SQL 数据库一直是我们IT行业中最有用的工具，然而，它们这样在行业中超过15年以上的"转正"终于就要寿终正寝了。现在，虽然关系型数据库仍然无所不在，但它越来越不能满足我们的需要了。NoSQL成为了业界的新宠。

但是，各种 "NoSQL" 数据库之间的差异比当年众多关系型数据库之间的差异要大许多。这就加大了人们在建设自己的应用是选择合适的数据库的难度。

在这篇汇总的PK中，我们对 [Cassandra][0], [Mongodb][1], [CouchDB][2], [Redis][3], [Riak][4] 和 [HBase][5] 进行了比较，以供参考：

CouchDB

**Written in:** Erlang

**Main point**关键点**:** DB consistency一致性, ease of use易用

**License 许可协议:** Apache

**Protocol 协议:** HTTP/REST

Bi-directional (!) replication双向复制,

continuous or ad-hoc,

with conflict detection冲突检测,

thus, master-master replication. (!) 主主复制

MVCC - write operations do not block reads 写操作不会阻塞读操作

Previous versions of documents are available 文本式

Crash-only (reliable) design 可靠性设计

Needs compacting from time to time

Views: embedded内部嵌入 map/reduce算法

Formatting views: lists & shows

Server-side document validation possible

Authentication possible

Real-time updates via \_changes (!) 实时更新

Attachment handling

thus, [CouchApps][6] (standalone js apps)

jQuery library included

**适用:** 累计 堆积计算, 偶尔改变数据, 预先定义的查询. 非常注重版本控制的场合.

**举例:** CRM, CMS系统. 主-主复制是其特别亮点，可以易于多个站点部署。

Redis

**Written in:** C/C++

**Main point **关键点**:** Blazing fast 超快

**License:** BSD

**Protocol:** Telnet-like

Disk-backed in-memory database, 磁盘后备，内存数据库

but since 2.0, it can swap to disk. 但是从2.0开始直接交换到磁盘

Master-slave replication 主-从复制

Simple keys and values, 简单的key-value形式

but [complex operations][7] like ZREVRANGEBYSCORE 但是复杂操作类似ZREVRANGEBYSCORE

INCR & co (good for rate limiting or statistics)

Has sets (also union/diff/inter)

Has lists (also a queue; blocking pop)

Has hashes (objects of multiple fields)

Of all these databases, only Redis does transactions (!) 在这些数据库中，只有Redis有**事务**机制。

Values can be set to expire (as in a cache) 如同**缓存**一样，值能被设置为超过一定时间过期失效。

Sorted sets (high score table, good for range queries) 有排序的sets，善于range查询。

Pub/Sub and WATCH on data changes (!) 采取Pub/Sub 和观察者WATCH事件触发数据变化。

**适用****:** 在可以控制的数据库大小情况下(放得下整个内存)，快速改变数据，快速写数据。

**举例****:** 股票价格系统 分析，实时数据收集，联系等等。

MongoDB

**Written in:** C++

**Main point:** Retains some friendly properties of SQL. 保留类似SQL风格.(Query, index)

**License:** AGPL (Drivers: Apache)

**Protocol:** Custom, binary (BSON)

Master/slave replication 主从复制(分布式状态**集群**方式)

Queries are javascript expressions 查询是javascript表达式

Run arbitrary javascript functions server-side

Better update-in-place than CouchDB  比CouchDB更好地就地更新

Sharding built-in 内置分片碎片

Uses memory mapped files for data storage 使用内存对应文件方式实现数据存储

Performance over features

After crash, it needs to repair tables 当崩溃后，需要修复表。

**适用****:** 需要动态查询. 愿意事先定义索引indexes, 不需要 map/reduce 功能. 你需要巨大的数据库有良好性能，你需要CouchDB但是你数据变化改变很频繁，需要频繁写。

**举例****:** 适合所有MySQL 或者 PostgreSQL场合，它也适合

Cassandra

**Written in:** Java

**Main point:** 大表模型BigTable 和 Dynamo中最好的

**License:** Apache

**Protocol:** Custom, binary (Thrift)

Tunable trade-offs for distribution and replication (N, R, W)

Querying by column, range of keys 按列查询

BigTable-like features: columns, column families 列

Writes are much faster than reads (!) 写快于读

Map/reduce possible with Apache Hadoop

部分复杂性可能由于Java自身原因(如配置configuration, seeing exceptions, etc)

**适用****:** 当写操作多于读操作 (如日志logging).

**举例****:** 银行Banking, 金融系统，写必须快于都的场合，实时的数据分析等.

Riak

**Written in:** Erlang & C, some Javascript

**Main point:** 容错性Fault tolerance 失败恢复 可靠性好

**License:** Apache

**Protocol:** HTTP/REST

Tunable trade-offs for distribution and replication (N, R, W)

Pre- and post-commit hooks,

for validation and security.

Built-in full-text search 内置全文本搜索

在 Javascript 中Map/reduce 或 Erlang 支持

Comes in "open source" and "enterprise" editions 有两个版本

**适用****:** 如果你希望有类似Cassandra-like (Dynamo-like)风格, 但是你不想处理器复杂性和膨胀性。单服务器有良好可**伸缩性**scalability, 可用性availability 和容错性 fault-tolerance, 采取是昂贵的多站点复制multi-site replication.

**举例****:** 销售点数据收集，工厂控制系统，那些不能允许几秒当机的场合。

HBase

(With the help of ghshephard)

**Written in:** Java

**Main point:** 十亿级别的行 X 百万级别的列 大容量

**License:** Apache

**Protocol:** HTTP/REST (also Thrift)

Modeled after BigTable 大表模型

Map/reduce with Hadoop 内置Map/reduce

Query predicate push down via server side scan and get filters

Optimizations for real time queries 能够实时获得基于查询的优化

A high performance Thrift gateway 高性能的Thrift型网关

HTTP supports XML, Protobuf, and binary

Cascading, hive, and pig source and sink modules

Jruby-based (JIRB) shell

No single point of failure 无单点风险

Rolling restart for configuration changes and minor upgrades

Random access performance is like MySQL 随机访问的性能类似MySQL

**适用****:** 如果你喜欢大表模型BigTable. :) 你需要随机 实时的读写操作

**举例****:** Facebook 消息数据库

当然，所有这些数据库系统都有比列在这里多得多的功能特性。我这里仅仅依据我个人认识列出一些关键特性，并且这些项目的开发也很活跃，我将尽力保持更新。


[0]: http://cassandra.apache.org/
[1]: http://www.mongodb.org/
[2]: http://couchdb.apache.org/
[3]: http://redis.io/
[4]: http://www.basho.com/Riak.html
[5]: http://hbase.apache.org/
[6]: http://couchapp.org/
[7]: http://redis.io/commands