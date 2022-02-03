<script>
	import Rows from "./rows.svelte";
	import Keyboard from "./keyboard.svelte";
	import {gameData} from "./store.js"
	const handleKeydown = (event) => {
		event.preventDefault();
		// if(event.key.toUpperCase() === "TAB" || event.key.toUpperCase() === "SHIFT")
		// 	return
		if($gameData.currentRow > 5) return
		if(event.key === 'Backspace' && $gameData.currentCol > 0) {
			$gameData.currentCol--
			$gameData.rowstate[$gameData.currentRow][$gameData.currentCol].content = ""
			return
		} else if (event.key === 'Backspace') {
			return
		} else if ($gameData.currentCol > 4 && event.key === 'Enter') {
			$gameData.currentRow++
			$gameData.currentCol = 0
			$gameData.gameWon = checkWord($gameData.rowstate[$gameData.currentRow-1], $gameData.wordToGuess)	
			console.log($gameData.gameWon)
			return
		} else if ($gameData.currentCol <= 4 && event.key === 'Enter') {
			console.log('not finished')
			return
		} else if ($gameData.currentCol <= 4 && event.key.length === 1 && ((event.key >= 'a' && event.key <= 'z') || (event.key >= 'A' && event.key <= 'Z'))) {
			$gameData.rowstate[$gameData.currentRow][$gameData.currentCol].content = event.key.toUpperCase()
			$gameData.currentCol++
			return
		} 
	}
	const checkWord = (row, word) => {
		for(let i = 0; i <= 4; i++) {
			if (word[i] === row[i].content)
				{
					row[i].inWord = true;
					row[i].rightPlace = true;
					row[i].color = "lightgreen";
				}
		}
		for(let i = 0; i <=4; i++) {
			for (let j = 0; j <= 4; j++)
				{
					if(!row[i].rightPlace && row[i].content === word[j])
						{
							row[i].inWord = true;
							row[i].color = "lightgrey";
						}
				}
		}
		let countDone = 0;
		for(let i = 0; i <= 4; i++) {
			if(row[i].inWord === true && row[i].rightPlace === true)
				countDone++
		}
		if (countDone == 5) 
			return true 
		else 
			return false;
	}
	const handlekeypressed = (event) => {
		event.key = event.detail.letter
		if (event.key === 'ENTER') event.key = 'Enter'
		if (event.key === 'DEL') event.key = 'Backspace'
		handleKeydown(event)
	}
</script>
<svelte:window on:keydown={handleKeydown}/>
<div class="container">
	<h1 style:color="{$gameData.gameWon ? 'red' : 'black'}">
		WEBWORD
	</h1>
	<span class="rows">
		<Rows></Rows>
	</span>
	<Keyboard on:keypressed={handlekeypressed}></Keyboard>
</div>


<style>
	.container {
		height: 700px;
		display: grid;
		align-items: space-around;
		justify-content:center;
		justify-items: center;
	}
</style>