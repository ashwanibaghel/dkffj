import os

app_dir = r"e:\dkffj\dkffj-next\src\app"
for root, dirs, files in os.walk(app_dir):
    for f in files:
        if f.endswith("page.tsx") or f.endswith("actions.ts"):
            fp = os.path.join(root, f)
            print("Page/Action:", fp.replace(app_dir, ""))
