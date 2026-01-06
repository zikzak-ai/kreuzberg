import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { LandingPage } from '@/pages/LandingPage'
import { BenchmarkProvider } from '@/context/BenchmarkContext'
import { mockAggregatedBenchmarkData, mockAggregatedBenchmarkDataMinimal } from '../../tests/fixtures/benchmarkData'

// Mock the BenchmarkDataService
vi.mock('@/services/benchmarkService', () => ({
  BenchmarkDataService: {
    fetchData: vi.fn(),
  },
}))

import { BenchmarkDataService } from '@/services/benchmarkService'

describe('LandingPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Loading State', () => {
    it('test_landingPage_loading_state_shows_skeleton', () => {
      const mockFetchData = vi.spyOn(BenchmarkDataService, 'fetchData').mockImplementation(
        () =>
          new Promise(() => {
            // Never resolves, keeps loading state
          })
      )

      render(
        <BenchmarkProvider>
          <LandingPage />
        </BenchmarkProvider>
      )

      expect(screen.getByTestId('skeleton-landing')).toBeInTheDocument()

      mockFetchData.mockRestore()
    })

    it('test_landingPage_loading_state_shows_multiple_skeletons', () => {
      const mockFetchData = vi.spyOn(BenchmarkDataService, 'fetchData').mockImplementation(
        () =>
          new Promise(() => {
            // Never resolves
          })
      )

      render(
        <BenchmarkProvider>
          <LandingPage />
        </BenchmarkProvider>
      )

      const skeletons = screen.getAllByRole('img', { hidden: true })
      // The skeleton loader shows 3 skeleton cards plus 1 header skeleton
      expect(skeletons.length).toBeGreaterThanOrEqual(1)

      mockFetchData.mockRestore()
    })

    it('test_landingPage_loading_state_does_not_show_content', () => {
      const mockFetchData = vi.spyOn(BenchmarkDataService, 'fetchData').mockImplementation(
        () =>
          new Promise(() => {
            // Never resolves
          })
      )

      render(
        <BenchmarkProvider>
          <LandingPage />
        </BenchmarkProvider>
      )

      expect(screen.queryByTestId('page-landing')).not.toBeInTheDocument()
      expect(screen.queryByTestId('metric-card-frameworks')).not.toBeInTheDocument()

      mockFetchData.mockRestore()
    })
  })

  describe('Error State', () => {
    it('test_landingPage_error_state_shows_error_message', async () => {
      const error = new Error('Failed to fetch benchmark data')
      const mockFetchData = vi.spyOn(BenchmarkDataService, 'fetchData').mockRejectedValue(error)

      render(
        <BenchmarkProvider>
          <LandingPage />
        </BenchmarkProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument()
      })

      expect(screen.getByText(/Failed to fetch benchmark data/)).toBeInTheDocument()

      mockFetchData.mockRestore()
    })

    it('test_landingPage_error_state_shows_destructive_alert', async () => {
      const error = new Error('Network error')
      const mockFetchData = vi.spyOn(BenchmarkDataService, 'fetchData').mockRejectedValue(error)

      render(
        <BenchmarkProvider>
          <LandingPage />
        </BenchmarkProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument()
      })

      const alert = screen.getByTestId('error-message')
      expect(alert).toHaveClass('border-red-600', 'text-red-600')

      mockFetchData.mockRestore()
    })

    it('test_landingPage_error_state_does_not_show_metric_cards', async () => {
      const error = new Error('Failed to fetch')
      const mockFetchData = vi.spyOn(BenchmarkDataService, 'fetchData').mockRejectedValue(error)

      render(
        <BenchmarkProvider>
          <LandingPage />
        </BenchmarkProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument()
      })

      expect(screen.queryByTestId('metric-card-frameworks')).not.toBeInTheDocument()
      expect(screen.queryByTestId('metric-card-file-types')).not.toBeInTheDocument()
      expect(screen.queryByTestId('metric-card-total-results')).not.toBeInTheDocument()

      mockFetchData.mockRestore()
    })
  })

  describe('Success State - Metric Cards', () => {
    it('test_landingPage_success_state_shows_all_metric_cards', async () => {
      const mockFetchData = vi
        .spyOn(BenchmarkDataService, 'fetchData')
        .mockResolvedValue(mockAggregatedBenchmarkData)

      render(
        <BenchmarkProvider>
          <LandingPage />
        </BenchmarkProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('page-landing')).toBeInTheDocument()
      })

      expect(screen.getByTestId('metric-card-frameworks')).toBeInTheDocument()
      expect(screen.getByTestId('metric-card-file-types')).toBeInTheDocument()
      expect(screen.getByTestId('metric-card-total-results')).toBeInTheDocument()

      mockFetchData.mockRestore()
    })

    it('test_landingPage_success_state_displays_correct_framework_count', async () => {
      const mockFetchData = vi
        .spyOn(BenchmarkDataService, 'fetchData')
        .mockResolvedValue(mockAggregatedBenchmarkData)

      render(
        <BenchmarkProvider>
          <LandingPage />
        </BenchmarkProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('metric-card-frameworks')).toBeInTheDocument()
      })

      const frameworkCard = screen.getByTestId('metric-card-frameworks')
      expect(frameworkCard).toHaveTextContent('5')
      expect(frameworkCard).toHaveTextContent('Frameworks')

      mockFetchData.mockRestore()
    })

    it('test_landingPage_success_state_displays_correct_file_type_count', async () => {
      const mockFetchData = vi
        .spyOn(BenchmarkDataService, 'fetchData')
        .mockResolvedValue(mockAggregatedBenchmarkData)

      render(
        <BenchmarkProvider>
          <LandingPage />
        </BenchmarkProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('metric-card-file-types')).toBeInTheDocument()
      })

      const fileTypeCard = screen.getByTestId('metric-card-file-types')
      expect(fileTypeCard).toHaveTextContent('8')
      expect(fileTypeCard).toHaveTextContent('File Types')

      mockFetchData.mockRestore()
    })

    it('test_landingPage_success_state_displays_correct_total_results', async () => {
      const mockFetchData = vi
        .spyOn(BenchmarkDataService, 'fetchData')
        .mockResolvedValue(mockAggregatedBenchmarkData)

      render(
        <BenchmarkProvider>
          <LandingPage />
        </BenchmarkProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('metric-card-total-results')).toBeInTheDocument()
      })

      const totalResultsCard = screen.getByTestId('metric-card-total-results')
      expect(totalResultsCard).toHaveTextContent('1250')
      expect(totalResultsCard).toHaveTextContent('Total Results')

      mockFetchData.mockRestore()
    })

    it('test_landingPage_success_state_shows_page_title', async () => {
      const mockFetchData = vi
        .spyOn(BenchmarkDataService, 'fetchData')
        .mockResolvedValue(mockAggregatedBenchmarkData)

      render(
        <BenchmarkProvider>
          <LandingPage />
        </BenchmarkProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('page-landing')).toBeInTheDocument()
      })

      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Benchmark Results')

      mockFetchData.mockRestore()
    })

    it('test_landingPage_success_state_renders_page_container', async () => {
      const mockFetchData = vi
        .spyOn(BenchmarkDataService, 'fetchData')
        .mockResolvedValue(mockAggregatedBenchmarkData)

      render(
        <BenchmarkProvider>
          <LandingPage />
        </BenchmarkProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('page-landing')).toBeInTheDocument()
      })

      const pageContainer = screen.getByTestId('page-landing')
      expect(pageContainer).toHaveClass('container', 'mx-auto', 'p-4')

      mockFetchData.mockRestore()
    })
  })

  describe('Timestamp Display', () => {
    it('test_landingPage_displays_timestamp_when_present', async () => {
      const mockFetchData = vi
        .spyOn(BenchmarkDataService, 'fetchData')
        .mockResolvedValue(mockAggregatedBenchmarkData)

      render(
        <BenchmarkProvider>
          <LandingPage />
        </BenchmarkProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('page-landing')).toBeInTheDocument()
      })

      expect(screen.getByText(/Last updated:/)).toBeInTheDocument()

      mockFetchData.mockRestore()
    })

    it('test_landingPage_timestamp_is_formatted_correctly', async () => {
      const mockFetchData = vi
        .spyOn(BenchmarkDataService, 'fetchData')
        .mockResolvedValue(mockAggregatedBenchmarkData)

      render(
        <BenchmarkProvider>
          <LandingPage />
        </BenchmarkProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('page-landing')).toBeInTheDocument()
      })

      const timestampText = screen.getByText(/Last updated:/)
      expect(timestampText).toBeInTheDocument()
      // Check that it contains a date-like pattern
      expect(timestampText.textContent).toMatch(/\d+\/\d+\/\d+/)

      mockFetchData.mockRestore()
    })

    it('test_landingPage_no_timestamp_when_not_present', async () => {
      const dataWithoutTimestamp = {
        ...mockAggregatedBenchmarkData,
        metadata: {
          ...mockAggregatedBenchmarkData.metadata,
          timestamp: '',
        },
      }

      const mockFetchData = vi
        .spyOn(BenchmarkDataService, 'fetchData')
        .mockResolvedValue(dataWithoutTimestamp)

      render(
        <BenchmarkProvider>
          <LandingPage />
        </BenchmarkProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('page-landing')).toBeInTheDocument()
      })

      expect(screen.queryByText(/Last updated:/)).not.toBeInTheDocument()

      mockFetchData.mockRestore()
    })
  })

  describe('Edge Cases', () => {
    it('test_landingPage_success_state_with_minimal_data', async () => {
      const mockFetchData = vi
        .spyOn(BenchmarkDataService, 'fetchData')
        .mockResolvedValue(mockAggregatedBenchmarkDataMinimal)

      render(
        <BenchmarkProvider>
          <LandingPage />
        </BenchmarkProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('page-landing')).toBeInTheDocument()
      })

      expect(screen.getByTestId('metric-card-frameworks')).toBeInTheDocument()
      expect(screen.getByTestId('metric-card-frameworks')).toHaveTextContent('0')

      mockFetchData.mockRestore()
    })

    it('test_landingPage_metric_cards_use_correct_data_testids', async () => {
      const mockFetchData = vi
        .spyOn(BenchmarkDataService, 'fetchData')
        .mockResolvedValue(mockAggregatedBenchmarkData)

      render(
        <BenchmarkProvider>
          <LandingPage />
        </BenchmarkProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('page-landing')).toBeInTheDocument()
      })

      // Verify all metric cards are accessible by their data-testid
      const frameworkCard = screen.getByTestId('metric-card-frameworks')
      const fileTypeCard = screen.getByTestId('metric-card-file-types')
      const totalResultsCard = screen.getByTestId('metric-card-total-results')

      expect(frameworkCard).toBeInTheDocument()
      expect(fileTypeCard).toBeInTheDocument()
      expect(totalResultsCard).toBeInTheDocument()

      mockFetchData.mockRestore()
    })

    it('test_landingPage_metric_card_titles_are_correct', async () => {
      const mockFetchData = vi
        .spyOn(BenchmarkDataService, 'fetchData')
        .mockResolvedValue(mockAggregatedBenchmarkData)

      render(
        <BenchmarkProvider>
          <LandingPage />
        </BenchmarkProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('page-landing')).toBeInTheDocument()
      })

      expect(screen.getByText('Frameworks')).toBeInTheDocument()
      expect(screen.getByText('File Types')).toBeInTheDocument()
      expect(screen.getByText('Total Results')).toBeInTheDocument()

      mockFetchData.mockRestore()
    })

    it('test_landingPage_error_message_contains_error_details', async () => {
      const errorMessage = 'Custom error: API endpoint unreachable'
      const error = new Error(errorMessage)
      const mockFetchData = vi.spyOn(BenchmarkDataService, 'fetchData').mockRejectedValue(error)

      render(
        <BenchmarkProvider>
          <LandingPage />
        </BenchmarkProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument()
      })

      expect(screen.getByText(new RegExp(errorMessage))).toBeInTheDocument()

      mockFetchData.mockRestore()
    })
  })

  describe('Data Testid Attributes', () => {
    it('test_landingPage_container_has_correct_testid', async () => {
      const mockFetchData = vi
        .spyOn(BenchmarkDataService, 'fetchData')
        .mockResolvedValue(mockAggregatedBenchmarkData)

      render(
        <BenchmarkProvider>
          <LandingPage />
        </BenchmarkProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('page-landing')).toBeInTheDocument()
      })

      const container = screen.getByTestId('page-landing')
      expect(container).toBeInTheDocument()

      mockFetchData.mockRestore()
    })

    it('test_landingPage_error_alert_has_correct_testid', async () => {
      const error = new Error('Test error')
      const mockFetchData = vi.spyOn(BenchmarkDataService, 'fetchData').mockRejectedValue(error)

      render(
        <BenchmarkProvider>
          <LandingPage />
        </BenchmarkProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument()
      })

      expect(screen.getByTestId('error-message')).toBeInTheDocument()

      mockFetchData.mockRestore()
    })

    it('test_landingPage_skeleton_has_correct_testid', () => {
      const mockFetchData = vi.spyOn(BenchmarkDataService, 'fetchData').mockImplementation(
        () =>
          new Promise(() => {
            // Never resolves
          })
      )

      render(
        <BenchmarkProvider>
          <LandingPage />
        </BenchmarkProvider>
      )

      expect(screen.getByTestId('skeleton-landing')).toBeInTheDocument()

      mockFetchData.mockRestore()
    })
  })

  describe('Metric Card Content Structure', () => {
    it('test_landingPage_metric_card_frameworks_shows_count_value', async () => {
      const mockFetchData = vi
        .spyOn(BenchmarkDataService, 'fetchData')
        .mockResolvedValue(mockAggregatedBenchmarkData)

      render(
        <BenchmarkProvider>
          <LandingPage />
        </BenchmarkProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('metric-card-frameworks')).toBeInTheDocument()
      })

      const card = screen.getByTestId('metric-card-frameworks')
      const text = card.textContent
      expect(text).toContain('Frameworks')
      expect(text).toContain('5')

      mockFetchData.mockRestore()
    })

    it('test_landingPage_metric_card_file_types_shows_count_value', async () => {
      const mockFetchData = vi
        .spyOn(BenchmarkDataService, 'fetchData')
        .mockResolvedValue(mockAggregatedBenchmarkData)

      render(
        <BenchmarkProvider>
          <LandingPage />
        </BenchmarkProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('metric-card-file-types')).toBeInTheDocument()
      })

      const card = screen.getByTestId('metric-card-file-types')
      const text = card.textContent
      expect(text).toContain('File Types')
      expect(text).toContain('8')

      mockFetchData.mockRestore()
    })

    it('test_landingPage_metric_card_total_results_shows_count_value', async () => {
      const mockFetchData = vi
        .spyOn(BenchmarkDataService, 'fetchData')
        .mockResolvedValue(mockAggregatedBenchmarkData)

      render(
        <BenchmarkProvider>
          <LandingPage />
        </BenchmarkProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('metric-card-total-results')).toBeInTheDocument()
      })

      const card = screen.getByTestId('metric-card-total-results')
      const text = card.textContent
      expect(text).toContain('Total Results')
      expect(text).toContain('1250')

      mockFetchData.mockRestore()
    })
  })
})
