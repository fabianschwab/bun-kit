<script lang="ts">
	import { createTemperatureStream } from '$lib/service/temperatureStream.svelte';
	import { TemperatureStore } from '$lib/stores/temperatureStore.svelte';
	import { Button, Tag } from 'carbon-components-svelte';
	import {
		ArrayNumbers,
		Temperature,
		TemperatureCelsius,
		TemperatureMax,
		TemperatureMin
	} from 'carbon-icons-svelte';
	import { onMount } from 'svelte';

	const store = new TemperatureStore();
	const stream = createTemperatureStream(store);

	onMount(() => {
		stream.connect();
		return () => stream.connect();
	});
</script>

<h1>Temperatur Streaming</h1>
<p>
	This serves as example how to stream data with server send events from the server to the client.
</p>
<h2>The following components are involved</h2>
<ul class="list-disc pb-8 pl-4">
	<li>
		TemperatureStore: Stores the current temperature, average, min and max. It is implemented as a
		class in a `.svelte.ts` file to take advantages of svelte runes and have reactive values.
	</li>
	<li>
		TemperatureStream: Is a service which creates a connection to a stream endpoint and updates a
		temperature store as events are received. It provides a `connect` and `disconnect` function.
	</li>
	<li>
		API endpoint: The endpoint is a SvelteKit endpoint which sends a stream of temperature data to
		the client.
	</li>
	<li>
		ShowTempPage: It is a SvelteKit page which uses the TemperatureStore and TemperatureStream to
		display the temperature data.
	</li>
</ul>

<div class="status">
	{#if store.isConnected}
		<Tag type="green">Live</Tag>
	{:else}
		<Tag type="red">Offline</Tag>
	{/if}
</div>
{#snippet statCard(label: string, icon: any, value: string | number | undefined)}
	<div class="flex flex-col items-center gap-1 px-8">
		<span>{label}</span>
		<svelte:component this={icon} size={32} />
		<span>{value}</span>
	</div>
{/snippet}

<div class="flex gap-2 divide-x py-4">
	{@render statCard('Current', TemperatureCelsius, store.currentTemp?.toFixed(1))}
	{@render statCard('Minimum', TemperatureMin, store.minTemp?.toFixed(1))}
	{@render statCard('Average', Temperature, store.avgTemp?.toFixed(1))}
	{@render statCard('Maximum', TemperatureMax, store.maxTemp?.toFixed(1))}
	{@render statCard('Readings', ArrayNumbers, store.readings.length)}
</div>
<div class="controls">
	<Button onclick={() => stream.connect()} disabled={store.isConnected}>Start</Button>
	<Button onclick={() => stream.disconnect()} disabled={!store.isConnected}>Stop</Button>
	<Button kind="danger" onclick={() => (store.readings = [])}>Reset</Button>
</div>
