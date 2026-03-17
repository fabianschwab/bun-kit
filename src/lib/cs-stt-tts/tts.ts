// Browser-native Text-to-Speech utilities with voice selection

let currentUtterance: SpeechSynthesisUtterance | null = null;
let selectedVoice: SpeechSynthesisVoice | null = null;

export async function loadTTSModel() {
	// Check if browser supports Speech Synthesis
	if ('speechSynthesis' in window) {
		// Wait for voices to load
		await waitForVoices();
		return true;
	}
	return false;
}

export function speak(
	text: string,
	options?: {
		voice?: SpeechSynthesisVoice | null;
		rate?: number;
		pitch?: number;
		volume?: number;
	}
): Promise<void> {
	return new Promise((resolve, reject) => {
		if (!('speechSynthesis' in window)) {
			reject(new Error('Speech Synthesis not supported'));
			return;
		}

		// Cancel any ongoing speech
		stopSpeaking();

		const utterance = new SpeechSynthesisUtterance(text);

		// Use provided voice or selected voice or find best available voice
		const voice = options?.voice || selectedVoice || getBestVoice();
		if (voice) {
			utterance.voice = voice;
		}

		// Set speech parameters for better quality
		utterance.rate = options?.rate ?? 0.9; // Slightly slower for clarity
		utterance.pitch = options?.pitch ?? 1.0;
		utterance.volume = options?.volume ?? 1.0;

		utterance.onend = () => {
			currentUtterance = null;
			resolve();
		};

		utterance.onerror = (event) => {
			currentUtterance = null;
			reject(new Error(event.error));
		};

		currentUtterance = utterance;
		window.speechSynthesis.speak(utterance);
	});
}

export function stopSpeaking() {
	if ('speechSynthesis' in window) {
		window.speechSynthesis.cancel();
		currentUtterance = null;
	}
}

export function isSpeaking(): boolean {
	if ('speechSynthesis' in window) {
		return window.speechSynthesis.speaking;
	}
	return false;
}

// Get available voices
export function getVoices(): SpeechSynthesisVoice[] {
	if ('speechSynthesis' in window) {
		return window.speechSynthesis.getVoices();
	}
	return [];
}

// Wait for voices to be loaded (some browsers load them asynchronously)
export function waitForVoices(): Promise<SpeechSynthesisVoice[]> {
	return new Promise((resolve) => {
		if ('speechSynthesis' in window) {
			const voices = window.speechSynthesis.getVoices();
			if (voices.length > 0) {
				resolve(voices);
			} else {
				window.speechSynthesis.onvoiceschanged = () => {
					resolve(window.speechSynthesis.getVoices());
				};
				// Fallback timeout
				setTimeout(() => {
					resolve(window.speechSynthesis.getVoices());
				}, 1000);
			}
		} else {
			resolve([]);
		}
	});
}

// Get the best quality voice available
export function getBestVoice(lang: string = 'en'): SpeechSynthesisVoice | null {
	const voices = getVoices();
	if (voices.length === 0) return null;

	// Priority order for better quality voices:
	// 1. Premium/Enhanced voices (usually contain "Premium", "Enhanced", "Neural")
	// 2. Local voices (localService = true)
	// 3. Voices matching the language
	// 4. Any voice

	// Look for premium/enhanced voices first
	const premiumVoice = voices.find(
		(v) =>
			v.lang.startsWith(lang) &&
			(v.name.includes('Premium') ||
				v.name.includes('Enhanced') ||
				v.name.includes('Neural') ||
				v.name.includes('Google'))
	);
	if (premiumVoice) return premiumVoice;

	// Look for local voices in the target language
	const localVoice = voices.find((v) => v.lang.startsWith(lang) && v.localService);
	if (localVoice) return localVoice;

	// Look for any voice in the target language
	const langVoice = voices.find((v) => v.lang.startsWith(lang));
	if (langVoice) return langVoice;

	// Return first available voice
	return voices[0];
}

// Set the voice to use for speech
export function setVoice(voice: SpeechSynthesisVoice | null) {
	selectedVoice = voice;
}

// Get currently selected voice
export function getSelectedVoice(): SpeechSynthesisVoice | null {
	return selectedVoice;
}

// Get voices grouped by language
export function getVoicesByLanguage(): Map<string, SpeechSynthesisVoice[]> {
	const voices = getVoices();
	const grouped = new Map<string, SpeechSynthesisVoice[]>();

	voices.forEach((voice) => {
		const lang = voice.lang.split('-')[0]; // Get base language code
		if (!grouped.has(lang)) {
			grouped.set(lang, []);
		}
		grouped.get(lang)!.push(voice);
	});

	return grouped;
}

// Made with Bob
