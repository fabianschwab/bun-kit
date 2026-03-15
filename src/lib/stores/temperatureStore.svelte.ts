interface TemperatureReading {
	timestamp: number;
	temperature: number;
	unit: string;
}

export class TemperatureStore {
	readings = $state<TemperatureReading[]>([]);
	isConnected = $state(false);
	error = $state<string | null>(null);

	// Derived statistics
	currentTemp = $derived(this.readings[this.readings.length - 1]?.temperature ?? null);

	avgTemp = $derived.by(() => {
		if (this.readings.length === 0) return null;
		const sum = this.readings.reduce((acc, r) => acc + r.temperature, 0);
		return sum / this.readings.length;
	});

	maxTemp = $derived(Math.max(...this.readings.map((r) => r.temperature)));

	minTemp = $derived(Math.min(...this.readings.map((r) => r.temperature)));
}
