import os

files_to_check = [
    r"e:\dkffj\dkffj-next\src\app\admin\(dashboard)\appreciation\actions.ts",
    r"e:\dkffj\dkffj-next\src\app\admin\(dashboard)\appreciation\AppreciationCertificateGenerator.tsx",
    r"e:\dkffj\dkffj-next\src\app\admin\(dashboard)\appreciation\page.tsx",
    r"e:\dkffj\dkffj-next\src\app\apply-appreciation\actions.ts",
    r"e:\dkffj\dkffj-next\src\app\apply-appreciation\page.tsx",
]

for fp in files_to_check:
    if os.path.exists(fp):
        with open(fp, "r", encoding="utf-8", errors="ignore") as f:
            lines = f.readlines()
            print("=== File:", os.path.basename(fp), "===")
            for idx, line in enumerate(lines):
                if any(k in line for k in ["cert", "2026", "prefix", "application_no", "generate", "DKFFJ", "YEAR"]):
                    print(f"Line {idx+1}: {line.strip()[:120]}")
