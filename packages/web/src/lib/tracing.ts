const TRACING_ENABLED = process.env.NEXT_PUBLIC_TRACING_ENABLED === 'true'

interface Trace {
  id: string
  operation: string
  startTime: number
  duration?: number
  error?: string
}

export function startTrace(operation: string): string {
  if (!TRACING_ENABLED) return ''
  const id = `trace_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
  if (typeof performance !== 'undefined') {
    performance.mark(`${id}_start`)
  }
  return id
}

export function endTrace(id: string, error?: string) {
  if (!TRACING_ENABLED || !id) return
  if (typeof performance !== 'undefined') {
    performance.mark(`${id}_end`)
    performance.measure(id, `${id}_start`, `${id}_end`)
  }
}

export async function traceFetch<T>(
  url: string,
  options?: RequestInit,
  label?: string
): Promise<T> {
  const traceId = startTrace(label || url)
  try {
    const res = await fetch(url, {
      ...options,
      signal: options?.signal || AbortSignal.timeout(15000),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    endTrace(traceId)
    return data as T
  } catch (err) {
    endTrace(traceId, (err as Error).message)
    throw err
  }
}
