export interface CliConfig {
	siteUrl: string;
	cloudflarePagesProject: string;
	cloudflareProductionBranch: string;
	telegramBotToken?: string;
	telegramChannelId?: string;
}

const DEFAULT_SITE_URL = "https://yumerobo.moe";
const DEFAULT_CLOUDFLARE_PROJECT = "yumerobo";
const DEFAULT_CLOUDFLARE_BRANCH = "main";

export function getCliConfig(
	env: Record<string, string | undefined> = process.env,
): CliConfig {
	return {
		siteUrl: normalizeSiteUrl(env.PUBLIC_SITE_URL || DEFAULT_SITE_URL),
		cloudflarePagesProject:
			env.CLOUDFLARE_PAGES_PROJECT || DEFAULT_CLOUDFLARE_PROJECT,
		cloudflareProductionBranch:
			env.CLOUDFLARE_PRODUCTION_BRANCH || DEFAULT_CLOUDFLARE_BRANCH,
		telegramBotToken: env.TELEGRAM_BOT_TOKEN,
		telegramChannelId: env.TELEGRAM_CHANNEL_ID,
	};
}

export function getReleaseUrl(config: CliConfig, slug: string): string {
	return `${config.siteUrl}/${slug}`;
}

export function getTelegramConfig(
	config: CliConfig,
): { token: string; channelId: string } | null {
	if (!config.telegramBotToken || !config.telegramChannelId) {
		return null;
	}

	return {
		token: config.telegramBotToken,
		channelId: config.telegramChannelId,
	};
}

function normalizeSiteUrl(siteUrl: string): string {
	return siteUrl.replace(/\/+$/, "");
}
