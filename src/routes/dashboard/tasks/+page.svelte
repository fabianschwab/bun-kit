<script lang="ts">
	import { Button, Checkbox, Form, InlineLoading, TextInput, Tile } from 'carbon-components-svelte';

	import { createTask, deleteTask, getTasks, toggleComplated } from '$lib/rpc/tasks.remote';
	import { TrashCan } from 'carbon-icons-svelte';
	import { FaceMelting } from 'carbon-pictograms-svelte';
	import { isHttpError } from '@sveltejs/kit';
	import { getNotificationCenterState } from '$lib/components/NotificationCenterState.svelte';

	async function handleDeleteTask(id: string) {
		try {
			await deleteTask(id).updates(getTasks());
		} catch (error) {
			if (isHttpError(error)) {
				center.addNotification({ kind: 'error', title: 'Error', subtitle: error.body.message });
			} else {
				center.addNotification({
					kind: 'error',
					title: 'Error',
					subtitle: 'Could not connect to server!'
				});
			}
		}
	}

	let center = getNotificationCenterState();
</script>

<h1>Tasks</h1>
<p>Quick view on what needs to be done for the PoC!</p>
<p class="hint">
	Also this serves you as a guide, how to use remote functions, forms, loading states, and using
	tailwindcss when creating custom css classes.
</p>
<h3>Creaet a new task</h3>
<Form {...createTask} class="flex items-end">
	<TextInput labelText="Task description" {...createTask.fields.title.as('text')} />
	<Button type="submit" size="field" disabled={!!createTask.pending}>Create Task</Button>
</Form>
<h3>Task list</h3>
<svelte:boundary>
	{#each await getTasks() as { id, title, completed, updatedAt }}
		{#key id}
			<Tile class="flex items-center  gap-2">
				<Checkbox
					class="max-w-fit"
					checked={completed}
					on:check={() => toggleComplated(id).updates(getTasks())}
				/>
				<div>
					<p>{title}</p>
					<p class="text-xs">last update: {updatedAt}</p>
				</div>
				<Button
					class="ml-auto"
					iconDescription="Delete task"
					kind="danger-ghost"
					icon={TrashCan}
					on:click={() => handleDeleteTask(id)}
				/>
			</Tile>
		{/key}
	{:else}
		<div class="w-full flex flex-col items-center">
			<FaceMelting />
			<h4>No Tasks found</h4>
			<p>Create a new task to get started</p>
		</div>
	{/each}

	{#snippet pending()}
		<InlineLoading description="Loading tasks..." />
	{/snippet}
</svelte:boundary>

<style>
	@reference "tailwindcss";

	.hint {
		@apply fixed bottom-0 w-full p-4 text-sm opacity-50;
	}
</style>
