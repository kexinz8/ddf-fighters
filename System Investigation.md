| FirstName     | LastName      | City     |
| ------------- | ------------- | -------- |
| John          | Test1         | NewYork  |
| Bob           | Test2         | Toronto  |

|               |       Redis     |    Cassandra   |    Spark    |       
| :-----------: | :----------------------: |
|  Data Model   |  Key-Value | Column-Family | Column-Family(Bigtable)|
|  Indices      |  Indices on key/allow secondary index strategy(e.g: lexicographically encoded indexes; sorted sets indexes) | Cassandra supports both primary and secondary index, allowing queries on the table to use those indexes | Spark cannot maintain indices. Because Spark is not a data management system but a batch data processing engine. |

|  Consistency  |  Weak consistency (some special cases could obtain strong consistency with WAIT command)  | Cassandra has flexible consistency with regards to queries and guarantees eventual consistency. Strong consistency is guaranteed if R + W consistency is greater than the number of replicas. | Spark write model does not support consistency. |

Sharding/Partitioning |  Criteria: Range; Hash and Consistent hashing. Implementation: Client side; Proxy assisted; Query routing; +: allow larger dataset; allocate workload between nodes; -: difficultpdate accommodation | Cassandra supports hash partitioning and the data locality is determined by partition key. | Apache Spark supports two types of partitioning: hash partitioning and range partitioning. Depending on how keys in your data are distributed or sequenced as well as the action you want to perform on your data can help you select the appropriate techniques. | 
Replication
Mechanism: Leader-follower
Leader: all writes and fast read
Follower: read-only (slow query O(n))
+: high availability of follower nodes; offload leaders’ work
-: asynchronous replication (may cause data loss); manually restart after failure (no auto-failover)
Cassandra has two replication strategies: SimpleStrategy and NetworkTopologyStrategy. 

Replication factor can also be changed by executing the ALTER KEYSPACE command.
Spark is a cluster computation engine, it does not replicate data or stored data implicitly. 
Data Interface: API or language(s), support for joins
Java，C/C++，C#，PHP，JavaScript，Perl，Object-C，Python，Ruby，Erlang; Does not support joins
Java , Python, NodeJS, Go and C++
Scala, Python, Java, R, SQL

