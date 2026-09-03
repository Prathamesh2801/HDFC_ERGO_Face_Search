import { appConfig } from '@/config/app.config'

export class ApiError extends Error {
  constructor(message, { status = 0, code = 'api_error', details = null } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.details = details
  }
}

const friendlyMessage = (status) => {
  if (status === 0) return 'We could not reach the server. Check your connection and try again.'
  if (status === 413) return 'That image is too large for the server. Try a smaller selfie.'
  if (status === 429) return 'Too many attempts right now. Please wait a moment and retry.'
  if (status >= 500) return 'The server had a problem. Please try again in a moment.'
  return 'Something went wrong with that request.'
}

/**
 * Thin fetch wrapper: absolute URL building, timeout, JSON/FormData bodies and
 * a single normalised error type for the UI to render.
 */
export async function request(path, { method = 'GET', body, headers, signal, timeoutMs } = {}) {
  const url = /^https?:\/\//i.test(path) ? path : `${appConfig.api.baseUrl}${path}`
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs ?? appConfig.api.timeoutMs)

  // Let the caller's signal (unmount, cancel) abort our controller too.
  const onAbort = () => controller.abort()
  signal?.addEventListener('abort', onAbort, { once: true })

  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData

  try {
    const response = await fetch(url, {
      method,
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        ...(isFormData || body === undefined ? {} : { 'Content-Type': 'application/json' }),
        ...headers,
      },
      body: isFormData ? body : body === undefined ? undefined : JSON.stringify(body),
    })

    const payload = await response
      .clone()
      .json()
      .catch(() => null)

    if (!response.ok) {
      throw new ApiError(payload?.message || friendlyMessage(response.status), {
        status: response.status,
        code: payload?.code ?? 'http_error',
        details: payload,
      })
    }

    return payload
  } catch (error) {
    if (error instanceof ApiError) throw error
    if (error.name === 'AbortError') {
      throw new ApiError('The request took too long. Please try again.', {
        code: 'timeout',
      })
    }
    throw new ApiError(friendlyMessage(0), { code: 'network_error', details: error.message })
  } finally {
    clearTimeout(timeout)
    signal?.removeEventListener('abort', onAbort)
  }
}

export const api = {
  get: (path, options) => request(path, { ...options, method: 'GET' }),
  post: (path, body, options) => request(path, { ...options, method: 'POST', body }),
}
