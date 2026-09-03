/**
 * Single place for runtime configuration. No .env files, no build-time
 * substitution: edit the values here per environment and rebuild.
 */
export const appConfig = {
  api: {
    /** Base URL of the face-detect / face-search backend, no trailing slash. */
    baseUrl: '',

    /** Endpoint paths, relative to `baseUrl`. */
    endpoints: {
      faceSearch: '/api/face-search',
    },

    /** Abort a request after this long. */
    timeoutMs: 45000,
  },

  upload: {
    maxImageBytes: 8 * 1024 * 1024,
    acceptedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'],
  },
}

/** With no base URL configured the app runs against the built-in mock service. */
export const useMockApi = appConfig.api.baseUrl.trim() === ''
