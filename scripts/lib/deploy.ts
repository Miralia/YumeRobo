import type { CliConfig } from "./config";

export interface CommandRunnerResult {
	stdout: string;
	stderr: string;
}

/**
 * Commands are passed as an argument vector, never as a shell string: the
 * project name and branch come from `.env`, and interpolating them into a
 * shell command would make the deploy step injectable.
 */
export type CommandRunner = (
	file: string,
	args: string[],
) => Promise<CommandRunnerResult>;

export interface DeployCommand {
	file: string;
	args: string[];
}

export interface DeployPreflightIssue {
	field: "PUBLIC_SITE_URL" | "CLOUDFLARE_PAGES_PROJECT" | "CLOUDFLARE_PRODUCTION_BRANCH";
	message: string;
}

const PLACEHOLDER_HOSTS = new Set(["example.com", "www.example.com"]);

export function isProjectAlreadyExistsError(error: unknown): boolean {
	const text = stringifyError(error).toLowerCase();
	return text.includes("already exists");
}

export async function ensurePagesProject(
	runCommand: CommandRunner,
	projectName: string,
	productionBranch: string,
): Promise<"created" | "exists"> {
	try {
		await runCommand("npx", [
			"wrangler",
			"pages",
			"project",
			"create",
			projectName,
			"--production-branch",
			productionBranch,
		]);
		return "created";
	} catch (error) {
		if (isProjectAlreadyExistsError(error)) {
			return "exists";
		}

		throw new Error(
			`Failed to ensure Cloudflare Pages project: ${stringifyError(error)}`,
		);
	}
}

export function getDeployCommand(
	projectName: string,
	buildDir: string,
): DeployCommand {
	return {
		file: "npx",
		args: [
			"wrangler",
			"pages",
			"deploy",
			buildDir,
			"--project-name",
			projectName,
			"--commit-dirty=true",
		],
	};
}

export function getDeployPreflightIssues(
	config: CliConfig,
): DeployPreflightIssue[] {
	const issues: DeployPreflightIssue[] = [];

	if (!config.cloudflarePagesProject.trim()) {
		issues.push({
			field: "CLOUDFLARE_PAGES_PROJECT",
			message: "CLOUDFLARE_PAGES_PROJECT must not be empty before deploy",
		});
	}

	if (!config.cloudflareProductionBranch.trim()) {
		issues.push({
			field: "CLOUDFLARE_PRODUCTION_BRANCH",
			message: "CLOUDFLARE_PRODUCTION_BRANCH must not be empty before deploy",
		});
	}

	try {
		const siteUrl = new URL(config.siteUrl);
		if (siteUrl.protocol !== "http:" && siteUrl.protocol !== "https:") {
			issues.push({
				field: "PUBLIC_SITE_URL",
				message: "PUBLIC_SITE_URL must be an absolute http(s) URL before deploy",
			});
		} else if (PLACEHOLDER_HOSTS.has(siteUrl.hostname)) {
			issues.push({
				field: "PUBLIC_SITE_URL",
				message: "PUBLIC_SITE_URL must be set to a real production URL before deploy",
			});
		}
	} catch {
		issues.push({
			field: "PUBLIC_SITE_URL",
			message: "PUBLIC_SITE_URL must be a valid absolute URL before deploy",
		});
	}

	return issues;
}

export function hasDeployPreflightIssues(
	issues: DeployPreflightIssue[],
): boolean {
	return issues.length > 0;
}

export function formatDeployPreflightIssues(
	issues: DeployPreflightIssue[],
): string {
	return [
		"DEPLOY_PREFLIGHT",
		...issues.map((issue) => `- field=${issue.field} message=${issue.message}`),
	].join("\n");
}

/**
 * Extract everything a caller might need to diagnose a failed command.
 * `child_process` errors are `Error` instances that also carry `stdout` and
 * `stderr`, so the `instanceof Error` branch must not short-circuit them —
 * "already exists" frequently appears only in the captured output.
 */
function stringifyError(error: unknown): string {
	const parts: string[] = [];

	if (error instanceof Error && error.message) {
		parts.push(error.message);
	}

	if (typeof error === "object" && error !== null) {
		const record = error as Record<string, unknown>;
		for (const key of ["stdout", "stderr"] as const) {
			const value = record[key];
			if (typeof value === "string" && value.trim()) parts.push(value);
		}
		if (parts.length === 0) {
			const message = record.message;
			if (typeof message === "string") parts.push(message);
		}
	}

	if (parts.length === 0) parts.push(String(error));

	return parts.join("\n");
}
