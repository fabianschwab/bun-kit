<script lang="ts">
	import Welcome from '$lib/components/Welcome.svelte';
	import { route } from '$lib/ROUTES';
</script>

<div class="flex h-screen flex-col items-center justify-center">
	<Welcome />
	<p class="mt-8">See some examples <a href={route('/examples')}>here</a></p>
</div>
