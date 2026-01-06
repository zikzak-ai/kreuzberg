import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { BenchmarkDataService } from '@/services/benchmarkService'
import { mockAggregatedBenchmarkData } from '../../tests/fixtures/benchmarkData'

describe('BenchmarkDataService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('fetchData', () => {
    it('test_fetchData_success_returns_data', async () => {
      const mockFetch = vi.spyOn(global, 'fetch').mockResolvedValue(
        new Response(JSON.stringify(mockAggregatedBenchmarkData), {
          status: 200,
          statusText: 'OK',
          headers: { 'Content-Type': 'application/json' },
        })
      )

      const result = await BenchmarkDataService.fetchData()

      expect(result).toEqual(mockAggregatedBenchmarkData)
      expect(mockFetch).toHaveBeenCalledWith('/aggregated.json')
      expect(mockFetch).toHaveBeenCalledTimes(1)
      expect(result.metadata.framework_count).toBe(5)
      expect(result.metadata.file_type_count).toBe(8)
      expect(result.metadata.total_results).toBe(1250)
    })

    it('test_fetchData_success_parses_nested_data_correctly', async () => {
      const mockFetch = vi.spyOn(global, 'fetch').mockResolvedValue(
        new Response(JSON.stringify(mockAggregatedBenchmarkData), {
          status: 200,
          statusText: 'OK',
          headers: { 'Content-Type': 'application/json' },
        })
      )

      const result = await BenchmarkDataService.fetchData()

      expect(result.by_framework_mode['rust_single']).toBeDefined()
      expect(result.by_framework_mode['rust_single'].framework).toBe('rust')
      expect(result.by_framework_mode['rust_single'].mode).toBe('single')
      expect(result.by_framework_mode['rust_single'].cold_start).toBeDefined()
      expect(result.by_framework_mode['rust_single'].cold_start?.p50_ms).toBe(5.2)

      mockFetch.mockRestore()
    })

    it('test_fetchData_success_includes_disk_sizes', async () => {
      const mockFetch = vi.spyOn(global, 'fetch').mockResolvedValue(
        new Response(JSON.stringify(mockAggregatedBenchmarkData), {
          status: 200,
          statusText: 'OK',
          headers: { 'Content-Type': 'application/json' },
        })
      )

      const result = await BenchmarkDataService.fetchData()

      expect(result.disk_sizes['rust_release']).toBeDefined()
      expect(result.disk_sizes['rust_release'].size_bytes).toBe(1024 * 1024 * 50)
      expect(result.disk_sizes['python_wheel']).toBeDefined()

      mockFetch.mockRestore()
    })

    it('test_fetchData_error_http_404_throws_error', async () => {
      const mockFetch = vi.spyOn(global, 'fetch').mockResolvedValue(
        new Response('Not Found', {
          status: 404,
          statusText: 'Not Found',
        })
      )

      await expect(BenchmarkDataService.fetchData()).rejects.toThrow(
        'Failed to fetch benchmark data: Not Found'
      )

      expect(mockFetch).toHaveBeenCalledWith('/aggregated.json')
      mockFetch.mockRestore()
    })

    it('test_fetchData_error_http_500_throws_error', async () => {
      const mockFetch = vi.spyOn(global, 'fetch').mockResolvedValue(
        new Response('Internal Server Error', {
          status: 500,
          statusText: 'Internal Server Error',
        })
      )

      await expect(BenchmarkDataService.fetchData()).rejects.toThrow(
        'Failed to fetch benchmark data: Internal Server Error'
      )

      mockFetch.mockRestore()
    })

    it('test_fetchData_error_network_failure_throws_error', async () => {
      const mockFetch = vi.spyOn(global, 'fetch').mockRejectedValue(
        new Error('Network error')
      )

      await expect(BenchmarkDataService.fetchData()).rejects.toThrow('Network error')

      expect(mockFetch).toHaveBeenCalledWith('/aggregated.json')
      mockFetch.mockRestore()
    })

    it('test_fetchData_error_invalid_json_throws_error', async () => {
      const mockFetch = vi.spyOn(global, 'fetch').mockResolvedValue(
        new Response('Invalid JSON {', {
          status: 200,
          statusText: 'OK',
          headers: { 'Content-Type': 'application/json' },
        })
      )

      await expect(BenchmarkDataService.fetchData()).rejects.toThrow()

      mockFetch.mockRestore()
    })

    it('test_fetchData_success_minimal_data_structure', async () => {
      const minimalData = {
        by_framework_mode: {},
        disk_sizes: {},
        metadata: {
          total_results: 0,
          framework_count: 0,
          file_type_count: 0,
          timestamp: new Date().toISOString(),
        },
      }

      const mockFetch = vi.spyOn(global, 'fetch').mockResolvedValue(
        new Response(JSON.stringify(minimalData), {
          status: 200,
          statusText: 'OK',
          headers: { 'Content-Type': 'application/json' },
        })
      )

      const result = await BenchmarkDataService.fetchData()

      expect(result).toEqual(minimalData)
      expect(result.by_framework_mode).toEqual({})
      expect(result.disk_sizes).toEqual({})

      mockFetch.mockRestore()
    })

    it('test_fetchData_error_timeout_throws_error', async () => {
      const mockFetch = vi.spyOn(global, 'fetch').mockRejectedValue(
        new Error('Request timeout')
      )

      await expect(BenchmarkDataService.fetchData()).rejects.toThrow('Request timeout')

      mockFetch.mockRestore()
    })
  })
})
