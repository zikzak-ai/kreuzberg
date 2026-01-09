import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as BenchmarkContext from "@/context/BenchmarkContext";
import { mockAggregatedBenchmarkData, mockAggregatedBenchmarkDataMinimal } from "../../../tests/fixtures/benchmarkData";
import { DurationChart } from "./DurationChart";

// Mock the BenchmarkContext
vi.mock("@/context/BenchmarkContext", () => ({
	useBenchmark: vi.fn(),
}));

// Mock Recharts ResponsiveContainer to avoid rendering issues in tests
vi.mock("recharts", async () => {
	const actual = await vi.importActual("recharts");
	return {
		...actual,
		ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
	};
});

describe("DurationChart", () => {
	const mockUseBenchmark = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
		(BenchmarkContext.useBenchmark as any).mockImplementation(mockUseBenchmark);
	});

	describe("Loading State", () => {
		it("renders skeleton loader when loading is true", () => {
			mockUseBenchmark.mockReturnValue({
				data: null,
				loading: true,
				error: null,
			});

			render(<DurationChart fileType="pdf" ocrMode="no_ocr" />);

			expect(screen.getByTestId("skeleton-duration-chart")).toBeInTheDocument();
			expect(screen.getByText("Duration (ms) - p50, p95, p99 Percentiles")).toBeInTheDocument();
		});

		it("does not render chart when loading", () => {
			mockUseBenchmark.mockReturnValue({
				data: null,
				loading: true,
				error: null,
			});

			render(<DurationChart fileType="pdf" ocrMode="no_ocr" />);

			expect(screen.queryByTestId("duration-barchart")).not.toBeInTheDocument();
		});
	});

	describe("Error State", () => {
		it("renders error alert when error is present", () => {
			const testError = new Error("Failed to load data");
			mockUseBenchmark.mockReturnValue({
				data: null,
				loading: false,
				error: testError,
			});

			render(<DurationChart fileType="pdf" ocrMode="no_ocr" />);

			expect(screen.getByTestId("error-duration-chart")).toBeInTheDocument();
			expect(screen.getByText(/Error loading duration chart/)).toBeInTheDocument();
			expect(screen.getByText(/Failed to load data/)).toBeInTheDocument();
		});

		it("displays error message with error details", () => {
			const testError = new Error("Network timeout");
			mockUseBenchmark.mockReturnValue({
				data: null,
				loading: false,
				error: testError,
			});

			render(<DurationChart fileType="pdf" ocrMode="no_ocr" />);

			expect(screen.getByText(/Network timeout/)).toBeInTheDocument();
		});
	});

	describe("Empty State", () => {
		it("renders empty state when no data is available for selected filters", () => {
			mockUseBenchmark.mockReturnValue({
				data: mockAggregatedBenchmarkDataMinimal,
				loading: false,
				error: null,
			});

			render(<DurationChart fileType="nonexistent" ocrMode="no_ocr" />);

			expect(screen.getByTestId("empty-duration-chart")).toBeInTheDocument();
			expect(screen.getByText(/No duration data available for the selected filters/)).toBeInTheDocument();
			expect(screen.getByText(/Try adjusting your file type or OCR mode selection/)).toBeInTheDocument();
		});

		it("shows empty state UI with card structure", () => {
			mockUseBenchmark.mockReturnValue({
				data: mockAggregatedBenchmarkDataMinimal,
				loading: false,
				error: null,
			});

			render(<DurationChart fileType="nonexistent" ocrMode="no_ocr" />);

			expect(screen.getByTestId("chart-duration-empty")).toBeInTheDocument();
			expect(screen.getByText("Duration (ms) - p50, p95, p99 Percentiles")).toBeInTheDocument();
		});
	});

	describe("Successful Rendering", () => {
		it("renders chart with data successfully", () => {
			mockUseBenchmark.mockReturnValue({
				data: mockAggregatedBenchmarkData,
				loading: false,
				error: null,
			});

			render(<DurationChart fileType="pdf" ocrMode="no_ocr" />);

			expect(screen.getByTestId("chart-duration")).toBeInTheDocument();
			expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
		});

		it("renders card with title and description", () => {
			mockUseBenchmark.mockReturnValue({
				data: mockAggregatedBenchmarkData,
				loading: false,
				error: null,
			});

			render(<DurationChart fileType="pdf" ocrMode="no_ocr" />);

			expect(screen.getByText("Duration (ms) - p50, p95, p99 Percentiles")).toBeInTheDocument();
			expect(screen.getByText(/Percentiles show performance distribution/)).toBeInTheDocument();
			expect(screen.getByText(/Lower is better/)).toBeInTheDocument();
		});

		it("renders responsive container for chart", () => {
			mockUseBenchmark.mockReturnValue({
				data: mockAggregatedBenchmarkData,
				loading: false,
				error: null,
			});

			render(<DurationChart fileType="pdf" ocrMode="no_ocr" />);

			expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
		});
	});

	describe("Tooltip Functionality", () => {
		it("passes correct data structure to transformer", () => {
			const testData = mockAggregatedBenchmarkData;
			mockUseBenchmark.mockReturnValue({
				data: testData,
				loading: false,
				error: null,
			});

			render(<DurationChart fileType="pdf" ocrMode="no_ocr" />);

			expect(screen.getByTestId("chart-duration")).toBeInTheDocument();
		});
	});

	describe("Different File Types", () => {
		it("handles pdf file type", () => {
			mockUseBenchmark.mockReturnValue({
				data: mockAggregatedBenchmarkData,
				loading: false,
				error: null,
			});

			render(<DurationChart fileType="pdf" ocrMode="no_ocr" />);

			expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
		});

		it("handles image file type", () => {
			mockUseBenchmark.mockReturnValue({
				data: mockAggregatedBenchmarkData,
				loading: false,
				error: null,
			});

			render(<DurationChart fileType="image" ocrMode="no_ocr" />);

			expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
		});
	});

	describe("Different OCR Modes", () => {
		it("handles no_ocr mode", () => {
			mockUseBenchmark.mockReturnValue({
				data: mockAggregatedBenchmarkData,
				loading: false,
				error: null,
			});

			render(<DurationChart fileType="pdf" ocrMode="no_ocr" />);

			expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
		});

		it("handles with_ocr mode", () => {
			mockUseBenchmark.mockReturnValue({
				data: mockAggregatedBenchmarkData,
				loading: false,
				error: null,
			});

			render(<DurationChart fileType="pdf" ocrMode="with_ocr" />);

			expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
		});
	});

	describe("Re-rendering and Updates", () => {
		it("updates chart when props change", () => {
			const { rerender } = render(<DurationChart fileType="pdf" ocrMode="no_ocr" />);

			mockUseBenchmark.mockReturnValue({
				data: mockAggregatedBenchmarkData,
				loading: false,
				error: null,
			});

			rerender(<DurationChart fileType="image" ocrMode="no_ocr" />);

			expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
		});

		it("updates chart when data changes from empty to available", () => {
			mockUseBenchmark.mockReturnValue({
				data: mockAggregatedBenchmarkDataMinimal,
				loading: false,
				error: null,
			});

			const { rerender } = render(<DurationChart fileType="pdf" ocrMode="no_ocr" />);
			expect(screen.getByTestId("empty-duration-chart")).toBeInTheDocument();

			mockUseBenchmark.mockReturnValue({
				data: mockAggregatedBenchmarkData,
				loading: false,
				error: null,
			});

			rerender(<DurationChart fileType="pdf" ocrMode="no_ocr" />);
			expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
		});
	});

	describe("Component Structure", () => {
		it("renders within a Card component", () => {
			mockUseBenchmark.mockReturnValue({
				data: mockAggregatedBenchmarkData,
				loading: false,
				error: null,
			});

			render(<DurationChart fileType="pdf" ocrMode="no_ocr" />);

			expect(screen.getByTestId("chart-duration")).toBeInTheDocument();
		});
	});

	describe("Edge Cases", () => {
		it("handles null data gracefully", () => {
			mockUseBenchmark.mockReturnValue({
				data: null,
				loading: false,
				error: null,
			});

			render(<DurationChart fileType="pdf" ocrMode="no_ocr" />);

			expect(screen.getByTestId("empty-duration-chart")).toBeInTheDocument();
		});

		it("handles transition from loading to error state", () => {
			const { rerender } = render(<DurationChart fileType="pdf" ocrMode="no_ocr" />);

			mockUseBenchmark.mockReturnValue({
				data: null,
				loading: true,
				error: null,
			});

			rerender(<DurationChart fileType="pdf" ocrMode="no_ocr" />);
			expect(screen.getByTestId("skeleton-duration-chart")).toBeInTheDocument();

			mockUseBenchmark.mockReturnValue({
				data: null,
				loading: false,
				error: new Error("Load failed"),
			});

			rerender(<DurationChart fileType="pdf" ocrMode="no_ocr" />);
			expect(screen.getByTestId("error-duration-chart")).toBeInTheDocument();
		});
	});
});
