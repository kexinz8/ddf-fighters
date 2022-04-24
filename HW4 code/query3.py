#query3
from pyhive import hive
import json
import sys

input = sys.argv[1]
conn=hive.Connection(host='10.128.0.3', username='zhihuiw328',port='10000', database='default')
cur = conn.cursor()
query3 = 'SELECT sum(clicks["{}"]) as url_num FROM cleaned_webSearch'.format(input)
cur.execute(query3)
results = cur.fetchall()
r=list(results[0])[0]
data = {"clicks": r}
result = json.dumps(data)
print(result, flush = True)
