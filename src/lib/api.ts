import { useEffect, useState } from 'react'

export interface ResourceState<T> {
  data: T
  loading: boolean
  error: string | null
}

export async function apiRequest<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    headers: { 'Content-Type': 'application/json', ...(options?.headers ?? {}) },
    ...options,
  })
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    const message = typeof payload.error === 'string' ? payload.error : payload.error?.message ?? payload.message ?? 'Something went wrong.'
    throw new Error(message)
  }
  return payload.data as T
}

export function useResource<T>(path: string, fallback: T): ResourceState<T> {
  const [data, setData] = useState<T>(fallback)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    setLoading(true)
    apiRequest<T>(path)
      .then((result) => {
        if (active) {
          setData(result)
          setError(null)
        }
      })
      .catch((reason: unknown) => {
        if (active) setError(reason instanceof Error ? reason.message : 'Using local demonstration data.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => { active = false }
  }, [path])

  return { data, loading, error }
}
