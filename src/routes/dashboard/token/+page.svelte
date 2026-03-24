<script lang="ts">
	import { Copy } from 'carbon-icons-svelte';
	import type { PageProps } from './$types';
	import { Button } from 'carbon-components-svelte';
	import { getNotificationCenterState } from '$lib/components/NotificationCenterState.svelte';
	let { data }: PageProps = $props();

	let center = getNotificationCenterState();

	function copyToClipboard() {
		navigator.clipboard.writeText(data.token || '');
		center.addNotification({
			kind: 'info',
			title: 'Copied',
			subtitle: 'Token copied to clipboard.',
			caption: new Date().toDateString(),
			timeout: 1500
		});
	}
</script>

<h1>Token</h1>
<p>
	If there is a need for JWT bassed authentication, read the developer notes in the source
	repositroy under `/src/routes/dashboard/token/jwt_bearer_setup.md`
</p>
<p>
	With the plugin jwt from better auth there is an endpoint `/api/auth/token` that returns a JWT
	token.
</p>
<div class="flex gap-4">
	<Button kind="tertiary" icon={Copy} hideTooltip on:click={() => copyToClipboard()} />
	<div class="max-w-md border border-dashed p-4 break-all whitespace-pre-wrap">{data.token}</div>
</div>
