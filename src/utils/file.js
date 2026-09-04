export const formatBytes = (bytes) => {
  if (!bytes) return '0 KB'
  const kb = bytes / 1024
  return kb < 1024 ? `${Math.round(kb)} KB` : `${(kb / 1024).toFixed(1)} MB`
}

/**
 * The server validates and compresses uploads itself, so the only thing worth
 * blocking here is an empty submit.
 *
 * @returns {string|null} an error message, or null when the file is acceptable.
 */
export const validateImage = (file) => (file ? null : 'Please add a selfie.')

/** Filename for a downloaded photo, e.g. "Ananya-Sharma-03.jpg". */
export const downloadName = (photo, index, fullName) => {
  const slug = (fullName || 'photo').trim().replace(/\s+/g, '-').replace(/[^\w-]/g, '') || 'photo'
  const ext = photo.extension?.replace(/^\.?/, '.') || '.jpg'
  return `${slug}-${String(index + 1).padStart(2, '0')}${ext}`
}
