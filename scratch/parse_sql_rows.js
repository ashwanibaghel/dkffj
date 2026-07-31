import fs from "fs";
import path from "path";

const sqlPath = path.join(process.cwd(), "..", "kelvinne_dkfound.sql");
const sql = fs.readFileSync(sqlPath, "utf8");

// Extract CREATE TABLE `membership_form` definition
const memTableDef = sql.match(/CREATE TABLE `membership_form`[\s\S]*?\);/);
console.log("membership_form schema:");
console.log(memTableDef ? memTableDef[0] : "Not found");

// Extract INSERT lines for membership_form
const lines = sql.split("\n");
const insertLines = lines.filter(l => l.includes("INSERT INTO `membership_form`"));
console.log(`Found ${insertLines.length} INSERT INTO membership_form lines.`);
