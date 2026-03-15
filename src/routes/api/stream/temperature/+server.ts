import { TemperatureSimulator } from '$lib/server/simulator';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async () => {
	const simulator = new TemperatureSimulator();

	const stream = new ReadableStream({
		start(controller) {
			const interval = setInterval(() => {
				const reading = simulator.generateReading();
				const data = `data: ${JSON.stringify(reading)}\n\n`;
				controller.enqueue(new TextEncoder().encode(data));
			}, 1000); // Send every second

			// Cleanup on connection close
			return () => clearInterval(interval);
		}
	});

	return new Response(stream, {
		headers: {
			'Content-Type': 'text/event-stream',
			'Cache-Control': 'no-cache',
			Connection: 'keep-alive'
		}
	});
};
