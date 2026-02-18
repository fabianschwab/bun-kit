<script lang="ts">
	import LogoSvelte from 'carbon-icons-svelte/lib/LogoSvelte.svelte';
	import LoginButtonAppID from '$lib/components/LoginButtonAppID.svelte';
</script>

<div class="flex flex-col items-center">
	<LogoSvelte class="mb-2 h-24 w-24" />
	<h1>Welcome to SvelteKit</h1>
	<p>
		visit <a href="https://svelte.dev/docs/kit">svelte.dev/docs/kit</a> to read the documentation
	</p>
	<h1>and Carbon design</h1>
	<p>
		visit <a href="https://svelte.carbondesignsystem.com/">Carbon Svelte Components</a> to read the
		component documentation. <br />
		Where in the upper right corner you can find links to Icons, Charts and Pictograms.
		<br />In order to use the application, you need to log in.
	</p>
	<LoginButtonAppID />
</div>

<style>
	p {
		text-align: center;
	}
</style>
