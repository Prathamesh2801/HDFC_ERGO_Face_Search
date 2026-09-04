import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

/**
 * Renders children into a node appended to <body>.
 *
 * Overlays must escape the app tree: AppLayout uses `transform` and
 * `backdrop-filter`, and either one creates a containing block that makes a
 * descendant `position: fixed` element size and scroll relative to that
 * ancestor instead of the viewport — the classic iOS Safari "full-screen modal
 * isn't full-screen and won't dismiss" bug.
 */
export function Portal({ children }) {
  const [host] = useState(() => (typeof document === 'undefined' ? null : document.createElement('div')))

  useEffect(() => {
    if (!host) return
    host.setAttribute('data-portal', '')
    document.body.appendChild(host)
    return () => host.remove()
  }, [host])

  return host ? createPortal(children, host) : null
}
