import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

import { router } from '@/routes/router'
import { SearchProvider } from '@/store/SearchProvider'
import '@/index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SearchProvider>
      <RouterProvider router={router} />
      <Toaster
        position="top-center"
        gutter={10}
        toastOptions={{
          duration: 4000,
          // Matches the design tokens in index.css.
          style: {
            background: '#14120f',
            color: '#fbf5e7',
            fontSize: '0.875rem',
            fontWeight: 600,
            borderRadius: '9999px',
            padding: '0.625rem 1rem',
            maxWidth: '90vw',
          },
          success: { iconTheme: { primary: '#e4032e', secondary: '#fbf5e7' } },
          error: { duration: 5000, iconTheme: { primary: '#e4032e', secondary: '#fbf5e7' } },
        }}
        containerStyle={{ top: 'calc(env(safe-area-inset-top) + 12px)' }}
      />
    </SearchProvider>
  </StrictMode>,
)
