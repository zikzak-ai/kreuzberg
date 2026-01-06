import type {
  AggregatedBenchmarkData,
  FrameworkModeData,
  PerformanceMetrics,
  ColdStartMetrics,
  FileTypeMetrics,
} from '@/types/benchmark'

/**
 * Recharts-compatible data point interface
 * All values are strings or numbers for proper chart rendering
 */
export interface ChartDataPoint {
  [key: string]: string | number
}

/**
 * Transform benchmark data for throughput comparison charts
 * Groups data by framework/mode and file type, using p50 as the primary metric
 *
 * @param data - Aggregated benchmark data
 * @param fileTypes - Optional array of file types to include (e.g., ['no_ocr', 'with_ocr'])
 * @returns Array of objects compatible with Recharts, with string keys and number values
 */
export function transformThroughputData(
  data: AggregatedBenchmarkData,
  fileTypes?: string[]
): ChartDataPoint[] {
  const chartData: ChartDataPoint[] = []

  Object.entries(data.by_framework_mode).forEach(([frameworkModeKey, frameworkData]) => {
    const dataPoint: ChartDataPoint = {
      name: frameworkModeKey,
    }

    const typesToProcess = fileTypes || Object.keys(frameworkData.by_file_type)

    typesToProcess.forEach(fileType => {
      const fileTypeMetrics = frameworkData.by_file_type[fileType]
      if (!fileTypeMetrics) return

      const throughput = extractThroughputMetric(fileTypeMetrics)
      if (throughput !== null) {
        dataPoint[fileType] = Math.round(throughput * 100) / 100 // Round to 2 decimals
      }
    })

    // Only add data point if it has metrics beyond the name
    if (Object.keys(dataPoint).length > 1) {
      chartData.push(dataPoint)
    }
  })

  return chartData
}

/**
 * Transform benchmark data for memory usage charts
 * Groups data by framework/mode and file type, using p50 as the primary metric
 *
 * @param data - Aggregated benchmark data
 * @param fileTypes - Optional array of file types to include (e.g., ['no_ocr', 'with_ocr'])
 * @returns Array of objects compatible with Recharts, with string keys and number values
 */
export function transformMemoryData(
  data: AggregatedBenchmarkData,
  fileTypes?: string[]
): ChartDataPoint[] {
  const chartData: ChartDataPoint[] = []

  Object.entries(data.by_framework_mode).forEach(([frameworkModeKey, frameworkData]) => {
    const dataPoint: ChartDataPoint = {
      name: frameworkModeKey,
    }

    const typesToProcess = fileTypes || Object.keys(frameworkData.by_file_type)

    typesToProcess.forEach(fileType => {
      const fileTypeMetrics = frameworkData.by_file_type[fileType]
      if (!fileTypeMetrics) return

      const memory = extractMemoryMetric(fileTypeMetrics)
      if (memory !== null) {
        dataPoint[fileType] = Math.round(memory * 100) / 100 // Round to 2 decimals
      }
    })

    // Only add data point if it has metrics beyond the name
    if (Object.keys(dataPoint).length > 1) {
      chartData.push(dataPoint)
    }
  })

  return chartData
}

/**
 * Transform benchmark data for duration charts
 * Groups data by framework/mode and file type, using p50 as the primary metric
 *
 * @param data - Aggregated benchmark data
 * @param fileTypes - Optional array of file types to include (e.g., ['no_ocr', 'with_ocr'])
 * @returns Array of objects compatible with Recharts, with string keys and number values
 */
export function transformDurationData(
  data: AggregatedBenchmarkData,
  fileTypes?: string[]
): ChartDataPoint[] {
  const chartData: ChartDataPoint[] = []

  Object.entries(data.by_framework_mode).forEach(([frameworkModeKey, frameworkData]) => {
    const dataPoint: ChartDataPoint = {
      name: frameworkModeKey,
    }

    const typesToProcess = fileTypes || Object.keys(frameworkData.by_file_type)

    typesToProcess.forEach(fileType => {
      const fileTypeMetrics = frameworkData.by_file_type[fileType]
      if (!fileTypeMetrics) return

      const duration = extractDurationMetric(fileTypeMetrics)
      if (duration !== null) {
        dataPoint[fileType] = Math.round(duration * 100) / 100 // Round to 2 decimals
      }
    })

    // Only add data point if it has metrics beyond the name
    if (Object.keys(dataPoint).length > 1) {
      chartData.push(dataPoint)
    }
  })

  return chartData
}

/**
 * Transform benchmark data for cold start comparison charts
 * Filters for frameworks/modes that have cold start data
 *
 * @param data - Aggregated benchmark data
 * @returns Array of objects compatible with Recharts with cold start metrics
 */
export function transformColdStartData(data: AggregatedBenchmarkData): ChartDataPoint[] {
  const chartData: ChartDataPoint[] = []

  Object.entries(data.by_framework_mode).forEach(([frameworkModeKey, frameworkData]) => {
    if (!frameworkData.cold_start) return

    const coldStart = frameworkData.cold_start
    const dataPoint: ChartDataPoint = {
      name: frameworkModeKey,
      p50: coldStart.p50_ms !== null ? Math.round(coldStart.p50_ms * 100) / 100 : 0,
      p95: coldStart.p95_ms !== null ? Math.round(coldStart.p95_ms * 100) / 100 : 0,
      p99: coldStart.p99_ms !== null ? Math.round(coldStart.p99_ms * 100) / 100 : 0,
    }

    chartData.push(dataPoint)
  })

  return chartData
}

/**
 * Extract throughput metric from file type metrics
 * Uses p50 as the primary metric, falls back gracefully on null values
 *
 * @param fileTypeMetrics - Metrics for a specific file type
 * @returns Throughput value in MB/s or null if not available
 */
function extractThroughputMetric(fileTypeMetrics: FileTypeMetrics): number | null {
  const metrics = getValidMetrics(fileTypeMetrics)
  if (!metrics) return null

  return metrics.throughput.p50 ?? null
}

/**
 * Extract memory metric from file type metrics
 * Uses p50 as the primary metric, falls back gracefully on null values
 *
 * @param fileTypeMetrics - Metrics for a specific file type
 * @returns Memory value in MB or null if not available
 */
function extractMemoryMetric(fileTypeMetrics: FileTypeMetrics): number | null {
  const metrics = getValidMetrics(fileTypeMetrics)
  if (!metrics) return null

  return metrics.memory.p50 ?? null
}

/**
 * Extract duration metric from file type metrics
 * Uses p50 as the primary metric, falls back gracefully on null values
 *
 * @param fileTypeMetrics - Metrics for a specific file type
 * @returns Duration value in milliseconds or null if not available
 */
function extractDurationMetric(fileTypeMetrics: FileTypeMetrics): number | null {
  const metrics = getValidMetrics(fileTypeMetrics)
  if (!metrics) return null

  return metrics.duration.p50 ?? null
}

/**
 * Get valid metrics from file type metrics, trying both no_ocr and with_ocr
 * Prioritizes no_ocr if both are available
 *
 * @param fileTypeMetrics - Metrics for a specific file type
 * @returns Valid PerformanceMetrics or null if neither variant has data
 */
function getValidMetrics(fileTypeMetrics: FileTypeMetrics): PerformanceMetrics | null {
  if (fileTypeMetrics.no_ocr) return fileTypeMetrics.no_ocr
  if (fileTypeMetrics.with_ocr) return fileTypeMetrics.with_ocr
  return null
}
