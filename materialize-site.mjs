import { readFileSync, writeFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";

const encoded = readFileSync("site-index.gz.b64", "utf8").trim();
writeFileSync("index.html", gunzipSync(Buffer.from(encoded, "base64")));
console.log("Site entrypoint generated.");
