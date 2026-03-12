<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { logout } from '$lib/rpc/auth.remote';
	import { Button } from 'carbon-components-svelte';
	import { Logout } from 'carbon-icons-svelte';
</script>

<form
	{...logout.enhance(async ({ form, data, submit }) => {
		try {
			await submit();
			form.reset();
			window.history.replaceState({}, '', '/');
			await invalidateAll();
		} catch (error) {
			console.error(error);
		}
	})}
>
	<Button type="submit" icon={Logout} kind="secondary" class="mt-8 self-end">Logout</Button>
</form>
