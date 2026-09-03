import { createHashRouter } from 'react-router-dom'

import { AppLayout } from '@/layouts/AppLayout'
import NotFoundPage from '@/pages/NotFoundPage'

/** Route-level code splitting: each page ships in its own chunk. */
const lazyPage = (loader) => async () => ({ Component: (await loader()).default })

export const router = createHashRouter([
  {
    path: '/',
    element: <AppLayout />,
    errorElement: <NotFoundPage />,
    children: [
      { index: true, lazy: lazyPage(() => import('@/pages/RegisterPage')) },
      { path: 'searching', lazy: lazyPage(() => import('@/pages/SearchingPage')) },
      {
        path: 'results',
        handle: { wide: true },
        lazy: lazyPage(() => import('@/pages/ResultsPage')),
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
])
