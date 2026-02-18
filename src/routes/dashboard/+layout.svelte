<script lang="ts">
	import { route } from '$lib/ROUTES';
	import {
		Column,
		Content,
		Grid,
		Header,
		HeaderAction,
		HeaderPanelDivider,
		HeaderPanelLinks,
		HeaderPanelLink,
		HeaderUtilities,
		NotificationQueue,
		Row,
		SkipToContent,
		Stack
	} from 'carbon-components-svelte';
	import { UserAvatarFilledAlt } from 'carbon-icons-svelte';
	import LogoutButton from '$lib/components/LogoutButton.svelte';

	let { children, data } = $props();
	let queue: NotificationQueue;
	let isOpen = $state(false);

	const triggerToast = () => {
		queue.add({
			kind: 'success',
			title: 'Success',
			subtitle: 'Your action was completed successfully.',
			timeout: 5000
		});
	};
</script>

<Header href="/" companyName="IBM" platformName="Carbon Svelte">
	<svelte:fragment slot="skipToContent">
		<SkipToContent />
	</svelte:fragment>
	<HeaderUtilities>
		<HeaderAction icon={UserAvatarFilledAlt} class="flex items-center justify-center" bind:isOpen>
			<div class="felx m-4">
				<div>
					<h1>Welcome,</h1>
					<h3>{data.user.name}</h3>
				</div>

				<LogoutButton />
			</div>
			<HeaderPanelLinks>
				<HeaderPanelDivider>Quick Settings</HeaderPanelDivider>
				<HeaderPanelLink href={route('/dashboard/tasks')}>Tasks</HeaderPanelLink>
			</HeaderPanelLinks>
		</HeaderAction>
	</HeaderUtilities>
</Header>

<NotificationQueue bind:this={queue} />

<Content>
	<Grid>
		<Row>
			<Column>
				<Stack gap={6}>
					{@render children()}
				</Stack>
			</Column>
		</Row>
	</Grid>
</Content>
