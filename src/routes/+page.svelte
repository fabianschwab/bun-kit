<script lang="ts">
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';
	import Welcome from '$lib/components/Welcome.svelte';
</script>

<div class="fixed top-0 right-0">
	<ThemeToggle />
</div>
<div class="flex h-screen flex-col items-center justify-center">
	<Welcome />
</div>
