const supabase = require('@supabase/supabase-js')

// Netlify will deploy this so it is 'fetch'able from '/.netlify/functions/supabase'
exports.handler = async (event, context) => {
  // Environment Variables now read from netlify deploy variables
  const conn = supabase.createClient(
    process.env.SUPABSE_URL,
    process.env.SUPABASE_PUBLIC_KEY,
  )
  let { data: words, error } = await conn
    .from('words')
    .select('word')
  if (error) {
    return {
      statusCode: 500,
      error,
    }
  }
  const wordArray = words.map((elm) => elm.word.split(''))
  const wordToGuess = wordArray[Math.floor(Math.random() * wordArray.length)]
  console.log(wordToGuess)
  return {
    statusCode: 200,
    body: JSON.stringify(wordToGuess),
  }
}
