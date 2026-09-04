import { useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

/**
 * `navigate` that carries the current query (notably `?event=`) across routes.
 *
 * The event code arrives only in the entry link, so dropping it on the first
 * hop would leave a refresh — or a shared mid-flow URL — with no event at all.
 */
export function useEventNavigate() {
  const navigate = useNavigate()
  const { search } = useLocation()

  return useCallback(
    (to, options) =>
      navigate(typeof to === 'string' ? { pathname: to, search } : { search, ...to }, options),
    [navigate, search],
  )
}
