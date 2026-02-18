<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from 'carbon-components-svelte';
	import { Logout } from 'carbon-icons-svelte';
</script>

<form method="post" action="/api/auth?/logout" use:enhance>
	<Button type="submit" icon={Logout} kind="secondary" class="mt-8 self-end">Logout</Button>
</form>
