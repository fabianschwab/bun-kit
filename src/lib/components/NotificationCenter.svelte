<script lang="ts">
	import { getNotificationCenterState } from '$lib/components/NotificationCenterState.svelte';
	import { ToastNotification } from 'carbon-components-svelte';

	const notificationCenterState = getNotificationCenterState();

	let {
		position = 'top-right',
		offsetTop = '3rem',
		offsetBottom = '1rem',
		offsetRight = '1rem',
		zIndex = 9000
	} = $props();
</script>

{#if notificationCenterState.notifications.length > 0}
	<div
		style:position="fixed"
		style:right={offsetRight}
		style:top={position === 'top-right' ? offsetTop : undefined}
		style:bottom={position === 'bottom-right' ? offsetBottom : undefined}
		style:z-index={zIndex}
	>
		{#each notificationCenterState.notifications as notification (notification.id)}
			<ToastNotification
				{...notification}
				on:close={() => notificationCenterState.removeNotification(notification.id!)}
			/>
		{/each}
	</div>
{/if}
