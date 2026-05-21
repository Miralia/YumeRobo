export type CliCommand =
	| "create"
	| "edit"
	| "delete"
	| "deploy"
	| "telegram"
	| "audit-assets"
	| "prune-assets"
	| "backfill-card-posters"
	| "help";

export function resolveCliCommand(argv: string[]): {
	command: CliCommand | string;
	args: string[];
} {
	if (argv.length === 0) {
		return { command: "create", args: [] };
	}

	const [first, ...rest] = argv;
	if (first === "--help" || first === "-h" || first === "help") {
		return { command: "help", args: [] };
	}

	return {
		command: first,
		args: rest,
	};
}

export function getCliUsage(): string {
	return [
		"Usage: bun run cli <command>",
		"",
		"Commands:",
		"  create               Interactive wizard to create a new release",
		"  edit                 Edit an existing release",
		"  delete <slug>        Delete a release by slug and clean owned assets",
		"  telegram             Push an existing release to Telegram",
		"  audit-assets         Audit managed media assets for drift or orphaning",
		"  prune-assets         Delete orphaned managed media assets after confirmation",
		"  backfill-card-posters Generate missing card poster assets for all releases",
		"  deploy               Build and deploy to Cloudflare Pages",
		"  help                 Show this help message",
	].join("\n");
}
