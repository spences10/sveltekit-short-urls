<script lang="ts">
	let { children } = $props();
	import { browser } from '$app/environment';
	import { page } from '$app/state';
	import {
		PUBLIC_FATHOM_ID,
		PUBLIC_FATHOM_URL,
	} from '$env/static/public';
	import * as Fathom from 'fathom-client';
	import '../app.css';

	$effect(() => {
		if (browser) {
			Fathom.load(PUBLIC_FATHOM_ID, {
				url: PUBLIC_FATHOM_URL,
			});
		}
	});

	// Track pageview on route change
	$effect(() => {
		page.url.pathname, browser && Fathom.trackPageview();
	});
</script>

<main class="container mx-auto max-w-3xl px-4">
	{@render children()}
</main>
