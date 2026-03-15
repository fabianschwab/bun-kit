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
	import { TrashCan, Microphone, StopOutline, VolumeUp, Copy } from 'carbon-icons-svelte';

	let defaultText = 'This is a text to speech example using IBM Watson services';

	let mediaRecorder: MediaRecorder | null = null;
	let audioChunks: Blob[] = [];
	let isRecording = $state(false);
	let transcribedText = $state('');
	let textToSpeak = $state(defaultText);
	let errorMessage = $state('');
	let isSpeaking = $state(false);
	let open = $state(false);
	let language = $state('en-US');
	let audioElement: HTMLAudioElement | null = null;
	let isProcessing = $state(false);

	onMount(() => {
		// Check if browser supports MediaRecorder
		if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
			errorMessage = 'Media recording is not supported in this browser.';
		}
	});

	async function toggleRecording() {
		if (isRecording) {
			// Stop recording
			if (mediaRecorder && mediaRecorder.state !== 'inactive') {
				mediaRecorder.stop();
			}
			isRecording = false;
		} else {
			// Start recording
			try {
				audioChunks = [];
				const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

				mediaRecorder = new MediaRecorder(stream, {
					mimeType: 'audio/webm'
				});

				mediaRecorder.ondataavailable = (event) => {
					if (event.data.size > 0) {
						audioChunks.push(event.data);
					}
				};

				mediaRecorder.onstop = async () => {
					const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
					await transcribeAudio(audioBlob);

					// Stop all tracks
					stream.getTracks().forEach((track) => track.stop());
				};

				mediaRecorder.start();
				isRecording = true;
				errorMessage = '';
			} catch (err: any) {
				errorMessage = `Error accessing microphone: ${err.message}`;
				isRecording = false;
			}
		}
	}

	async function transcribeAudio(audioBlob: Blob) {
		isProcessing = true;
		try {
			// Convert blob to base64
			const reader = new FileReader();
			reader.readAsDataURL(audioBlob);

			reader.onloadend = async () => {
				const base64Audio = (reader.result as string).split(',')[1];

				const response = await fetch('/examples/watson-stt-tts', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({
						action: 'transcribe',
						data: base64Audio,
						language
					})
				});

				if (!response.ok) {
					const error = await response.json();
					throw new Error(error.message || 'Transcription failed');
				}

				const result = await response.json();
				transcribedText = result.transcript || '';
				isProcessing = false;
			};
		} catch (err: any) {
			errorMessage = `Transcription error: ${err.message}`;
			isProcessing = false;
		}
	}

	async function speakText() {
		if (isSpeaking) {
			// Stop speaking
			if (audioElement) {
				audioElement.pause();
				audioElement.currentTime = 0;
			}
			isSpeaking = false;
			return;
		}

		isProcessing = true;
		try {
			const response = await fetch('/examples/watson-stt-tts', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					action: 'synthesize',
					data: textToSpeak,
					language
				})
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.message || 'Speech synthesis failed');
			}

			const result = await response.json();
			const audioData = `data:audio/mp3;base64,${result.audio}`;

			// Create and play audio
			audioElement = new Audio(audioData);
			audioElement.onplay = () => {
				isSpeaking = true;
				isProcessing = false;
				errorMessage = '';
			};

			audioElement.onended = () => {
				isSpeaking = false;
			};

			audioElement.onerror = () => {
				errorMessage = 'Error playing audio';
				isSpeaking = false;
				isProcessing = false;
			};

			await audioElement.play();
		} catch (err: any) {
			errorMessage = `Speech synthesis error: ${err.message}`;
			isSpeaking = false;
			isProcessing = false;
		}
	}
</script>

<h1>IBM Watson Speech Services</h1>

{#if errorMessage}
	<InlineNotification title="Error:" subtitle={errorMessage} />
{/if}

{#if isProcessing}
	<InlineNotification kind="info" title="Processing..." subtitle="Please wait..." hideCloseButton />
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
			<Button kind="secondary" icon={Copy} on:click={() => (textToSpeak = transcribedText)}
				>Copy to speech field</Button
			>
			<Button
				icon={isRecording ? StopOutline : Microphone}
				on:click={toggleRecording}
				disabled={isProcessing}
			>
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
			<Button
				icon={isSpeaking ? StopOutline : VolumeUp}
				on:click={speakText}
				disabled={isProcessing}
			>
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
