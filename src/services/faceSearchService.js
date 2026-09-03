import { appConfig, useMockApi } from '@/config/app.config'
import { api } from '@/services/apiClient'
import { mockFaceSearch } from '@/services/mockFaceSearch'

/**
 * Normalises whatever shape the backend returns into the single `Photo` shape
 * the UI renders. When the real API contract lands, this mapper is the only
 * place that needs to change.
 *
 * @typedef {{ id: string, url: string, thumbnailUrl: string, takenAt: string|null, score: number|null }} Photo
 */
const toPhoto = (item, index) => {
  const url = item.url ?? item.imageUrl ?? item.photoUrl ?? item.src ?? item.signedUrl ?? ''
  return {
    id: String(item.id ?? item.photoId ?? item.key ?? `photo-${index}`),
    url,
    thumbnailUrl: item.thumbnailUrl ?? item.thumbUrl ?? item.thumbnail ?? url,
    takenAt: item.takenAt ?? item.capturedAt ?? item.createdAt ?? null,
    score: typeof item.score === 'number' ? item.score : (item.confidence ?? null),
  }
}

const normaliseResult = (payload) => {
  const list =
    payload?.photos ?? payload?.results ?? payload?.matches ?? payload?.data?.photos ?? payload?.data ?? []

  return {
    requestId: payload?.requestId ?? payload?.id ?? null,
    photos: (Array.isArray(list) ? list : []).map(toPhoto).filter((photo) => photo.url),
  }
}

/**
 * Registers the attendee's selfie and returns every event photo they appear in.
 *
 * @param {{ fullName: string, selfie: File, signal?: AbortSignal }} input
 * @returns {Promise<{ requestId: string|null, photos: Photo[] }>}
 */
export async function searchPhotosByFace({ fullName, selfie, signal }) {
  if (useMockApi) return mockFaceSearch({ fullName, selfie, signal })

  const form = new FormData()
  form.append('name', fullName)
  form.append('image', selfie, selfie.name || 'selfie.jpg')

  const payload = await api.post(appConfig.api.endpoints.faceSearch, form, { signal })
  return normaliseResult(payload)
}
