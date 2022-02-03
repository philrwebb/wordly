<script>
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();
	export let letter = "A";
</script>

<div class="key" on:click="{() => dispatch('keypressed', {letter})}">
	{letter}
</div>

<style>
	.key {
		height: 3rem;
		width: 2rem auto;
		padding: 0 0.5rem;
		border-radius: 10%;
		border: solid 1px black;
		display: grid;
		justify-content: center;
		align-content: center;
		background-color: #FFFFFF;
		margin: 0 2px
	}
</style>
