with open(r"e:\dkffj\dkffj-next\src\lib\teamData.ts", "r", encoding="utf-8") as f:
    lines = f.readlines()

for idx, line in enumerate(lines):
    if 'id: "1049"' in line:
        print(f"ID 1049 found at line {idx + 1}")
