<script>
	import * as Fathom from 'fathom-client'
	import { browser } from '$app/environment'
	import { page } from '$app/stores'
	import {
		PUBLIC_FATHOM_ID,
		PUBLIC_FATHOM_URL,
	} from '$env/static/public'
	import { onMount } from 'svelte'
	import '../app.css'

	onMount(() => {
		Fathom.load(PUBLIC_FATHOM_ID, {
			url: PUBLIC_FATHOM_URL,
			excludedDomains: ['localhost'],
		})
	})

	$: $page.url.pathname, browser && Fathom.trackPageview()
</script>

<main class="container max-w-3xl mx-auto px-4">
	<slot />
</main>
