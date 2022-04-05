#### State which storage system and dataset you have chosen. </br>
Dataset chosen: Airbnb </br>
Storage system: Cassandra </br>

> Using some or all of the provided sample data, explain how you plan to represent that data in your selected system. </br>
> Show how the example data can be represented in the data model of your data store. Mention any indexes you will create:

![](https://github.com/kexinz8/ddl-fighters/blob/main/data/keysapce_eg.png)
<p align="center"> Fig1: Overview of keyspace ListingInfo</p></br>

- We construct a keyspace named “ListingInfo” to store given datasets. With Calendar, Reviews, Neighborhoods and Listings as four column families, organize the insightful information(columns) after data preprocessing.
- Take Calendar keyspace for instance to illustrate how we consider indexes creation.
- A compound partition key is composed of three variables: city+date+listing_id. This determines in which data partition each row belongs.
- The clustering key is a combination of ‘price’ and ‘availability’. This helps presort data, allowing search and display operation in a satisfying quick manner.

Not only concentrated on query tasks, we are considering in a holistic perspective when considering data system design. So in our Cassandra cluster, the overall structure will be like the following:

![](https://github.com/kexinz8/ddl-fighters/blob/main/data/cluster_eg.png)
 <p align="center"> Fig2: Overall structure in project Cassandra cluster<p/><br/>

> Describe at least one variant representation you considered during the design phase.

- For Column family design: we considered extracting out host information from the original listings data file into an individual column family.
- For Partition Key design: we considered taking ‘listing_id’ as our partition key.
- For consistency level design: we considered another choice of a larger replicas’ quantity, say 4 or 5.

>  Explain why you believe your final design is the preferred one

- For Column family design: compared with the variant, our final design could perform some operations within one column family which may improve the response time.

- For Partition Key design: In Airbnb, the most frequent request is the listing availability check. The corresponding info passing from UI to backend are keywords Location and Check-in-and-out, which are reflected in our data model as column city and date. So our final design on the partition key is more desirable.

- For consistency level design: the usual formula to calculate the LOCAL_QUORUM value, which specifying the consistency level of the key space:
<p align="center"><b> LOCAL_QUORUM = (replication_factor/2) + 1</b><p/>
If we take the variant design, more replicas induce a larger LOCAL_QUORUM value. And this would take a longer time for acknowledging client requests, which is in contrast to our ideal interaction response time.

> Describe the process you will use to restructure the data to fit your model—including any cleaning steps you think will be needed—and how you plan to load it.

- <b>Data integration</b>
e.g. Integrate each file from four cities into one overall column family with labeling a ‘city’ column to identify them.

- <b>Data cleaning</b>
e.g. Clean out the undesirable html tags in ‘comments’ in the review column family.
Data reconstruction

- <b>Data reconstruction</b>
e.g. Out of convenience, We create a new column ‘month’ in response to massive query requests that perform aggregation on month. 

- <b>Logic verification</b>
e.g.  In the calendar column family, the ‘available’ column may produce an illusion of the real availability of a listing. For instance, given a requirement of minimum nights order to be 2, one listing could not be considered as available on Friday if it is not available on Thursday or Saturday. So we are going to preprocess the data and make it logically accurate before performing relevant queries. </br>

For example: we create a new column ‘revised_available’ to identify dates that all dates in between the interval [date-min, date] OR [date, date+min] are available(min stands for minimum_nights requirement)</br>

def revised_availability (data, given_date){
range_night = data['date' == given_date]['minimum_nights']
max_date = given_date + range_night
min_date =  given_date - range_night
if ((data['date' == given_date]['has_availability'] == t]) 
and (data['date' in range(date, max_date)]['has_availability'] == t)){
data['date' == given_date]['revised_availability'] = True
}
elseif ((data['date' == given_date]['has_availability'] == t]) 
and (data['date' in range(min_date, date)]['has_availability'] == t)){
data['date' == given_date]['s_availability'] = True
}
else{
data['date' == given_date]['revised_availability'] = False
   }
}

> For the six queries in the appropriate dataset description document, give implementation strategies in pseudo-code based on the capabilities of your data store and the indexes you plan to define. Be sure there are enough comments to explain the strategy of each. 

Our chosen data system Cassandra supports sql-like query language CQL, which is quite similar to the structure of SQL. And after prepossessing the raw data, we also make assumptions such as:
- We are perfoming queries on after-prepocessed dataset by default. (with neccessary info integrated/added/updated/deleted)
- Generally, the maximum_nights allowed are far greater than the real booking needs. (We did several examinations already).

#### Query1

<b>STEP1</b> From the ‘calendar’ column family, filter out available listing_id(available status equals True and minimum nights requirement is less than or equal to 2) in Portland in a given two-day period; 

<b>STEP2</b> Find relevant info in the ‘listings’ column family.

<b>Demonstration</b> @para: given start date, given end date 

![](https://github.com/kexinz8/ddl-fighters/blob/main/data/Q1.png)

#### Query2

<b>STEP1</b> Take the intersection between two sets (all neighborhood in that city) - (neighborhood has listing in that city for a given month)

<b>Demonstration</b> @para: Given month, given city

![](https://github.com/kexinz8/ddl-fighters/blob/main/data/Q2.png)

The above shows an example for one specific city. If we want to get the neighborhoods in any of the cities that have no listings for a 
given month (as query2 asked), simply delete the WHERE clause condition on specific city.

#### Query3

We pipeline this query into 4 parts as follows

<b>STEP1</b> Filter out available Salem listings in the given month </br>
<b>STEP2</b> Get the consecutive available 'from' dates and 'to' dates for each listing </br>
<b>STEP3</b> Filter out chunks of bookable time period that satisfying the minimum_nights requirement </br>
<b>STEP4</b> Make sure we get info are belongs to 'Entire home/Apt'  category </br>

<b>Demonstration</b> @para: Given month

![](https://github.com/kexinz8/ddl-fighters/blob/main/data/Q3.png)

#### Query4

<b>STEP1</b> We would take the query3 as a stored procedure named availApt. (for the sake of page limit, we would not go through it since the logic stays the same and nothing changed but passing different parameters)


<b>Demonstration1</b>

![](https://github.com/kexinz8/ddl-fighters/blob/main/data/Q4-1.png)

<b>Demonstration2</b>
![](https://github.com/kexinz8/ddl-fighters/blob/main/data/Q4-2.png)

<b>STEP2</b> Stored results obatined from above into a table. Group by each month between March and August, sum up the DISTINCT values on available dates(both 'from' and 'to' date) to get the the total number of available nights in that specific month in Portland.


#### Query5

Filtering out all the December reviews, group by city and year to sum up all the reviews in each year.

<b>Demonstration</b> 
![](https://github.com/kexinz8/ddl-fighters/blob/main/data/Q5.png)


#### Query6

<b>STEP1</b> Find out listings that a user has reviewed more than once; 

<b>STEP2</b> Check the listings availability after the user’s review date (within same month);

<b>STEP3</b> Join with listings column family to select out relevant information.

<b>Demonstration</b> 
![](https://github.com/kexinz8/ddl-fighters/blob/main/data/Q6.png)

> Include a screenshot that shows you have loaded at least a few data items into your system. 

We successfully imported calendar data in San Diego into our Cassandra cluster. (60225 rows)
![](https://github.com/kexinz8/ddl-fighters/blob/main/data/imported.png)

And following is CQL query works out in our imported dataset.
![](https://github.com/kexinz8/ddl-fighters/blob/main/data/imported2.jpg)
