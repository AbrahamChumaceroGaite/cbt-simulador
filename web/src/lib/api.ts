import type { IApiResponse } from '@simulador/shared'

/**
 * GET/read — unwraps envelope, returns only data.
 * Throws if status !== 'success' or if the HTTP request fails.
 */
export async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res  = await fetch(url, init)
  const body = await res.json() as IApiResponse<T>

  if (!res.ok || body.status !== 'success') {
    throw new Error(body.message ?? `Error ${res.status}`)
  }

  return body.data as T
}

/**
 * POST/PUT/DELETE — returns { data, message } so mutations can show
 * the exact backend message in a Toast.
 */
export async function apiFetchFull<T>(url: string, init?: RequestInit): Promise<{ data: T; message: string }> {
  const res  = await fetch(url, init)
  const body = await res.json() as IApiResponse<T>

  if (!res.ok || body.status !== 'success') {
    throw new Error(body.message ?? `Error ${res.status}`)
  }

  return { data: body.data as T, message: body.message ?? '' }
}
