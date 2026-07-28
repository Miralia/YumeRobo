import { YACOMP_WEB_VERSION } from "../src/lib/config/yacomp-web";

interface GitHubRelease {
  tag_name: string;
  prerelease: boolean;
  draft: boolean;
  html_url: string;
}

const apiUrl = "https://api.github.com/repos/Miralia/yacomp-web/releases/latest";
const headers: Record<string, string> = {
  Accept: "application/vnd.github+json",
  "User-Agent": "YumeRobo-yacomp-checker",
};
if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

const response = await fetch(apiUrl, { headers });
if (!response.ok) {
  throw new Error(`GitHub release API returned ${response.status}`);
}

const release = await response.json() as GitHubRelease;
if (
  release.draft ||
  release.prerelease ||
  !/^v\d+\.\d+\.\d+-web\.\d+$/.test(release.tag_name)
) {
  throw new Error(`Latest yacomp-web release is not a stable Web release: ${release.tag_name}`);
}

const latestVersion = release.tag_name.slice(1);
console.log(`Current: ${YACOMP_WEB_VERSION}`);
console.log(`Latest:  ${latestVersion}`);

if (latestVersion === YACOMP_WEB_VERSION) {
  console.log("yacomp-web is up to date.");
} else {
  console.log(`Update available: bun run update:yacomp`);
  console.log(release.html_url);
}
