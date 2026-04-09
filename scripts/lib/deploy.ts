export interface CommandRunnerResult {
	stdout: string;
	stderr: string;
}

export type CommandRunner = (command: string) => Promise<CommandRunnerResult>;

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
