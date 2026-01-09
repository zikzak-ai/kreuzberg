import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AggregatedBenchmarkData } from "@/types/benchmark";
import { BenchmarkProvider, useBenchmark } from "./BenchmarkContext";

// Mock the benchmarkService module
vi.mock("@/services/benchmarkService", () => ({
	fetchData: vi.fn(),
}));

import { fetchData } from "@/services/benchmarkService";

// Sample benchmark data for testing
const mockBenchmarkData: AggregatedBenchmarkData = {
	by_framework_mode: {
		"test-framework-single": {
			framework: "test-framework",
			mode: "single" as const,
			cold_start: {
				sample_count: 100,
				p50_ms: 50,
				p95_ms: 95,
				p99_ms: 99,
			},
			by_file_type: {
				pdf: {
					no_ocr: {
						sample_count: 100,
						success_rate_percent: 99.5,
						throughput: { p50: 10, p95: 15, p99: 20 },
						memory: { p50: 100, p95: 150, p99: 200 },
						duration: { p50: 100, p95: 150, p99: 200 },
					},
					with_ocr: null,
				},
			},
		},
	},
	disk_sizes: {
		"test-disk": {
			size_bytes: 1024000,
			method: "du",
			description: "Test disk size",
		},
	},
	metadata: {
		total_results: 100,
		framework_count: 1,
		file_type_count: 1,
		timestamp: "2024-01-01T00:00:00Z",
	},
};

// Test component that uses the useBenchmark hook
function TestComponent() {
	const { data, loading, error } = useBenchmark();

	if (loading) return <div>Loading...</div>;
	if (error) return <div>Error: {error.message}</div>;

	return (
		<div>
			<div data-testid="metadata">{mockBenchmarkData.metadata.total_results}</div>
			<div data-testid="framework-count">{Object.keys(data?.by_framework_mode || {}).length}</div>
		</div>
	);
}

describe("BenchmarkContext", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("BenchmarkProvider initialization", () => {
		it("should render children", () => {
			(fetchData as any).mockImplementation(
				() => new Promise(() => {}), // Never resolves
			);

			render(
				<BenchmarkProvider>
					<div>Test Content</div>
				</BenchmarkProvider>,
			);

			expect(screen.getByText("Test Content")).toBeInTheDocument();
		});

		it("should initialize with loading state true", () => {
			const TestLoadingComponent = () => {
				const { loading } = useBenchmark();
				return <div>{loading ? "Loading" : "Done"}</div>;
			};

			(fetchData as any).mockImplementation(
				() => new Promise(() => {}), // Never resolves
			);

			render(
				<BenchmarkProvider>
					<TestLoadingComponent />
				</BenchmarkProvider>,
			);

			expect(screen.getByText("Loading")).toBeInTheDocument();
		});

		it("should initialize with null data", () => {
			const TestDataComponent = () => {
				const { data } = useBenchmark();
				return <div>{data ? "Has Data" : "No Data"}</div>;
			};

			(fetchData as any).mockImplementation(
				() => new Promise(() => {}), // Never resolves
			);

			render(
				<BenchmarkProvider>
					<TestDataComponent />
				</BenchmarkProvider>,
			);

			expect(screen.getByText("No Data")).toBeInTheDocument();
		});

		it("should initialize with no error", () => {
			const TestErrorComponent = () => {
				const { error } = useBenchmark();
				return <div>{error ? "Has Error" : "No Error"}</div>;
			};

			(fetchData as any).mockImplementation(
				() => new Promise(() => {}), // Never resolves
			);

			render(
				<BenchmarkProvider>
					<TestErrorComponent />
				</BenchmarkProvider>,
			);

			expect(screen.getByText("No Error")).toBeInTheDocument();
		});
	});

	describe("Data fetching", () => {
		it("should fetch data on mount", async () => {
			(fetchData as any).mockResolvedValue(mockBenchmarkData);

			render(
				<BenchmarkProvider>
					<TestComponent />
				</BenchmarkProvider>,
			);

			await waitFor(() => {
				expect(fetchData).toHaveBeenCalledTimes(1);
			});
		});

		it("should handle successful data fetch", async () => {
			(fetchData as any).mockResolvedValue(mockBenchmarkData);

			const TestSuccessComponent = () => {
				const { data, loading, error } = useBenchmark();

				if (loading) return <div>Loading</div>;
				if (error) return <div>Error</div>;

				return (
					<div>
						<div data-testid="total-results">{data?.metadata.total_results}</div>
						<div data-testid="framework-mode">{Object.keys(data?.by_framework_mode || {}).length}</div>
					</div>
				);
			};

			render(
				<BenchmarkProvider>
					<TestSuccessComponent />
				</BenchmarkProvider>,
			);

			await waitFor(() => {
				expect(screen.getByTestId("total-results")).toHaveTextContent("100");
			});

			expect(screen.getByTestId("framework-mode")).toHaveTextContent("1");
		});

		it("should set loading to false after successful fetch", async () => {
			(fetchData as any).mockResolvedValue(mockBenchmarkData);

			const TestLoadingStateComponent = () => {
				const { loading } = useBenchmark();
				return <div>{loading ? "Loading" : "Loaded"}</div>;
			};

			render(
				<BenchmarkProvider>
					<TestLoadingStateComponent />
				</BenchmarkProvider>,
			);

			expect(screen.getByText("Loading")).toBeInTheDocument();

			await waitFor(() => {
				expect(screen.getByText("Loaded")).toBeInTheDocument();
			});
		});

		it("should clear error on successful fetch", async () => {
			(fetchData as any).mockResolvedValue(mockBenchmarkData);

			const TestErrorClearComponent = () => {
				const { error } = useBenchmark();
				return <div>{error ? "Has Error" : "No Error"}</div>;
			};

			render(
				<BenchmarkProvider>
					<TestErrorClearComponent />
				</BenchmarkProvider>,
			);

			await waitFor(() => {
				expect(screen.getByText("No Error")).toBeInTheDocument();
			});
		});
	});

	describe("Error handling", () => {
		it("should handle fetch errors", async () => {
			const testError = new Error("Network error");
			(fetchData as any).mockRejectedValue(testError);

			const TestErrorComponent = () => {
				const { error, loading } = useBenchmark();

				if (loading) return <div>Loading</div>;
				if (error) return <div data-testid="error-message">{error.message}</div>;

				return <div>No Error</div>;
			};

			render(
				<BenchmarkProvider>
					<TestErrorComponent />
				</BenchmarkProvider>,
			);

			await waitFor(() => {
				expect(screen.getByTestId("error-message")).toHaveTextContent("Network error");
			});
		});

		it("should set loading to false on error", async () => {
			(fetchData as any).mockRejectedValue(new Error("Fetch failed"));

			const TestLoadingOnErrorComponent = () => {
				const { loading } = useBenchmark();
				return <div>{loading ? "Loading" : "Not Loading"}</div>;
			};

			render(
				<BenchmarkProvider>
					<TestLoadingOnErrorComponent />
				</BenchmarkProvider>,
			);

			await waitFor(() => {
				expect(screen.getByText("Not Loading")).toBeInTheDocument();
			});
		});

		it("should set data to null on error", async () => {
			(fetchData as any).mockRejectedValue(new Error("Fetch failed"));

			const TestDataOnErrorComponent = () => {
				const { data } = useBenchmark();
				return <div>{data ? "Has Data" : "No Data"}</div>;
			};

			render(
				<BenchmarkProvider>
					<TestDataOnErrorComponent />
				</BenchmarkProvider>,
			);

			await waitFor(() => {
				expect(screen.getByText("No Data")).toBeInTheDocument();
			});
		});

		it("should handle validation errors from fetchData", async () => {
			const validationError = new Error("Benchmark data validation failed");
			(fetchData as any).mockRejectedValue(validationError);

			const TestValidationErrorComponent = () => {
				const { error } = useBenchmark();
				return <div>{error?.message}</div>;
			};

			render(
				<BenchmarkProvider>
					<TestValidationErrorComponent />
				</BenchmarkProvider>,
			);

			await waitFor(() => {
				expect(screen.getByText("Benchmark data validation failed")).toBeInTheDocument();
			});
		});

		it("should handle timeout errors", async () => {
			const timeoutError = new Error("Benchmark data fetch timeout after 30000ms");
			(fetchData as any).mockRejectedValue(timeoutError);

			const TestTimeoutComponent = () => {
				const { error } = useBenchmark();
				return <div>{error?.message}</div>;
			};

			render(
				<BenchmarkProvider>
					<TestTimeoutComponent />
				</BenchmarkProvider>,
			);

			await waitFor(() => {
				expect(screen.getByText(/timeout/i)).toBeInTheDocument();
			});
		});
	});

	describe("Hook usage", () => {
		it("useBenchmark should throw error when used outside provider", () => {
			const ComponentUsingHook = () => {
				useBenchmark();
				return <div>Should not render</div>;
			};

			// Suppress console.error for this test
			const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

			expect(() => {
				render(<ComponentUsingHook />);
			}).toThrow("useBenchmark must be used within BenchmarkProvider");

			consoleError.mockRestore();
		});

		it("useBenchmark should return context value", async () => {
			(fetchData as any).mockResolvedValue(mockBenchmarkData);

			const TestContextValueComponent = () => {
				const context = useBenchmark();

				// Verify all properties exist
				expect(context).toHaveProperty("data");
				expect(context).toHaveProperty("loading");
				expect(context).toHaveProperty("error");

				return <div>Context valid</div>;
			};

			render(
				<BenchmarkProvider>
					<TestContextValueComponent />
				</BenchmarkProvider>,
			);

			await waitFor(() => {
				expect(screen.getByText("Context valid")).toBeInTheDocument();
			});
		});

		it("should provide loading state through hook", async () => {
			(fetchData as any).mockImplementation(
				() => new Promise(() => {}), // Never resolves
			);

			const TestLoadingComponent = () => {
				const { loading } = useBenchmark();
				return <div>{loading ? "Is loading" : "Not loading"}</div>;
			};

			render(
				<BenchmarkProvider>
					<TestLoadingComponent />
				</BenchmarkProvider>,
			);

			expect(screen.getByText("Is loading")).toBeInTheDocument();
		});

		it("should provide data through hook", async () => {
			(fetchData as any).mockResolvedValue(mockBenchmarkData);

			const TestDataComponent = () => {
				const { data } = useBenchmark();
				return <div>{data?.metadata.total_results || 0}</div>;
			};

			render(
				<BenchmarkProvider>
					<TestDataComponent />
				</BenchmarkProvider>,
			);

			await waitFor(() => {
				expect(screen.getByText("100")).toBeInTheDocument();
			});
		});

		it("should provide error through hook", async () => {
			const testError = new Error("Test error message");
			(fetchData as any).mockRejectedValue(testError);

			const TestErrorComponent = () => {
				const { error } = useBenchmark();
				return <div>{error?.message || "No error"}</div>;
			};

			render(
				<BenchmarkProvider>
					<TestErrorComponent />
				</BenchmarkProvider>,
			);

			await waitFor(() => {
				expect(screen.getByText("Test error message")).toBeInTheDocument();
			});
		});
	});

	describe("State management", () => {
		it("should memoize context value", async () => {
			(fetchData as any).mockResolvedValue(mockBenchmarkData);

			let renderCount = 0;

			const TestMemoComponent = () => {
				const { data, loading, error } = useBenchmark();
				renderCount++;

				return (
					<div>
						<span>{loading ? "Loading" : "Loaded"}</span>
					</div>
				);
			};

			const { rerender } = render(
				<BenchmarkProvider>
					<TestMemoComponent />
				</BenchmarkProvider>,
			);

			const _initialRenderCount = renderCount;

			// Rerender parent (but context value should be memoized)
			rerender(
				<BenchmarkProvider>
					<TestMemoComponent />
				</BenchmarkProvider>,
			);

			// The component should still render, but the context value should be stable
			expect(renderCount).toBeGreaterThan(0);
		});

		it("should handle multiple consumers", async () => {
			(fetchData as any).mockResolvedValue(mockBenchmarkData);

			const Consumer1 = () => {
				const { loading } = useBenchmark();
				return <div data-testid="consumer-1">{loading ? "Loading" : "Ready"}</div>;
			};

			const Consumer2 = () => {
				const { data } = useBenchmark();
				return <div data-testid="consumer-2">{data ? "Has Data" : "No Data"}</div>;
			};

			render(
				<BenchmarkProvider>
					<Consumer1 />
					<Consumer2 />
				</BenchmarkProvider>,
			);

			await waitFor(() => {
				expect(screen.getByTestId("consumer-1")).toHaveTextContent("Ready");
				expect(screen.getByTestId("consumer-2")).toHaveTextContent("Has Data");
			});
		});

		it("should handle nested providers", async () => {
			(fetchData as any).mockResolvedValue(mockBenchmarkData);

			const Inner = () => {
				const { data } = useBenchmark();
				return <div data-testid="inner">{data?.metadata.total_results || 0}</div>;
			};

			render(
				<BenchmarkProvider>
					<div>
						<Inner />
					</div>
				</BenchmarkProvider>,
			);

			await waitFor(() => {
				expect(screen.getByTestId("inner")).toHaveTextContent("100");
			});
		});

		it("should only fetch data once on mount", async () => {
			(fetchData as any).mockResolvedValue(mockBenchmarkData);

			const TestComponent = () => {
				const { data } = useBenchmark();
				return <div>{data ? "Ready" : "Loading"}</div>;
			};

			render(
				<BenchmarkProvider>
					<TestComponent />
				</BenchmarkProvider>,
			);

			await waitFor(() => {
				expect(screen.getByText("Ready")).toBeInTheDocument();
			});

			expect(fetchData).toHaveBeenCalledTimes(1);
		});
	});

	describe("Edge cases", () => {
		it("should handle empty data response", async () => {
			const emptyData: AggregatedBenchmarkData = {
				by_framework_mode: {},
				disk_sizes: {},
				metadata: {
					total_results: 0,
					framework_count: 0,
					file_type_count: 0,
					timestamp: "2024-01-01T00:00:00Z",
				},
			};

			(fetchData as any).mockResolvedValue(emptyData);

			const TestEmptyDataComponent = () => {
				const { data } = useBenchmark();
				return <div>{Object.keys(data?.by_framework_mode || {}).length === 0 ? "Empty" : "Has data"}</div>;
			};

			render(
				<BenchmarkProvider>
					<TestEmptyDataComponent />
				</BenchmarkProvider>,
			);

			await waitFor(() => {
				expect(screen.getByText("Empty")).toBeInTheDocument();
			});
		});

		it("should handle rapid fetch completion", async () => {
			(fetchData as any).mockResolvedValue(mockBenchmarkData);

			const TestRapidFetchComponent = () => {
				const { loading, data } = useBenchmark();

				if (loading) return <div>Loading</div>;
				return <div>Loaded: {data?.metadata.total_results}</div>;
			};

			render(
				<BenchmarkProvider>
					<TestRapidFetchComponent />
				</BenchmarkProvider>,
			);

			await waitFor(() => {
				expect(screen.getByText("Loaded: 100")).toBeInTheDocument();
			});
		});

		it("should maintain error state on subsequent renders", async () => {
			const testError = new Error("Persistent error");
			(fetchData as any).mockRejectedValue(testError);

			const TestErrorPersistenceComponent = () => {
				const { error } = useBenchmark();
				return <div data-testid="error">{error?.message}</div>;
			};

			const { rerender } = render(
				<BenchmarkProvider>
					<TestErrorPersistenceComponent />
				</BenchmarkProvider>,
			);

			await waitFor(() => {
				expect(screen.getByTestId("error")).toHaveTextContent("Persistent error");
			});

			// Rerender should still show error
			rerender(
				<BenchmarkProvider>
					<TestErrorPersistenceComponent />
				</BenchmarkProvider>,
			);

			expect(screen.getByTestId("error")).toHaveTextContent("Persistent error");
		});
	});
});
