<script lang="ts">
	import { Button } from 'carbon-components-svelte';
	import Login from 'carbon-icons-svelte/lib/Login.svelte';
	import { login } from '$lib/rpc/auth.remote';
</script>

<form {...login}>
	<input {...login.fields.provider.as('text')} hidden value="appid" />
	<Button type="submit" icon={Login} kind="primary" class="mt-8 self-end">Login</Button>
</form>
