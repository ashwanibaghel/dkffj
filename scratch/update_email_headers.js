const fs = require("fs");
const path = require("path");

const LOGO_URL = "https://dkffj.vercel.app/logo.png";

const NEW_HEADER_HTML = `
      <div style="background-color: #1E60B4; padding: 24px; text-align: center;">
        <img src="${LOGO_URL}" alt="DKFFJ Logo" style="width: 70px; height: 70px; margin-bottom: 12px; display: inline-block;" />
        <h1 style="color: #ffffff; margin: 0; font-size: 18px; font-weight: bold; letter-spacing: 0.5px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.3; text-transform: uppercase;">DK FOUNDATION OF FREEDOM AND JUSTICE</h1>
        <div style="color: #ffffff; font-size: 13px; font-weight: 600; letter-spacing: 1px; margin-top: 4px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; text-transform: uppercase;">HUMAN RIGHTS PROTECTION</div>
        <div style="color: #e0f2fe; font-size: 11px; margin-top: 6px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; opacity: 0.9;">Regd By Ministry of Corporate Affairs Govt. of India</div>
      </div>
`.trim();

const targetFiles = [
  "src/services/email/templates.ts",
  "src/app/admin/(dashboard)/appreciation/actions.ts",
  "src/app/admin/(dashboard)/complaints/actions.ts",
  "src/app/admin/(dashboard)/members/actions.ts",
  "src/app/api/phonepe/callback/route.ts",
  "src/app/api/phonepe/verify/route.ts",
  "src/app/payment-mock/actions.ts"
];

const basePath = path.join("E:", "dkffj", "dkffj-next");

function processFiles() {
  targetFiles.forEach((relPath) => {
    const fullPath = path.join(basePath, relPath.replace(/\//g, path.sep));
    if (!fs.existsSync(fullPath)) {
      console.warn(`File not found: ${fullPath}`);
      return;
    }

    let content = fs.readFileSync(fullPath, "utf-8");
    
    // Regex matches: <div style="background-color: #001C55; ... padding: ...; text-align: center;"> ... </div>
    // with no nested <div> tags.
    const headerRegex = /<div\s+style="background-color:\s*#001C55;\s*padding:\s*(20px|24px);\s*text-align:\s*center;">[\s\S]*?<\/div>/g;

    let matchCount = 0;
    const updatedContent = content.replace(headerRegex, (match) => {
      matchCount++;
      // Return new header but try to keep matching indentation if possible
      const lines = match.split("\n");
      const firstLine = lines[0];
      const matchIndent = firstLine.match(/^\s*/);
      const indent = matchIndent ? matchIndent[0] : "      ";
      
      const indentedNewHeader = NEW_HEADER_HTML.split("\n")
        .map((line, idx) => (idx === 0 ? line : indent + line.trim()))
        .join("\n");
        
      return indentedNewHeader;
    });

    if (matchCount > 0) {
      fs.writeFileSync(fullPath, updatedContent, "utf-8");
      console.log(`Successfully updated ${matchCount} headers in: ${relPath}`);
    } else {
      console.log(`No matching headers found in: ${relPath}`);
    }
  });
}

processFiles();
