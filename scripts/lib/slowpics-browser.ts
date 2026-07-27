import fs from "node:fs/promises";
import { chromium, type Browser } from "playwright-core";
import { validateSlowPicsCollection, type SlowPicsCollection } from "./comparisons";

export interface SlowPicsBrowserCollector {
  collect(url: string, expectedKey: string): Promise<SlowPicsCollection>;
  close(): Promise<void>;
}

async function existingExecutablePath(): Promise<string | undefined> {
  const configured = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
  const candidates = [
    configured,
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
  ].filter((value): value is string => Boolean(value));

  for (const candidate of candidates) {
    try {
      await fs.access(candidate);
      return candidate;
    } catch {
      // Try the next installed browser.
    }
  }
  return undefined;
}

async function launchBrowser(): Promise<Browser> {
  const executablePath = await existingExecutablePath();
  if (executablePath) return chromium.launch({ headless: true, executablePath });

  try {
    return await chromium.launch({ headless: true, channel: "chrome" });
  } catch (error) {
    throw new Error(
      "Chromium is required for slow.pics collection sync. Install Google Chrome or set PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH.",
      { cause: error },
    );
  }
}

export async function createSlowPicsBrowserCollector(): Promise<SlowPicsBrowserCollector> {
  const browser = await launchBrowser();
  const context = await browser.newContext({ locale: "en-US" });

  await context.route("**/*", async (route) => {
    if (route.request().resourceType() === "document") {
      await route.continue();
    } else {
      await route.abort();
    }
  });

  return {
    async collect(url: string, expectedKey: string): Promise<SlowPicsCollection> {
      const page = await context.newPage();
      try {
        const response = await page.goto(url, {
          waitUntil: "domcontentloaded",
          timeout: 30_000,
        });
        if (!response?.ok()) {
          throw new Error(`slow.pics returned HTTP ${response?.status() ?? "unknown"}`);
        }
        const collection = await page.evaluate(() =>
          (globalThis as typeof globalThis & { collection?: unknown }).collection
        );
        return validateSlowPicsCollection(collection, expectedKey);
      } finally {
        await page.close();
      }
    },
    async close(): Promise<void> {
      await context.close();
      await browser.close();
    },
  };
}
