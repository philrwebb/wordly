<script>
	import Key from "./key.svelte"
	export let keysInRow = ["Q","W","E","R","T","Y","U","I","O","P"]
</script>

<div class="keyrow">
	{#each keysInRow as key}	
		<span class="keyc">
			<Key letter={key} on:keypressed />
		</span>
	{/each}
</div>

<style>
	.keyrow {
		display: flex;
		flex-direction: row; 
	}
	.keyc {
		margin: 0;
		padding: 0;
	}
</style>

