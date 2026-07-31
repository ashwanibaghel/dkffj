import json

with open(r"e:\dkffj\dkffj-next\src\lib\teamData.ts", "r", encoding="utf-8") as f:
    text = f.read()

import re
matches = re.findall(r"{\s*id:\s*[\"']1049[\"'].*?}", text, re.DOTALL)
if matches:
    print("Record with ID 1049 in teamData.ts:")
    print(matches[0])
else:
    print("ID 1049 not found in teamData.ts")

# Search for Ashwani or Ashwini
names = re.findall(r"name:\s*[\"']([^\"']*Ashw[^\"']*)[\"']", text, re.IGNORECASE)
print("Names matching Ashw in teamData.ts:", names)
