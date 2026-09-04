import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import toast from 'react-hot-toast'

import { appConfig } from '@/config/app.config'
import { registerAndSearch } from '@/services/faceSearchService'
import { resetCorsProbe } from '@/utils/download'
import { SearchContext, SearchStatus } from '@/store/searchContext'
import { clearAttendee, clearDeviceRef, loadAttendee, saveAttendee } from '@/utils/storage'

/**
 * Reads the event from the link, e.g. `/#/?event=Test`.
 *
 * HashRouter puts the real query inside the hash, but a link may also carry it
 * before the hash (`/?event=Test#/`), so both are checked.
 */
const readEventId = () => {
  const { eventParam, fallbackEventId } = appConfig.search
  const hash = window.location.hash
  const hashQuery = hash.includes('?') ? hash.slice(hash.indexOf('?')) : ''

  return (
    new URLSearchParams(hashQuery).get(eventParam) ||
    new URLSearchParams(window.location.search).get(eventParam) ||
    fallbackEventId
  )
}

const initialState = {
  status: SearchStatus.Idle,
  fullName: '',
  previewUrl: null,
  photos: [],
  error: null,
  /** Server's own words when it found nobody, e.g. "No matches found". */
  emptyMessage: null,
}

/**
 * Owns the cross-route state: who registered, their selfie preview and the
 * photos the API matched. The attendee's name is mirrored into localStorage so
 * a repeat visit only has to re-take the selfie.
 */
export function SearchProvider({ children }) {
  const [state, setState] = useState(initialState)
  const [eventId, setEventId] = useState(readEventId)
  const [remembered, setRemembered] = useState(loadAttendee)
  const abortRef = useRef(null)
  const previewRef = useRef(null)

  // The event can change without a reload when someone opens a second link.
  useEffect(() => {
    const onHashChange = () => setEventId(readEventId())
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  const revokePreview = useCallback(() => {
    if (previewRef.current) URL.revokeObjectURL(previewRef.current)
    previewRef.current = null
  }, [])

  useEffect(() => revokePreview, [revokePreview])

  const startSearch = useCallback(
    async ({ fullName, selfie }) => {
      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller

      const name = fullName.trim()

      // Everything from here on lives inside the try: the prologue can throw
      // too (createObjectURL rejects a non-Blob), and an escaping error would
      // surface as an unhandled rejection mid-click — which lets the form's
      // native submit through and trips the router error boundary.
      try {
        resetCorsProbe()
        revokePreview()
        previewRef.current = URL.createObjectURL(selfie)

        setState({
          ...initialState,
          status: SearchStatus.Searching,
          fullName: name,
          previewUrl: previewRef.current,
        })

        const { photos, message } = await registerAndSearch({
          fullName: name,
          eventId,
          selfie,
          signal: controller.signal,
        })
        if (controller.signal.aborted) return

        setState((prev) => ({
          ...prev,
          status: SearchStatus.Success,
          photos,
          emptyMessage: photos.length ? null : message,
        }))

        // Registration succeeded either way — remember them for next time.
        saveAttendee({ fullName: name, eventId })
        setRemembered({ fullName: name, eventId })

        if (photos.length) {
          toast.success(`Found ${photos.length} photo${photos.length === 1 ? '' : 's'} of you`)
        } else {
          toast(message || 'No photos matched yet', { icon: '🔍' })
        }
      } catch (error) {
        if (controller.signal.aborted || error?.name === 'AbortError') return
        const message = error?.message ?? 'Something went wrong. Please try again.'
        // Spread from the base state, not `prev`: if the prologue threw, `prev`
        // may still be Idle and the error screen would never render.
        setState({
          ...initialState,
          status: SearchStatus.Error,
          fullName: name,
          previewUrl: previewRef.current,
          error: message,
        })
        toast.error(message)
      }
    },
    [eventId, revokePreview],
  )

  /** Cancels an in-flight search and returns to a clean form. */
  const reset = useCallback(() => {
    abortRef.current?.abort()
    abortRef.current = null
    revokePreview()
    setState(initialState)
  }, [revokePreview])

  /** "Not you?" — drops the remembered attendee from this device. */
  const forgetMe = useCallback(() => {
    clearAttendee()
    clearDeviceRef()
    setRemembered(null)
    reset()
    toast.success('Your saved details were cleared from this device')
  }, [reset])

  const value = useMemo(
    () => ({ ...state, eventId, remembered, startSearch, reset, forgetMe }),
    [state, eventId, remembered, startSearch, reset, forgetMe],
  )

  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>
}
