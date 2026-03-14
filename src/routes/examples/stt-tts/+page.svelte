<script lang="ts">
	import {
		Button,
		InlineNotification,
		Modal,
		Select,
		TextArea,
		Toolbar,
		ToolbarContent,
		ToolbarMenu,
		ToolbarMenuItem
	} from 'carbon-components-svelte';
	import { onMount } from 'svelte';
	import { TrashCan, Microphone, StopOutline, VolumeUp } from 'carbon-icons-svelte';

	// Type declarations for Web Speech API
	type SpeechRecognition = any;
	type SpeechRecognitionEvent = any;

	let defaultText = 'This is a text to speech example using the browser native API';

	let recognition: SpeechRecognition | null = null;
	let synthesis: SpeechSynthesis | null = null;
	let isRecording = $state(false);
	let transcribedText = $state('');
	let textToSpeak = $state(defaultText);
	let errorMessage = $state('');
	let isSpeaking = $state(false);
	let open = $state(false);
	let language = $state('en-US');

	onMount(() => {
		// Check if browser supports Speech Recognition
		const SpeechRecognition =
			(window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

		if (!SpeechRecognition) {
			recognition = new SpeechRecognition();
			recognition.continuous = true;
			recognition.interimResults = true;
			recognition.lang = language;

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
			console.log('Starting speech recognition...');
			recognition.language = language;
			console.log(`Language set to: ${recognition.language}`);

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
		utterance.lang = language;
		console.log(`Speaking text in language: ${utterance.lang}`);
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

<h1>Browser Native APIs</h1>

{#if errorMessage}
	<InlineNotification title="Error:" subtitle={errorMessage} />
{/if}

<!-- Speech to Text Section -->
<section class="section">
	<h2>Speech to Text</h2>
	<p>Click the button below and speak into your microphone.</p>

	<TextArea
		bind:value={transcribedText}
		placeholder="Transcribed text will appear here..."
		rows={4}
	/>
	<Toolbar>
		<ToolbarContent>
			<ToolbarMenu>
				<ToolbarMenuItem on:click={() => (open = true)}>Language Settings</ToolbarMenuItem>
			</ToolbarMenu>
			<Button kind="danger" icon={TrashCan} on:click={() => (transcribedText = '')}
				>Clear Content</Button
			>
			<Button icon={isRecording ? StopOutline : Microphone} on:click={toggleRecording}>
				{isRecording ? 'Stop Recording' : 'Start Recording'}
			</Button>
		</ToolbarContent>
	</Toolbar>
</section>

<!-- Text to Speech Section -->
<section class="section">
	<h2>Text to Speech</h2>
	<p>Enter text below and click the button to hear it spoken.</p>

	<TextArea bind:value={textToSpeak} placeholder="Enter text to speak..." rows={4} />

	<Toolbar>
		<ToolbarContent>
			<ToolbarMenu>
				<ToolbarMenuItem on:click={() => (open = true)}>Language Settings</ToolbarMenuItem>
			</ToolbarMenu>
			<Button kind="danger" icon={TrashCan} on:click={() => (textToSpeak = defaultText)}
				>Clear Content</Button
			>
			<Button icon={isSpeaking ? StopOutline : VolumeUp} on:click={speakText}>
				{isSpeaking ? 'Stop Speaking' : 'Speak Text'}
			</Button>
		</ToolbarContent>
	</Toolbar>
</section>

<!-- Modal for Language Settings -->
<Modal
	bind:open
	primaryButtonText="Close"
	on:click:button--primary={() => (open = false)}
	modalHeading="Language Setting"
>
	<p>Select the language for speech recognition and synthesis.</p>
	<Select bind:selected={language} placeholder="Select language">
		<option value="en-US">English (US)</option>
		<option value="de-DE">German (Germany)</option>
		<option value="fr-FR">French (France)</option>
		<option value="es-ES">Spanish (Spain)</option>
	</Select>
</Modal>

<style>
	.section {
		margin-bottom: 2rem;
	}
</style>
