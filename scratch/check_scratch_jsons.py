import os
import json

scratch = r"e:\dkffj\dkffj-next\scratch"
for f in os.listdir(scratch):
    if f.endswith(".json"):
        fp = os.path.join(scratch, f)
        try:
            with open(fp, "r", encoding="utf-8") as file:
                data = json.load(file)
                if isinstance(data, list):
                    print(f"JSON file {f}: list with {len(data)} items")
                elif isinstance(data, dict):
                    print(f"JSON file {f}: dict with {len(data)} keys")
        except Exception as e:
            print(f"Error reading {f}: {e}")
