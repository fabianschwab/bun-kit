let pipeline: any = null;

export async function loadModel() {
	if (pipeline) return pipeline;

	const { pipeline: createPipeline } = await import('@xenova/transformers');

	pipeline = await createPipeline('automatic-speech-recognition', 'Xenova/whisper-small');

	return pipeline;
}

export async function transcribe(audioBlob: Blob): Promise<string> {
	const pipe = await loadModel();

	// Convert blob to array buffer
	const arrayBuffer = await audioBlob.arrayBuffer();

	// Decode audio data using Web Audio API
	const audioContext = new AudioContext({ sampleRate: 16000 });
	const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

	// Get audio data as Float32Array (mono channel)
	const channelData = audioBuffer.getChannelData(0);

	// Convert to a new Float32Array to ensure correct type
	let audioData: Float32Array = new Float32Array(channelData);

	// If sample rate is not 16kHz, we need to resample
	if (audioBuffer.sampleRate !== 16000) {
		audioData = resampleAudio(audioData, audioBuffer.sampleRate, 16000) as Float32Array;
	}

	const result = await pipe(audioData);

	return result.text;
}

// Simple resampling function
function resampleAudio(
	audioData: Float32Array,
	originalSampleRate: number,
	targetSampleRate: number
): Float32Array {
	if (originalSampleRate === targetSampleRate) {
		return audioData;
	}

	const sampleRateRatio = originalSampleRate / targetSampleRate;
	const newLength = Math.round(audioData.length / sampleRateRatio);
	const result = new Float32Array(newLength);

	for (let i = 0; i < newLength; i++) {
		const position = i * sampleRateRatio;
		const index = Math.floor(position);
		const fraction = position - index;

		if (index + 1 < audioData.length) {
			// Linear interpolation
			result[i] = audioData[index] * (1 - fraction) + audioData[index + 1] * fraction;
		} else {
			result[i] = audioData[index];
		}
	}

	return result;
}

// Made with Bob
