rom pyhive import hive
import json
import sys

input = sys.argv[1]
# connect to hive
conn=hive.Connection(host='10.128.0.3', username='zhihuiw328',port='10000', database='default')
cur = conn.cursor()
query1 = 'SELECT clicks FROM cleaned_webSearch WHERE cleaned_term="{}"'.format(input) 
cur.execute(query1)
results = cur.fetchall()
r=list(results[0])[0]
data = {"results": json.loads(r)}
result = json.dumps(data)
print(result, flush = True)
