import { describe, expect, test } from "bun:test";
import {
  createSlowPicsCollector,
  extractCollectionFromHtml,
  SlowPicsPayloadError,
} from "./slowpics-collect";
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

  test("ignores braces inside single quotes, backticks and comments", () => {
    const payload = JSON.stringify(collection("abc123"));
    const html = [
      "<!doctype html><html><body><script>",
      "// a line comment with } and \" and ' and `",
      "/* a block comment with } { \" ' ` */",
      "var unrelated = 'a single quoted } brace';",
      "var alsoUnrelated = `a backtick } brace`;",
      "var collection = " + payload + ";",
      "</script></body></html>",
    ].join("\n");

    expect(extractCollectionFromHtml(html)).toEqual(collection("abc123"));
  });

  test("a malformed payload raises a parse error, not a blocked/network message", () => {
    const html = "<script>var collection = { \"key\": \"abc123\", };</script>";

    expect(() => extractCollectionFromHtml(html)).toThrow(SlowPicsPayloadError);
    expect(() => extractCollectionFromHtml(html)).toThrow(/not valid JSON/);
    // No marker at all stays "payload missing" (null), not a parse error.
    expect(extractCollectionFromHtml("<html><body>blocked</body></html>")).toBeNull();
  });

  test("the collector refuses URLs that are not https slow.pics", async () => {
    const collector = await createSlowPicsCollector();
    await expect(collector.collect("https://slow.pics.evil.example/c/abc123", "abc123"))
      .rejects.toThrow("Refusing to fetch a non-slow.pics URL");
    await expect(collector.collect("http://slow.pics/c/abc123", "abc123"))
      .rejects.toThrow("Refusing to fetch a non-slow.pics URL");
    await expect(collector.collect("not a url", "abc123"))
      .rejects.toThrow("Invalid slow.pics URL");
  });
});

describe("slow.pics collector factory", () => {
  test("creates a collector with collect and close without launching a browser", async () => {
    const collector = await createSlowPicsCollector();
    expect(typeof collector.collect).toBe("function");
    await expect(collector.close()).resolves.toBeUndefined();
  });
});
