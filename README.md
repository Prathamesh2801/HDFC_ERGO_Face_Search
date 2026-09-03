# HDFC ERGO · Face Detect & Photo Search

Mobile-first web app for **Pioneers Circle 2026**. An attendee enters their name, takes (or uploads)
a selfie, and the app calls the face-search API to return every event photo they appear in.

Stack: **React 19 + Vite 8 + Tailwind CSS v4 + React Router (`createHashRouter`)**.

## Getting started

```bash
npm install
npm run dev               # http://localhost:5173
npm run build && npm run preview
npm run lint
```

`base: './'` and a **hash router** mean the built `dist/` folder can be dropped on any static host or
sub-path (S3, IIS, a CDN folder) with no server rewrite rules.

## Flow

```
/#/            RegisterPage    name + selfie  ──▶ startSearch()
/#/searching   SearchingPage   live progress, auto-advances or shows the error
/#/results     ResultsPage     matched photo grid + full-screen lightbox
```

## Project structure

```
src/
├─ assets/brand/        background + the two event logos
├─ components/
│  ├─ ui/               Button, TextField, Alert, Icons  (presentational only)
│  ├─ form/             SelfieField (native device camera)
│  └─ gallery/          PhotoGrid, Lightbox
├─ config/
│  ├─ app.config.js     BASE_URL, endpoints, timeouts, upload limits
│  └─ brand.js          logos, event name, all user-facing copy
├─ layouts/             AppLayout (background stage) + BrandHeader
├─ pages/               one file per route, default-exported, lazily loaded
├─ routes/router.jsx    createHashRouter route table
├─ services/
│  ├─ apiClient.js      fetch wrapper: base URL, timeout, ApiError
│  ├─ faceSearchService.js  API call + response normalisation  ◀── integration point
│  └─ mockFaceSearch.js     stand-in until the real endpoint is wired
├─ store/               SearchProvider — the only cross-route state
├─ utils/               cn(), image validation + size formatting
└─ index.css            Tailwind v4 `@theme` design tokens (the colour palette)
```

## Wiring the real API

There are **no `.env` files** — all runtime settings live in
[`src/config/app.config.js`](src/config/app.config.js).

1. Set the base URL there:

   ```js
   export const appConfig = {
     api: {
       baseUrl: 'https://your-api.example.com',
       endpoints: { faceSearch: '/api/face-search' },
       timeoutMs: 45000,
     },
     ...
   }
   ```

   While `baseUrl` is an empty string the app uses the built-in mock; filling it in switches to the
   real backend.

2. The request is sent as `multipart/form-data` to `POST {baseUrl}{endpoints.faceSearch}`:

   | field   | value                    |
   | ------- | ------------------------ |
   | `name`  | attendee's full name     |
   | `image` | the selfie `File` (JPEG) |

3. The response is normalised in [`faceSearchService.js`](src/services/faceSearchService.js) — it
   already accepts `photos` / `results` / `matches` / `data` arrays and `url` / `imageUrl` /
   `photoUrl` / `signedUrl` fields. When the Postman contract arrives, adjust `toPhoto()` and
   `normaliseResult()` there; **no component needs to change.**

   The shape the UI renders:

   ```js
   { requestId, photos: [{ id, url, thumbnailUrl, takenAt, score }] }
   ```

## Selfie capture

`SelfieField` uses one native `<input type="file" accept="image/*" capture="user">`, which hands off
to the device's own camera app on Android and iOS (front lens). Desktop browsers ignore `capture` and
show the file picker. The camera is the only source — there is no gallery/upload path by design.

The resulting `File` is validated against `appConfig.upload`.

## Design tokens

The palette lives in one `@theme` block in [`src/index.css`](src/index.css) and is consumed as normal
Tailwind classes (`bg-brand-600`, `text-ink-500`, `rounded-card`, `shadow-cta`, …):

| token family | role                                    | key value          |
| ------------ | --------------------------------------- | ------------------ |
| `brand`      | HDFC ERGO red — headings, CTA, focus    | `brand-600 #E4032E` |
| `cream`      | parchment background family             | `cream-100 #FBF5E7` |
| `gold`       | Pioneers Circle accents                 | `gold-400 #C9A15A`  |
| `navy`       | compass/mosaic accent                   | `navy-500 #24447A`  |
| `ink`        | body text and neutrals                  | `ink-600 #2E2B27`   |

Layout is phone-first and scales to a centred parchment "stage" on tablet and desktop; the results
route widens itself via `handle: { wide: true }` on its route object.
