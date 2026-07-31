import os

app_dir = r"e:\dkffj\dkffj-next\src\app"
for root, dirs, files in os.walk(app_dir):
    for f in files:
        if f.endswith(".tsx") or f.endswith(".ts"):
            fp = os.path.join(root, f)
            if "appreciation" in fp.lower() or "membership" in fp.lower() or "join" in fp.lower() or "register" in fp.lower():
                print("Form file found:", fp)
