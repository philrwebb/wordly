<script>
	import Keyrow from './keyrow.svelte';
	import { keyboardData } from './store.js';
	let rows = [
		["Q","W","E","R","T","Y","U","I","O","P"],
		["A","S","D","F","G","H","J","K","L"],
		["ENTER","Z","X","C","V","B","N","M","DEL"]
	]
</script>

<div class='keyboard'>
	{#each $keyboardData.keystate as keysInRow}
		<Keyrow {keysInRow} on:keypressed />
	{/each}
</div>

<style>
	.keyboard {
		display: grid;
		grid-template-columns: 1fr;
		/* align-items: center; */
		justify-items: center;
		padding: 0;
		margin: 0;
	}
	
</style>
