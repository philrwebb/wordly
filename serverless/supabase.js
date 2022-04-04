// import { createClient } from '@supabase/supabase-js'
const supabase = require('@supabase/supabase-js')

exports.handler = async (event, context) => {
  const conn = supabase.createClient(
    process.env.SUPABSE_URL,
    process.env.SUPABASE_PUBLIC_KEY
    // 'https://cfythzsmualnnqgwhxax.supabase.co',
    // 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTY0NDIxNDcxMCwiZXhwIjoxOTU5NzkwNzEwfQ.4f88YkUDDOMMaGms6F4R_TGhcdJV2XeeDgCcVv6atCo',
  )
  let { data: words, error } = await conn.from('words').select('word')
  const wordArray = words.map((elm) => elm.word.split(''))
  console.log(wordArray)
  const wordToGuess = wordArray[
    Math.floor(Math.random() * wordArray.length)
  ]  
  return {
    statusCode: 200,
    body: JSON.stringify(wordToGuess),
  }
}
