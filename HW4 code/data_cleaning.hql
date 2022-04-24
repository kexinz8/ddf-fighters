CREATE EXTERNAL TABLE webSearch4 (term String, clicks map<String, BIGINT>)
ROW FORMAT DELIMITED
FIELDS TERMINATED BY ','
COLLECTION ITEMS TERMINATED BY '~'
MAP KEYS TERMINATED BY ':'
LOCATION 'gs://411hw4-bucket/hw4data1/';


CREATE TABLE cleaned_webSearch AS 
SELECT REGEXP_REPLACE(c.cleaned_term, 'searchTerm: ', '') as cleaned_term, clicks 
FROM (SELECT REGEXP_REPLACE(term,'"','') as cleaned_term, clicks FROM webSearch4) c;
