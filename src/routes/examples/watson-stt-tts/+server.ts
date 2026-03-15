import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import SpeechToTextV1 from 'ibm-watson/speech-to-text/v1';
import TextToSpeechV1 from 'ibm-watson/text-to-speech/v1';
import { IamAuthenticator } from 'ibm-watson/auth';
import { env } from '$env/dynamic/private';
import { buffer } from 'stream/consumers';
import type { Readable } from 'stream';

// Audio format constants
const AUDIO_FORMATS = {
	INPUT: 'audio/webm',
	OUTPUT: 'audio/mp3'
} as const;

// Request body type definition
interface WatsonRequest {
	action: 'transcribe' | 'synthesize';
	data: string;
	language: string;
}

// Type guard for request validation
function isValidWatsonRequest(body: unknown): body is WatsonRequest {
	if (typeof body !== 'object' || body === null) {
		return false;
	}
	const req = body as Record<string, unknown>;
	return (
		(req.action === 'transcribe' || req.action === 'synthesize') &&
		typeof req.data === 'string' &&
		typeof req.language === 'string'
	);
}

// Initialize Watson Speech to Text
const speechToText = new SpeechToTextV1({
	authenticator: new IamAuthenticator({
		apikey: env.WATSON_STT_API_KEY || ''
	}),
	serviceUrl: env.WATSON_STT_URL || ''
});

// Initialize Watson Text to Speech
const textToSpeech = new TextToSpeechV1({
	authenticator: new IamAuthenticator({
		apikey: env.WATSON_TTS_API_KEY || ''
	}),
	serviceUrl: env.WATSON_TTS_URL || ''
});

// Helper function to convert stream to buffer
async function streamToBuffer(stream: Readable): Promise<Buffer> {
	return await buffer(stream);
}

// Transcribe audio using Watson Speech to Text
async function transcribeAudio(audioData: string, language: string) {
	const audioBuffer = Buffer.from(audioData, 'base64');

	const params = {
		audio: audioBuffer,
		contentType: AUDIO_FORMATS.INPUT,
		model: getSTTModel(language),
		timestamps: false,
		wordAlternativesThreshold: 0.9
	};

	const response = await speechToText.recognize(params);
	const transcript = response.result.results
		?.map((result) => result.alternatives[0]?.transcript)
		.join(' ');

	return { transcript };
}

// Synthesize speech using Watson Text to Speech
async function synthesizeSpeech(text: string, language: string) {
	const params = {
		text,
		voice: getTTSVoice(language),
		accept: AUDIO_FORMATS.OUTPUT
	};

	const response = await textToSpeech.synthesize(params);
	const stream = response.result as Readable;

	const audioBuffer = await streamToBuffer(stream);
	const base64Audio = audioBuffer.toString('base64');

	return { audio: base64Audio };
}

export const POST: RequestHandler = async ({ request }) => {
	const body = await request.json();

	if (!isValidWatsonRequest(body)) {
		throw error(400, 'Invalid request body. Expected: { action, data, language }');
	}

	try {
		switch (body.action) {
			case 'transcribe':
				return json(await transcribeAudio(body.data, body.language));
			case 'synthesize':
				return json(await synthesizeSpeech(body.data, body.language));
			default:
				throw error(400, 'Invalid action');
		}
	} catch (err) {
		console.error('Watson API Error:', err);
		const message = err instanceof Error ? err.message : 'Watson API request failed';
		throw error(500, message);
	}
};

function getSTTModel(language: string): string {
	const models: Record<string, string> = {
		'en-US': 'en-US_BroadbandModel',
		'de-DE': 'de-DE_BroadbandModel',
		'fr-FR': 'fr-FR_BroadbandModel',
		'es-ES': 'es-ES_BroadbandModel'
	};
	return models[language] || models['en-US'];
}

function getTTSVoice(language: string): string {
	const voices: Record<string, string> = {
		'en-US': 'en-US_MichaelV3Voice',
		'de-DE': 'de-DE_BirgitV3Voice',
		'fr-FR': 'fr-FR_NicolasV3Voice',
		'es-ES': 'es-ES_EnriqueV3Voice'
	};
	return voices[language] || voices['en-US'];
}
