import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './contexts/AuthContext'
import { MotionProvider } from './lib/motion/MotionProvider'
import { ErrorBoundary } from './components/layout/ErrorBoundary'
import { queryClient } from './lib/queryClient'
import App from './App'
import '@tomtom-international/web-sdk-maps/dist/maps.css'
import './index.css'

// Activate NOCTURNE dark theme
document.documentElement.setAttribute('data-theme', 'dark')

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ErrorBoundary>
          <AuthProvider>
            <MotionProvider>
              <App />
              <Toaster
              position="top-right"
              toastOptions={{
                duration: 3000,
                style: {
                  background: 'var(--bg-overlay)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-default)',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  borderRadius: '14px',
                  padding: '12px 16px',
                  fontSize: '0.9rem',
                  boxShadow: '0 12px 32px -8px rgba(0,0,0,0.5)',
                },
                success: {
                  iconTheme: { primary: 'var(--accent-solid)', secondary: 'var(--bg-overlay)' },
                },
                error: {
                  iconTheme: { primary: 'var(--accent-solid)', secondary: 'var(--bg-overlay)' },
                },
              }}
            />
          </MotionProvider>
        </AuthProvider>
        </ErrorBoundary>
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>
)
