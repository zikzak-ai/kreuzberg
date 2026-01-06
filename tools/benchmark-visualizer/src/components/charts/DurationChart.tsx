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

interface DurationChartProps {
  data: AggregatedBenchmarkData | null
  loading: boolean
  error: Error | null
  frameworks?: string[]
  fileTypes?: string[]
  ocrModes?: ('no_ocr' | 'with_ocr')[]
}

interface ChartDataPoint {
  name: string
  [key: string]: string | number
}

export function DurationChart({
  data,
  loading,
  error,
  frameworks = [],
  fileTypes = [],
  ocrModes = ['no_ocr', 'with_ocr'],
}: DurationChartProps) {
  const chartData = useMemo(() => {
    if (!data) return []

    const points: ChartDataPoint[] = []
    const processedCombos = new Set<string>()

    Object.entries(data.by_framework_mode).forEach(([, frameworkData]) => {
      // Apply framework filter
      if (frameworks.length > 0 && !frameworks.includes(frameworkData.framework)) {
        return
      }

      // Process file types
      Object.entries(frameworkData.by_file_type).forEach(([fileType, fileTypeMetrics]) => {
        // Apply file type filter
        if (fileTypes.length > 0 && !fileTypes.includes(fileType)) {
          return
        }

        // Process OCR modes
        ocrModes.forEach(ocrMode => {
          const metrics = ocrMode === 'no_ocr' ? fileTypeMetrics.no_ocr : fileTypeMetrics.with_ocr

          if (!metrics || !metrics.duration) {
            return
          }

          const comboKey = `${frameworkData.framework}:${frameworkData.mode}:${fileType}:${ocrMode}`
          if (processedCombos.has(comboKey)) {
            return
          }
          processedCombos.add(comboKey)

          const dataKey = `${frameworkData.framework} (${frameworkData.mode})`
          let point = points.find(p => p.name === `${fileType} - ${ocrMode}`)

          if (!point) {
            point = { name: `${fileType} - ${ocrMode}` }
            points.push(point)
          }

          point[dataKey] = parseFloat(metrics.duration.p50.toFixed(2))
        })
      })
    })

    return points
  }, [data, frameworks, fileTypes, ocrModes])

  if (loading) {
    return (
      <Card data-testid="chart-duration">
        <CardHeader>
          <CardTitle>Duration (ms)</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-80 w-full" data-testid="skeleton-duration-chart" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card data-testid="chart-duration-error">
        <CardHeader>
          <CardTitle>Duration (ms)</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive" data-testid="error-duration-chart">
            <AlertDescription>Error loading chart: {error.message}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  if (chartData.length === 0) {
    return (
      <Card data-testid="chart-duration-empty">
        <CardHeader>
          <CardTitle>Duration (ms)</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className="flex items-center justify-center h-80 text-muted-foreground"
            data-testid="empty-duration-chart"
          >
            No data available for the selected filters
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card data-testid="chart-duration">
      <CardHeader>
        <CardTitle>Duration (ms)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 0, bottom: 60 }}
            data-testid="duration-barchart"
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
              data-testid="duration-tooltip"
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
                    data-testid={`bar-duration-${key}`}
                  />
                ))}
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
