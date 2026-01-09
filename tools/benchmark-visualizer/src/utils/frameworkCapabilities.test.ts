import { describe, expect, it } from "vitest";
import type { AggregatedBenchmarkData } from "@/types/benchmark";
import { mockAggregatedBenchmarkData, mockAggregatedBenchmarkDataMinimal } from "../../tests/fixtures/benchmarkData";
import { filterFrameworksByFileType, getFileTypeSupport, getFrameworkCapabilities } from "./frameworkCapabilities";

describe("frameworkCapabilities", () => {
	describe("getFrameworkCapabilities", () => {
		it("should identify supported file types for each framework", () => {
			const capabilities = getFrameworkCapabilities(mockAggregatedBenchmarkData);

			expect(capabilities.size).toBeGreaterThan(0);
			capabilities.forEach((supportedTypes) => {
				expect(supportedTypes).toBeInstanceOf(Set);
			});
		});

		it("should include frameworks from the data", () => {
			const capabilities = getFrameworkCapabilities(mockAggregatedBenchmarkData);

			expect(capabilities.has("rust_single")).toBe(true);
			expect(capabilities.has("rust_batch")).toBe(true);
			expect(capabilities.has("python_sync")).toBe(true);
		});

		it("should list supported file types correctly", () => {
			const capabilities = getFrameworkCapabilities(mockAggregatedBenchmarkData);
			const rustSingleCapabilities = capabilities.get("rust_single");

			expect(rustSingleCapabilities).toContain("pdf");
			expect(rustSingleCapabilities).toContain("image");
		});

		it("should mark framework as supporting file type if no_ocr is available", () => {
			const dataWithNoOcr: AggregatedBenchmarkData = {
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
						},
					},
				},
				disk_sizes: {},
				metadata: mockAggregatedBenchmarkData.metadata,
			};

			const capabilities = getFrameworkCapabilities(dataWithNoOcr);
			const rustCapabilities = capabilities.get("rust_single");

			expect(rustCapabilities?.has("pdf")).toBe(true);
		});

		it("should mark framework as supporting file type if with_ocr is available", () => {
			const dataWithOnlyOcr: AggregatedBenchmarkData = {
				...mockAggregatedBenchmarkData,
				by_framework_mode: {
					rust_single: {
						framework: "rust",
						mode: "single",
						cold_start: null,
						by_file_type: {
							pdf: {
								no_ocr: null,
								with_ocr: {
									sample_count: 100,
									success_rate_percent: 99.5,
									throughput: { p50: 150, p95: 200, p99: 250 },
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

			const capabilities = getFrameworkCapabilities(dataWithOnlyOcr);
			const rustCapabilities = capabilities.get("rust_single");

			expect(rustCapabilities?.has("pdf")).toBe(true);
		});

		it("should not mark file type as supported if both metrics are null", () => {
			const dataWithoutMetrics: AggregatedBenchmarkData = {
				...mockAggregatedBenchmarkData,
				by_framework_mode: {
					rust_single: {
						framework: "rust",
						mode: "single",
						cold_start: null,
						by_file_type: {
							unsupported_format: {
								no_ocr: null,
								with_ocr: null,
							},
						},
					},
				},
				disk_sizes: {},
				metadata: mockAggregatedBenchmarkData.metadata,
			};

			const capabilities = getFrameworkCapabilities(dataWithoutMetrics);
			const rustCapabilities = capabilities.get("rust_single");

			expect(rustCapabilities?.has("unsupported_format")).toBe(false);
		});

		it("should use UNSUPPORTED_THRESHOLD_MS to determine support", () => {
			// Duration > 10000ms should be considered unsupported
			const dataWithLongDuration: AggregatedBenchmarkData = {
				...mockAggregatedBenchmarkData,
				by_framework_mode: {
					rust_single: {
						framework: "rust",
						mode: "single",
						cold_start: null,
						by_file_type: {
							problematic_format: {
								no_ocr: {
									sample_count: 100,
									success_rate_percent: 50.0,
									throughput: { p50: 10, p95: 15, p99: 20 },
									memory: { p50: 256, p95: 512, p99: 768 },
									duration: { p50: 11000, p95: 12000, p99: 13000 }, // > 10000ms
								},
								with_ocr: null,
							},
						},
					},
				},
				disk_sizes: {},
				metadata: mockAggregatedBenchmarkData.metadata,
			};

			const capabilities = getFrameworkCapabilities(dataWithLongDuration);
			const rustCapabilities = capabilities.get("rust_single");

			expect(rustCapabilities?.has("problematic_format")).toBe(false);
		});

		it("should return empty set for frameworks with no file types", () => {
			const dataWithNoFileTypes: AggregatedBenchmarkData = {
				...mockAggregatedBenchmarkData,
				by_framework_mode: {
					rust_single: {
						framework: "rust",
						mode: "single",
						cold_start: null,
						by_file_type: {},
					},
				},
				disk_sizes: {},
				metadata: mockAggregatedBenchmarkData.metadata,
			};

			const capabilities = getFrameworkCapabilities(dataWithNoFileTypes);
			const rustCapabilities = capabilities.get("rust_single");

			expect(rustCapabilities?.size).toBe(0);
		});

		it("should handle minimal data without crashing", () => {
			const capabilities = getFrameworkCapabilities(mockAggregatedBenchmarkDataMinimal);

			expect(capabilities).toBeInstanceOf(Map);
		});

		it("should return all frameworks from data", () => {
			const capabilities = getFrameworkCapabilities(mockAggregatedBenchmarkData);

			expect(capabilities.has("rust_single")).toBe(true);
			expect(capabilities.has("rust_batch")).toBe(true);
			expect(capabilities.has("python_sync")).toBe(true);
			expect(capabilities.has("node_async")).toBe(true);
		});
	});

	describe("filterFrameworksByFileType", () => {
		it("should filter frameworks to only those supporting file type", () => {
			const capabilities = getFrameworkCapabilities(mockAggregatedBenchmarkData);
			const allFrameworks = Array.from(capabilities.keys());

			const filtered = filterFrameworksByFileType(allFrameworks, "pdf", capabilities);

			expect(filtered.length).toBeGreaterThan(0);
			filtered.forEach((framework) => {
				expect(capabilities.get(framework)?.has("pdf")).toBe(true);
			});
		});

		it("should return empty array when no frameworks support file type", () => {
			const capabilities = getFrameworkCapabilities(mockAggregatedBenchmarkData);
			const allFrameworks = Array.from(capabilities.keys());

			const filtered = filterFrameworksByFileType(allFrameworks, "nonexistent_format", capabilities);

			expect(filtered).toEqual([]);
		});

		it("should include frameworks without capability data", () => {
			const capabilities = getFrameworkCapabilities(mockAggregatedBenchmarkData);
			const unknownFramework = "unknown_framework";
			const frameworks = ["rust_single", unknownFramework];

			const filtered = filterFrameworksByFileType(frameworks, "pdf", capabilities);

			expect(filtered).toContain(unknownFramework);
		});

		it("should be defensive about missing capability data", () => {
			const capabilities = new Map<string, Set<string>>();
			capabilities.set("rust_single", new Set(["pdf", "image"]));
			capabilities.set("python_single", new Set(["pdf"]));

			const frameworks = ["rust_single", "python_single", "unknown_framework"];
			const filtered = filterFrameworksByFileType(frameworks, "pdf", capabilities);

			expect(filtered).toContain("rust_single");
			expect(filtered).toContain("python_single");
			expect(filtered).toContain("unknown_framework"); // Defensive inclusion
		});

		it("should filter multiple frameworks correctly", () => {
			const capabilities = new Map<string, Set<string>>();
			capabilities.set("rust_single", new Set(["pdf", "image", "docx"]));
			capabilities.set("python_single", new Set(["pdf"]));
			capabilities.set("node_single", new Set(["image"]));

			const frameworks = ["rust_single", "python_single", "node_single"];
			const filtered = filterFrameworksByFileType(frameworks, "docx", capabilities);

			expect(filtered).toEqual(["rust_single"]);
		});

		it("should preserve order of frameworks", () => {
			const capabilities = new Map<string, Set<string>>();
			capabilities.set("rust_single", new Set(["pdf"]));
			capabilities.set("python_single", new Set(["pdf"]));
			capabilities.set("node_single", new Set(["pdf"]));

			const frameworks = ["node_single", "rust_single", "python_single"];
			const filtered = filterFrameworksByFileType(frameworks, "pdf", capabilities);

			expect(filtered).toEqual(["node_single", "rust_single", "python_single"]);
		});

		it("should handle empty framework list", () => {
			const capabilities = getFrameworkCapabilities(mockAggregatedBenchmarkData);
			const filtered = filterFrameworksByFileType([], "pdf", capabilities);

			expect(filtered).toEqual([]);
		});

		it("should handle empty capabilities map", () => {
			const emptyCapabilities = new Map<string, Set<string>>();
			const frameworks = ["rust_single", "python_single"];

			const filtered = filterFrameworksByFileType(frameworks, "pdf", emptyCapabilities);

			// Should defensively return all frameworks
			expect(filtered).toEqual(frameworks);
		});
	});

	describe("getFileTypeSupport", () => {
		it("should count frameworks supporting a file type", () => {
			const capabilities = getFrameworkCapabilities(mockAggregatedBenchmarkData);
			const support = getFileTypeSupport("pdf", capabilities);

			expect(support.supporting).toBeGreaterThan(0);
			expect(support.total).toBeGreaterThan(0);
			expect(support.supporting).toBeLessThanOrEqual(support.total);
		});

		it("should return correct total framework count", () => {
			const capabilities = getFrameworkCapabilities(mockAggregatedBenchmarkData);
			const support = getFileTypeSupport("pdf", capabilities);

			expect(support.total).toBe(capabilities.size);
		});

		it("should return 0 supporting count for unsupported file type", () => {
			const capabilities = getFrameworkCapabilities(mockAggregatedBenchmarkData);
			const support = getFileTypeSupport("nonexistent_format", capabilities);

			expect(support.supporting).toBe(0);
			expect(support.total).toBeGreaterThan(0);
		});

		it("should return total > 0 even for unsupported file type", () => {
			const capabilities = getFrameworkCapabilities(mockAggregatedBenchmarkData);
			const support = getFileTypeSupport("xyz123", capabilities);

			expect(support.total).toBe(capabilities.size);
		});

		it("should work with empty capabilities", () => {
			const emptyCapabilities = new Map<string, Set<string>>();
			const support = getFileTypeSupport("pdf", emptyCapabilities);

			expect(support.supporting).toBe(0);
			expect(support.total).toBe(0);
		});

		it("should correctly count multiple supporting frameworks", () => {
			const capabilities = new Map<string, Set<string>>();
			capabilities.set("rust_single", new Set(["pdf", "image"]));
			capabilities.set("python_single", new Set(["pdf"]));
			capabilities.set("node_single", new Set(["image"]));
			capabilities.set("go_single", new Set(["pdf"]));

			const support = getFileTypeSupport("pdf", capabilities);

			expect(support.supporting).toBe(3);
			expect(support.total).toBe(4);
		});

		it("should handle case sensitivity", () => {
			const capabilities = new Map<string, Set<string>>();
			capabilities.set("rust_single", new Set(["pdf", "PDF"])); // Assuming different cases

			const supportLower = getFileTypeSupport("pdf", capabilities);
			const supportUpper = getFileTypeSupport("PDF", capabilities);

			expect(supportLower.supporting).toBe(1);
			expect(supportUpper.supporting).toBe(1);
		});
	});

	describe("Integration scenarios", () => {
		it("should work with real-world benchmark data", () => {
			const capabilities = getFrameworkCapabilities(mockAggregatedBenchmarkData);

			// Verify capabilities structure
			expect(capabilities.size).toBeGreaterThan(0);

			// Get all unique file types
			const allFileTypes = new Set<string>();
			capabilities.forEach((types) => {
				types.forEach((type) => allFileTypes.add(type));
			});

			expect(allFileTypes.size).toBeGreaterThan(0);

			// For each file type, count support
			allFileTypes.forEach((fileType) => {
				const support = getFileTypeSupport(fileType, capabilities);
				expect(support.supporting).toBeGreaterThan(0);
				expect(support.total).toBe(capabilities.size);
			});
		});

		it("should correctly filter frameworks across multiple file types", () => {
			const capabilities = getFrameworkCapabilities(mockAggregatedBenchmarkData);
			const allFrameworks = Array.from(capabilities.keys());

			// Get file types that are supported by at least some frameworks
			const fileTypesToCheck = ["pdf", "image"];

			fileTypesToCheck.forEach((fileType) => {
				const filtered = filterFrameworksByFileType(allFrameworks, fileType, capabilities);

				// All filtered frameworks should support the file type
				filtered.forEach((framework) => {
					const supported = capabilities.get(framework);
					if (supported) {
						expect(supported.has(fileType)).toBe(true);
					}
				});
			});
		});

		it("should handle data with varying framework support levels", () => {
			const dataWithVariedSupport: AggregatedBenchmarkData = {
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
							image: {
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
					python_single: {
						framework: "python",
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
							// Does not support image
						},
					},
				},
				disk_sizes: {},
				metadata: mockAggregatedBenchmarkData.metadata,
			};

			const capabilities = getFrameworkCapabilities(dataWithVariedSupport);
			const rustCaps = capabilities.get("rust_single");
			const pythonCaps = capabilities.get("python_single");

			expect(rustCaps?.has("pdf")).toBe(true);
			expect(rustCaps?.has("image")).toBe(true);
			expect(pythonCaps?.has("pdf")).toBe(true);
			expect(pythonCaps?.has("image")).toBe(false);

			// Filter for image support
			const allFrameworks = Array.from(capabilities.keys());
			const imageFrameworks = filterFrameworksByFileType(allFrameworks, "image", capabilities);

			expect(imageFrameworks).toContain("rust_single");
			expect(imageFrameworks).not.toContain("python_single");
		});
	});
});
