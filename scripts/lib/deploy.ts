import type { CliConfig } from "./config";

export interface CommandRunnerResult {
	stdout: string;
	stderr: string;
}

export type CommandRunner = (command: string) => Promise<CommandRunnerResult>;
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
	const command = `npx wrangler pages project create ${projectName} --production-branch ${productionBranch}`;

	try {
		await runCommand(command);
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
): string {
	return `npx wrangler pages deploy ${buildDir} --project-name ${projectName} --commit-dirty=true`;
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
		if (PLACEHOLDER_HOSTS.has(siteUrl.hostname)) {
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

function stringifyError(error: unknown): string {
	if (error instanceof Error) {
		return error.message;
	}

	if (typeof error === "object" && error !== null) {
		const stdout =
			"stdout" in error && typeof error.stdout === "string" ? error.stdout : "";
		const stderr =
			"stderr" in error && typeof error.stderr === "string" ? error.stderr : "";
		const message =
			"message" in error && typeof error.message === "string"
				? error.message
				: "";
		return [message, stdout, stderr].filter(Boolean).join("\n");
	}

	return String(error);
}
