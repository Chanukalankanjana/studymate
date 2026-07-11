const SUMMARY_PROMPT = `You are a study assistant. Read the student's note below and return:
1) A 3 bullet-point summary of the key ideas
2) Exactly 1 quiz question about this note

Use this exact format (no extra commentary):
SUMMARY:
- bullet one
- bullet two
- bullet three
QUIZ:
Your quiz question here`

function parseAiResponse(text) {
  const cleaned = String(text || '').trim()
  const quizMatch = cleaned.match(/QUIZ:\s*([\s\S]*)$/i)
  const summaryMatch = cleaned.match(/SUMMARY:\s*([\s\S]*?)(?=QUIZ:|$)/i)

  const summary = (summaryMatch?.[1] || cleaned).trim()
  const quizQuestion = (quizMatch?.[1] || '').trim()

  return { summary, quizQuestion }
}

async function callClaude(noteContent) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return null

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL || 'claude-haiku-4-5-20251001',
      max_tokens: 800,
      messages: [
        {
          role: 'user',
          content: `${SUMMARY_PROMPT}\n\nNOTE:\n${noteContent}`,
        },
      ],
    }),
  })

  if (!response.ok) {
    const details = await response.text()
    throw new Error(`Claude API error: ${details}`)
  }

  const data = await response.json()
  const text = data.content?.map((part) => part.text || '').join('\n') || ''
  return parseAiResponse(text)
}

async function callOpenAI(noteContent) {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return null

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      temperature: 0.4,
      messages: [
        {
          role: 'user',
          content: `${SUMMARY_PROMPT}\n\nNOTE:\n${noteContent}`,
        },
      ],
    }),
  })

  if (!response.ok) {
    const details = await response.text()
    throw new Error(`OpenAI API error: ${details}`)
  }

  const data = await response.json()
  const text = data.choices?.[0]?.message?.content || ''
  return parseAiResponse(text)
}

export async function generateNoteSummary(noteContent) {
  const fromClaude = await callClaude(noteContent)
  if (fromClaude) return fromClaude

  const fromOpenAI = await callOpenAI(noteContent)
  if (fromOpenAI) return fromOpenAI

  throw new Error(
    'Set ANTHROPIC_API_KEY or OPENAI_API_KEY in server/.env to enable AI summaries.',
  )
}
