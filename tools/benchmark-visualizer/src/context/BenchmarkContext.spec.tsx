import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { BenchmarkProvider, useBenchmark } from '@/context/BenchmarkContext'
import { mockAggregatedBenchmarkData } from '../../tests/fixtures/benchmarkData'
import type { ReactNode } from 'react'

// Mock the BenchmarkDataService
vi.mock('@/services/benchmarkService', () => ({
  BenchmarkDataService: {
    fetchData: vi.fn(),
  },
}))

import { BenchmarkDataService } from '@/services/benchmarkService'

// Test component to access the context
function TestComponent() {
  const { data, loading, error } = useBenchmark()

  if (loading) {
    return <div data-testid="loading-state">Loading...</div>
  }

  if (error) {
    return <div data-testid="error-state">Error: {error.message}</div>
  }

  return (
    <div data-testid="success-state">
      <div data-testid="framework-count">{data?.metadata.framework_count}</div>
      <div data-testid="file-type-count">{data?.metadata.file_type_count}</div>
      <div data-testid="total-results">{data?.metadata.total_results}</div>
      <div data-testid="timestamp">{data?.metadata.timestamp}</div>
    </div>
  )
}

describe('BenchmarkContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('BenchmarkProvider', () => {
    it('test_provider_loading_state_displays_loading', async () => {
      const mockFetchData = vi.spyOn(BenchmarkDataService, 'fetchData').mockImplementation(
        () =>
          new Promise(() => {
            // Never resolves, keeps loading state
          })
      )

      render(
        <BenchmarkProvider>
          <TestComponent />
        </BenchmarkProvider>
      )

      expect(screen.getByTestId('loading-state')).toBeInTheDocument()
      expect(screen.getByText('Loading...')).toBeInTheDocument()

      mockFetchData.mockRestore()
    })

    it('test_provider_success_state_provides_data', async () => {
      const mockFetchData = vi.spyOn(BenchmarkDataService, 'fetchData').mockResolvedValue(
        mockAggregatedBenchmarkData
      )

      render(
        <BenchmarkProvider>
          <TestComponent />
        </BenchmarkProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('success-state')).toBeInTheDocument()
      })

      expect(screen.getByTestId('framework-count')).toHaveTextContent('5')
      expect(screen.getByTestId('file-type-count')).toHaveTextContent('8')
      expect(screen.getByTestId('total-results')).toHaveTextContent('1250')
      expect(mockFetchData).toHaveBeenCalledTimes(1)

      mockFetchData.mockRestore()
    })

    it('test_provider_error_state_displays_error', async () => {
      const error = new Error('Failed to fetch benchmark data')
      const mockFetchData = vi.spyOn(BenchmarkDataService, 'fetchData').mockRejectedValue(error)

      render(
        <BenchmarkProvider>
          <TestComponent />
        </BenchmarkProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('error-state')).toBeInTheDocument()
      })

      expect(screen.getByText(/Failed to fetch benchmark data/)).toBeInTheDocument()
      expect(mockFetchData).toHaveBeenCalledTimes(1)

      mockFetchData.mockRestore()
    })

    it('test_provider_mounts_once_fetches_data_once', async () => {
      const mockFetchData = vi.spyOn(BenchmarkDataService, 'fetchData').mockResolvedValue(
        mockAggregatedBenchmarkData
      )

      render(
        <BenchmarkProvider>
          <TestComponent />
        </BenchmarkProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('success-state')).toBeInTheDocument()
      })

      expect(mockFetchData).toHaveBeenCalledTimes(1)

      mockFetchData.mockRestore()
    })

    it('test_provider_passes_correct_data_structure', async () => {
      const mockFetchData = vi.spyOn(BenchmarkDataService, 'fetchData').mockResolvedValue(
        mockAggregatedBenchmarkData
      )

      render(
        <BenchmarkProvider>
          <TestComponent />
        </BenchmarkProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('success-state')).toBeInTheDocument()
      })

      const timestamp = screen.getByTestId('timestamp')
      expect(timestamp).toHaveTextContent(mockAggregatedBenchmarkData.metadata.timestamp)

      mockFetchData.mockRestore()
    })
  })

  describe('useBenchmark hook', () => {
    it('test_useBenchmark_throws_error_without_provider', () => {
      function ComponentWithoutProvider() {
        useBenchmark()
        return <div>Should not render</div>
      }

      // Suppress console.error for this test
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

      expect(() => {
        render(<ComponentWithoutProvider />)
      }).toThrow('useBenchmark must be used within BenchmarkProvider')

      consoleError.mockRestore()
    })

    it('test_useBenchmark_returns_loading_true_initially', async () => {
      const mockFetchData = vi.spyOn(BenchmarkDataService, 'fetchData').mockImplementation(
        () =>
          new Promise(() => {
            // Never resolves
          })
      )

      render(
        <BenchmarkProvider>
          <TestComponent />
        </BenchmarkProvider>
      )

      expect(screen.getByTestId('loading-state')).toBeInTheDocument()

      mockFetchData.mockRestore()
    })

    it('test_useBenchmark_returns_data_after_fetch_succeeds', async () => {
      const mockFetchData = vi.spyOn(BenchmarkDataService, 'fetchData').mockResolvedValue(
        mockAggregatedBenchmarkData
      )

      render(
        <BenchmarkProvider>
          <TestComponent />
        </BenchmarkProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('success-state')).toBeInTheDocument()
      })

      const frameworkCount = screen.getByTestId('framework-count')
      expect(frameworkCount).toHaveTextContent('5')

      mockFetchData.mockRestore()
    })

    it('test_useBenchmark_returns_error_after_fetch_fails', async () => {
      const error = new Error('Network error')
      const mockFetchData = vi.spyOn(BenchmarkDataService, 'fetchData').mockRejectedValue(error)

      render(
        <BenchmarkProvider>
          <TestComponent />
        </BenchmarkProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('error-state')).toBeInTheDocument()
      })

      expect(screen.getByText(/Network error/)).toBeInTheDocument()

      mockFetchData.mockRestore()
    })

    it('test_useBenchmark_returns_null_data_on_error', async () => {
      const error = new Error('Fetch failed')
      const mockFetchData = vi.spyOn(BenchmarkDataService, 'fetchData').mockRejectedValue(error)

      render(
        <BenchmarkProvider>
          <TestComponent />
        </BenchmarkProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('error-state')).toBeInTheDocument()
      })

      expect(screen.queryByTestId('framework-count')).not.toBeInTheDocument()

      mockFetchData.mockRestore()
    })

    it('test_useBenchmark_multiple_consumers_share_same_state', async () => {
      const mockFetchData = vi.spyOn(BenchmarkDataService, 'fetchData').mockResolvedValue(
        mockAggregatedBenchmarkData
      )

      function Consumer1() {
        const { data } = useBenchmark()
        return <div data-testid="consumer1">{data?.metadata.framework_count}</div>
      }

      function Consumer2() {
        const { data } = useBenchmark()
        return <div data-testid="consumer2">{data?.metadata.framework_count}</div>
      }

      render(
        <BenchmarkProvider>
          <Consumer1 />
          <Consumer2 />
        </BenchmarkProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('consumer1')).toBeInTheDocument()
      })

      expect(screen.getByTestId('consumer1')).toHaveTextContent('5')
      expect(screen.getByTestId('consumer2')).toHaveTextContent('5')

      mockFetchData.mockRestore()
    })
  })

  describe('Provider Error Handling', () => {
    it('test_provider_handles_error_type_correctly', async () => {
      const customError = new Error('Custom benchmark error')
      const mockFetchData = vi
        .spyOn(BenchmarkDataService, 'fetchData')
        .mockRejectedValue(customError)

      render(
        <BenchmarkProvider>
          <TestComponent />
        </BenchmarkProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('error-state')).toBeInTheDocument()
      })

      expect(screen.getByText(/Custom benchmark error/)).toBeInTheDocument()

      mockFetchData.mockRestore()
    })

    it('test_provider_transitions_from_loading_to_success', async () => {
      const mockFetchData = vi
        .spyOn(BenchmarkDataService, 'fetchData')
        .mockImplementation(
          () =>
            new Promise(resolve => {
              setTimeout(() => resolve(mockAggregatedBenchmarkData), 100)
            })
        )

      const { rerender } = render(
        <BenchmarkProvider>
          <TestComponent />
        </BenchmarkProvider>
      )

      expect(screen.getByTestId('loading-state')).toBeInTheDocument()

      await waitFor(() => {
        expect(screen.getByTestId('success-state')).toBeInTheDocument()
      })

      mockFetchData.mockRestore()
    })

    it('test_provider_transitions_from_loading_to_error', async () => {
      const error = new Error('Failed')
      const mockFetchData = vi
        .spyOn(BenchmarkDataService, 'fetchData')
        .mockImplementation(
          () =>
            new Promise((_, reject) => {
              setTimeout(() => reject(error), 100)
            })
        )

      render(
        <BenchmarkProvider>
          <TestComponent />
        </BenchmarkProvider>
      )

      expect(screen.getByTestId('loading-state')).toBeInTheDocument()

      await waitFor(() => {
        expect(screen.getByTestId('error-state')).toBeInTheDocument()
      })

      mockFetchData.mockRestore()
    })
  })
})
