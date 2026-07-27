import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import {
  YACOMP_WEB_SHA256,
  YACOMP_WEB_VERSION,
} from "../src/lib/config/yacomp-web";

const source = `https://github.com/Miralia/yacomp-web/releases/download/v${YACOMP_WEB_VERSION}/yacomp-web.esm.js`;
const target = path.join(
  process.cwd(),
  "static",
  "vendor",
  "yacomp-web",
  `v${YACOMP_WEB_VERSION}`,
  "yacomp-web.esm.js",
);

const response = await fetch(source, { redirect: "follow" });
if (!response.ok) throw new Error(`yacomp-web download returned ${response.status}`);

const asset = new Uint8Array(await response.arrayBuffer());
const digest = createHash("sha256").update(asset).digest("hex");
if (digest !== YACOMP_WEB_SHA256) {
  throw new Error(`yacomp-web checksum mismatch: expected ${YACOMP_WEB_SHA256}, received ${digest}`);
}

await fs.mkdir(path.dirname(target), { recursive: true });
await fs.writeFile(target, asset);
console.log(`[+] Vendored yacomp-web ${YACOMP_WEB_VERSION}: ${target}`);
