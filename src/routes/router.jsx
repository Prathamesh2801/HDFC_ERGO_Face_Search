import { createHashRouter } from 'react-router-dom'

import { AppLayout } from '@/layouts/AppLayout'
import ErrorPage from '@/pages/ErrorPage'
import NotFoundPage from '@/pages/NotFoundPage'
import RegisterPage from '@/pages/RegisterPage'
import ResultsPage from '@/pages/ResultsPage'
import SearchingPage from '@/pages/SearchingPage'

/*
 * Pages are imported directly rather than lazily. They are a few KB each, and
 * `lazy` routes make the initial match asynchronous — which needs a
 * HydrateFallback and delays the first paint for no real gain here.
 */
export const router = createHashRouter([
  {
    path: '/',
    element: <AppLayout />,
    // A thrown error is not a 404 — it gets its own recoverable screen.
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <RegisterPage /> },
      { path: 'searching', element: <SearchingPage /> },
      { path: 'results', handle: { wide: true }, element: <ResultsPage /> },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
])
