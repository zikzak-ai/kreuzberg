import { useState } from 'react'
import { useBenchmark } from '@/context/BenchmarkContext'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { FrameworkFilter } from '@/components/filters/FrameworkFilter'
import { FileTypeFilter } from '@/components/filters/FileTypeFilter'
import { ThroughputChart } from '@/components/charts/ThroughputChart'
import { MemoryChart } from '@/components/charts/MemoryChart'
import { DurationChart } from '@/components/charts/DurationChart'
import { ColdStartChart } from '@/components/charts/ColdStartChart'

export function PerformanceChartsPage() {
  const { data, loading, error } = useBenchmark()
  const [selectedFramework, setSelectedFramework] = useState<string>('')
  const [selectedFileType, setSelectedFileType] = useState<string>('')

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <Skeleton className="h-12 w-64 mb-6" data-testid="skeleton-charts" />
        <Skeleton className="h-96" />
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

  if (!data) {
    return null
  }

  const frameworks = selectedFramework ? [selectedFramework] : []
  const fileTypes = selectedFileType ? [selectedFileType] : []

  return (
    <div data-testid="page-charts" className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-6">Performance Charts</h1>

      <div className="mb-6 flex gap-4">
        <FrameworkFilter
          value={selectedFramework}
          onChange={setSelectedFramework}
          data-testid="filters-framework"
        />
        <FileTypeFilter
          value={selectedFileType}
          onChange={setSelectedFileType}
          data-testid="filters-file-type"
        />
      </div>

      <div className="space-y-6">
        <ThroughputChart
          data={data}
          loading={false}
          error={null}
          frameworks={frameworks}
          fileTypes={fileTypes}
          data-testid="chart-throughput"
        />

        <MemoryChart
          data={data}
          loading={false}
          error={null}
          frameworks={frameworks}
          fileTypes={fileTypes}
          data-testid="chart-memory"
        />

        <DurationChart
          data={data}
          loading={false}
          error={null}
          frameworks={frameworks}
          fileTypes={fileTypes}
          data-testid="chart-duration"
        />

        <ColdStartChart
          data={data}
          loading={false}
          error={null}
          frameworks={frameworks}
          data-testid="chart-cold-start"
        />
      </div>
    </div>
  )
}
