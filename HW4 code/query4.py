#query4
from pyhive import hive
import json
import sys

input = sys.argv[1]
#output = sys.argv[2]
conn=hive.Connection(host='10.128.0.3', username='zhihuiw328',port='10000', database='default')
cur = conn.cursor()
query4 = 'SELECT collect_set(c.cleaned_term) as best_terms FROM(SELECT cleaned_term, clicks["{}"] FROM cleaned_webSearch GROUP BY cleaned_term,clicks["{}"] HAVING clicks["{}"] > (SELECT sum(clicks["{}"])*0.05 FROM cleaned_webSearch) ORDER BY clicks["{}"] DESC) c'.format(input,input,input,input,input)
cur.execute(query4)
results = cur.fetchall()
r=list(results[0])[0]
data = {"best_terms": json.loads(r)}
result = json.dumps(data)
print(result, flush = True)
