<script lang="ts">
	import { route } from '$lib/ROUTES';
</script>

<h1>Dashboard</h1>
<a href={route('/dashboard/one')}>Dashboard One</a>

<h2>Some examples</h2>
<ul>
	<li>
		A example for speach to text and text to speach with the browsers native APIs is implemented
		here: <a href={route('/examples/stt-tts')}>STT / TTS</a>
	</li>
	<li>
		Streaming a data to the browser is implemented here: <a href={route('/examples/show-temp')}
			>Streaming temperature</a
		>
	</li>
</ul>
