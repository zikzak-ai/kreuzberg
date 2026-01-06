import { useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import type { AggregatedBenchmarkData } from '@/types/benchmark'

interface ColdStartChartProps {
  data: AggregatedBenchmarkData | null
  loading: boolean
  error: Error | null
  frameworks?: string[]
}

interface ChartDataPoint {
  name: string
  [key: string]: string | number
}

export function ColdStartChart({
  data,
  loading,
  error,
  frameworks = [],
}: ColdStartChartProps) {
  const chartData = useMemo(() => {
    if (!data) return []

    const points: ChartDataPoint[] = []

    Object.entries(data.by_framework_mode).forEach(([, frameworkData]) => {
      // Apply framework filter
      if (frameworks.length > 0 && !frameworks.includes(frameworkData.framework)) {
        return
      }

      // Check if cold start data exists
      if (!frameworkData.cold_start) {
        return
      }

      const dataKey = `${frameworkData.framework} (${frameworkData.mode})`
      const pointName = frameworkData.framework

      let point = points.find(p => p.name === pointName)
      if (!point) {
        point = { name: pointName }
        points.push(point)
      }

      point[dataKey] = parseFloat(frameworkData.cold_start.p50_ms.toFixed(2))
    })

    return points
  }, [data, frameworks])

  if (loading) {
    return (
      <Card data-testid="chart-cold-start">
        <CardHeader>
          <CardTitle>Cold Start Time (ms)</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-80 w-full" data-testid="skeleton-cold-start-chart" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card data-testid="chart-cold-start-error">
        <CardHeader>
          <CardTitle>Cold Start Time (ms)</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive" data-testid="error-cold-start-chart">
            <AlertDescription>Error loading chart: {error.message}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  if (chartData.length === 0) {
    return (
      <Card data-testid="chart-cold-start-empty">
        <CardHeader>
          <CardTitle>Cold Start Time (ms)</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className="flex items-center justify-center h-80 text-muted-foreground"
            data-testid="empty-cold-start-chart"
          >
            No cold start data available for the selected filters
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card data-testid="chart-cold-start">
      <CardHeader>
        <CardTitle>Cold Start Time (ms)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 0, bottom: 60 }}
            data-testid="cold-start-barchart"
          >
            <XAxis
              dataKey="name"
              angle={-45}
              textAnchor="end"
              height={100}
              interval={0}
              tick={{ fontSize: 12 }}
            />
            <YAxis label={{ value: 'ms', angle: -90, position: 'insideLeft' }} />
            <Tooltip
              contentStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.75)', border: 'none' }}
              formatter={(value: number) => value.toFixed(2)}
              data-testid="cold-start-tooltip"
            />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            {chartData.length > 0 &&
              Object.keys(chartData[0])
                .filter(key => key !== 'name')
                .map((key, index) => (
                  <Bar
                    key={key}
                    dataKey={key}
                    fill={`hsl(${(index * 360) / 10}, 70%, 50%)`}
                    data-testid={`bar-cold-start-${key}`}
                  />
                ))}
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
