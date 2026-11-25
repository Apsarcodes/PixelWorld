export const PREVIEW_SESSION_KEY = 'pixelworld-preview-session'

export function previewAuthorizationHeaders(): Record<string, string> {
  if (typeof window === 'undefined') return {}
  const token =
    window.localStorage.getItem(PREVIEW_SESSION_KEY) ||
    window.sessionStorage.getItem(PREVIEW_SESSION_KEY)
  return token ? { Authorization: `JWT ${token}` } : {}
}

export function savePreviewSession(token: unknown) {
  if (typeof window === 'undefined' || typeof token !== 'string' || !token) return
  window.localStorage.setItem(PREVIEW_SESSION_KEY, token)
  window.sessionStorage.setItem(PREVIEW_SESSION_KEY, token)
}

export function clearPreviewSession() {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(PREVIEW_SESSION_KEY)
    window.sessionStorage.removeItem(PREVIEW_SESSION_KEY)
    window.localStorage.removeItem('pixelworld_active_screen')
  }
}
