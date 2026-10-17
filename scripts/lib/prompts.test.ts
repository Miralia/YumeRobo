import { describe, expect, test } from "bun:test";
import { parseSeasonInput, validateSeasonInput } from "./prompts";

describe("validateSeasonInput", () => {
    test("accepts whole numbers including 0 (none/single)", () => {
        for (const value of ["0", "1", "2", "12", " 3 "]) {
            expect(validateSeasonInput(value)).toBe(true);
        }
    });

    test("rejects junk, decimals and negatives", () => {
        for (const value of ["3abc", "1.9", "-5", "", "abc", "1e2", "+3", "٣"]) {
            expect(validateSeasonInput(value)).toBe("Must be a whole number (0 for none/single)");
        }
    });
});

describe("parseSeasonInput", () => {
    test("maps 0 to no season and keeps positive seasons", () => {
        expect(parseSeasonInput("0")).toBeUndefined();
        expect(parseSeasonInput("2")).toBe(2);
        expect(parseSeasonInput(" 12 ")).toBe(12);
    });
});
