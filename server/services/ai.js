const SUMMARY_PROMPT = `You are a study assistant. Read the student's note and return ONLY valid JSON (no markdown fences) with this shape:
{
  "summary": "- bullet one\\n- bullet two\\n- bullet three",
  "quizQuestions": [
    {
      "question": "Multiple choice question 1?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "Option A"
    },
    {
      "question": "Multiple choice question 2?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "Option B"
    },
    {
      "question": "Multiple choice question 3?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "Option C"
    }
  ]
}

Rules:
- summary must be exactly 3 bullet points separated by newlines
- quizQuestions must contain exactly 3 MCQs
- each question needs 4 options
- correctAnswer must exactly match one of the options`

function extractJson(text) {
  const cleaned = String(text || '').trim()
  const fenced = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/i)
  const candidate = fenced?.[1]?.trim() || cleaned
  const start = candidate.indexOf('{')
  const end = candidate.lastIndexOf('}')
  if (start === -1 || end === -1) {
    throw new Error('AI response did not include JSON.')
  }
  return JSON.parse(candidate.slice(start, end + 1))
}

function normalizeQuizQuestions(rawQuestions) {
  if (!Array.isArray(rawQuestions)) return []

  return rawQuestions.slice(0, 3).map((item, index) => {
    const options = Array.isArray(item?.options)
      ? item.options.map((option) => String(option).trim()).filter(Boolean)
      : []

    return {
      question: String(item?.question || `Question ${index + 1}`).trim(),
      options,
      correctAnswer: String(item?.correctAnswer || options[0] || '').trim(),
    }
  })
}

function parseAiResponse(text) {
  const data = extractJson(text)
  const summary = String(data.summary || '').trim()
  const quizQuestions = normalizeQuizQuestions(data.quizQuestions)
  const quizQuestion =
    quizQuestions[0]?.question ||
    String(data.quizQuestion || '').trim()

  if (!summary) {
    throw new Error('AI response missing summary.')
  }

  return { summary, quizQuestion, quizQuestions }
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
      max_tokens: 1600,
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
      response_format: { type: 'json_object' },
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
