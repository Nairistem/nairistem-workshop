import fs from "fs";

const SUPABASE_PROJECT = process.env.SUPABASE_PROJECT || "lmppkwjwlugqogueghmk";
const SUPABASE_TOKEN = process.env.SUPABASE_ACCESS_TOKEN || "";

async function runMigration() {
  if (!SUPABASE_TOKEN) {
    console.log("No SUPABASE_ACCESS_TOKEN provided in environment. Skipping remote migration.");
    return;
  }
  let sql = fs.readFileSync("supabase/schema.sql", "utf8");
  sql = sql.replace(/^\uFEFF/, "").trim();
  console.log("Reading schema.sql, length:", sql.length);

  const res = await fetch(`https://api.supabase.com/v1/projects/${SUPABASE_PROJECT}/database/query`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${SUPABASE_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ query: sql })
  });

  const text = await res.text();
  console.log("Status:", res.status);
  console.log("Response:", text);
}

runMigration().catch(console.error);
