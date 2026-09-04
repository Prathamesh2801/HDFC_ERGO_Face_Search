/** Inline stroke icons — no icon dependency, all inherit `currentColor`. */
const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  viewBox: '0 0 24 24',
  'aria-hidden': true,
}

export const CameraIcon = (props) => (
  <svg {...base} {...props}>
    <path d="M3 8.5A2.5 2.5 0 0 1 5.5 6h1.7a1 1 0 0 0 .83-.44l.94-1.4A1 1 0 0 1 9.8 3.7h4.4a1 1 0 0 1 .83.45l.94 1.4A1 1 0 0 0 16.8 6h1.7A2.5 2.5 0 0 1 21 8.5v8A2.5 2.5 0 0 1 18.5 19h-13A2.5 2.5 0 0 1 3 16.5z" />
    <circle cx="12" cy="12.5" r="3.6" />
  </svg>
)

export const UploadIcon = (props) => (
  <svg {...base} {...props}>
    <path d="M12 16V4.5M12 4.5 7.75 8.75M12 4.5 16.25 8.75" />
    <path d="M4.5 15.5v2.25A2.25 2.25 0 0 0 6.75 20h10.5a2.25 2.25 0 0 0 2.25-2.25V15.5" />
  </svg>
)

export const DownloadIcon = (props) => (
  <svg {...base} {...props}>
    <path d="M12 4v11.5M12 15.5 7.75 11.25M12 15.5l4.25-4.25" />
    <path d="M4.5 16.5v1.25A2.25 2.25 0 0 0 6.75 20h10.5a2.25 2.25 0 0 0 2.25-2.25V16.5" />
  </svg>
)

export const CloseIcon = (props) => (
  <svg {...base} {...props}>
    <path d="m6.5 6.5 11 11M17.5 6.5l-11 11" />
  </svg>
)

export const RetryIcon = (props) => (
  <svg {...base} {...props}>
    <path d="M20 12a8 8 0 1 1-2.6-5.9" />
    <path d="M20 4v4.5h-4.5" />
  </svg>
)

export const CheckIcon = (props) => (
  <svg {...base} {...props}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </svg>
)

export const ChevronLeftIcon = (props) => (
  <svg {...base} {...props}>
    <path d="m14.5 5.5-7 6.5 7 6.5" />
  </svg>
)

export const ChevronRightIcon = (props) => (
  <svg {...base} {...props}>
    <path d="m9.5 5.5 7 6.5-7 6.5" />
  </svg>
)

export const AlertIcon = (props) => (
  <svg {...base} {...props}>
    <path d="M12 8.5v4.25M12 16.4h.01" />
    <path d="M10.3 4.2 2.9 17.1A1.9 1.9 0 0 0 4.6 20h14.8a1.9 1.9 0 0 0 1.7-2.9L13.7 4.2a1.9 1.9 0 0 0-3.4 0Z" />
  </svg>
)

export const GalleryIcon = (props) => (
  <svg {...base} {...props}>
    <rect x="3.5" y="4.5" width="17" height="15" rx="2.5" />
    <circle cx="9" cy="9.75" r="1.6" />
    <path d="m4.5 17 4.6-4.3a1.8 1.8 0 0 1 2.5 0l4.1 4.3M14.5 14l1.6-1.5a1.8 1.8 0 0 1 2.5 0l1.9 1.8" />
  </svg>
)

export const TrashIcon = (props) => (
  <svg {...base} {...props}>
    <path d="M4.5 6.5h15M9.5 6.5V5a1.5 1.5 0 0 1 1.5-1.5h2A1.5 1.5 0 0 1 14.5 5v1.5" />
    <path d="M6.5 6.5 7.4 19a1.5 1.5 0 0 0 1.5 1.4h6.2a1.5 1.5 0 0 0 1.5-1.4l.9-12.5" />
    <path d="M10.5 10v6.5M13.5 10v6.5" />
  </svg>
)

export const SelectAllIcon = (props) => (
  <svg {...base} {...props}>
    <rect x="8.5" y="3.5" width="12" height="12" rx="2.5" />
    <path d="M15.5 20.5h-9a3 3 0 0 1-3-3v-9" />
    <path d="m11.5 9.4 1.9 1.9 3.6-3.7" />
  </svg>
)

export const UserIcon = (props) => (
  <svg {...base} {...props}>
    <circle cx="12" cy="8.5" r="3.8" />
    <path d="M4.6 20a7.4 7.4 0 0 1 14.8 0" />
  </svg>
)
