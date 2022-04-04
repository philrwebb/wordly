<script>
  import Row from "./row.svelte";
  let rowstate1 = [
      { content: 'W', color: 'lightgreen', inWord: true, rightPlace: true },
      { content: 'E', color: 'white', inWord: false, rightPlace: false },
      { content: 'A', color: 'white', inWord: false, rightPlace: false },
      { content: 'R', color: 'white', inWord: false, rightPlace: false },
      { content: 'Y', color: 'white', inWord: false, rightPlace: false },
    ]
  let rowstate2 = [
      { content: 'P', color: 'white', inWord: true, rightPlace: true },
      { content: 'I', color: '#fad6a5', inWord: true, rightPlace: false },
      { content: 'L', color: 'white', inWord: false, rightPlace: false },
      { content: 'L', color: 'white', inWord: false, rightPlace: false },
      { content: 'S', color: 'white', inWord: false, rightPlace: false },
    ]
  let rowstate3 = [
      { content: 'V', color: 'white', inWord: true, rightPlace: true },
      { content: 'A', color: 'white', inWord: false, rightPlace: false },
      { content: 'G', color: 'white', inWord: false, rightPlace: false },
      { content: 'U', color: 'lightgrey', inWord: false, rightPlace: false },
      { content: 'E', color: 'white', inWord: false, rightPlace: false },
    ]
</script>

<div class="container">
  <h1>HOW TO PLAY</h1>
  <div class="content">
    <p>Guess the WORDLE in six tries.</p>
    <p>
      Each guess must be a valid five-letter word. Hit the enter button to
      submit.
    </p>
    <p>
      After each guess, the color of the tiles will change to show how close
      your guess was to the word.
    </p>
  </div>
<hr>
  <h2>Examples</h2>
  <div class="example">
    <Row rowstate={rowstate1}/>
    <p>The letter W is in the word and in the correct spot.</p>
  </div>
  <div class="example">
      <Row rowstate={rowstate2}/>
    <p>The letter I is in the word but in the wrong spot. </p>
  </div>
  <div class="example">
      <Row rowstate={rowstate3}/>
    <p>The letter U is not in the word in any spot.</p>
  </div>
<hr>
   <h2>A new WORDLE will be available each day!</h2>
</div>


<style>
	.example {
		display: grid;
		grid-template-columns: 1fr;
		justify-items: left;
		grid-gap: 5px;
	}
</style>
