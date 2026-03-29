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
		Row,
		SkipToContent,
		Stack
	} from 'carbon-components-svelte';
	import { UserAvatarFilledAlt } from 'carbon-icons-svelte';
	import LogoutButton from '$lib/components/LogoutButton.svelte';
	import NotificationCenter from '$lib/components/NotificationCenter.svelte';
	import { setNotificationCenterStore } from '$lib/stores/notificationCenterStore.svelte.js';
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';

	let { children, data } = $props();
	let isOpen = $state(false);

	// Initate the global notification center
	setNotificationCenterStore();
</script>

<Header href={route('/')} companyName="IBM" platformName="Carbon Svelte">
	<svelte:fragment slot="skipToContent">
		<SkipToContent />
	</svelte:fragment>
	<HeaderUtilities>
		<ThemeToggle />
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
				<HeaderPanelLink href={route('/dashboard/token')}>Show JWT</HeaderPanelLink>
				<HeaderPanelLink href={route('/dashboard/tasks')}>Tasks</HeaderPanelLink>
			</HeaderPanelLinks>
		</HeaderAction>
	</HeaderUtilities>
</Header>

<NotificationCenter />

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
