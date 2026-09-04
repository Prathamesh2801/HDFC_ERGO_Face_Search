/**
 * Locks background scrolling while an overlay is open.
 *
 * `overflow: hidden` on <body> alone does not hold on iOS Safari — the page
 * still rubber-bands and the overlay drifts. Pinning the body to a fixed
 * position and restoring the offset afterwards is the reliable approach.
 *
 * @returns {() => void} the release function.
 */
export function lockScroll() {
  if (typeof document === 'undefined') return () => {}

  const { body } = document
  const scrollY = window.scrollY
  const previous = {
    position: body.style.position,
    top: body.style.top,
    width: body.style.width,
    overflow: body.style.overflow,
  }

  body.style.position = 'fixed'
  body.style.top = `-${scrollY}px`
  body.style.width = '100%'
  body.style.overflow = 'hidden'

  return () => {
    body.style.position = previous.position
    body.style.top = previous.top
    body.style.width = previous.width
    body.style.overflow = previous.overflow
    // Restoring position removes the offset, so put the reader back where they were.
    window.scrollTo(0, scrollY)
  }
}
