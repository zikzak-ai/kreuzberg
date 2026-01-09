import { describe, expect, it } from "vitest";
import type { AggregatedBenchmarkData } from "@/types/benchmark";
import { mockAggregatedBenchmarkData, mockAggregatedBenchmarkDataMinimal } from "../../tests/fixtures/benchmarkData";
import {
	formatFramework,
	generateDisplayLabel,
	parseFrameworkModeKey,
	transformColdStartData,
	transformDurationData,
	transformForColdStartChart,
	transformForDurationChart,
	transformForMemoryChart,
	transformForThroughputChart,
	transformMemoryData,
	transformThroughputData,
} from "./chartTransformers";

describe("chartTransformers", () => {
	describe("formatFramework", () => {
		it("should map python to Kreuzberg (Python)", () => {
			expect(formatFramework("python")).toBe("Kreuzberg (Python)");
		});

		it("should map rust to Kreuzberg (Rust)", () => {
			expect(formatFramework("rust")).toBe("Kreuzberg (Rust)");
		});

		it("should map node to Kreuzberg (Node.js)", () => {
			expect(formatFramework("node")).toBe("Kreuzberg (Node.js)");
		});

		it("should map go to Kreuzberg (Go)", () => {
			expect(formatFramework("go")).toBe("Kreuzberg (Go)");
		});

		it("should map ruby to Kreuzberg (Ruby)", () => {
			expect(formatFramework("ruby")).toBe("Kreuzberg (Ruby)");
		});

		it("should map java to Kreuzberg (Java)", () => {
			expect(formatFramework("java")).toBe("Kreuzberg (Java)");
		});

		it("should map csharp to Kreuzberg (C#)", () => {
			expect(formatFramework("csharp")).toBe("Kreuzberg (C#)");
		});

		it("should map elixir to Kreuzberg (Elixir)", () => {
			expect(formatFramework("elixir")).toBe("Kreuzberg (Elixir)");
		});

		it("should map php to Kreuzberg (PHP)", () => {
			expect(formatFramework("php")).toBe("Kreuzberg (PHP)");
		});

		it("should be case insensitive", () => {
			expect(formatFramework("PYTHON")).toBe("Kreuzberg (Python)");
			expect(formatFramework("Rust")).toBe("Kreuzberg (Rust)");
			expect(formatFramework("NODE")).toBe("Kreuzberg (Node.js)");
		});

		it("should return original value for unknown framework", () => {
			expect(formatFramework("unknown")).toBe("unknown");
			expect(formatFramework("cpp")).toBe("cpp");
		});
	});

	describe("generateDisplayLabel", () => {
		it("should generate label with framework and mode", () => {
			const label = generateDisplayLabel("python", "single");

			expect(label).toContain("Kreuzberg (Python)");
			expect(label).toContain("single");
		});

		it("should include line break in label", () => {
			const label = generateDisplayLabel("rust", "batch");

			expect(label).toContain("\n");
		});

		it("should format correctly for different modes", () => {
			const single = generateDisplayLabel("python", "single");
			const batch = generateDisplayLabel("python", "batch");

			expect(single).toMatch(/single/);
			expect(batch).toMatch(/batch/);
		});

		it("should work with all framework types", () => {
			const frameworks = ["python", "rust", "node", "go", "ruby", "java", "csharp", "elixir", "php"];

			frameworks.forEach((fw) => {
				const label = generateDisplayLabel(fw, "single");
				expect(label).toContain("Kreuzberg");
			});
		});
	});

	describe("parseFrameworkModeKey", () => {
		it("should parse framework and mode from key", () => {
			const result = parseFrameworkModeKey("python_single");

			expect(result.framework).toBe("python");
			expect(result.mode).toBe("single");
		});

		it("should handle batch mode", () => {
			const result = parseFrameworkModeKey("rust_batch");

			expect(result.framework).toBe("rust");
			expect(result.mode).toBe("batch");
		});

		it("should handle keys with underscores in suffix", () => {
			const result = parseFrameworkModeKey("python_single_pdf_no_ocr");

			expect(result.framework).toBe("python");
			expect(result.mode).toBe("single");
		});

		it("should handle single-part keys gracefully", () => {
			const result = parseFrameworkModeKey("python");

			expect(result.framework).toBe("python");
			expect(result.mode).toBe("unknown");
		});

		it("should return unknown for malformed keys", () => {
			const result = parseFrameworkModeKey("");

			expect(result.framework).toBe("");
			expect(result.mode).toBe("unknown");
		});
	});

	describe("transformThroughputData", () => {
		it("should transform data for throughput chart", () => {
			const data = transformThroughputData(mockAggregatedBenchmarkData);

			expect(Array.isArray(data)).toBe(true);
			expect(data.length).toBeGreaterThan(0);
		});

		it("should include framework-mode keys as names", () => {
			const data = transformThroughputData(mockAggregatedBenchmarkData);

			expect(data[0].name).toBeDefined();
		});

		it("should include file type values as keys", () => {
			const data = transformThroughputData(mockAggregatedBenchmarkData);

			data.forEach((point) => {
				expect(Object.keys(point).length).toBeGreaterThan(1);
			});
		});

		it("should round values to 2 decimal places", () => {
			const data = transformThroughputData(mockAggregatedBenchmarkData);

			data.forEach((point) => {
				Object.entries(point).forEach(([key, value]) => {
					if (key !== "name" && typeof value === "number") {
						const stringValue = value.toString();
						const decimalPart = stringValue.split(".")[1];
						if (decimalPart) {
							expect(decimalPart.length).toBeLessThanOrEqual(2);
						}
					}
				});
			});
		});

		it("should filter file types when provided", () => {
			const fileTypes = ["pdf"];
			const data = transformThroughputData(mockAggregatedBenchmarkData, fileTypes);

			data.forEach((point) => {
				// Should only have pdf, not image
				if ("pdf" in point) {
					expect(point.pdf).toBeDefined();
				}
			});
		});

		it("should omit data points without metrics", () => {
			const data = transformThroughputData(mockAggregatedBenchmarkData);

			data.forEach((point) => {
				expect(Object.keys(point).length).toBeGreaterThan(1);
			});
		});

		it("should handle minimal data", () => {
			const data = transformThroughputData(mockAggregatedBenchmarkDataMinimal);

			expect(Array.isArray(data)).toBe(true);
		});

		it("should handle null throughput values", () => {
			const dataWithNulls: AggregatedBenchmarkData = {
				...mockAggregatedBenchmarkData,
				by_framework_mode: {
					rust_single: {
						framework: "rust",
						mode: "single",
						cold_start: null,
						by_file_type: {
							pdf: {
								no_ocr: {
									sample_count: 100,
									success_rate_percent: 99.5,
									throughput: { p50: 0, p95: 0, p99: 0 },
									memory: { p50: 256, p95: 512, p99: 768 },
									duration: { p50: 10, p95: 25, p99: 50 },
								},
								with_ocr: null,
							},
						},
					},
				},
				disk_sizes: {},
				metadata: mockAggregatedBenchmarkData.metadata,
			};

			const data = transformThroughputData(dataWithNulls);

			expect(data.length).toBeGreaterThan(0);
		});
	});

	describe("transformMemoryData", () => {
		it("should transform data for memory chart", () => {
			const data = transformMemoryData(mockAggregatedBenchmarkData);

			expect(Array.isArray(data)).toBe(true);
			expect(data.length).toBeGreaterThan(0);
		});

		it("should use memory metrics", () => {
			const data = transformMemoryData(mockAggregatedBenchmarkData);

			data.forEach((point) => {
				Object.entries(point).forEach(([key, value]) => {
					if (key !== "name" && typeof value === "number") {
						expect(value).toBeGreaterThanOrEqual(0);
					}
				});
			});
		});

		it("should round memory values to 2 decimal places", () => {
			const data = transformMemoryData(mockAggregatedBenchmarkData);

			data.forEach((point) => {
				Object.entries(point).forEach(([key, value]) => {
					if (key !== "name" && typeof value === "number") {
						const stringValue = value.toString();
						const decimalPart = stringValue.split(".")[1];
						if (decimalPart) {
							expect(decimalPart.length).toBeLessThanOrEqual(2);
						}
					}
				});
			});
		});

		it("should filter file types when provided", () => {
			const fileTypes = ["pdf"];
			const data = transformMemoryData(mockAggregatedBenchmarkData, fileTypes);

			expect(data.length).toBeGreaterThan(0);
		});
	});

	describe("transformDurationData", () => {
		it("should transform data for duration chart", () => {
			const data = transformDurationData(mockAggregatedBenchmarkData);

			expect(Array.isArray(data)).toBe(true);
			expect(data.length).toBeGreaterThan(0);
		});

		it("should use duration metrics", () => {
			const data = transformDurationData(mockAggregatedBenchmarkData);

			data.forEach((point) => {
				Object.entries(point).forEach(([key, value]) => {
					if (key !== "name" && typeof value === "number") {
						expect(value).toBeGreaterThanOrEqual(0);
					}
				});
			});
		});

		it("should round duration values to 2 decimal places", () => {
			const data = transformDurationData(mockAggregatedBenchmarkData);

			data.forEach((point) => {
				Object.entries(point).forEach(([key, value]) => {
					if (key !== "name" && typeof value === "number") {
						const stringValue = value.toString();
						const decimalPart = stringValue.split(".")[1];
						if (decimalPart) {
							expect(decimalPart.length).toBeLessThanOrEqual(2);
						}
					}
				});
			});
		});
	});

	describe("transformColdStartData", () => {
		it("should transform cold start data", () => {
			const data = transformColdStartData(mockAggregatedBenchmarkData);

			expect(Array.isArray(data)).toBe(true);
		});

		it("should include p50, p95, p99 values", () => {
			const data = transformColdStartData(mockAggregatedBenchmarkData);

			data.forEach((point) => {
				expect(point.p50).toBeDefined();
				expect(point.p95).toBeDefined();
				expect(point.p99).toBeDefined();
			});
		});

		it("should skip frameworks without cold start data", () => {
			const dataWithoutColdStart: AggregatedBenchmarkData = {
				...mockAggregatedBenchmarkData,
				by_framework_mode: {
					rust_single: {
						...mockAggregatedBenchmarkData.by_framework_mode.rust_single!,
						cold_start: null,
					},
				},
				disk_sizes: {},
				metadata: mockAggregatedBenchmarkData.metadata,
			};

			const data = transformColdStartData(dataWithoutColdStart);

			expect(Array.isArray(data)).toBe(true);
		});

		it("should round cold start values to 2 decimal places", () => {
			const data = transformColdStartData(mockAggregatedBenchmarkData);

			data.forEach((point) => {
				[point.p50, point.p95, point.p99].forEach((value) => {
					const stringValue = value.toString();
					const decimalPart = stringValue.split(".")[1];
					if (decimalPart) {
						expect(decimalPart.length).toBeLessThanOrEqual(2);
					}
				});
			});
		});

		it("should handle null cold start values", () => {
			const dataWithNullColdStart: AggregatedBenchmarkData = {
				...mockAggregatedBenchmarkData,
				by_framework_mode: {
					rust_single: {
						framework: "rust",
						mode: "single",
						cold_start: {
							sample_count: 50,
							p50_ms: null as any,
							p95_ms: null as any,
							p99_ms: null as any,
						},
						by_file_type: {},
					},
				},
				disk_sizes: {},
				metadata: mockAggregatedBenchmarkData.metadata,
			};

			const data = transformColdStartData(dataWithNullColdStart);

			expect(data[0].p50).toBe(0);
			expect(data[0].p95).toBe(0);
			expect(data[0].p99).toBe(0);
		});
	});

	describe("transformForThroughputChart", () => {
		it("should transform for percentile-based throughput chart", () => {
			const data = transformForThroughputChart(mockAggregatedBenchmarkData);

			expect(Array.isArray(data)).toBe(true);
			expect(data.length).toBeGreaterThan(0);
		});

		it("should include readable names and full names", () => {
			const data = transformForThroughputChart(mockAggregatedBenchmarkData);

			data.forEach((point) => {
				expect(point.name).toBeDefined();
				expect(point.fullName).toBeDefined();
				expect(point.p50).toBeDefined();
				expect(point.p95).toBeDefined();
				expect(point.p99).toBeDefined();
			});
		});

		it("should include framework names in readable name", () => {
			const data = transformForThroughputChart(mockAggregatedBenchmarkData);

			data.forEach((point) => {
				expect(point.name).toMatch(/Kreuzberg|single|batch/);
			});
		});

		it("should support framework filter", () => {
			const data = transformForThroughputChart(mockAggregatedBenchmarkData, {
				framework: "rust",
			});

			data.forEach((point) => {
				expect(point.fullName).toContain("rust");
			});
		});

		it("should support fileType filter", () => {
			const data = transformForThroughputChart(mockAggregatedBenchmarkData, {
				fileType: "pdf",
			});

			data.forEach((point) => {
				expect(point.fullName).toContain("pdf");
			});
		});

		it("should support ocrMode filter", () => {
			const data = transformForThroughputChart(mockAggregatedBenchmarkData, {
				ocrMode: "no_ocr",
			});

			data.forEach((point) => {
				expect(point.fullName).toContain("no_ocr");
			});
		});

		it("should combine multiple filters", () => {
			const data = transformForThroughputChart(mockAggregatedBenchmarkData, {
				framework: "rust",
				fileType: "pdf",
				ocrMode: "no_ocr",
			});

			data.forEach((point) => {
				expect(point.fullName).toContain("rust");
				expect(point.fullName).toContain("pdf");
				expect(point.fullName).toContain("no_ocr");
			});
		});
	});

	describe("transformForMemoryChart", () => {
		it("should transform for percentile-based memory chart", () => {
			const data = transformForMemoryChart(mockAggregatedBenchmarkData);

			expect(Array.isArray(data)).toBe(true);
			expect(data.length).toBeGreaterThan(0);
		});

		it("should include p50, p95, p99 percentiles", () => {
			const data = transformForMemoryChart(mockAggregatedBenchmarkData);

			data.forEach((point) => {
				expect(point.p50).toBeDefined();
				expect(point.p95).toBeDefined();
				expect(point.p99).toBeDefined();
			});
		});

		it("should support filters", () => {
			const data = transformForMemoryChart(mockAggregatedBenchmarkData, {
				framework: "python",
				fileType: "pdf",
			});

			data.forEach((point) => {
				expect(point.fullName).toContain("python");
				expect(point.fullName).toContain("pdf");
			});
		});
	});

	describe("transformForDurationChart", () => {
		it("should transform for percentile-based duration chart", () => {
			const data = transformForDurationChart(mockAggregatedBenchmarkData);

			expect(Array.isArray(data)).toBe(true);
			expect(data.length).toBeGreaterThan(0);
		});

		it("should include p50, p95, p99 percentiles", () => {
			const data = transformForDurationChart(mockAggregatedBenchmarkData);

			data.forEach((point) => {
				expect(point.p50).toBeDefined();
				expect(point.p95).toBeDefined();
				expect(point.p99).toBeDefined();
			});
		});

		it("should support filters", () => {
			const data = transformForDurationChart(mockAggregatedBenchmarkData, {
				fileType: "image",
			});

			data.forEach((point) => {
				expect(point.fullName).toContain("image");
			});
		});
	});

	describe("transformForColdStartChart", () => {
		it("should transform for percentile-based cold start chart", () => {
			const data = transformForColdStartChart(mockAggregatedBenchmarkData);

			expect(Array.isArray(data)).toBe(true);
		});

		it("should include readable and full names", () => {
			const data = transformForColdStartChart(mockAggregatedBenchmarkData);

			data.forEach((point) => {
				expect(point.name).toBeDefined();
				expect(point.fullName).toBeDefined();
			});
		});

		it("should include percentile values", () => {
			const data = transformForColdStartChart(mockAggregatedBenchmarkData);

			data.forEach((point) => {
				expect(point.p50).toBeDefined();
				expect(point.p95).toBeDefined();
				expect(point.p99).toBeDefined();
			});
		});

		it("should support framework filter", () => {
			const data = transformForColdStartChart(mockAggregatedBenchmarkData, {
				framework: "rust",
			});

			data.forEach((point) => {
				expect(point.fullName).toContain("rust");
			});
		});

		it("should skip frameworks without cold start data", () => {
			const dataWithoutColdStart: AggregatedBenchmarkData = {
				by_framework_mode: {
					rust_single: {
						...mockAggregatedBenchmarkData.by_framework_mode.rust_single!,
						cold_start: null,
					},
				},
				disk_sizes: {},
				metadata: mockAggregatedBenchmarkData.metadata,
			};

			const data = transformForColdStartChart(dataWithoutColdStart);

			expect(Array.isArray(data)).toBe(true);
		});
	});

	describe("Edge cases and data integrity", () => {
		it("should handle empty data", () => {
			const emptyData: AggregatedBenchmarkData = {
				by_framework_mode: {},
				disk_sizes: {},
				metadata: mockAggregatedBenchmarkData.metadata,
			};

			const throughput = transformThroughputData(emptyData);
			const memory = transformMemoryData(emptyData);
			const duration = transformDurationData(emptyData);
			const coldStart = transformColdStartData(emptyData);

			expect(throughput).toEqual([]);
			expect(memory).toEqual([]);
			expect(duration).toEqual([]);
			expect(coldStart).toEqual([]);
		});

		it("should preserve numeric precision", () => {
			const data = transformThroughputData(mockAggregatedBenchmarkData);

			data.forEach((point) => {
				Object.entries(point).forEach(([key, value]) => {
					if (typeof value === "number" && key !== "name") {
						expect(typeof value).toBe("number");
					}
				});
			});
		});

		it("should handle frameworks with partial file type support", () => {
			const dataWithPartialSupport: AggregatedBenchmarkData = {
				...mockAggregatedBenchmarkData,
				by_framework_mode: {
					rust_single: {
						framework: "rust",
						mode: "single",
						cold_start: null,
						by_file_type: {
							pdf: {
								no_ocr: {
									sample_count: 100,
									success_rate_percent: 99.5,
									throughput: { p50: 150, p95: 200, p99: 250 },
									memory: { p50: 256, p95: 512, p99: 768 },
									duration: { p50: 10, p95: 25, p99: 50 },
								},
								with_ocr: null,
							},
							// image not supported
						},
					},
				},
				disk_sizes: {},
				metadata: mockAggregatedBenchmarkData.metadata,
			};

			const data = transformThroughputData(dataWithPartialSupport);

			expect(data.length).toBeGreaterThan(0);
			data.forEach((point) => {
				expect("pdf" in point).toBe(true);
			});
		});
	});
});
