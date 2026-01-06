import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from '@/App'
import { BenchmarkProvider } from '@/context/BenchmarkContext'

/**
 * Application Entry Point
 * Renders the app with necessary providers:
 * - StrictMode: Highlights potential problems in the application
 * - BenchmarkProvider: Provides benchmark data context to the entire app
 * - RouterProvider: Handled in App component
 */
const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Root element not found')
}

createRoot(rootElement).render(
  <StrictMode>
    <BenchmarkProvider>
      <App />
    </BenchmarkProvider>
  </StrictMode>,
)
