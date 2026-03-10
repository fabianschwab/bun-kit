<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { Button } from 'carbon-components-svelte';
	import { Logout } from 'carbon-icons-svelte';
</script>

<form
	method="post"
	action="/api/auth?/logout"
	use:enhance={() => {
		return async ({ update }) => {
			// Invalidate all data and force a full page reload
			await invalidateAll();
			await update({ reset: false });
			// Replace history state to prevent back button from showing cached content
			window.history.replaceState({}, '', '/');
		};
	}}
>
	<Button type="submit" icon={Logout} kind="secondary" class="mt-8 self-end">Logout</Button>
</form>
