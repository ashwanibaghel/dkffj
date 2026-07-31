import fs from "fs";
import path from "path";

const sqlPath = path.join(process.cwd(), "..", "kelvinne_dkfound.sql");
const sql = fs.readFileSync(sqlPath, "utf8");

const createTables = sql.match(/CREATE TABLE `([^`]+)`/g);
const inserts = Array.from(new Set(sql.match(/INSERT INTO `([^`]+)`/g)));

const out = `Tables: ${JSON.stringify(createTables, null, 2)}\nInserts: ${JSON.stringify(inserts, null, 2)}`;
fs.writeFileSync(path.join(process.cwd(), "scratch", "sql_out.txt"), out);
