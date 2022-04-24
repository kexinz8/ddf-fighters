#query2
from pyhive import hive
import json
import sys

input = sys.argv[1]
conn=hive.Connection(host='10.128.0.3', username='zhihuiw328',port='10000', database='default')
cur = conn.cursor()
query2 = 'SELECT s.clicks_num FROM (SELECT cleaned_term, sum(clicks_value) as clicks_num FROM  (SELECT cleaned_term, map_values(clicks) as clicks_values FROM cleaned_webSearch WHERE cleaned_term = "{}") s LATERAL VIEW explode(clicks_values) tempTable AS clicks_value GROUP BY cleaned_term) s'.format(input) 
cur.execute(query2)
results = cur.fetchall()
r=list(results[0])[0]
data = {"clicks": r}
result = json.dumps(data)
print(result, flush = True)
