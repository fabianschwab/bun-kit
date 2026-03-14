import { route } from '$lib/ROUTES';
import type { TemperatureStore } from '$lib/stores/temperatureStore.svelte';

export function createTemperatureStream(store: TemperatureStore) {
	let eventSource: EventSource | null = null;

	function connect() {
		eventSource = new EventSource(route('GET /api/stream/temperature'));

		eventSource.onopen = () => {
			store.isConnected = true;
			store.error = null;
		};

		eventSource.onmessage = (event) => {
			const reading = JSON.parse(event.data);
			store.readings = [...store.readings, reading];
		};

		eventSource.onerror = () => {
			store.isConnected = false;
			store.error = 'Connection lost';
			disconnect();
		};
	}

	function disconnect() {
		eventSource?.close();
		eventSource = null;
		store.isConnected = false;
	}

	return { connect, disconnect };
}
