<script lang="ts">
	import { getNotificationCenterStore } from '$lib/stores/notificationCenterStore.svelte';
	import { ToastNotification } from 'carbon-components-svelte';
	import { fly } from 'svelte/transition';
	import { backOut } from 'svelte/easing';
	import { flip } from 'svelte/animate';

	const notificationCenterStore = getNotificationCenterStore();

	let {
		position = 'top-right',
		offsetTop = '3rem',
		offsetBottom = '1rem',
		offsetRight = '1rem',
		zIndex = 9000
	} = $props();
</script>

<div
	style:position="fixed"
	style:right={offsetRight}
	style:top={position === 'top-right' ? offsetTop : undefined}
	style:bottom={position === 'bottom-right' ? offsetBottom : undefined}
	style:z-index={zIndex}
>
	{#each notificationCenterStore.notifications as notification (notification.id)}
		<div
			animate:flip
			in:fly={{
				delay: 100,
				duration: 100,
				easing: backOut,
				x: 100
			}}
			out:fly={{
				delay: 60,
				duration: 100,
				easing: backOut,
				x: 100
			}}
		>
			<ToastNotification
				{...notification}
				on:close={() => notificationCenterStore.removeNotification(notification.id!)}
			/>
		</div>
	{/each}
</div>
