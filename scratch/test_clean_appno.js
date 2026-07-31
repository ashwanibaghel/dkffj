function cleanApplicationNo(appNo) {
  if (!appNo) return "";
  let cleaned = appNo.replace(/DKFFJ\/A\/(\d{4})\/-\1-/g, "DKFFJ/A/$1/");
  cleaned = cleaned.replace(/DKFFJ\/A\/(\d{4})\/(\d{4})\//g, "DKFFJ/A/$1/");
  cleaned = cleaned.replace(/(\d{4})\/-\1-/g, "$1/");
  return cleaned;
}

console.log("Cleaned 1:", cleanApplicationNo("DKFFJ/A/2026/-2026-00010"));
console.log("Cleaned 2:", cleanApplicationNo("DKFFJ/A/2026/-2026-00009"));
console.log("Cleaned 3:", cleanApplicationNo("DKFFJ/A/2026/2026/00005"));
console.log("Cleaned 4:", cleanApplicationNo("DKFFJ/A/2026/00001"));
