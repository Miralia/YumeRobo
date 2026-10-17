/**
 * Minimal ambient declarations for the Bun runtime APIs this CLI calls.
 *
 * The project deliberately does not depend on `bun-types`: the CLI only ever
 * runs under Bun (`bun run cli`), so we declare the handful of globals and the
 * `bun:test` surface the test files use. Anything beyond this should be added
 * here rather than by installing a types package.
 */

declare const Bun: {
	file(path: string): {
		json(): Promise<unknown>;
		text(): Promise<string>;
		exists(): Promise<boolean>;
		stat(): Promise<{ mtime: Date; size: number }>;
	};
	write(path: string, data: string | Uint8Array): Promise<number>;
	spawn(
		command: string[],
		options?: {
			cwd?: string;
			stdout?: "inherit" | "pipe";
			stderr?: "inherit" | "pipe";
		},
	): { exited: Promise<number> };
	serve(options: {
		port?: number;
		fetch(request: Request): Response | Promise<Response>;
	}): { port: number; stop(closeActiveConnections?: boolean): void };
};

declare module "bun:test" {
	type TestBody = () => void | Promise<void>;
	type EachBody = (...args: never[]) => void | Promise<void>;

	interface Eachable {
		/** Table of rows: each row's elements are spread into the test body. */
		<Row extends readonly unknown[]>(
			cases: readonly Row[],
		): (name: string, fn: (...args: Row) => void | Promise<void>) => void;
		/** Flat table: each element is passed as the single argument. */
		<Value>(
			cases: readonly Value[],
		): (name: string, fn: (value: Value) => void | Promise<void>) => void;
	}

	interface TestFn {
		(name: string, fn: TestBody): void;
		each: Eachable;
	}

	export const describe: TestFn;
	export const test: TestFn;
	export function beforeAll(fn: TestBody): void;
	export function afterAll(fn: TestBody): void;
	export function beforeEach(fn: TestBody): void;
	export function afterEach(fn: TestBody): void;

	interface Matchers {
		toBe(expected: unknown): void;
		toEqual(expected: unknown): void;
		toContain(expected: unknown): void;
		toContainEqual(expected: unknown): void;
		toEndWith(expected: unknown): void;
		toStartWith(expected: unknown): void;
		toHaveLength(expected: number): void;
		toMatch(expected: unknown): void;
		toThrow(expected?: unknown): void;
		toMatchObject(expected: unknown): void;
		toBeNull(): void;
		toBeUndefined(): void;
		toBeDefined(): void;
		toBeTruthy(): void;
		toBeFalsy(): void;
		toBeInstanceOf(expected: unknown): void;
		toBeGreaterThan(expected: number): void;
		toBeGreaterThanOrEqual(expected: number): void;
		toBeLessThan(expected: number): void;
		toBeLessThanOrEqual(expected: number): void;
		rejects: Matchers;
		resolves: Matchers;
		not: Matchers;
	}

	export function expect(value: unknown): Matchers;
}
