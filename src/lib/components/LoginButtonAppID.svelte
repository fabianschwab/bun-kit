<script lang="ts">
	import { Button } from 'carbon-components-svelte';
	import Login from 'carbon-icons-svelte/lib/Login.svelte';
	import { enhance } from '$app/forms';
</script>

<form method="post" action="/api/auth?/login" use:enhance>
	<input type="hidden" name="provider" value="appid" />
	<Button type="submit" icon={Login} kind="primary" class="mt-8 self-end">Login</Button>
</form>
