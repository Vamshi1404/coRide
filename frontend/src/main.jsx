import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import App from './App'
import '@tomtom-international/web-sdk-maps/dist/maps.css'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              borderRadius: '12px',
              padding: '12px 16px',
              fontSize: '0.9rem',
              boxShadow: '0 12px 32px -8px rgba(16,20,24,0.18)',
            },
            success: {
              iconTheme: { primary: '#1b7f3c', secondary: '#fff' },
            },
            error: {
              iconTheme: { primary: '#dc2626', secondary: '#fff' },
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)
