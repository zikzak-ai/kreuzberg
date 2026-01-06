import '@/App.css'
import { RouterProvider } from '@tanstack/react-router'
import { router } from '@/router'

/**
 * Main Application Component
 * Provides the router context to the entire application
 */
function App() {
  return <RouterProvider router={router} />
}

export default App
