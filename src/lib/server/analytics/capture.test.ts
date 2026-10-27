import { describe, expect, test } from 'vite-plus/test';
import { click_event } from './capture.js';

const chrome =
	'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36';

describe('click_event', () => {
	test('reads referrer, country and browser from headers', () => {
		const event = click_event(
			new Headers({
				'user-agent': chrome,
				referer: 'https://www.linkedin.com/feed/',
				'cf-ipcountry': 'GB',
				'cf-connecting-ip': '1.2.3.4',
			}),
			'127.0.0.1',
			'short.example',
			'salt',
		);
		expect(event).toMatchObject({
			referrer: 'linkedin.com',
			country: 'GB',
			browser: 'Chrome',
			os: 'macOS',
			device_type: 'desktop',
			is_bot: false,
		});
		expect(event.visitor_hash).toHaveLength(16);
	});

	test('flags link previews as bots', () => {
		const event = click_event(
			new Headers({ 'user-agent': 'Slackbot-LinkExpanding 1.0' }),
			'127.0.0.1',
			'short.example',
			'salt',
		);
		expect(event).toMatchObject({
			is_bot: true,
			preview_source: 'Slack',
			referrer: null,
		});
	});
});
