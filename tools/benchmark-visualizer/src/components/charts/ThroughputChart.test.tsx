import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as BenchmarkContext from "@/context/BenchmarkContext";
import { mockAggregatedBenchmarkData, mockAggregatedBenchmarkDataMinimal } from "../../../tests/fixtures/benchmarkData";
import { ThroughputChart } from "./ThroughputChart";

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

describe("ThroughputChart", () => {
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

			render(<ThroughputChart framework="rust" fileType="pdf" ocrMode="no_ocr" />);

			expect(screen.getByTestId("skeleton-throughput-chart")).toBeInTheDocument();
			expect(screen.getByText("Throughput (MB/s)")).toBeInTheDocument();
		});

		it("does not render chart when loading", () => {
			mockUseBenchmark.mockReturnValue({
				data: null,
				loading: true,
				error: null,
			});

			render(<ThroughputChart framework="rust" fileType="pdf" ocrMode="no_ocr" />);

			expect(screen.queryByTestId("throughput-barchart")).not.toBeInTheDocument();
		});
	});

	describe("Error State", () => {
		it("renders error alert when error is present", () => {
			const testError = new Error("Failed to fetch throughput data");
			mockUseBenchmark.mockReturnValue({
				data: null,
				loading: false,
				error: testError,
			});

			render(<ThroughputChart framework="rust" fileType="pdf" ocrMode="no_ocr" />);

			expect(screen.getByTestId("error-throughput-chart")).toBeInTheDocument();
			expect(screen.getByText(/Error loading throughput data/)).toBeInTheDocument();
			expect(screen.getByText(/Failed to fetch throughput data/)).toBeInTheDocument();
		});

		it("displays error message with error details", () => {
			const testError = new Error("API unavailable");
			mockUseBenchmark.mockReturnValue({
				data: null,
				loading: false,
				error: testError,
			});

			render(<ThroughputChart framework="rust" fileType="pdf" ocrMode="no_ocr" />);

			expect(screen.getByText(/API unavailable/)).toBeInTheDocument();
		});
	});

	describe("Empty State", () => {
		it("renders empty state when no data is available for selected filters", () => {
			mockUseBenchmark.mockReturnValue({
				data: mockAggregatedBenchmarkDataMinimal,
				loading: false,
				error: null,
			});

			render(<ThroughputChart framework="nonexistent" fileType="pdf" ocrMode="no_ocr" />);

			expect(screen.getByTestId("empty-throughput-chart")).toBeInTheDocument();
			expect(screen.getByText(/No throughput data available for the selected filters/)).toBeInTheDocument();
		});

		it("shows empty state UI with card structure", () => {
			mockUseBenchmark.mockReturnValue({
				data: mockAggregatedBenchmarkDataMinimal,
				loading: false,
				error: null,
			});

			render(<ThroughputChart framework="nonexistent" fileType="pdf" ocrMode="no_ocr" />);

			expect(screen.getByTestId("chart-throughput-empty")).toBeInTheDocument();
			expect(screen.getByText("Throughput (MB/s)")).toBeInTheDocument();
		});
	});

	describe("Successful Rendering", () => {
		it("renders chart with data successfully", () => {
			mockUseBenchmark.mockReturnValue({
				data: mockAggregatedBenchmarkData,
				loading: false,
				error: null,
			});

			render(<ThroughputChart framework="rust" fileType="pdf" ocrMode="no_ocr" />);

			expect(screen.getByTestId("chart-throughput")).toBeInTheDocument();
			expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
		});

		it("renders card with title and description", () => {
			mockUseBenchmark.mockReturnValue({
				data: mockAggregatedBenchmarkData,
				loading: false,
				error: null,
			});

			render(<ThroughputChart framework="rust" fileType="pdf" ocrMode="no_ocr" />);

			expect(screen.getByText("Throughput (MB/s)")).toBeInTheDocument();
			expect(
				screen.getByText(/Median \(p50\), 95th percentile \(p95\), and 99th percentile \(p99\) throughput values/),
			).toBeInTheDocument();
			expect(screen.getByText(/Higher is better/)).toBeInTheDocument();
		});

		it("renders responsive container", () => {
			mockUseBenchmark.mockReturnValue({
				data: mockAggregatedBenchmarkData,
				loading: false,
				error: null,
			});

			render(<ThroughputChart framework="rust" fileType="pdf" ocrMode="no_ocr" />);

			expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
		});

		it("renders legend explanation grid", () => {
			mockUseBenchmark.mockReturnValue({
				data: mockAggregatedBenchmarkData,
				loading: false,
				error: null,
			});

			render(<ThroughputChart framework="rust" fileType="pdf" ocrMode="no_ocr" />);

			expect(screen.getByText(/P50 \(Median\)/)).toBeInTheDocument();
			expect(screen.getByText(/P95 \(95th %ile\)/)).toBeInTheDocument();
			expect(screen.getByText(/P99 \(99th %ile\)/)).toBeInTheDocument();
			expect(screen.getByText(/Typical throughput for 50% of requests/)).toBeInTheDocument();
			expect(screen.getByText(/Throughput for 95% of requests/)).toBeInTheDocument();
			expect(screen.getByText(/Throughput for slowest 1% of requests/)).toBeInTheDocument();
		});
	});

	describe("Tooltip Functionality", () => {
		it("passes correct data structure to transformer", () => {
			mockUseBenchmark.mockReturnValue({
				data: mockAggregatedBenchmarkData,
				loading: false,
				error: null,
			});

			render(<ThroughputChart framework="rust" fileType="pdf" ocrMode="no_ocr" />);

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

			render(<ThroughputChart framework="rust" fileType="pdf" ocrMode="no_ocr" />);

			expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
		});

		it("handles python framework", () => {
			mockUseBenchmark.mockReturnValue({
				data: mockAggregatedBenchmarkData,
				loading: false,
				error: null,
			});

			render(<ThroughputChart framework="python" fileType="pdf" ocrMode="no_ocr" />);

			expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
		});

		it("handles node framework", () => {
			mockUseBenchmark.mockReturnValue({
				data: mockAggregatedBenchmarkData,
				loading: false,
				error: null,
			});

			render(<ThroughputChart framework="node" fileType="pdf" ocrMode="no_ocr" />);

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

			render(<ThroughputChart framework="rust" fileType="pdf" ocrMode="no_ocr" />);

			expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
		});

		it("handles image file type", () => {
			mockUseBenchmark.mockReturnValue({
				data: mockAggregatedBenchmarkData,
				loading: false,
				error: null,
			});

			render(<ThroughputChart framework="rust" fileType="image" ocrMode="no_ocr" />);

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

			render(<ThroughputChart framework="rust" fileType="pdf" ocrMode="no_ocr" />);

			expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
		});

		it("handles with_ocr mode", () => {
			mockUseBenchmark.mockReturnValue({
				data: mockAggregatedBenchmarkData,
				loading: false,
				error: null,
			});

			render(<ThroughputChart framework="rust" fileType="pdf" ocrMode="with_ocr" />);

			expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
		});
	});

	describe("Re-rendering and Updates", () => {
		it("updates chart when framework prop changes", () => {
			const { rerender } = render(<ThroughputChart framework="rust" fileType="pdf" ocrMode="no_ocr" />);

			mockUseBenchmark.mockReturnValue({
				data: mockAggregatedBenchmarkData,
				loading: false,
				error: null,
			});

			rerender(<ThroughputChart framework="python" fileType="pdf" ocrMode="no_ocr" />);

			expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
		});

		it("updates chart when data changes from empty to available", () => {
			mockUseBenchmark.mockReturnValue({
				data: mockAggregatedBenchmarkDataMinimal,
				loading: false,
				error: null,
			});

			const { rerender } = render(<ThroughputChart framework="rust" fileType="pdf" ocrMode="no_ocr" />);
			expect(screen.getByTestId("empty-throughput-chart")).toBeInTheDocument();

			mockUseBenchmark.mockReturnValue({
				data: mockAggregatedBenchmarkData,
				loading: false,
				error: null,
			});

			rerender(<ThroughputChart framework="rust" fileType="pdf" ocrMode="no_ocr" />);
			expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
		});

		it("updates chart when ocr mode changes", () => {
			const { rerender } = render(<ThroughputChart framework="rust" fileType="pdf" ocrMode="no_ocr" />);

			mockUseBenchmark.mockReturnValue({
				data: mockAggregatedBenchmarkData,
				loading: false,
				error: null,
			});

			rerender(<ThroughputChart framework="rust" fileType="pdf" ocrMode="with_ocr" />);

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

			render(<ThroughputChart framework="rust" fileType="pdf" ocrMode="no_ocr" />);

			expect(screen.getByTestId("chart-throughput")).toBeInTheDocument();
		});

		it("renders with proper heading structure", () => {
			mockUseBenchmark.mockReturnValue({
				data: mockAggregatedBenchmarkData,
				loading: false,
				error: null,
			});

			render(<ThroughputChart framework="rust" fileType="pdf" ocrMode="no_ocr" />);

			const title = screen.getByText("Throughput (MB/s)");
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

			render(<ThroughputChart framework="rust" fileType="pdf" ocrMode="no_ocr" />);

			expect(screen.getByTestId("empty-throughput-chart")).toBeInTheDocument();
		});

		it("handles undefined data gracefully", () => {
			mockUseBenchmark.mockReturnValue({
				data: undefined,
				loading: false,
				error: null,
			});

			render(<ThroughputChart framework="rust" fileType="pdf" ocrMode="no_ocr" />);

			expect(screen.getByTestId("empty-throughput-chart")).toBeInTheDocument();
		});

		it("handles transition from loading to error state", () => {
			const { rerender } = render(<ThroughputChart framework="rust" fileType="pdf" ocrMode="no_ocr" />);

			mockUseBenchmark.mockReturnValue({
				data: null,
				loading: true,
				error: null,
			});

			rerender(<ThroughputChart framework="rust" fileType="pdf" ocrMode="no_ocr" />);
			expect(screen.getByTestId("skeleton-throughput-chart")).toBeInTheDocument();

			mockUseBenchmark.mockReturnValue({
				data: null,
				loading: false,
				error: new Error("Load failed"),
			});

			rerender(<ThroughputChart framework="rust" fileType="pdf" ocrMode="no_ocr" />);
			expect(screen.getByTestId("error-throughput-chart")).toBeInTheDocument();
		});

		it("renders chart when transitioning from loading to success", () => {
			mockUseBenchmark.mockReturnValue({
				data: null,
				loading: true,
				error: null,
			});

			const { rerender } = render(<ThroughputChart framework="rust" fileType="pdf" ocrMode="no_ocr" />);
			expect(screen.getByTestId("skeleton-throughput-chart")).toBeInTheDocument();

			mockUseBenchmark.mockReturnValue({
				data: mockAggregatedBenchmarkData,
				loading: false,
				error: null,
			});

			rerender(<ThroughputChart framework="rust" fileType="pdf" ocrMode="no_ocr" />);
			expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
		});
	});
});
