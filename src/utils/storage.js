const KEY = 'pc26.attendee'

/**
 * Remembers who the attendee is between visits — name and event only.
 *
 * The selfie is deliberately never persisted: the event library keeps growing,
 * so every visit re-uploads a fresh shot and gets a fresh match set. That also
 * keeps a face image out of localStorage.
 *
 * @typedef {{ fullName: string, eventId: string, lastSearchedAt: string }} Attendee
 */

/** @returns {Attendee|null} */
export const loadAttendee = () => {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return typeof parsed?.fullName === 'string' && parsed.fullName.trim() ? parsed : null
  } catch {
    return null // private mode, corrupt JSON, quota — treat as a first visit
  }
}

export const saveAttendee = (attendee) => {
  try {
    localStorage.setItem(KEY, JSON.stringify({ ...attendee, lastSearchedAt: new Date().toISOString() }))
  } catch {
    /* non-fatal: the flow works without a cache */
  }
}

export const clearAttendee = () => {
  try {
    localStorage.removeItem(KEY)
  } catch {
    /* ignore */
  }
}

const DEVICE_KEY = 'pc26.deviceRef'

/**
 * A stable per-device stand-in for the phone number the API demands.
 *
 * The backend format-validates Phone_No and names the stored upload after it
 * (`uploads/users/<phone>_<hash>.jpg`), so a shared constant would pile every
 * attendee into one namespace. A random number generated once per device keeps
 * uploads distinct without ever asking for a real one.
 */
export const deviceRef = (digits = 10) => {
  try {
    const existing = localStorage.getItem(DEVICE_KEY)
    if (existing && existing.length === digits && /^[0-9]+$/.test(existing)) return existing
  } catch {
    /* fall through to a fresh value */
  }

  // Leading digit is non-zero so the value survives any numeric coercion.
  const value =
    String(Math.floor(Math.random() * 9) + 1) +
    Array.from({ length: digits - 1 }, () => Math.floor(Math.random() * 10)).join('')

  try {
    localStorage.setItem(DEVICE_KEY, value)
  } catch {
    /* ephemeral is fine */
  }
  return value
}

export const clearDeviceRef = () => {
  try {
    localStorage.removeItem(DEVICE_KEY)
  } catch {
    /* ignore */
  }
}
