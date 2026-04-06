import Anthropic from '@anthropic-ai/sdk'
import type { GenerationType } from '@/types'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const PROMPTS: Record<GenerationType, (input: string) => string> = {
  summary: (input) =>
    'You are a precise summarizer. Summarize the following text in 3-5 clear sentences. Preserve the key information and main ideas. Output plain text only — no headers, no bullet points, no markdown formatting.\n\nText to summarize:\n' +
    input,

  rewrite_professional: (input) =>
    'You are an expert business writer. Rewrite the following text in a clear, professional tone suitable for business communication. Maintain the original meaning but improve clarity and professionalism. Output plain text only — no headers, no markdown formatting.\n\nText to rewrite:\n' +
    input,

  rewrite_casual: (input) =>
    'You are a friendly copywriter. Rewrite the following text in a casual, conversational tone. Keep it natural, warm, and easy to read. Maintain the original meaning. Output plain text only — no markdown formatting.\n\nText to rewrite:\n' +
    input,

  bullets: (input) =>
    "You are an expert at extracting key information. Extract the most important points from the following text as a clean bullet list. Start each bullet with '• '. Be concise — one clear idea per bullet. Output only the bullet list, no introduction, no conclusion, no markdown formatting.\n\nText to process:\n" +
    input,
}

export async function generateContent(
  input: string,
  type: GenerationType
): Promise<string> {
  try {
    const prompt = PROMPTS[type](input)

    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    })

    const block = response.content[0]
    if (block.type !== 'text') {
      throw new Error('Unexpected response type')
    }

    return block.text.trim()
  } catch (error) {
    throw new Error(
      'AI generation failed: ' +
        (error instanceof Error ? error.message : 'Unknown error')
    )
  }
}
