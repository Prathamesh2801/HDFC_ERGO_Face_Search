import { useCallback, useMemo, useRef, useState } from 'react'

import { searchPhotosByFace } from '@/services/faceSearchService'
import { SearchContext, SearchStatus } from '@/store/searchContext'

const initialState = {
  status: SearchStatus.Idle,
  fullName: '',
  previewUrl: null,
  photos: [],
  error: null,
}

/**
 * Owns the one piece of cross-route state: who registered, their selfie preview
 * and the photos the API matched. Everything else stays local to its component.
 */
export function SearchProvider({ children }) {
  const [state, setState] = useState(initialState)
  const abortRef = useRef(null)
  const previewRef = useRef(null)

  const revokePreview = useCallback(() => {
    if (previewRef.current) URL.revokeObjectURL(previewRef.current)
    previewRef.current = null
  }, [])

  const startSearch = useCallback(
    async ({ fullName, selfie }) => {
      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller

      revokePreview()
      previewRef.current = URL.createObjectURL(selfie)

      setState({
        status: SearchStatus.Searching,
        fullName: fullName.trim(),
        previewUrl: previewRef.current,
        photos: [],
        error: null,
      })

      try {
        const { photos } = await searchPhotosByFace({
          fullName: fullName.trim(),
          selfie,
          signal: controller.signal,
        })
        if (controller.signal.aborted) return
        setState((prev) => ({ ...prev, status: SearchStatus.Success, photos }))
      } catch (error) {
        if (controller.signal.aborted || error?.name === 'AbortError') return
        setState((prev) => ({
          ...prev,
          status: SearchStatus.Error,
          error: error?.message ?? 'Something went wrong. Please try again.',
        }))
      }
    },
    [revokePreview],
  )

  const reset = useCallback(() => {
    abortRef.current?.abort()
    revokePreview()
    setState(initialState)
  }, [revokePreview])

  const value = useMemo(() => ({ ...state, startSearch, reset }), [state, startSearch, reset])

  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>
}
