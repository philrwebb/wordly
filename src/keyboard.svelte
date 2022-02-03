<script>
	import Keyrow from './keyrow.svelte';
	let rows = [
		["Q","W","E","R","T","Y","U","I","O","P"],
		["A","S","D","F","G","H","J","K","L"],
		["ENTER","Z","X","C","V","B","N","M","DEL"]
	]
</script>

<div class='keyboard'>
	{#each rows as keysInRow}
		<Keyrow {keysInRow} on:keypressed />
	{/each}
</div>

<style>
	.keyboard {
		display: grid;
		grid-template-columns: 1fr;
		align-items: center;
		justify-items: center;
		
	}
	
</style>
