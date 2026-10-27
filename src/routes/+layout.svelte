<script lang="ts">
	import {
		PUBLIC_FATHOM_ID,
		PUBLIC_FATHOM_URL,
	} from '$app/env/public';
	import { afterNavigate } from '$app/navigation';
	import * as Fathom from 'fathom-client';
	import { onMount, type Snippet } from 'svelte';
	import '../app.css';

	let { children }: { children: Snippet } = $props();

	onMount(() => {
		Fathom.load(PUBLIC_FATHOM_ID, {
			url: PUBLIC_FATHOM_URL,
		});
	});

	// Track pageview on route change
	afterNavigate(({ shallow }) => {
		if (shallow) return;

		Fathom.trackPageview();
	});
</script>

<main class="container mx-auto max-w-3xl px-4">
	{@render children()}
</main>
