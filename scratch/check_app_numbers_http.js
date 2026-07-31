const https = require("https");

const url = "https://tgszzjbvpcznndrfkkov.supabase.co/rest/v1/appreciation_applications?select=id,application_no,full_name,created_at&order=created_at.desc&limit=10";
const options = {
  headers: {
    "apikey": "sb_publishable_TU0EoaL-jusAaWLETkH5Ig_ODLvIw5n",
    "Authorization": "Bearer sb_publishable_TU0EoaL-jusAaWLETkH5Ig_ODLvIw5n"
  }
};

https.get(url, options, (res) => {
  let body = "";
  res.on("data", (chunk) => body += chunk);
  res.on("end", () => {
    console.log("Status:", res.statusCode);
    console.log("Data:", JSON.parse(body));
  });
});
