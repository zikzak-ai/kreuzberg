import type {
  AggregatedBenchmarkData,
  BenchmarkMetadata,
  FrameworkModeData,
  FileTypeMetrics,
  PerformanceMetrics,
  ColdStartMetrics,
  DiskSizeInfo,
} from '@/types/benchmark'

export const mockPerformanceMetrics: PerformanceMetrics = {
  sample_count: 100,
  success_rate_percent: 99.5,
  throughput: {
    p50: 150.5,
    p95: 200.3,
    p99: 250.8,
  },
  memory: {
    p50: 256.5,
    p95: 512.2,
    p99: 768.9,
  },
  duration: {
    p50: 10.5,
    p95: 25.3,
    p99: 50.8,
  },
}

export const mockColdStartMetrics: ColdStartMetrics = {
  sample_count: 50,
  p50_ms: 5.2,
  p95_ms: 10.8,
  p99_ms: 15.3,
}

export const mockFileTypeMetrics: FileTypeMetrics = {
  no_ocr: mockPerformanceMetrics,
  with_ocr: {
    ...mockPerformanceMetrics,
    throughput: {
      p50: 120.3,
      p95: 180.5,
      p99: 230.2,
    },
  },
}

export const mockFrameworkModeData: FrameworkModeData = {
  framework: 'rust',
  mode: 'single',
  cold_start: mockColdStartMetrics,
  by_file_type: {
    pdf: mockFileTypeMetrics,
    image: mockFileTypeMetrics,
  },
}

export const mockDiskSizeInfo: DiskSizeInfo = {
  size_bytes: 1024 * 1024 * 50, // 50 MB
  method: 'du -sh',
  description: 'Binary size without optimization',
}

export const mockBenchmarkMetadata: BenchmarkMetadata = {
  total_results: 1250,
  framework_count: 5,
  file_type_count: 8,
  timestamp: new Date('2024-01-15T10:30:00Z').toISOString(),
}

export const mockAggregatedBenchmarkData: AggregatedBenchmarkData = {
  by_framework_mode: {
    'rust_single': mockFrameworkModeData,
    'rust_batch': {
      ...mockFrameworkModeData,
      mode: 'batch',
    },
    'python_sync': {
      ...mockFrameworkModeData,
      framework: 'python',
      mode: 'sync',
    },
    'node_async': {
      ...mockFrameworkModeData,
      framework: 'node',
      mode: 'async',
    },
  },
  disk_sizes: {
    'rust_release': mockDiskSizeInfo,
    'python_wheel': {
      ...mockDiskSizeInfo,
      size_bytes: 1024 * 1024 * 8, // 8 MB
      description: 'Python wheel package',
    },
  },
  metadata: mockBenchmarkMetadata,
}

export const mockAggregatedBenchmarkDataMinimal: AggregatedBenchmarkData = {
  by_framework_mode: {
    'rust_single': {
      framework: 'rust',
      mode: 'single',
      cold_start: null,
      by_file_type: {},
    },
  },
  disk_sizes: {},
  metadata: {
    total_results: 0,
    framework_count: 0,
    file_type_count: 0,
    timestamp: new Date().toISOString(),
  },
}
