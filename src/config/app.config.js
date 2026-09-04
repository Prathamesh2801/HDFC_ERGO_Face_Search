/**
 * Single place for runtime configuration. No .env files, no build-time
 * substitution: edit the values here per environment and rebuild.
 */
export const appConfig = {
  api: {
    /** Base URL of the face-search backend, no trailing slash. */
    baseUrl: 'https://facesearch.theeventpics.com/API',

    /** Endpoint paths, relative to `baseUrl`. */
    endpoints: {
      /** Registers the attendee and returns every photo they appear in. */
      registerAndSearch: '/User/user.php',
    },

    /**
     * Generous: the server runs face detection across the whole event library
     * and a slow mobile upload sits inside this budget too.
     */
    timeoutMs: 120000,
  },

  /**
   * The backend owns file validation (type, size, compression). The client only
   * checks that something was actually picked.
   */
  search: {
    /** URL param carrying the event, e.g. /#/?event=Test */
    eventParam: 'event',
    /** Used when the link has no event param — keeps local dev clickable. */
    fallbackEventId: '',
    /**
     * The API requires Email_ID and Phone_No; this app collects neither.
     * Email accepts the literal "null", but Phone_No is format-validated and
     * must be digits — and the server names the stored upload after it, so each
     * device gets its own generated number instead of a shared constant.
     */
    placeholderEmail: 'null',
    phoneDigits: 10,
  },
}
