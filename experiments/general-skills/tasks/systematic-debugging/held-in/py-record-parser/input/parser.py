def parse_records(text):
 out=[]
 for line in text.splitlines():
  if not line.strip(): break
  key,value=line.split(':',1);out.append((key.strip(),value.strip()))
 return out
