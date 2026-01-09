import { describe, expect, it } from "vitest";
import type { AggregatedBenchmarkData } from "@/types/benchmark";
import { mockAggregatedBenchmarkData, mockAggregatedBenchmarkDataMinimal } from "../../tests/fixtures/benchmarkData";
import {
	calculateOcrOverhead,
	getAvailableWorkloads,
	getEfficiencyScore,
	getFastestColdStart,
	getFastestFramework,
	getMostMemoryEfficient,
	getTopPerformers,
} from "./insights";

describe("insights", () => {
	describe("getFastestFramework", () => {
		it("should find the fastest framework for a given workload", () => {
			const result = getFastestFramework(mockAggregatedBenchmarkData, "pdf", "no_ocr");

			expect(result).not.toBeNull();
			expect(result?.title).toContain("Fastest for PDF");
			expect(result?.description).toContain("MB/s");
			expect(result?.value).toBeDefined();
		});

		it("should compare throughput values correctly", () => {
			const dataWithDifferentThroughputs: AggregatedBenchmarkData = {
				...mockAggregatedBenchmarkData,
				by_framework_mode: {
					rust_single: {
						...mockAggregatedBenchmarkData.by_framework_mode.rust_single!,
						by_file_type: {
							pdf: {
								no_ocr: {
									sample_count: 100,
									success_rate_percent: 99.5,
									throughput: { p50: 100, p95: 150, p99: 200 },
									memory: { p50: 256, p95: 512, p99: 768 },
									duration: { p50: 10, p95: 25, p99: 50 },
								},
								with_ocr: null,
							},
						},
					},
					python_single: {
						framework: "python",
						mode: "single",
						cold_start: null,
						by_file_type: {
							pdf: {
								no_ocr: {
									sample_count: 100,
									success_rate_percent: 99.5,
									throughput: { p50: 200, p95: 250, p99: 300 },
									memory: { p50: 512, p95: 768, p99: 1024 },
									duration: { p50: 5, p95: 10, p99: 20 },
								},
								with_ocr: null,
							},
						},
					},
				},
				disk_sizes: {},
				metadata: mockAggregatedBenchmarkData.metadata,
			};

			const result = getFastestFramework(dataWithDifferentThroughputs, "pdf", "no_ocr");

			expect(result?.description).toContain("Kreuzberg (Python)");
			expect(result?.value).toBe("200.0 MB/s");
		});

		it("should return null when file type is not found", () => {
			const result = getFastestFramework(mockAggregatedBenchmarkData, "nonexistent", "no_ocr");

			expect(result).toBeNull();
		});

		it("should return null when no metrics available", () => {
			const result = getFastestFramework(mockAggregatedBenchmarkDataMinimal, "pdf", "no_ocr");

			expect(result).toBeNull();
		});

		it("should handle with_ocr mode correctly", () => {
			const result = getFastestFramework(mockAggregatedBenchmarkData, "pdf", "with_ocr");

			expect(result).not.toBeNull();
			expect(result?.title).toContain("with OCR");
		});

		it("should format framework names correctly", () => {
			const result = getFastestFramework(mockAggregatedBenchmarkData, "pdf", "no_ocr");

			expect(result?.description).toMatch(/Kreuzberg \(Rust|Python|Node\.js|Go|Ruby|Java|C#|Elixir|PHP\)/);
		});

		it("should include context in result", () => {
			const result = getFastestFramework(mockAggregatedBenchmarkData, "pdf", "no_ocr");

			expect(result?.context).toContain("pdf");
		});
	});

	describe("getMostMemoryEfficient", () => {
		it("should find the most memory-efficient framework", () => {
			const result = getMostMemoryEfficient(mockAggregatedBenchmarkData, "pdf", "no_ocr");

			expect(result).not.toBeNull();
			expect(result?.title).toContain("Most Memory Efficient");
			expect(result?.description).toContain("MB");
		});

		it("should select framework with lowest memory usage", () => {
			const dataWithMemoryDifferences: AggregatedBenchmarkData = {
				...mockAggregatedBenchmarkData,
				by_framework_mode: {
					rust_single: {
						...mockAggregatedBenchmarkData.by_framework_mode.rust_single!,
						by_file_type: {
							pdf: {
								no_ocr: {
									sample_count: 100,
									success_rate_percent: 99.5,
									throughput: { p50: 150, p95: 200, p99: 250 },
									memory: { p50: 512, p95: 768, p99: 1024 },
									duration: { p50: 10, p95: 25, p99: 50 },
								},
								with_ocr: null,
							},
						},
					},
					python_single: {
						framework: "python",
						mode: "single",
						cold_start: null,
						by_file_type: {
							pdf: {
								no_ocr: {
									sample_count: 100,
									success_rate_percent: 99.5,
									throughput: { p50: 100, p95: 150, p99: 200 },
									memory: { p50: 256, p95: 400, p99: 512 },
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

			const result = getMostMemoryEfficient(dataWithMemoryDifferences, "pdf", "no_ocr");

			expect(result?.description).toContain("Kreuzberg (Python)");
			expect(result?.value).toBe("256.0 MB");
		});

		it("should return null when file type not found", () => {
			const result = getMostMemoryEfficient(mockAggregatedBenchmarkData, "nonexistent", "no_ocr");

			expect(result).toBeNull();
		});

		it("should return null when no metrics available", () => {
			const result = getMostMemoryEfficient(mockAggregatedBenchmarkDataMinimal, "pdf", "no_ocr");

			expect(result).toBeNull();
		});

		it("should work with with_ocr mode", () => {
			const result = getMostMemoryEfficient(mockAggregatedBenchmarkData, "pdf", "with_ocr");

			expect(result).not.toBeNull();
			expect(result?.title).toContain("with OCR");
		});
	});

	describe("calculateOcrOverhead", () => {
		it("should calculate OCR overhead correctly", () => {
			const result = calculateOcrOverhead(mockAggregatedBenchmarkData, "rust", "pdf");

			expect(result).not.toBeNull();
			expect(result?.title).toContain("OCR Impact");
			expect(result?.value).toMatch(/%/);
		});

		it("should return null when framework not found", () => {
			const result = calculateOcrOverhead(mockAggregatedBenchmarkData, "nonexistent", "pdf");

			expect(result).toBeNull();
		});

		it("should return null when file type not found", () => {
			const result = calculateOcrOverhead(mockAggregatedBenchmarkData, "rust", "nonexistent");

			expect(result).toBeNull();
		});

		it("should return null when OCR data is missing", () => {
			const dataWithoutOcr: AggregatedBenchmarkData = {
				...mockAggregatedBenchmarkData,
				by_framework_mode: {
					rust_single: {
						...mockAggregatedBenchmarkData.by_framework_mode.rust_single!,
						by_file_type: {
							pdf: {
								no_ocr: mockAggregatedBenchmarkData.by_framework_mode.rust_single?.by_file_type.pdf.no_ocr,
								with_ocr: null,
							},
						},
					},
				},
				disk_sizes: {},
				metadata: mockAggregatedBenchmarkData.metadata,
			};

			const result = calculateOcrOverhead(dataWithoutOcr, "rust", "pdf");

			expect(result).toBeNull();
		});

		it("should calculate percentage correctly", () => {
			const dataWithKnownValues: AggregatedBenchmarkData = {
				...mockAggregatedBenchmarkData,
				by_framework_mode: {
					rust_single: {
						...mockAggregatedBenchmarkData.by_framework_mode.rust_single!,
						by_file_type: {
							pdf: {
								no_ocr: {
									sample_count: 100,
									success_rate_percent: 99.5,
									throughput: { p50: 100, p95: 150, p99: 200 },
									memory: { p50: 256, p95: 512, p99: 768 },
									duration: { p50: 10, p95: 25, p99: 50 },
								},
								with_ocr: {
									sample_count: 100,
									success_rate_percent: 99.5,
									throughput: { p50: 50, p95: 75, p99: 100 },
									memory: { p50: 256, p95: 512, p99: 768 },
									duration: { p50: 10, p95: 25, p99: 50 },
								},
							},
						},
					},
				},
				disk_sizes: {},
				metadata: mockAggregatedBenchmarkData.metadata,
			};

			const result = calculateOcrOverhead(dataWithKnownValues, "rust", "pdf");

			// (100 - 50) / 100 * 100 = 50%
			expect(result?.value).toBe("50% overhead");
		});
	});

	describe("getEfficiencyScore", () => {
		it("should calculate efficiency score (throughput per memory)", () => {
			const result = getEfficiencyScore(mockAggregatedBenchmarkData, "rust", "pdf", "no_ocr");

			expect(result).not.toBeNull();
			expect(result?.title).toContain("Efficiency Score");
			expect(result?.value).toBeDefined();
		});

		it("should return null when framework not found", () => {
			const result = getEfficiencyScore(mockAggregatedBenchmarkData, "nonexistent", "pdf", "no_ocr");

			expect(result).toBeNull();
		});

		it("should return null when file type not found", () => {
			const result = getEfficiencyScore(mockAggregatedBenchmarkData, "rust", "nonexistent", "no_ocr");

			expect(result).toBeNull();
		});

		it("should calculate score correctly", () => {
			const dataWithKnownValues: AggregatedBenchmarkData = {
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
									throughput: { p50: 100, p95: 150, p99: 200 },
									memory: { p50: 10, p95: 15, p99: 20 },
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

			const result = getEfficiencyScore(dataWithKnownValues, "rust", "pdf", "no_ocr");

			// 100 / 10 = 10.00
			expect(result?.value).toBe("10.00");
		});

		it("should work with with_ocr mode", () => {
			const result = getEfficiencyScore(mockAggregatedBenchmarkData, "rust", "pdf", "with_ocr");

			expect(result).not.toBeNull();
			expect(result?.title).toContain("Efficiency Score");
		});
	});

	describe("getFastestColdStart", () => {
		it("should find the framework with fastest cold start", () => {
			const result = getFastestColdStart(mockAggregatedBenchmarkData);

			expect(result).not.toBeNull();
			expect(result?.title).toContain("Fastest Cold Start");
			expect(result?.value).toMatch(/ms/);
		});

		it("should compare cold start times correctly", () => {
			const dataWithDifferentColdStarts: AggregatedBenchmarkData = {
				...mockAggregatedBenchmarkData,
				by_framework_mode: {
					rust_single: {
						...mockAggregatedBenchmarkData.by_framework_mode.rust_single!,
						cold_start: {
							sample_count: 50,
							p50_ms: 100,
							p95_ms: 150,
							p99_ms: 200,
						},
					},
					python_single: {
						framework: "python",
						mode: "single",
						cold_start: {
							sample_count: 50,
							p50_ms: 50,
							p95_ms: 75,
							p99_ms: 100,
						},
						by_file_type: {},
					},
				},
				disk_sizes: {},
				metadata: mockAggregatedBenchmarkData.metadata,
			};

			const result = getFastestColdStart(dataWithDifferentColdStarts);

			expect(result?.description).toContain("Kreuzberg (Python)");
			expect(result?.value).toBe("50ms");
		});

		it("should return null when no cold start data available", () => {
			const result = getFastestColdStart(mockAggregatedBenchmarkDataMinimal);

			expect(result).toBeNull();
		});

		it("should include mode in description", () => {
			const result = getFastestColdStart(mockAggregatedBenchmarkData);

			expect(result?.description).toMatch(/(single|batch)/);
		});
	});

	describe("getAvailableWorkloads", () => {
		it("should return all available workloads", () => {
			const result = getAvailableWorkloads(mockAggregatedBenchmarkData);

			expect(Array.isArray(result)).toBe(true);
			expect(result.length).toBeGreaterThan(0);
		});

		it("should include file type and OCR mode in each workload", () => {
			const result = getAvailableWorkloads(mockAggregatedBenchmarkData);

			result.forEach((workload) => {
				expect(workload.fileType).toBeDefined();
				expect(workload.ocrMode).toMatch(/^(no_ocr|with_ocr)$/);
			});
		});

		it("should not include workloads without metrics", () => {
			const dataWithNoMetrics: AggregatedBenchmarkData = {
				...mockAggregatedBenchmarkData,
				by_framework_mode: {
					rust_single: {
						framework: "rust",
						mode: "single",
						cold_start: null,
						by_file_type: {
							pdf: {
								no_ocr: null,
								with_ocr: null,
							},
						},
					},
				},
				disk_sizes: {},
				metadata: mockAggregatedBenchmarkData.metadata,
			};

			const result = getAvailableWorkloads(dataWithNoMetrics);

			expect(result.length).toBe(0);
		});

		it("should return empty array for minimal data", () => {
			const result = getAvailableWorkloads(mockAggregatedBenchmarkDataMinimal);

			expect(Array.isArray(result)).toBe(true);
			expect(result.length).toBe(0);
		});

		it("should avoid duplicate workloads", () => {
			const result = getAvailableWorkloads(mockAggregatedBenchmarkData);
			const stringified = result.map((w) => `${w.fileType}:${w.ocrMode}`);
			const unique = new Set(stringified);

			expect(unique.size).toBe(result.length);
		});
	});

	describe("getTopPerformers", () => {
		it("should return top N performers by throughput", () => {
			const result = getTopPerformers(mockAggregatedBenchmarkData, "pdf", "no_ocr", 2);

			expect(Array.isArray(result)).toBe(true);
			expect(result.length).toBeLessThanOrEqual(2);
		});

		it("should sort performers by throughput descending", () => {
			const result = getTopPerformers(mockAggregatedBenchmarkData, "pdf", "no_ocr", 10);

			for (let i = 0; i < result.length - 1; i++) {
				expect(result[i].throughput).toBeGreaterThanOrEqual(result[i + 1].throughput);
			}
		});

		it("should respect limit parameter", () => {
			const result3 = getTopPerformers(mockAggregatedBenchmarkData, "pdf", "no_ocr", 3);
			const result1 = getTopPerformers(mockAggregatedBenchmarkData, "pdf", "no_ocr", 1);

			expect(result3.length).toBeLessThanOrEqual(3);
			expect(result1.length).toBeLessThanOrEqual(1);
		});

		it("should return empty array when no performers match", () => {
			const result = getTopPerformers(mockAggregatedBenchmarkData, "nonexistent", "no_ocr", 3);

			expect(Array.isArray(result)).toBe(true);
			expect(result.length).toBe(0);
		});

		it("should include framework details", () => {
			const result = getTopPerformers(mockAggregatedBenchmarkData, "pdf", "no_ocr", 1);

			if (result.length > 0) {
				expect(result[0].framework).toBeDefined();
				expect(result[0].mode).toBeDefined();
				expect(result[0].throughput).toBeDefined();
				expect(result[0].memory).toBeDefined();
				expect(result[0].duration).toBeDefined();
			}
		});

		it("should use p50 values for comparison", () => {
			const dataWithKnownValues: AggregatedBenchmarkData = {
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
									throughput: { p50: 100, p95: 200, p99: 300 },
									memory: { p50: 256, p95: 512, p99: 768 },
									duration: { p50: 10, p95: 25, p99: 50 },
								},
								with_ocr: null,
							},
						},
					},
					python_single: {
						framework: "python",
						mode: "single",
						cold_start: null,
						by_file_type: {
							pdf: {
								no_ocr: {
									sample_count: 100,
									success_rate_percent: 99.5,
									throughput: { p50: 200, p95: 250, p99: 300 },
									memory: { p50: 512, p95: 768, p99: 1024 },
									duration: { p50: 5, p95: 10, p99: 20 },
								},
								with_ocr: null,
							},
						},
					},
				},
				disk_sizes: {},
				metadata: mockAggregatedBenchmarkData.metadata,
			};

			const result = getTopPerformers(dataWithKnownValues, "pdf", "no_ocr", 1);

			expect(result[0].framework).toBe("python");
			expect(result[0].throughput).toBe(200);
		});

		it("should default to limit of 3", () => {
			const dataWithMany = {
				...mockAggregatedBenchmarkData,
				by_framework_mode: {
					...mockAggregatedBenchmarkData.by_framework_mode,
					go_single: {
						framework: "go",
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
						},
					},
				},
				disk_sizes: mockAggregatedBenchmarkData.disk_sizes,
				metadata: mockAggregatedBenchmarkData.metadata,
			};

			const result = getTopPerformers(dataWithMany as AggregatedBenchmarkData, "pdf", "no_ocr");

			expect(result.length).toBeLessThanOrEqual(3);
		});
	});

	describe("Edge cases and error conditions", () => {
		it("should handle empty by_framework_mode", () => {
			const emptyData: AggregatedBenchmarkData = {
				by_framework_mode: {},
				disk_sizes: {},
				metadata: mockAggregatedBenchmarkData.metadata,
			};

			const fastest = getFastestFramework(emptyData, "pdf", "no_ocr");
			const efficient = getMostMemoryEfficient(emptyData, "pdf", "no_ocr");
			const overhead = calculateOcrOverhead(emptyData, "rust", "pdf");
			const score = getEfficiencyScore(emptyData, "rust", "pdf", "no_ocr");
			const coldStart = getFastestColdStart(emptyData);
			const workloads = getAvailableWorkloads(emptyData);
			const topPerformers = getTopPerformers(emptyData, "pdf", "no_ocr");

			expect(fastest).toBeNull();
			expect(efficient).toBeNull();
			expect(overhead).toBeNull();
			expect(score).toBeNull();
			expect(coldStart).toBeNull();
			expect(workloads).toEqual([]);
			expect(topPerformers).toEqual([]);
		});

		it("should handle NaN or invalid throughput values gracefully", () => {
			const dataWithInvalid: AggregatedBenchmarkData = {
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

			const result = getFastestFramework(dataWithInvalid, "pdf", "no_ocr");

			expect(result?.value).toBe("0.0 MB/s");
		});
	});
});
