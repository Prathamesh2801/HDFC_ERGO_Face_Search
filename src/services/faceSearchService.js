import { appConfig } from '@/config/app.config'
import { api, ApiError } from '@/services/apiClient'
import { deviceRef } from '@/utils/storage'

/**
 * @typedef {{ id: string, url: string, thumbnailUrl: string, name: string,
 *             extension: string, confidence: number|null }} Photo
 */

/**
 * One match from the API:
 *   { confidence, extension, face_index, match_file, URL }
 *
 * There is no separate thumbnail in the payload, so the grid lazy-loads the
 * full image and `<img loading="lazy">` keeps an 80–100 photo result cheap.
 */
const toPhoto = (item, index) => {
  const url = item.URL ?? item.url ?? ''
  const file = item.match_file ?? `photo-${index + 1}`
  return {
    // match_file repeats when one photo matches on several faces, so the index
    // is part of the key to keep React reconciliation stable.
    id: `${file}-${item.face_index ?? index}`,
    url,
    thumbnailUrl: url,
    name: file,
    extension: item.extension ?? '.jpg',
    confidence: typeof item.confidence === 'number' ? item.confidence : null,
  }
}

/**
 * `Status` comes back as a boolean on success and as the string "False" on a
 * validation error, so it is compared loosely rather than with ===.
 */
const isTruthyStatus = (status) =>
  status === true || (typeof status === 'string' && status.toLowerCase() === 'true')

/**
 * Registers the attendee and returns every event photo they appear in.
 *
 * The endpoint answers HTTP 200 for every outcome and describes the result in
 * the body, in three shapes:
 *   found      → { Status: true,    Data: { matches: [...], total_matches } }
 *   no matches → { Status: false,   Message: "No matches found", Saved: true, Image_Path }
 *   failed     → { Status: "False", Message: "Error: ..." }
 *
 * "No matches" is a successful, empty result; the third shape is a real error
 * and is told apart by `Saved` being absent.
 *
 * @param {{ fullName: string, eventId: string, selfie: File, signal?: AbortSignal }} input
 * @returns {Promise<{ photos: Photo[], message: string|null, saved: boolean }>}
 */
export async function registerAndSearch({ fullName, eventId, selfie, signal }) {
  const { endpoints } = appConfig.api
  const { placeholderEmail } = appConfig.search

  const form = new FormData()
  form.append('Event_ID', eventId)
  form.append('Name', fullName)
  form.append('image', selfie, selfie.name || 'selfie.jpg')
  // Required by the API but not collected by this app.
  form.append('Email_ID', placeholderEmail)
  form.append('Phone_No', deviceRef(appConfig.search.phoneDigits))

  const payload = await api.post(endpoints.registerAndSearch, form, { signal })

  // A falsy Status with no `Saved` flag means the request itself was rejected.
  if (!isTruthyStatus(payload?.Status) && payload?.Saved === undefined) {
    throw new ApiError(payload?.Message?.replace(/^Error:\s*/i, '') || 'We could not process that selfie. Please try again.', {
      status: 200,
      code: 'api_rejected',
      details: payload,
    })
  }

  const matches = Array.isArray(payload?.Data?.matches) ? payload.Data.matches : []

  return {
    photos: matches.map(toPhoto).filter((photo) => photo.url),
    message: payload?.Message ?? null,
    saved: payload?.Saved === true,
  }
}
