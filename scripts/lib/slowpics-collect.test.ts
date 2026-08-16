import { describe, expect, test } from "bun:test";
import { createSlowPicsCollector, extractCollectionFromHtml } from "./slowpics-collect";
import { validateSlowPicsCollection } from "./comparisons";

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

function htmlWithCollection(value: unknown): string {
  return [
    "<!doctype html><html><body>",
    "<script>",
    "        var collection = " + JSON.stringify(value) + ";",
    "        var currentComparisonIndex = 0;",
    "    </script>",
    "</body></html>",
  ].join("\n");
}

describe("slow.pics HTML collection extraction", () => {
  test("extracts and parses the embedded collection JSON", () => {
    const parsed = extractCollectionFromHtml(htmlWithCollection(collection()));
    expect(parsed).toEqual(collection());
  });

  test("returns null when the page has no collection payload", () => {
    expect(extractCollectionFromHtml("<html><body>blocked</body></html>")).toBeNull();
  });

  test("survives braces and semicolons inside string values", () => {
    const tricky = collection("abc123");
    tricky.comparisons[0].images[0].name = '}; {"quote"';
    const parsed = extractCollectionFromHtml(htmlWithCollection(tricky));
    expect(parsed).toEqual(tricky);
  });

  test("extracted payload passes slow.pics validation with the expected key", () => {
    const parsed = extractCollectionFromHtml(htmlWithCollection(collection("abc123")));
    expect(validateSlowPicsCollection(parsed, "row1").key).toBe("abc123");
  });
});

describe("slow.pics collector factory", () => {
  test("creates a collector with collect and close without launching a browser", async () => {
    const collector = await createSlowPicsCollector();
    expect(typeof collector.collect).toBe("function");
    await expect(collector.close()).resolves.toBeUndefined();
  });
});
