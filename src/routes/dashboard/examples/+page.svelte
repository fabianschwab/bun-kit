<script lang="ts">
	import { routes } from '$lib/ROUTES';
</script>

<h1>Examples</h1>
<p>Gets dyamically updated as new routes are made.</p>
<ul>
	{#each routes as route}
		{#if route.startsWith('/examples/')}
			<li><a href={route}>{route}</a></li>
		{/if}
	{/each}
</ul>
