with open(r"e:\dkffj\dkffj-next\src\app\apply-appreciation\page.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()

for idx, line in enumerate(lines):
    if "fee" in line.lower() or "amount" in line.lower() or "price" in line.lower() or "₹" in line:
        print(f"Line {idx+1}: {line.strip()[:100]}")
