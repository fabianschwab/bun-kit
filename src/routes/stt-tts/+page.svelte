<script lang="ts">
	import { onMount } from 'svelte';

	// Type declarations for Web Speech API
	type SpeechRecognition = any;
	type SpeechRecognitionEvent = any;

	let recognition: SpeechRecognition | null = null;
	let synthesis: SpeechSynthesis | null = null;
	let isRecording = false;
	let transcribedText = '';
	let textToSpeak = 'Hello! This is a text-to-speech example.';
	let errorMessage = '';
	let isSpeaking = false;

	onMount(() => {
		// Check if browser supports Speech Recognition
		const SpeechRecognition =
			(window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

		if (SpeechRecognition) {
			recognition = new SpeechRecognition();
			recognition.continuous = true;
			recognition.interimResults = true;
			recognition.lang = 'en-US';

			recognition.onresult = (event: SpeechRecognitionEvent) => {
				let interimTranscript = '';
				let finalTranscript = '';

				for (let i = event.resultIndex; i < event.results.length; i++) {
					const transcript = event.results[i][0].transcript;
					if (event.results[i].isFinal) {
						finalTranscript += transcript + ' ';
					} else {
						interimTranscript += transcript;
					}
				}

				transcribedText = finalTranscript || interimTranscript;
			};

			recognition.onerror = (event: any) => {
				errorMessage = `Speech recognition error: ${event.error}`;
				isRecording = false;
			};

			recognition.onend = () => {
				isRecording = false;
			};
		} else {
			errorMessage = 'Speech Recognition is not supported in this browser.';
		}

		// Check if browser supports Speech Synthesis
		if ('speechSynthesis' in window) {
			synthesis = window.speechSynthesis;
		} else {
			errorMessage += ' Text-to-Speech is not supported in this browser.';
		}
	});

	function toggleRecording() {
		if (!recognition) {
			errorMessage = 'Speech Recognition is not available.';
			return;
		}

		if (isRecording) {
			recognition.stop();
			isRecording = false;
		} else {
			transcribedText = '';
			errorMessage = '';
			recognition.start();
			isRecording = true;
		}
	}

	function speakText() {
		if (!synthesis) {
			errorMessage = 'Text-to-Speech is not available.';
			return;
		}

		if (isSpeaking) {
			synthesis.cancel();
			isSpeaking = false;
			return;
		}

		const utterance = new SpeechSynthesisUtterance(textToSpeak);
		utterance.lang = 'en-US';
		utterance.rate = 1;
		utterance.pitch = 1;

		utterance.onstart = () => {
			isSpeaking = true;
			errorMessage = '';
		};

		utterance.onend = () => {
			isSpeaking = false;
		};

		utterance.onerror = (event) => {
			errorMessage = `Text-to-Speech error: ${event.error}`;
			isSpeaking = false;
		};

		synthesis.speak(utterance);
	}
</script>

<div class="container">
	<h1>Support - Speech Demo</h1>

	{#if errorMessage}
		<div class="error">{errorMessage}</div>
	{/if}

	<!-- Speech to Text Section -->
	<section class="section">
		<h2>Speech to Text</h2>
		<p>Click the button below and speak into your microphone.</p>

		<button class="record-button" class:recording={isRecording} on:click={toggleRecording}>
			{isRecording ? '⏹️ Stop Recording' : '🎤 Start Recording'}
		</button>

		<div class="result-box">
			<h3>Transcribed Text:</h3>
			<div class="transcription">
				{transcribedText || 'Your speech will appear here...'}
			</div>
		</div>
	</section>

	<!-- Text to Speech Section -->
	<section class="section">
		<h2>Text to Speech</h2>
		<p>Enter text below and click the button to hear it spoken.</p>

		<textarea bind:value={textToSpeak} placeholder="Enter text to speak..." rows="4"></textarea>

		<button class="speak-button" class:speaking={isSpeaking} on:click={speakText}>
			{isSpeaking ? '⏹️ Stop Speaking' : '🔊 Speak Text'}
		</button>
	</section>
</div>

<style>
	.container {
		max-width: 800px;
		margin: 0 auto;
		padding: 2rem;
		font-family:
			system-ui,
			-apple-system,
			sans-serif;
	}

	h1 {
		color: #333;
		text-align: center;
		margin-bottom: 2rem;
	}

	.section {
		background: #f5f5f5;
		border-radius: 8px;
		padding: 2rem;
		margin-bottom: 2rem;
	}

	h2 {
		color: #555;
		margin-top: 0;
	}

	p {
		color: #666;
		margin-bottom: 1rem;
	}

	.record-button,
	.speak-button {
		background: #4caf50;
		color: white;
		border: none;
		padding: 1rem 2rem;
		font-size: 1rem;
		border-radius: 4px;
		cursor: pointer;
		transition: all 0.3s ease;
		display: block;
		margin: 1rem 0;
	}

	.record-button:hover,
	.speak-button:hover {
		background: #45a049;
		transform: translateY(-2px);
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
	}

	.record-button.recording {
		background: #f44336;
		animation: pulse 1.5s infinite;
	}

	.speak-button.speaking {
		background: #ff9800;
		animation: pulse 1.5s infinite;
	}

	@keyframes pulse {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.7;
		}
	}

	.result-box {
		margin-top: 1.5rem;
	}

	h3 {
		color: #555;
		margin-bottom: 0.5rem;
		font-size: 1rem;
	}

	.transcription {
		background: white;
		border: 2px solid #ddd;
		border-radius: 4px;
		padding: 1rem;
		min-height: 100px;
		color: #333;
		line-height: 1.6;
	}

	textarea {
		width: 100%;
		padding: 1rem;
		border: 2px solid #ddd;
		border-radius: 4px;
		font-size: 1rem;
		font-family: inherit;
		resize: vertical;
		box-sizing: border-box;
	}

	textarea:focus {
		outline: none;
		border-color: #4caf50;
	}

	.error {
		background: #ffebee;
		color: #c62828;
		padding: 1rem;
		border-radius: 4px;
		margin-bottom: 1rem;
		border-left: 4px solid #c62828;
	}
</style>
