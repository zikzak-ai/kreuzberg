import { useBenchmark } from '@/context/BenchmarkContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'

export function LandingPage() {
  const { data, loading, error } = useBenchmark()

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <Skeleton className="h-12 w-64 mb-6" data-testid="skeleton-landing" />
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <Alert variant="destructive" data-testid="error-message">
          <AlertDescription>Error: {error.message}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div data-testid="page-landing" className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-6">Benchmark Results</h1>

      <div className="grid gap-4 md:grid-cols-3">
        <Card data-testid="metric-card-frameworks">
          <CardHeader>
            <CardTitle>Frameworks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data?.metadata.framework_count}</div>
          </CardContent>
        </Card>

        <Card data-testid="metric-card-file-types">
          <CardHeader>
            <CardTitle>File Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data?.metadata.file_type_count}</div>
          </CardContent>
        </Card>

        <Card data-testid="metric-card-total-results">
          <CardHeader>
            <CardTitle>Total Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data?.metadata.total_results}</div>
          </CardContent>
        </Card>
      </div>

      {data?.metadata.timestamp && (
        <p className="mt-4 text-sm text-muted-foreground">
          Last updated: {new Date(data.metadata.timestamp).toLocaleString()}
        </p>
      )}
    </div>
  )
}
