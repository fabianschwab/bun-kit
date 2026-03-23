<script lang="ts">
	let { children } = $props();
</script>

<div class="container">
	{@render children()}
</div>

<style>
	@reference "tailwindcss";

	.container {
		@apply mx-auto max-w-1/2;
	}
</style>
