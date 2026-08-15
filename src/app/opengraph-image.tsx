import fs from "fs";
import path from "path";

export const runtime = "nodejs";
export const alt = "DK Foundation of Freedom and Justice - Human Rights Protection";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  const filePath = path.join(process.cwd(), "public/og-image.png");
  if (fs.existsSync(filePath)) {
    const buffer = fs.readFileSync(filePath);
    return new Response(buffer, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  }
  return new Response("OG Image Not Found", { status: 404 });
}
