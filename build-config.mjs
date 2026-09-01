import { writeFileSync } from "node:fs";

const config = {
  url: process.env.SUPABASE_URL || "",
  anonKey: process.env.SUPABASE_ANON_KEY || "",
};

writeFileSync(
  "supabase-config.js",
  `// Generated at build time. Do not add a service-role key here.
window.ROBO_SUPABASE_CONFIG = ${JSON.stringify(config, null, 2)};
`,
);

console.log(
  config.url && config.anonKey
    ? "Supabase browser configuration generated."
    : "Supabase environment variables are not set; keeping Supabase disabled.",
);