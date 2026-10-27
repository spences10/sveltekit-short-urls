export interface ParsedUserAgent {
	browser: string | null;
	os: string | null;
	device_type: 'desktop' | 'mobile' | 'tablet' | null;
	is_bot: boolean;
	/** The service fetching a link preview, which is always a bot. */
	preview_source: string | null;
}

// Link previews say who they are; showing them apart says where a link
// was shared. First match wins, so iMessage's combined agent reads as
// Facebook.
const preview_sources: [RegExp, string][] = [
	[/linkedinbot/i, 'LinkedIn'],
	[/slackbot|slack-imgproxy/i, 'Slack'],
	[/skypeuripreview|microsoftpreview|teams/i, 'Microsoft Teams'],
	[/facebookexternalhit|meta-externalagent|facebot/i, 'Facebook'],
	[/twitterbot/i, 'X'],
	[/whatsapp/i, 'WhatsApp'],
	[/telegrambot/i, 'Telegram'],
	[/discordbot/i, 'Discord'],
	[/mastodon\//i, 'Mastodon'],
	[/bluesky|cardyb/i, 'Bluesky'],
];

// From scottspence.com's capture list, which is tuned on real traffic.
const bot_patterns = [
	// Generic indicators.
	/bot/i,
	/crawl/i,
	/spider/i,
	/slurp/i,
	/mediapartners/i,
	// Search engines.
	/yandex/i,
	/baidu/i,
	/sogou/i,
	// AI crawlers and agents.
	/chatgpt/i,
	/oai-searchbot/i,
	/notebooklm/i,
	/claude-user/i,
	/anthropic/i,
	/langchain/i,
	/perplexity/i,
	/cohere/i,
	/lmarena/i,
	// Social previews not named above.
	/meta-webindexer/i,
	/whatsapp/i,
	/telegram/i,
	/slack/i,
	// SEO tools.
	/semrush/i,
	/ahrefs/i,
	/bytespider/i,
	// Feed readers.
	/newsblur/i,
	/feedly/i,
	/feeder\.co/i,
	/freshrss/i,
	/feedfetcher/i,
	// Monitoring and testing.
	/pingdom/i,
	/uptimerobot/i,
	/gtmetrix/i,
	/lighthouse/i,
	// Headless browsers and automation.
	/headlesschrome/i,
	/phantomjs/i,
	/selenium/i,
	/puppeteer/i,
	/playwright/i,
	// HTTP clients and libraries.
	/python-requests/i,
	/python-urllib/i,
	/aiohttp/i,
	/curl/i,
	/wget/i,
	/httpx/i,
	/axios/i,
	/go-http-client/i,
	/java\//i,
	/ruby/i,
	/perl/i,
	/guzzlehttp/i,
	/colly/i,
	/scrapy/i,
	/node-fetch/i,
	/undici/i,
	// Developer tools.
	/postman/i,
	/insomnia/i,
	// Archives.
	/archive\.org/i,
	// Bare or spoofed agents.
	/^node$/i,
	/^Mozilla\/5\.0$/,
	/^Mozilla\/5\.0 \(compatible\)$/,
	/MSIE [5-7]\./i,
	/iPhone; CPU iPhone OS 1[0-4]_/i,
	/Android [4-9];.*Chrome\/[4-8]\d\./i,
	/Chrome\/[1-9]\d\.\d/i,
	/Chrome\/\d+\.0\.0\.0(?!\s+Safari)/i,
];

function browser_of(agent: string) {
	if (/edg/i.test(agent)) return 'Edge';
	if (/opr|opera/i.test(agent)) return 'Opera';
	if (/samsungbrowser/i.test(agent)) return 'Samsung';
	if (/chrome|chromium|crios/i.test(agent)) return 'Chrome';
	if (/firefox|fxios/i.test(agent)) return 'Firefox';
	if (/safari/i.test(agent)) return 'Safari';
	return null;
}

function os_of(agent: string) {
	if (/windows/i.test(agent)) return 'Windows';
	if (/iphone|ipad|ipod/i.test(agent)) return 'iOS';
	if (/macintosh|mac os x/i.test(agent)) return 'macOS';
	if (/android/i.test(agent)) return 'Android';
	if (/cros/i.test(agent)) return 'ChromeOS';
	if (/linux/i.test(agent)) return 'Linux';
	return null;
}

function device_of(
	agent: string,
	os: string | null,
): ParsedUserAgent['device_type'] {
	if (/ipad|tablet|playbook|silk/i.test(agent)) return 'tablet';
	if (/mobile|iphone|ipod|windows phone/i.test(agent))
		return 'mobile';
	return os ? 'desktop' : null;
}

/** Hand-written matching, as on scottspence.com; no parser dependency. */
export function parse_user_agent(
	agent: string | null,
): ParsedUserAgent {
	// Real browsers always send a user agent.
	if (!agent)
		return {
			browser: null,
			os: null,
			device_type: null,
			is_bot: true,
			preview_source: null,
		};
	const preview_source =
		preview_sources.find(([pattern]) => pattern.test(agent))?.[1] ??
		null;
	const os = os_of(agent);
	return {
		browser: browser_of(agent),
		os,
		device_type: device_of(agent, os),
		is_bot:
			preview_source !== null ||
			bot_patterns.some((pattern) => pattern.test(agent)),
		preview_source,
	};
}
