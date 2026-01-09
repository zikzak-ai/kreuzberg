import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as BenchmarkContext from "@/context/BenchmarkContext";
import { mockAggregatedBenchmarkData, mockAggregatedBenchmarkDataMinimal } from "../../../tests/fixtures/benchmarkData";
import { MemoryChart } from "./MemoryChart";

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

describe("MemoryChart", () => {
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

			render(<MemoryChart framework="rust" fileType="pdf" ocrMode="no_ocr" />);

			expect(screen.getByTestId("skeleton-memory-chart")).toBeInTheDocument();
			expect(screen.getByText("Memory Usage (MB)")).toBeInTheDocument();
		});

		it("displays loading state with description", () => {
			mockUseBenchmark.mockReturnValue({
				data: null,
				loading: true,
				error: null,
			});

			render(<MemoryChart framework="rust" fileType="pdf" ocrMode="no_ocr" />);

			expect(screen.getByText(/Shows p50, p95, and p99 percentiles for memory consumption/)).toBeInTheDocument();
		});

		it("does not render chart when loading", () => {
			mockUseBenchmark.mockReturnValue({
				data: null,
				loading: true,
				error: null,
			});

			render(<MemoryChart framework="rust" fileType="pdf" ocrMode="no_ocr" />);

			expect(screen.queryByTestId("memory-barchart")).not.toBeInTheDocument();
		});
	});

	describe("Error State", () => {
		it("renders error alert when error is present", () => {
			const testError = new Error("Memory data unavailable");
			mockUseBenchmark.mockReturnValue({
				data: null,
				loading: false,
				error: testError,
			});

			render(<MemoryChart framework="rust" fileType="pdf" ocrMode="no_ocr" />);

			expect(screen.getByTestId("error-memory-chart")).toBeInTheDocument();
			expect(screen.getByText(/Error loading memory data/)).toBeInTheDocument();
			expect(screen.getByText(/Memory data unavailable/)).toBeInTheDocument();
		});

		it("displays error message with error details", () => {
			const testError = new Error("Connection timeout");
			mockUseBenchmark.mockReturnValue({
				data: null,
				loading: false,
				error: testError,
			});

			render(<MemoryChart framework="rust" fileType="pdf" ocrMode="no_ocr" />);

			expect(screen.getByText(/Connection timeout/)).toBeInTheDocument();
		});

		it("handles Error instance error messages", () => {
			const testError = new Error("Test error message");
			mockUseBenchmark.mockReturnValue({
				data: null,
				loading: false,
				error: testError,
			});

			render(<MemoryChart framework="rust" fileType="pdf" ocrMode="no_ocr" />);

			expect(screen.getByText(/Test error message/)).toBeInTheDocument();
		});
	});

	describe("Empty State", () => {
		it("renders empty state when no data is available for selected filters", () => {
			mockUseBenchmark.mockReturnValue({
				data: mockAggregatedBenchmarkDataMinimal,
				loading: false,
				error: null,
			});

			render(<MemoryChart framework="nonexistent" fileType="pdf" ocrMode="no_ocr" />);

			expect(screen.getByTestId("empty-memory-chart")).toBeInTheDocument();
			expect(screen.getByText(/No data available/)).toBeInTheDocument();
			expect(screen.getByText(/Try adjusting your filters to view memory usage data/)).toBeInTheDocument();
		});

		it("shows empty state UI with card structure", () => {
			mockUseBenchmark.mockReturnValue({
				data: mockAggregatedBenchmarkDataMinimal,
				loading: false,
				error: null,
			});

			render(<MemoryChart framework="nonexistent" fileType="pdf" ocrMode="no_ocr" />);

			expect(screen.getByTestId("chart-memory-empty")).toBeInTheDocument();
			expect(screen.getByText("Memory Usage (MB)")).toBeInTheDocument();
		});
	});

	describe("Successful Rendering", () => {
		it("renders chart with data successfully", () => {
			mockUseBenchmark.mockReturnValue({
				data: mockAggregatedBenchmarkData,
				loading: false,
				error: null,
			});

			render(<MemoryChart framework="rust" fileType="pdf" ocrMode="no_ocr" />);

			expect(screen.getByTestId("chart-memory")).toBeInTheDocument();
			expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
		});

		it("renders card with title and description", () => {
			mockUseBenchmark.mockReturnValue({
				data: mockAggregatedBenchmarkData,
				loading: false,
				error: null,
			});

			render(<MemoryChart framework="rust" fileType="pdf" ocrMode="no_ocr" />);

			expect(screen.getByText("Memory Usage (MB)")).toBeInTheDocument();
			expect(
				screen.getByText(/Shows p50 \(median\), p95, and p99 percentiles for memory consumption/),
			).toBeInTheDocument();
			expect(screen.getByText(/Lower is better/)).toBeInTheDocument();
		});

		it("renders responsive container", () => {
			mockUseBenchmark.mockReturnValue({
				data: mockAggregatedBenchmarkData,
				loading: false,
				error: null,
			});

			render(<MemoryChart framework="rust" fileType="pdf" ocrMode="no_ocr" />);

			expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
		});

		it("renders percentile legend with explanations", () => {
			mockUseBenchmark.mockReturnValue({
				data: mockAggregatedBenchmarkData,
				loading: false,
				error: null,
			});

			render(<MemoryChart framework="rust" fileType="pdf" ocrMode="no_ocr" />);

			expect(screen.getByText(/p50: Typical memory usage/)).toBeInTheDocument();
			expect(screen.getByText(/p95: High memory usage/)).toBeInTheDocument();
			expect(screen.getByText(/p99: Peak memory usage/)).toBeInTheDocument();
		});
	});

	describe("Chart Elements", () => {
		it("renders with CartesianGrid", () => {
			mockUseBenchmark.mockReturnValue({
				data: mockAggregatedBenchmarkData,
				loading: false,
				error: null,
			});

			render(<MemoryChart framework="rust" fileType="pdf" ocrMode="no_ocr" />);

			expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
		});
	});

	describe("Different Frameworks", () => {
		it("handles rust framework", () => {
			mockUseBenchmark.mockReturnValue({
				data: mockAggregatedBenchmarkData,
				loading: false,
				error: null,
			});

			render(<MemoryChart framework="rust" fileType="pdf" ocrMode="no_ocr" />);

			expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
		});

		it("handles python framework", () => {
			mockUseBenchmark.mockReturnValue({
				data: mockAggregatedBenchmarkData,
				loading: false,
				error: null,
			});

			render(<MemoryChart framework="python" fileType="pdf" ocrMode="no_ocr" />);

			expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
		});

		it("handles node framework", () => {
			mockUseBenchmark.mockReturnValue({
				data: mockAggregatedBenchmarkData,
				loading: false,
				error: null,
			});

			render(<MemoryChart framework="node" fileType="pdf" ocrMode="no_ocr" />);

			expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
		});
	});

	describe("Different File Types", () => {
		it("handles pdf file type", () => {
			mockUseBenchmark.mockReturnValue({
				data: mockAggregatedBenchmarkData,
				loading: false,
				error: null,
			});

			render(<MemoryChart framework="rust" fileType="pdf" ocrMode="no_ocr" />);

			expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
		});

		it("handles image file type", () => {
			mockUseBenchmark.mockReturnValue({
				data: mockAggregatedBenchmarkData,
				loading: false,
				error: null,
			});

			render(<MemoryChart framework="rust" fileType="image" ocrMode="no_ocr" />);

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

			render(<MemoryChart framework="rust" fileType="pdf" ocrMode="no_ocr" />);

			expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
		});

		it("handles with_ocr mode", () => {
			mockUseBenchmark.mockReturnValue({
				data: mockAggregatedBenchmarkData,
				loading: false,
				error: null,
			});

			render(<MemoryChart framework="rust" fileType="pdf" ocrMode="with_ocr" />);

			expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
		});
	});

	describe("Re-rendering and Updates", () => {
		it("updates chart when framework prop changes", () => {
			const { rerender } = render(<MemoryChart framework="rust" fileType="pdf" ocrMode="no_ocr" />);

			mockUseBenchmark.mockReturnValue({
				data: mockAggregatedBenchmarkData,
				loading: false,
				error: null,
			});

			rerender(<MemoryChart framework="python" fileType="pdf" ocrMode="no_ocr" />);

			expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
		});

		it("updates chart when fileType prop changes", () => {
			const { rerender } = render(<MemoryChart framework="rust" fileType="pdf" ocrMode="no_ocr" />);

			mockUseBenchmark.mockReturnValue({
				data: mockAggregatedBenchmarkData,
				loading: false,
				error: null,
			});

			rerender(<MemoryChart framework="rust" fileType="image" ocrMode="no_ocr" />);

			expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
		});

		it("updates chart when data changes from empty to available", () => {
			mockUseBenchmark.mockReturnValue({
				data: mockAggregatedBenchmarkDataMinimal,
				loading: false,
				error: null,
			});

			const { rerender } = render(<MemoryChart framework="rust" fileType="pdf" ocrMode="no_ocr" />);
			expect(screen.getByTestId("empty-memory-chart")).toBeInTheDocument();

			mockUseBenchmark.mockReturnValue({
				data: mockAggregatedBenchmarkData,
				loading: false,
				error: null,
			});

			rerender(<MemoryChart framework="rust" fileType="pdf" ocrMode="no_ocr" />);
			expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
		});

		it("updates chart when ocr mode changes", () => {
			const { rerender } = render(<MemoryChart framework="rust" fileType="pdf" ocrMode="no_ocr" />);

			mockUseBenchmark.mockReturnValue({
				data: mockAggregatedBenchmarkData,
				loading: false,
				error: null,
			});

			rerender(<MemoryChart framework="rust" fileType="pdf" ocrMode="with_ocr" />);

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

			render(<MemoryChart framework="rust" fileType="pdf" ocrMode="no_ocr" />);

			expect(screen.getByTestId("chart-memory")).toBeInTheDocument();
		});

		it("renders with proper content structure", () => {
			mockUseBenchmark.mockReturnValue({
				data: mockAggregatedBenchmarkData,
				loading: false,
				error: null,
			});

			render(<MemoryChart framework="rust" fileType="pdf" ocrMode="no_ocr" />);

			const title = screen.getByText("Memory Usage (MB)");
			expect(title).toBeInTheDocument();
		});
	});

	describe("Edge Cases", () => {
		it("handles null data gracefully", () => {
			mockUseBenchmark.mockReturnValue({
				data: null,
				loading: false,
				error: null,
			});

			render(<MemoryChart framework="rust" fileType="pdf" ocrMode="no_ocr" />);

			expect(screen.getByTestId("empty-memory-chart")).toBeInTheDocument();
		});

		it("handles undefined data gracefully", () => {
			mockUseBenchmark.mockReturnValue({
				data: undefined,
				loading: false,
				error: null,
			});

			render(<MemoryChart framework="rust" fileType="pdf" ocrMode="no_ocr" />);

			expect(screen.getByTestId("empty-memory-chart")).toBeInTheDocument();
		});

		it("handles transition from loading to error state", () => {
			const { rerender } = render(<MemoryChart framework="rust" fileType="pdf" ocrMode="no_ocr" />);

			mockUseBenchmark.mockReturnValue({
				data: null,
				loading: true,
				error: null,
			});

			rerender(<MemoryChart framework="rust" fileType="pdf" ocrMode="no_ocr" />);
			expect(screen.getByTestId("skeleton-memory-chart")).toBeInTheDocument();

			mockUseBenchmark.mockReturnValue({
				data: null,
				loading: false,
				error: new Error("Load failed"),
			});

			rerender(<MemoryChart framework="rust" fileType="pdf" ocrMode="no_ocr" />);
			expect(screen.getByTestId("error-memory-chart")).toBeInTheDocument();
		});

		it("renders chart when transitioning from loading to success", () => {
			mockUseBenchmark.mockReturnValue({
				data: null,
				loading: true,
				error: null,
			});

			const { rerender } = render(<MemoryChart framework="rust" fileType="pdf" ocrMode="no_ocr" />);
			expect(screen.getByTestId("skeleton-memory-chart")).toBeInTheDocument();

			mockUseBenchmark.mockReturnValue({
				data: mockAggregatedBenchmarkData,
				loading: false,
				error: null,
			});

			rerender(<MemoryChart framework="rust" fileType="pdf" ocrMode="no_ocr" />);
			expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
		});

		it("handles non-Error error objects", () => {
			mockUseBenchmark.mockReturnValue({
				data: null,
				loading: false,
				error: { message: "Custom error" } as any,
			});

			render(<MemoryChart framework="rust" fileType="pdf" ocrMode="no_ocr" />);

			expect(screen.getByTestId("error-memory-chart")).toBeInTheDocument();
		});
	});

	describe("Percentile Visualization", () => {
		it("shows percentile descriptions", () => {
			mockUseBenchmark.mockReturnValue({
				data: mockAggregatedBenchmarkData,
				loading: false,
				error: null,
			});

			render(<MemoryChart framework="rust" fileType="pdf" ocrMode="no_ocr" />);

			expect(screen.getByText(/p50: Typical memory usage/)).toBeInTheDocument();
			expect(screen.getByText(/p95: High memory usage/)).toBeInTheDocument();
			expect(screen.getByText(/p99: Peak memory usage/)).toBeInTheDocument();
		});
	});
});
