<script lang="ts">
	import { Button } from 'carbon-components-svelte';
	import { Sun, Moon, ColorPicker } from 'carbon-icons-svelte';

	// when the theme changes, update the cookie and the html data tag DaisyUI uses to determine the theme
	function changeTheme(selection: string) {
		document.startViewTransition(() => {
			if (selection) {
				document.cookie = `theme=${selection}; max-age=${60 * 60 * 24 * 365}; path=/; SameSite=Lax`;
				document.documentElement.setAttribute('theme', selection);
				localStorage.setItem('theme', selection);
			} else {
				document.cookie = `theme=''; max-age=0; path=/; SameSite=Lax`;
				document.documentElement.setAttribute('theme', '');
				localStorage.removeItem('theme');
			}
		});
	}

	let theme = $state('');

	$effect(() => {
		theme = document.documentElement.getAttribute('theme') ?? '';
	});
</script>

{#if theme === 'white'}
	<Button
		kind="ghost"
		icon={Sun}
		hideTooltip
		on:click={() => {
			theme = 'g100';
			changeTheme('g100');
		}}
	/>
{/if}
{#if theme === ''}
	<Button
		kind="ghost"
		icon={ColorPicker}
		hideTooltip
		on:click={() => {
			theme = 'white';
			changeTheme('white');
		}}
	/>
{/if}
{#if theme === 'g100'}
	<Button
		kind="ghost"
		icon={Moon}
		hideTooltip
		on:click={() => {
			theme = '';
			changeTheme('');
		}}
	/>
{/if}
