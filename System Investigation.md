
# System Features Table
|               |       Redis     |    Cassandra   |    Spark    |
| ------------- | --------------- | -------------- | ----------- |
| Data Model    |  Key-Value | Column-Family | Column-Family(Bigtable)|
|  Indices      |  Indices on key/allow secondary index strategy(e.g: lexicographically encoded indexes; sorted sets indexes) | Cassandra supports both primary and secondary index, allowing queries on the table to use those indexes | Spark cannot maintain indices. Because Spark is not a data management system but a batch data processing engine. |
|  Consistency  |  Weak consistency (some special cases could obtain strong consistency with WAIT command)  | Cassandra has flexible consistency with regards to queries and guarantees eventual consistency. Strong consistency is guaranteed if R + W consistency is greater than the number of replicas. | Spark write model does not support consistency. |
|  Sharding/Partitioning | __Criteria__: __Range__; Hash and Consistent hashing. __Implementation__: Client side; Proxy assisted; Query routing;<br /> __+__: allow larger dataset; allocate workload between nodes;<br /> __-__: difficultpdate accommodation | Cassandra supports __hash partitioning__ and the data locality is determined by partition key. | Apache Spark supports two types of partitioning: __hash partitioning__ and __range partitioning__. Depending on how keys in your data are distributed or sequenced as well as the action you want to perform on your data can help you select the appropriate techniques. | 
|  Replication | __Mechanism__: Leader-follower; <br /> __Leader__: all writes and fast read; <br /> __Follower__: read-only (slow query O(n)); <br />__+__: high availability of follower nodes; offload leaders’ work; <br />__-__: asynchronous replication (may cause data loss); manually restart after failure (no auto-failover)  |  Cassandra has two replication strategies: SimpleStrategy and NetworkTopologyStrategy. <br />Replication factor can also be changed by executing the ALTER KEYSPACE command. | Spark is a cluster computation engine, __it does not replicate data or stored data implicitly__. 
|  Data Interface: API or language(s), support for joins |  Java，C/C++，C#，PHP，JavaScript，Perl，Object-C，Python，Ruby，Erlang; Does not support joins |  Java , Python, NodeJS, Go and C++ |  Scala, Python, Java, R, SQL |

__System Selection:__ Cassandra

# System Profile
## Summary & Justification
### 1. Summary of the system and its key features.<br />
We are going to use Apache Cassandra as our database system. In Cassandra, data is distributed in different clusters and a cluster might have several nodes. Cassandra is a column family system, which has tunable consistency. There are some features of  Cassandra:<br />
- Primary key: The way primary key works in Cassandra is a combination of partition key and clustering key, where partition key determines the distribution of data across nodes and the clustering key determines the order of how data displays in that node.
- Flexible Consistency: The consistency of Cassandra could be tuned according to queries, it is possible to tune the tradeoff between availability and consistency of data.
- Query Language: Cassandra uses its CQL language to deal with data.
- Fault tolerance: Nodes in Cassandra are treated equally, that is there is no master or lead node. Therefore, if a node fails, the influence is not very serious. <br />
### 2. Justification of why you chose this system and why you believe it is a good choice.<br />
We first comb out our expectations for the system based on but way beyond the query tasks and Airbnb dataset properties:<br />
- Read-Write intensive, update less scenario with a favor of high availability
- Ideally an interactive response time for group by, sorting query on specific columns
- Support partition and satisfying performance in terms of fault tolerance and extensibility <br />
__Why column-based DBMS and why Cassandra__<br />
Out of the need for intensive operations on ‘popular’ columns, column store DBMS outperforms other choices in our case. Main functions in Airbnb are search-displaying and order-making. The demand for support of concurrency and replications stands Cassandra out from other popular column-based choice HBase.<br />
__How Cassandra would benefit our project__<br />
- High Read-Write efficiency: Compound primary key (partition key+clustering key) have done pre-grouby and preorder work which speeds up query since it allows binary search on disks.
- Tunable consistency: tune availability and partition tolerance based on the real demand for consistency.
- Secure and stable data enviornment: Cassandra allows replicating data to other data centers and keeping multiple copies in multiple geographies. In addition to serving as robust disaster recovery and business continuity assurance, this helps meet many regulatory, offline analytics, and other requirements. Decentralized server mechanism prevents our system from suffering a single point of failure.
- sql-like cql language, development-friendly, low-cost to get started; 

## Data Model 
### 1. What is the data model of your system? 
Cassandra is a wide column data management system.
### 2. Give an example of how data stored in your system might look and the function(s) to insert data.
![Test Image 4](https://github.com/kexinz8/ddl-fighters/blob/main/Data%20model%20example.png)
 <p align="center"> Fig1: Data stored in our system example<p/><br />
cqlsh> INSERT INTO table (date,isting_id, listing_name, num_reviews, location, neighborhood) VALUES (‘2022/3/7’, ’Kexin’s’, 998,  ’Campus Instructional Facility’, ’Engineering’);

## User Interface
### 1. Which UI will you use to interact with your system? What API or language(s) does it support?
We will use Spark Web UI to interact with our system. It supports Python, Java, R and Scala languages.<br />
### 2. Give two examples of interactions with your system.
(1) Range search: Select all available listings (name, neighbourhood, room_type, price) where the time is from 24 December, 2021 to 25 December, 2021 and the city is Portland.<br />
SELECT name, neighbourhood, room_type, price FROM example WHERE (time = '12-24-2021' OR time = '12-25-2021') AND city = 'Portland'<br />
(2) Graph-navigation query: A common application of a simple recommendation system could be implemented through graph-navigation query.<br />
For example, we could search reviewers who have reviewed more than once that are also available in the same month as they reviewed previously, recommend these reviews with all listings by the same host in the same city and remind them to book again. In this scenario, we will use Spark to connect with Cassandra data and utilize Spark's GraphFrames API to implement this interaction function.<br />
![Test Image 4](https://github.com/kexinz8/ddl-fighters/blob/main/User%20Interface%20example.png)
 <p align="center"> Fig2: Graph query UI example<p/><br />
 
 ## Indexes
 ### 1. Does your system support indices? If so, what types of indices are supported?
Cassandra does support indices. <br />
- Compound primary key:  consists of two components, partition key and cluster key (strictly following this order). The main function of the primary key is to uniquely recognize record and control order.
- Secondary index: creating indexes on columns except partition columns. For each secondary index created, Cassandra creates a Hidden table on each node.
One thing to notice is that indices built in Cassandra will not speed up the query efficiency of the data in any way like RDBMS, but only make a WHERE clause possible in queries. In order to improve the query efficiency, it is expected to build indexes for a single query rather than pre-assign a secondary index on some column. <br />
### 2. Give two examples of index creation in your system.
- Compound primary key:<br />
PRIMARY KEY((date), listing_id, listing_name, num_reviews, location, neighborhood)
WITH CLUSTERING ORDER BY(listing_id ASC, listing_name ASC, num_reviews DESC)<br />
- Secondary index:<br />
cqlsh> CREATE INDEX nbh ON table(neighborhood);<br />
The first example is written when creating the table, partitioned based on date, order on listing_id, listing_name and num_reviews.<br />
The second example is before querying creating index on neighborhood, which is used in the query where clause.<br />

## Consistency
### 1. What consistency options and guarantees does your system support?
![Test Image 4](https://github.com/kexinz8/ddl-fighters/blob/main/Cassandra%20with%20CAP%20Theorem.png)
 <p align="center"> Fig3: Cassandra with CAP Theorem<p/><br />
Recall the CAP theorem for distributed data storage, Cassandra roots in the intersection of the availability and partition tolerance, which considers an eventual consistency. Based on that, Cassandra supports tunable consistency levels in the system by setting different CL values. <br />
Consistency settings and description in Cassandra(weakest to strongest): <br />
__ANY__ Without any ACK <br />
__ONE; TWO; THREE__ ACK from ONE/TWO/THREE closest node to the coordinator <br />
__QUORUM__ Majority vode (51%) <br />
__LOCAL_ONE__ ACK from one node to coordinator within the same data center <br />
__LOCAL_QUORUM__ ACK from quorum node to coordinator within the same data center <br />
__EACH_QUORUM__ Quorum of nodes in each data center <br />
__ALL__ Every node in the whole distributed system <br />

Demand for consistency in our case: high availability in a dense reading scenario. Given options summarized in above table), a __LOCAL_QUORUM__ Write and __ONE Read__ arrangement is considered to be helpful. <br />

### 2. Does the system support any type of transactions? 
Rather than ACID transactions with rollback or locking in RDBMS, Cassandra supports atomic, isolated and durable transactions under the tunable consistency environment. Paxos protocol is designed for handling concurrency in lightweight transactions implementation. <br /> 

## Scalability and Replication 
### 1. Does your system support replication?
Cassandra __supports replication__. The replication factor, which refers to the total number of replicas for a keyspace in a Cassandra cluster, should not be greater than the number of Cassandra nodes in the cluster.<br />
Cassandra also provides several options for replication strategy. SimpleStrategy is utilized for multiple nodes over multiple racks in a single data center. NetworkTopologyStrategy is used to store multiple copies of data in different data centers. According to our data, we will set up SimpleStrategy as the replication method of our system.<br />

### 2. Does your system support sharding or other kinds of partitioning?
Cassandra supports __hash partitioning__ through partitioners. After determining a partition key, a partitioner could hashes data, assigns a hash value to each partition key and partitions it based on the value of the partition key and the range of that node.<br />
For example, in a cluster of six nodes, each node is responsible for a range of hash values between the lower bound and the upper bound. Cassandra will partition data on each node according to the partition key and the range of nodes.<br />
![Test Image 4](https://github.com/kexinz8/ddl-fighters/blob/main/Replication%20example.png)
 <p align="center"> Fig4: Cassandra hash partitioning example<p/><br />

### 3. Examples
(1) __Replication example__:<br />
For example, we could set up a replication method of SimpleStrategy with 2 replicas of each node in a cluster. The creation is performed in Cassandra keyspace.<br />

CREATE KEYSPACE exampleCluster WITH <br />
replication = {'class': 'SimpleStrategy', 'replication_factor': 2} <br />

(2) __Partition example__:<br />
For example, We will use date as the partition key. In Cassandra, the primary key consists of one or several partition key(s) and zero or several clustering key(s). <br />
A simple example of setting partition key of listing data table is as follows:<br />
PRIMARY KEY((date), listing_id, listing_name) 

