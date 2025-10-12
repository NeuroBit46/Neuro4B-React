import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { LoadingBarProvider } from "@/components/LoadingBar";

const originalFetch = window.fetch;
window.fetch = (url, options = {}) =>
  originalFetch(url, { credentials: "include", ...options });

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LoadingBarProvider>
      <App />
    </LoadingBarProvider>
  </StrictMode>,
)
