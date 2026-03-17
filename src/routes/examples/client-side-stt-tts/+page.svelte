<script lang="ts">
	import {
		Button,
		InlineNotification,
		TextArea,
		Toolbar,
		ToolbarContent,
		Select,
		SelectItem,
		Modal,
		ToolbarMenu,
		ToolbarMenuItem,
		Slider
	} from 'carbon-components-svelte';
	import { onMount } from 'svelte';
	import { TrashCan, Microphone, StopOutline, VolumeUp, Copy, Settings } from 'carbon-icons-svelte';
	import { AudioRecorder } from '$lib/cs-stt-tts/recorder';
	import { transcribe, loadModel } from '$lib/cs-stt-tts/whisper';
	import { speak, stopSpeaking, waitForVoices, setVoice, getBestVoice } from '$lib/cs-stt-tts/tts';

	let defaultText =
		'This is a text to speech example using browser native API and offline AI transcription';

	const recorder = new AudioRecorder();
	let isRecording = $state(false);
	let transcribedText = $state('');
	let textToSpeak = $state(defaultText);
	let errorMessage = $state('');
	let isSpeaking = $state(false);
	let isTranscribing = $state(false);
	let voices = $state<SpeechSynthesisVoice[]>([]);
	let selectedVoiceURI = $state('');
	let speechRate = $state(0.9);
	let speechPitch = $state(1.0);
	let showSettings = $state(false);

	onMount(async () => {
		// Preload Whisper model for STT
		loadModel().catch((error) => {
			console.error('Failed to load STT model:', error);
			errorMessage = 'Failed to load speech recognition model.';
		});

		// Load available voices
		try {
			voices = await waitForVoices();
			// Select best voice by default
			const bestVoice = getBestVoice('en');
			if (bestVoice) {
				selectedVoiceURI = bestVoice.voiceURI;
				setVoice(bestVoice);
			}
		} catch (error) {
			console.error('Failed to load voices:', error);
		}
	});

	// Update selected voice when changed
	$effect(() => {
		if (selectedVoiceURI && voices.length > 0) {
			const voice = voices.find((v) => v.voiceURI === selectedVoiceURI);
			if (voice) {
				setVoice(voice);
			}
		}
	});

	async function toggleRecording() {
		if (isRecording) {
			isRecording = false;
			isTranscribing = true;
			errorMessage = '';

			try {
				const audio = await recorder.stop();
				const result = await transcribe(audio);
				transcribedText = result;
			} catch (e) {
				console.error('Transcription error:', e);
				errorMessage = `Transcription error: ${e instanceof Error ? e.message : 'Unknown error'}`;
			} finally {
				isTranscribing = false;
			}
		} else {
			try {
				errorMessage = '';
				await recorder.start();
				isRecording = true;
			} catch (e) {
				console.error('Recording error:', e);
				errorMessage = `Failed to start recording: ${e instanceof Error ? e.message : 'Unknown error'}`;
			}
		}
	}

	async function speakText() {
		if (isSpeaking) {
			stopSpeaking();
			isSpeaking = false;
			return;
		}

		if (!textToSpeak.trim()) {
			errorMessage = 'Please enter some text to speak.';
			return;
		}

		try {
			isSpeaking = true;
			errorMessage = '';

			await speak(textToSpeak, {
				rate: speechRate,
				pitch: speechPitch
			});

			isSpeaking = false;
		} catch (e) {
			console.error('TTS error:', e);
			errorMessage = `Text-to-Speech error: ${e instanceof Error ? e.message : 'Unknown error'}`;
			isSpeaking = false;
		}
	}
</script>

<h1>Offline Speech Recognition & Browser TTS</h1>

{#if errorMessage}
	<InlineNotification title="Error:" subtitle={errorMessage} />
{/if}

<!-- Speech to Text Section -->
<section class="section">
	<h2>Speech to Text</h2>
	<p>
		Click the button below and speak into your microphone. Uses Whisper AI for offline
		transcription.
	</p>

	<TextArea
		bind:value={transcribedText}
		placeholder="Transcribed text will appear here..."
		rows={4}
		disabled={isTranscribing}
	/>
	<Toolbar>
		<ToolbarContent>
			<Button kind="danger" icon={TrashCan} on:click={() => (transcribedText = '')}
				>Clear Content</Button
			>
			<Button kind="secondary" icon={Copy} on:click={() => (textToSpeak = transcribedText)}
				>Copy to speech field</Button
			>
			<Button
				icon={isRecording ? StopOutline : Microphone}
				on:click={toggleRecording}
				disabled={isTranscribing}
			>
				{#if isTranscribing}
					Transcribing...
				{:else if isRecording}
					Stop Recording
				{:else}
					Start Recording
				{/if}
			</Button>
		</ToolbarContent>
	</Toolbar>
	{#if isTranscribing}
		<InlineNotification
			kind="info"
			title="Processing:"
			subtitle="Transcribing audio... (first run may take a while to load the model)"
			hideCloseButton
		/>
	{/if}
</section>

<!-- Text to Speech Section -->
<section class="section">
	<h2>Text to Speech</h2>
	<p>
		Enter text below and click the button to hear it spoken. Uses browser native Speech Synthesis
		API with enhanced voice quality.
	</p>

	<TextArea bind:value={textToSpeak} placeholder="Enter text to speak..." rows={4} />

	<Toolbar>
		<ToolbarContent>
			<ToolbarMenu>
				<ToolbarMenuItem on:click={() => (showSettings = true)}>Voice Settings</ToolbarMenuItem>
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

<!-- Voice Settings Modal -->
<Modal
	bind:open={showSettings}
	modalHeading="Voice Settings"
	primaryButtonText="Close"
	on:click:button--primary={() => (showSettings = false)}
	passiveModal
>
	<div class="settings-content">
		<Select labelText="Voice" bind:selected={selectedVoiceURI}>
			{#each voices as voice}
				<SelectItem
					value={voice.voiceURI}
					text={`${voice.name} (${voice.lang})${voice.localService ? ' - Local' : ''}`}
				/>
			{/each}
		</Select>

		<div class="slider-group">
			<Slider
				labelText="Speech Rate"
				min={0.5}
				max={2}
				step={0.1}
				bind:value={speechRate}
				fullWidth
			/>
			<span class="slider-value">{speechRate.toFixed(1)}x</span>
		</div>

		<div class="slider-group">
			<Slider
				labelText="Speech Pitch"
				min={0.5}
				max={2}
				step={0.1}
				bind:value={speechPitch}
				fullWidth
			/>
			<span class="slider-value">{speechPitch.toFixed(1)}x</span>
		</div>

		<div>
			<p>
				<strong>Tip:</strong> For best quality, look for voices labeled "Premium", "Enhanced", "Neural",
				or "Google" in the voice list.
			</p>
		</div>
	</div>
</Modal>

<style>
	.section {
		margin-bottom: 2rem;
	}

	.settings-content {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.slider-group {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.slider-value {
		min-width: 3rem;
		text-align: right;
		font-weight: 500;
	}
</style>
