const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY
const OPENAI_API_KEY = process.env.OPENAI_API_KEY

const NVIDIA_BASE = 'https://integrate.api.nvidia.com/v1'
const OPENAI_BASE = 'https://api.openai.com/v1'

type Provider = 'nvidia' | 'openai'

function getConfig(): { base: string; key: string; provider: Provider } | null {
  if (NVIDIA_API_KEY) {
    return { base: NVIDIA_BASE, key: NVIDIA_API_KEY, provider: 'nvidia' }
  }
  if (OPENAI_API_KEY) {
    return { base: OPENAI_BASE, key: OPENAI_API_KEY, provider: 'openai' }
  }
  return null
}

export async function callChatCompletion(
  messages: { role: string; content: string }[],
  opts: { model?: string; temperature?: number; maxTokens?: number } = {}
): Promise<string | null> {
  const cfg = getConfig()
  if (!cfg) return null

  const model = opts.model || (cfg.provider === 'nvidia' ? 'meta/llama-3.1-70b-instruct' : 'gpt-4')

  try {
    const res = await fetch(`${cfg.base}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${cfg.key}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: opts.temperature ?? 0.7,
        max_tokens: opts.maxTokens ?? 1024,
      }),
      signal: AbortSignal.timeout(30000),
    })

    if (!res.ok) {
      const body = await res.text()
      console.error(`AI API error (${cfg.provider}):`, res.status, body)
      return null
    }

    const data = await res.json()
    return data.choices?.[0]?.message?.content ?? null
  } catch (err) {
    console.error(`AI API failure (${cfg.provider}):`, err)
    return null
  }
}

export async function callJsonCompletion<T>(
  systemPrompt: string,
  userPrompt: string,
  opts?: { temperature?: number }
): Promise<T | null> {
  const raw = await callChatCompletion(
    [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    { temperature: opts?.temperature ?? 0.3 }
  )

  if (!raw) return null

  try {
    return JSON.parse(raw) as T
  } catch {
    console.error('Failed to parse AI JSON response:', raw.slice(0, 200))
    return null
  }
}
