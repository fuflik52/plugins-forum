import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Initialize devtrace for debugging (dev only)
if (import.meta.env.DEV) {
  await import('@ton-ai-core/devtrace')
    .then(m => m.installStackLogger({
      limit: 5,
      skip: 0,
      tail: false,
      ascending: true,
      mapSources: true,
      snippet: 1,
      preferApp: true,
      onlyApp: false
    }))
    .catch(() => {});

  await import('@ton-ai-core/devtrace')
    .then(m => m.installDevInstrumentation())
    .catch(() => {});
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
