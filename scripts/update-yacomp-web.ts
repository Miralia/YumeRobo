import fs from "node:fs/promises";
import path from "node:path";
import {
  YACOMP_WEB_VERSION,
} from "../src/lib/config/yacomp-web";

interface GitHubRelease {
  tag_name: string;
  prerelease: boolean;
  draft: boolean;
  assets: Array<{ name: string; browser_download_url: string }>;
}

interface YacompManifest {
  name: string;
  version: string;
  file: string;
  sha256: string;
}

const apiUrl = "https://api.github.com/repos/Miralia/yacomp-web/releases/latest";
const headers: Record<string, string> = {
  Accept: "application/vnd.github+json",
  "User-Agent": "YumeRobo-yacomp-updater",
};
if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

const releaseResponse = await fetch(apiUrl, { headers });
if (!releaseResponse.ok) throw new Error(`GitHub release API returned ${releaseResponse.status}`);
const release = await releaseResponse.json() as GitHubRelease;

if (release.draft || release.prerelease || !/^v\d+\.\d+\.\d+-web\.\d+$/.test(release.tag_name)) {
  throw new Error(`Latest yacomp-web release is not a stable Web release: ${release.tag_name}`);
}

const nextVersion = release.tag_name.slice(1);
if (nextVersion === YACOMP_WEB_VERSION) {
  console.log(`[i] yacomp-web ${YACOMP_WEB_VERSION} is current`);
  process.exit(0);
}

const manifestAsset = release.assets.find((asset) => asset.name === "yacomp-web.manifest.json");
if (!manifestAsset) throw new Error("Latest yacomp-web release has no manifest asset");

const manifestResponse = await fetch(manifestAsset.browser_download_url, { headers });
if (!manifestResponse.ok) throw new Error(`yacomp-web manifest returned ${manifestResponse.status}`);
const manifest = await manifestResponse.json() as YacompManifest;
if (
  manifest.name !== "yacomp-web" ||
  manifest.version !== nextVersion ||
  manifest.file !== "yacomp-web.esm.js" ||
  !/^[a-f0-9]{64}$/.test(manifest.sha256)
) {
  throw new Error("Latest yacomp-web manifest is invalid");
}

const configPath = path.join(process.cwd(), "src", "lib", "config", "yacomp-web.ts");
const previousAssetDir = path.join(
  process.cwd(),
  "static",
  "vendor",
  "yacomp-web",
  `v${YACOMP_WEB_VERSION}`,
);

await fs.writeFile(configPath, [
  `export const YACOMP_WEB_VERSION = "${nextVersion}";`,
  `export const YACOMP_WEB_SHA256 = "${manifest.sha256}";`,
  "export const YACOMP_WEB_ASSET_URL = `/vendor/yacomp-web/v${YACOMP_WEB_VERSION}/yacomp-web.esm.js`;",
  "",
].join("\n"));

const vendor = Bun.spawn(["bun", "run", "vendor:yacomp"], {
  cwd: process.cwd(),
  stdout: "inherit",
  stderr: "inherit",
});
if (await vendor.exited !== 0) throw new Error("Failed to vendor the new yacomp-web asset");

await fs.rm(previousAssetDir, { recursive: true, force: true });
console.log(`[+] Updated yacomp-web ${YACOMP_WEB_VERSION} -> ${nextVersion}`);
