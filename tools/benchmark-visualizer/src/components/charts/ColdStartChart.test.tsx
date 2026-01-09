import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as BenchmarkContext from "@/context/BenchmarkContext";
import type { AggregatedBenchmarkData } from "@/types/benchmark";
import { mockAggregatedBenchmarkData, mockAggregatedBenchmarkDataMinimal } from "../../../tests/fixtures/benchmarkData";
import { ColdStartChart } from "./ColdStartChart";

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

describe("ColdStartChart", () => {
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

			render(<ColdStartChart framework="rust" />);

			expect(screen.getByTestId("skeleton-cold-start-chart")).toBeInTheDocument();
			expect(screen.getByText("Cold Start Time (ms)")).toBeInTheDocument();
		});

		it("does not render chart when loading", () => {
			mockUseBenchmark.mockReturnValue({
				data: null,
				loading: true,
				error: null,
			});

			render(<ColdStartChart framework="rust" />);

			expect(screen.queryByTestId("cold-start-barchart")).not.toBeInTheDocument();
		});

		it("shows loading state when external loading prop is true", () => {
			mockUseBenchmark.mockReturnValue({
				data: mockAggregatedBenchmarkData,
				loading: false,
				error: null,
			});

			render(<ColdStartChart framework="rust" loading={true} />);

			expect(screen.getByTestId("skeleton-cold-start-chart")).toBeInTheDocument();
		});
	});

	describe("Error State", () => {
		it("renders error alert when error is present", () => {
			const testError = new Error("Cold start data not available");
			mockUseBenchmark.mockReturnValue({
				data: null,
				loading: false,
				error: testError,
			});

			render(<ColdStartChart framework="rust" />);

			expect(screen.getByTestId("error-cold-start-chart")).toBeInTheDocument();
			expect(screen.getByText(/Error loading chart/)).toBeInTheDocument();
			expect(screen.getByText(/Cold start data not available/)).toBeInTheDocument();
		});

		it("displays error message with error details", () => {
			const testError = new Error("Benchmark timeout");
			mockUseBenchmark.mockReturnValue({
				data: null,
				loading: false,
				error: testError,
			});

			render(<ColdStartChart framework="rust" />);

			expect(screen.getByText(/Benchmark timeout/)).toBeInTheDocument();
		});

		it("uses external error prop when provided", () => {
			mockUseBenchmark.mockReturnValue({
				data: mockAggregatedBenchmarkData,
				loading: false,
				error: null,
			});

			const externalError = new Error("External error");
			render(<ColdStartChart framework="rust" error={externalError} />);

			expect(screen.getByTestId("error-cold-start-chart")).toBeInTheDocument();
			expect(screen.getByText(/External error/)).toBeInTheDocument();
		});
	});

	describe("Empty State", () => {
		it("renders empty state when no data is available for selected framework", () => {
			mockUseBenchmark.mockReturnValue({
				data: mockAggregatedBenchmarkDataMinimal,
				loading: false,
				error: null,
			});

			render(<ColdStartChart framework="nonexistent" />);

			expect(screen.getByTestId("empty-cold-start-chart")).toBeInTheDocument();
			expect(screen.getByText(/No cold start data available for the selected filters/)).toBeInTheDocument();
		});

		it("shows empty state UI with card structure", () => {
			mockUseBenchmark.mockReturnValue({
				data: mockAggregatedBenchmarkDataMinimal,
				loading: false,
				error: null,
			});

			render(<ColdStartChart framework="nonexistent" />);

			expect(screen.getByTestId("chart-cold-start-empty")).toBeInTheDocument();
			expect(screen.getByText("Cold Start Time (ms)")).toBeInTheDocument();
		});
	});

	describe("Successful Rendering", () => {
		it("renders chart with data successfully", () => {
			mockUseBenchmark.mockReturnValue({
				data: mockAggregatedBenchmarkData,
				loading: false,
				error: null,
			});

			render(<ColdStartChart framework="rust" />);

			expect(screen.getByTestId("chart-cold-start")).toBeInTheDocument();
			expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
		});

		it("renders card with title and description", () => {
			mockUseBenchmark.mockReturnValue({
				data: mockAggregatedBenchmarkData,
				loading: false,
				error: null,
			});

			render(<ColdStartChart framework="rust" />);

			expect(screen.getByText("Cold Start Time (ms)")).toBeInTheDocument();
			expect(
				screen.getByText(/Comparing p50 \(median\), p95, and p99 \(worst case\) cold start times across frameworks/),
			).toBeInTheDocument();
			expect(screen.getByText(/Lower is better/)).toBeInTheDocument();
		});

		it("renders responsive container", () => {
			mockUseBenchmark.mockReturnValue({
				data: mockAggregatedBenchmarkData,
				loading: false,
				error: null,
			});

			render(<ColdStartChart framework="rust" />);

			expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
		});

		it("renders percentile legend with explanations", () => {
			mockUseBenchmark.mockReturnValue({
				data: mockAggregatedBenchmarkData,
				loading: false,
				error: null,
			});

			render(<ColdStartChart framework="rust" />);

			expect(screen.getByText(/p50: Median response time/)).toBeInTheDocument();
			expect(screen.getByText(/p95: 95% of requests faster/)).toBeInTheDocument();
			expect(screen.getByText(/p99: Worst case scenario/)).toBeInTheDocument();
		});
	});

	describe("Chart Elements", () => {
		it("renders chart with proper testid", () => {
			mockUseBenchmark.mockReturnValue({
				data: mockAggregatedBenchmarkData,
				loading: false,
				error: null,
			});

			render(<ColdStartChart framework="rust" />);

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

			render(<ColdStartChart framework="rust" />);

			expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
		});

		it("handles python framework", () => {
			mockUseBenchmark.mockReturnValue({
				data: mockAggregatedBenchmarkData,
				loading: false,
				error: null,
			});

			render(<ColdStartChart framework="python" />);

			expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
		});

		it("handles node framework", () => {
			mockUseBenchmark.mockReturnValue({
				data: mockAggregatedBenchmarkData,
				loading: false,
				error: null,
			});

			render(<ColdStartChart framework="node" />);

			expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
		});
	});

	describe("External Props Override", () => {
		it("uses external data prop when provided", () => {
			render(<ColdStartChart framework="rust" data={mockAggregatedBenchmarkData} />);

			expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
		});

		it("uses external loading prop when provided", () => {
			render(<ColdStartChart framework="rust" data={null} loading={true} />);

			expect(screen.getByTestId("skeleton-cold-start-chart")).toBeInTheDocument();
		});

		it("uses context data when external data is not provided", () => {
			mockUseBenchmark.mockReturnValue({
				data: mockAggregatedBenchmarkData,
				loading: false,
				error: null,
			});

			render(<ColdStartChart framework="rust" />);

			expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
		});

		it("prefers external data over context data", () => {
			const externalData: AggregatedBenchmarkData = {
				by_framework_mode: {},
				disk_sizes: {},
				metadata: {
					total_results: 0,
					framework_count: 0,
					file_type_count: 0,
					timestamp: new Date().toISOString(),
				},
			};

			mockUseBenchmark.mockReturnValue({
				data: mockAggregatedBenchmarkData,
				loading: false,
				error: null,
			});

			render(<ColdStartChart framework="rust" data={externalData} />);

			expect(screen.getByTestId("empty-cold-start-chart")).toBeInTheDocument();
		});

		it("prefers external loading over context loading", () => {
			mockUseBenchmark.mockReturnValue({
				data: mockAggregatedBenchmarkData,
				loading: false,
				error: null,
			});

			render(<ColdStartChart framework="rust" loading={true} />);

			expect(screen.getByTestId("skeleton-cold-start-chart")).toBeInTheDocument();
		});

		it("prefers external error over context error", () => {
			const contextError = new Error("Context error");
			const externalError = new Error("External error");

			mockUseBenchmark.mockReturnValue({
				data: null,
				loading: false,
				error: contextError,
			});

			render(<ColdStartChart framework="rust" error={externalError} />);

			expect(screen.getByText(/External error/)).toBeInTheDocument();
		});
	});

	describe("Re-rendering and Updates", () => {
		it("updates chart when framework prop changes", () => {
			const { rerender } = render(<ColdStartChart framework="rust" />);

			mockUseBenchmark.mockReturnValue({
				data: mockAggregatedBenchmarkData,
				loading: false,
				error: null,
			});

			rerender(<ColdStartChart framework="python" />);

			expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
		});

		it("updates chart when data changes from empty to available", () => {
			mockUseBenchmark.mockReturnValue({
				data: mockAggregatedBenchmarkDataMinimal,
				loading: false,
				error: null,
			});

			const { rerender } = render(<ColdStartChart framework="rust" />);
			expect(screen.getByTestId("empty-cold-start-chart")).toBeInTheDocument();

			mockUseBenchmark.mockReturnValue({
				data: mockAggregatedBenchmarkData,
				loading: false,
				error: null,
			});

			rerender(<ColdStartChart framework="rust" />);
			expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
		});

		it("updates when external data prop changes", () => {
			const { rerender } = render(<ColdStartChart framework="rust" data={mockAggregatedBenchmarkDataMinimal} />);
			expect(screen.getByTestId("empty-cold-start-chart")).toBeInTheDocument();

			rerender(<ColdStartChart framework="rust" data={mockAggregatedBenchmarkData} />);
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

			render(<ColdStartChart framework="rust" />);

			expect(screen.getByTestId("chart-cold-start")).toBeInTheDocument();
		});

		it("renders with proper content structure", () => {
			mockUseBenchmark.mockReturnValue({
				data: mockAggregatedBenchmarkData,
				loading: false,
				error: null,
			});

			render(<ColdStartChart framework="rust" />);

			const title = screen.getByText("Cold Start Time (ms)");
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

			render(<ColdStartChart framework="rust" />);

			expect(screen.getByTestId("empty-cold-start-chart")).toBeInTheDocument();
		});

		it("handles undefined data gracefully", () => {
			mockUseBenchmark.mockReturnValue({
				data: undefined,
				loading: false,
				error: null,
			});

			render(<ColdStartChart framework="rust" />);

			expect(screen.getByTestId("empty-cold-start-chart")).toBeInTheDocument();
		});

		it("handles transition from loading to error state", () => {
			const { rerender } = render(<ColdStartChart framework="rust" />);

			mockUseBenchmark.mockReturnValue({
				data: null,
				loading: true,
				error: null,
			});

			rerender(<ColdStartChart framework="rust" />);
			expect(screen.getByTestId("skeleton-cold-start-chart")).toBeInTheDocument();

			mockUseBenchmark.mockReturnValue({
				data: null,
				loading: false,
				error: new Error("Load failed"),
			});

			rerender(<ColdStartChart framework="rust" />);
			expect(screen.getByTestId("error-cold-start-chart")).toBeInTheDocument();
		});

		it("renders chart when transitioning from loading to success", () => {
			mockUseBenchmark.mockReturnValue({
				data: null,
				loading: true,
				error: null,
			});

			const { rerender } = render(<ColdStartChart framework="rust" />);
			expect(screen.getByTestId("skeleton-cold-start-chart")).toBeInTheDocument();

			mockUseBenchmark.mockReturnValue({
				data: mockAggregatedBenchmarkData,
				loading: false,
				error: null,
			});

			rerender(<ColdStartChart framework="rust" />);
			expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
		});

		it("handles data with no cold start metrics for framework", () => {
			const dataWithoutColdStart: AggregatedBenchmarkData = {
				...mockAggregatedBenchmarkData,
				by_framework_mode: {
					go_single: {
						framework: "go",
						mode: "single",
						cold_start: null,
						by_file_type: mockAggregatedBenchmarkData.by_framework_mode.rust_single.by_file_type,
					},
				},
			};

			mockUseBenchmark.mockReturnValue({
				data: dataWithoutColdStart,
				loading: false,
				error: null,
			});

			render(<ColdStartChart framework="go" />);

			expect(screen.getByTestId("empty-cold-start-chart")).toBeInTheDocument();
		});
	});

	describe("Percentile Visualization", () => {
		it("shows percentile descriptions", () => {
			mockUseBenchmark.mockReturnValue({
				data: mockAggregatedBenchmarkData,
				loading: false,
				error: null,
			});

			render(<ColdStartChart framework="rust" />);

			expect(screen.getByText(/p50: Median response time/)).toBeInTheDocument();
			expect(screen.getByText(/p95: 95% of requests faster/)).toBeInTheDocument();
			expect(screen.getByText(/p99: Worst case scenario/)).toBeInTheDocument();
		});
	});
});
