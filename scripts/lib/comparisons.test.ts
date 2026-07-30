import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, test } from "bun:test";
import {
  createStoredComparison,
  deleteStoredComparison,
  extractSlowPicsCandidates,
  getComparisonDeepLink,
  readStoredComparison,
  readStoredComparisonFile,
  validateSlowPicsCollection,
  writeStoredComparison,
  writeStoredComparisonFile,
} from "./comparisons";

function collection(key = "abc123") {
  return {
    key,
    name: "Example",
    comparisons: [
      {
        key: "row1",
        images: [
          { name: "Source", publicFileName: "source.png", width: 1920, height: 1080 },
          { name: "Encode", publicFileName: "encode.png", width: 1920, height: 1080 },
        ],
      },
    ],
  };
}

describe("slow.pics comparison metadata", () => {
  test("extracts unique candidates and readable labels from Tech Info HTML", () => {
    const candidates = extractSlowPicsCandidates([
      {
        content: `Comparisons: <a href="https://slow.pics/c/abc123">Source | Encode</a>
          <a href="https://slow.pics/c/def456/">Disc sources</a>
          <a href="https://example.com/c/nope">Ignore</a>`,
      },
      { content: `<a href="https://slow.pics/c/abc123">Duplicate</a>` },
    ]);

    expect(candidates).toEqual([
      { key: "abc123", url: "https://slow.pics/c/abc123", label: "Duplicate" },
      { key: "def456", url: "https://slow.pics/c/def456", label: "Disc sources" },
    ]);
  });

  test("validates collection identity and grid shape", () => {
    expect(validateSlowPicsCollection(collection(), "abc123").comparisons).toHaveLength(1);
    expect(validateSlowPicsCollection(collection(), "row1").key).toBe("abc123");
    expect(() => validateSlowPicsCollection(collection("other"), "abc123")).toThrow("key mismatch");

    const uneven = collection();
    uneven.comparisons.push({ key: "row2", images: [uneven.comparisons[0].images[0]] });
    expect(() => validateSlowPicsCollection(uneven, "abc123")).toThrow("inconsistent column counts");
  });

  test("preserves a comparison entry URL when its key differs from the parent collection", () => {
    const stored = createStoredComparison(
      { key: "row1", url: "https://slow.pics/c/row1", label: "Source | Encode" },
      collection("parent1"),
    );

    expect(stored.source).toEqual({
      provider: "slowpics",
      key: "row1",
      url: "https://slow.pics/c/row1",
    });
    expect(stored.collection.key).toBe("parent1");
  });

  test("writes and reads a versioned sidecar without image binaries", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "yumerobo-comparison-"));
    try {
      const stored = createStoredComparison(
        { key: "abc123", url: "https://slow.pics/c/abc123", label: "Example" },
        collection(),
      );
      const target = await writeStoredComparison("release1", stored, root);
      expect(target).toEndWith("static/comparisons/release1.json");
      expect(await readStoredComparison("release1", root)).toEqual(stored);
      expect(await fs.readFile(target, "utf8")).not.toContain("data:image");
    } finally {
      await fs.rm(root, { recursive: true, force: true });
    }
  });

  test("writes and reads a staged sidecar at an explicit path", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "yumerobo-comparison-stage-"));
    const target = path.join(root, "drafts", "comparison.json");
    try {
      const stored = createStoredComparison(
        { key: "abc123", url: "https://slow.pics/c/abc123", label: "Example" },
        collection(),
      );
      expect(await writeStoredComparisonFile(target, stored)).toBe(target);
      expect(await readStoredComparisonFile(target)).toEqual(stored);
    } finally {
      await fs.rm(root, { recursive: true, force: true });
    }
  });

  test("deletes a stored sidecar idempotently", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "yumerobo-comparison-delete-"));
    try {
      await writeStoredComparison(
        "release1",
        createStoredComparison(
          { key: "abc123", url: "https://slow.pics/c/abc123", label: "Example" },
          collection(),
        ),
        root,
      );
      expect(await deleteStoredComparison("release1", root)).toBe(true);
      expect(await deleteStoredComparison("release1", root)).toBe(false);
      expect(await readStoredComparison("release1", root)).toBeNull();
    } finally {
      await fs.rm(root, { recursive: true, force: true });
    }
  });

  test("builds the public viewer deep link", () => {
    expect(getComparisonDeepLink("https://yumerobo.moe/", "release1"))
      .toBe("https://yumerobo.moe/release1/comparisons");
  });
});
