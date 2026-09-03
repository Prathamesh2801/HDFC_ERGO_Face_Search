import { appConfig } from '@/config/app.config'

const { maxImageBytes, acceptedTypes } = appConfig.upload

export const formatBytes = (bytes) => {
  if (!bytes) return '0 KB'
  const kb = bytes / 1024
  return kb < 1024 ? `${Math.round(kb)} KB` : `${(kb / 1024).toFixed(1)} MB`
}

/** Returns an error message, or null when the file is acceptable. */
export const validateImage = (file) => {
  if (!file) return 'Please add a selfie.'
  if (file.type && !acceptedTypes.includes(file.type) && !file.type.startsWith('image/')) {
    return 'That file is not an image. Use a JPG, PNG or WebP.'
  }
  if (file.size > maxImageBytes) {
    return `Image is too large (${formatBytes(file.size)}). Keep it under ${formatBytes(maxImageBytes)}.`
  }
  return null
}
