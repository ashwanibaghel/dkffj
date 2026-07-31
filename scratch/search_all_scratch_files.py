import os
import json

scratch_dir = r"e:\dkffj\dkffj-next\scratch"
files = os.listdir(scratch_dir)

print(f"Scanning {len(files)} files in scratch directory...")

for f in files:
    fpath = os.path.join(scratch_dir, f)
    if os.path.isfile(fpath):
        size = os.path.getsize(fpath)
        if f.endswith(".json") or f.endswith(".txt") or f.endswith(".js"):
            try:
                with open(fpath, "r", encoding="utf-8", errors="ignore") as file:
                    text = file.read()
                    # Check for 380 or 389 or member arrays
                    if "380" in text or "389" in text or "383" in text or "378" in text:
                        print(f"Match found in file: {f} (size: {size} bytes)")
            except Exception as e:
                pass
