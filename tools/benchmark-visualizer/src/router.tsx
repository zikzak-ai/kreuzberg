import { createRootRoute, createRoute, createRouter, Outlet } from '@tanstack/react-router'
import { LandingPage } from '@/pages/LandingPage'
import { PerformanceChartsPage } from '@/pages/PerformanceChartsPage'
import { DetailedComparisonsPage } from '@/pages/DetailedComparisonsPage'
import { Header } from '@/components/layout/Header'
import { Navigation } from '@/components/layout/Navigation'
import { Footer } from '@/components/layout/Footer'
import { useBenchmark } from '@/context/BenchmarkContext'

/**
 * Root Layout Component
 * Provides the main layout structure with Header, Navigation, and Footer
 */
function RootLayout() {
  const { data } = useBenchmark()

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <Navigation />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer
        metadata={{
          benchmarkCount: data?.metadata.total_results,
          timestamp: data?.metadata.timestamp,
        }}
      />
    </div>
  )
}

/**
 * Root Route Definition
 * Sets up the root route with the main layout
 */
const rootRoute = createRootRoute({
  component: RootLayout,
})

/**
 * Landing Page Route
 * Path: /
 */
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: LandingPage,
})

/**
 * Performance Charts Route
 * Path: /charts
 */
const chartsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/charts',
  component: PerformanceChartsPage,
})

/**
 * Detailed Comparisons Route
 * Path: /comparisons
 */
const comparisonsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/comparisons',
  component: DetailedComparisonsPage,
})

/**
 * Route Tree
 * Combines all routes into a tree structure for the router
 */
const routeTree = rootRoute.addChildren([
  indexRoute,
  chartsRoute,
  comparisonsRoute,
])

/**
 * Router Instance
 * Creates the main router with the route tree
 */
export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
})

/**
 * Router Type Registration
 * Registers the router type for type-safe routing throughout the application
 */
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
