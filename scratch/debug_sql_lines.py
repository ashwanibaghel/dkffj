with open(r"e:\dkffj\kelvinne_dkfound.sql", "r", encoding="utf-8", errors="ignore") as f:
    for line in f:
        if "INSERT INTO" in line:
            print(line[:100])
