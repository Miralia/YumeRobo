import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { select } from "@inquirer/prompts";
import {
  createStoredComparison,
  extractSlowPicsCandidates,
  getComparisonFilePath,
  writeStoredComparison,
  type SlowPicsCandidate,
} from "./lib/comparisons";
import { createSlowPicsCollector } from "./lib/slowpics-collect";
import type { ReleaseData } from "./lib/types";

interface ReleaseRecord {
  slug: string;
  data: ReleaseData;
}

const releasesDir = path.join(process.cwd(), "src", "lib", "content", "releases");
const force = process.argv.includes("--force");

if (process.argv.includes("--help") || process.argv.includes("-h")) {
  console.log([
    "Usage: bun run backfill:comparisons [--force]",
    "",
    "Backfill comparison sidecars for every historical release.",
    "Existing sidecars are skipped unless --force is provided.",
    "When Tech Info contains multiple slow.pics links, you must select one.",
  ].join("\n"));
  process.exit(0);
}

async function loadReleases(): Promise<ReleaseRecord[]> {
  const records: ReleaseRecord[] = [];
  for (const file of await fs.readdir(releasesDir)) {
    if (!file.endsWith(".ts")) continue;
    const module = await import(pathToFileURL(path.join(releasesDir, file)).href);
    if (module.release) records.push({ slug: module.release.slug, data: module.release });
  }
  return records.sort((a, b) => a.data.title.localeCompare(b.data.title));
}

async function exists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function chooseCandidate(
  release: ReleaseData,
  candidates: SlowPicsCandidate[],
): Promise<SlowPicsCandidate> {
  if (candidates.length === 1) {
    console.log(`[i] ${candidates[0].label} - ${candidates[0].url}`);
    return candidates[0];
  }

  return select({
    message: `Select the slow.pics comparison for ${release.title}:`,
    choices: candidates.map((candidate) => ({
      name: `${candidate.label} - ${candidate.url}`,
      value: candidate,
    })),
  });
}

const releases = await loadReleases();
const collector = await createSlowPicsCollector();
let saved = 0;
let existing = 0;
let withoutLink = 0;
let skipped = 0;

console.log(`[i] Historical comparison backfill: ${releases.length} releases${force ? " (force refresh)" : ""}`);

try {
  for (const [index, record] of releases.entries()) {
    const target = getComparisonFilePath(record.slug);
    console.log(`\n[${index + 1}/${releases.length}] ${record.data.title} (${record.slug})`);

    if (!force && await exists(target)) {
      existing++;
      console.log("[i] Existing comparison metadata, skipped");
      continue;
    }

    const candidates = extractSlowPicsCandidates(record.data.specs);
    if (candidates.length === 0) {
      withoutLink++;
      console.log("[i] No slow.pics link in Tech Info, skipped");
      continue;
    }

    while (true) {
      try {
        // More than one candidate always pauses here for explicit confirmation.
        const candidate = await chooseCandidate(record.data, candidates);
        const collection = await collector.collect(candidate.url, candidate.key);
        await writeStoredComparison(
          record.slug,
          createStoredComparison(candidate, collection),
        );
        saved++;
        console.log(`[+] Saved ${target}`);
        break;
      } catch (error) {
        console.error(`[!] ${error instanceof Error ? error.message : String(error)}`);
        const action = await select({
          message: "Backfill action:",
          choices: [
            { name: "Retry this release", value: "retry" },
            { name: "Skip this release", value: "skip" },
            { name: "Stop backfill", value: "stop" },
          ],
        });
        if (action === "retry") continue;
        if (action === "stop") throw new Error("Backfill stopped by user");
        skipped++;
        break;
      }
    }
  }
} finally {
  await collector.close();
  console.log(`\n[i] Backfill result: saved=${saved} existing=${existing} no-link=${withoutLink} skipped=${skipped}`);
}
