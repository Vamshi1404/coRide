import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './contexts/AuthContext'
import { MotionProvider } from './lib/motion/MotionProvider'
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
        <AuthProvider>
          <MotionProvider>
            <App />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3000,
                style: {
                  background: 'var(--nc-200, #1c1c1f)',
                  color: 'var(--nc-800, #ececee)',
                  border: '1px solid var(--nc-300, #2a2a2e)',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  borderRadius: '14px',
                  padding: '12px 16px',
                  fontSize: '0.9rem',
                  boxShadow: '0 12px 32px -8px rgba(0,0,0,0.5)',
                },
                success: {
                  iconTheme: { primary: '#ff4d1c', secondary: '#1c1c1f' },
                },
                error: {
                  iconTheme: { primary: '#ff4d1c', secondary: '#1c1c1f' },
                },
              }}
            />
          </MotionProvider>
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>
)
