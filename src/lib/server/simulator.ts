export class TemperatureSimulator {
	private baseTemp = 20; // Celsius
	private variance = 5;

	generateReading(): {
		timestamp: number;
		temperature: number;
		unit: 'celsius';
	} {
		const noise = (Math.random() - 0.5) * this.variance;
		return {
			timestamp: Date.now(),
			temperature: this.baseTemp + noise,
			unit: 'celsius'
		};
	}
}
