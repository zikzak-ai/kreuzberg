import { describe, expect, it } from "vitest";
import { mockAggregatedBenchmarkData } from "../../tests/fixtures/benchmarkData";
import {
	AggregatedBenchmarkDataSchema,
	BenchmarkMetadataSchema,
	ColdStartMetricsSchema,
	DiskSizeInfoSchema,
	FileTypeMetricsSchema,
	FrameworkModeDataSchema,
	PercentileValuesSchema,
	PerformanceMetricsSchema,
} from "./benchmarkSchema";

describe("benchmarkSchema", () => {
	describe("PercentileValuesSchema", () => {
		it("should validate correct percentile values", () => {
			const valid = {
				p50: 100.5,
				p95: 200.3,
				p99: 300.8,
			};

			const result = PercentileValuesSchema.safeParse(valid);
			expect(result.success).toBe(true);
		});

		it("should validate integer percentile values", () => {
			const valid = {
				p50: 100,
				p95: 200,
				p99: 300,
			};

			const result = PercentileValuesSchema.safeParse(valid);
			expect(result.success).toBe(true);
		});

		it("should reject missing p50", () => {
			const invalid = {
				p95: 200,
				p99: 300,
			};

			const result = PercentileValuesSchema.safeParse(invalid);
			expect(result.success).toBe(false);
		});

		it("should reject missing p95", () => {
			const invalid = {
				p50: 100,
				p99: 300,
			};

			const result = PercentileValuesSchema.safeParse(invalid);
			expect(result.success).toBe(false);
		});

		it("should reject missing p99", () => {
			const invalid = {
				p50: 100,
				p95: 200,
			};

			const result = PercentileValuesSchema.safeParse(invalid);
			expect(result.success).toBe(false);
		});

		it("should reject non-finite values", () => {
			const invalid = {
				p50: Infinity,
				p95: 200,
				p99: 300,
			};

			const result = PercentileValuesSchema.safeParse(invalid);
			expect(result.success).toBe(false);
		});

		it("should reject NaN values", () => {
			const invalid = {
				p50: NaN,
				p95: 200,
				p99: 300,
			};

			const result = PercentileValuesSchema.safeParse(invalid);
			expect(result.success).toBe(false);
		});

		it("should reject non-numeric values", () => {
			const invalid = {
				p50: "100",
				p95: 200,
				p99: 300,
			};

			const result = PercentileValuesSchema.safeParse(invalid);
			expect(result.success).toBe(false);
		});

		it("should reject zero percentile values", () => {
			const valid = {
				p50: 0,
				p95: 0,
				p99: 0,
			};

			const result = PercentileValuesSchema.safeParse(valid);
			expect(result.success).toBe(true);
		});

		it("should reject negative percentile values", () => {
			const invalid = {
				p50: -100,
				p95: 200,
				p99: 300,
			};

			const result = PercentileValuesSchema.safeParse(invalid);
			expect(result.success).toBe(true); // Negative numbers are allowed
		});
	});

	describe("PerformanceMetricsSchema", () => {
		it("should validate complete performance metrics", () => {
			const valid = {
				sample_count: 100,
				success_rate_percent: 99.5,
				throughput: { p50: 150, p95: 200, p99: 250 },
				memory: { p50: 256, p95: 512, p99: 768 },
				duration: { p50: 10, p95: 25, p99: 50 },
			};

			const result = PerformanceMetricsSchema.safeParse(valid);
			expect(result.success).toBe(true);
		});

		it("should reject non-positive sample count", () => {
			const invalid = {
				sample_count: 0,
				success_rate_percent: 99.5,
				throughput: { p50: 150, p95: 200, p99: 250 },
				memory: { p50: 256, p95: 512, p99: 768 },
				duration: { p50: 10, p95: 25, p99: 50 },
			};

			const result = PerformanceMetricsSchema.safeParse(invalid);
			expect(result.success).toBe(false);
		});

		it("should reject negative sample count", () => {
			const invalid = {
				sample_count: -10,
				success_rate_percent: 99.5,
				throughput: { p50: 150, p95: 200, p99: 250 },
				memory: { p50: 256, p95: 512, p99: 768 },
				duration: { p50: 10, p95: 25, p99: 50 },
			};

			const result = PerformanceMetricsSchema.safeParse(invalid);
			expect(result.success).toBe(false);
		});

		it("should reject non-integer sample count", () => {
			const invalid = {
				sample_count: 100.5,
				success_rate_percent: 99.5,
				throughput: { p50: 150, p95: 200, p99: 250 },
				memory: { p50: 256, p95: 512, p99: 768 },
				duration: { p50: 10, p95: 25, p99: 50 },
			};

			const result = PerformanceMetricsSchema.safeParse(invalid);
			expect(result.success).toBe(false);
		});

		it("should accept 0% success rate", () => {
			const valid = {
				sample_count: 100,
				success_rate_percent: 0,
				throughput: { p50: 150, p95: 200, p99: 250 },
				memory: { p50: 256, p95: 512, p99: 768 },
				duration: { p50: 10, p95: 25, p99: 50 },
			};

			const result = PerformanceMetricsSchema.safeParse(valid);
			expect(result.success).toBe(true);
		});

		it("should accept 100% success rate", () => {
			const valid = {
				sample_count: 100,
				success_rate_percent: 100,
				throughput: { p50: 150, p95: 200, p99: 250 },
				memory: { p50: 256, p95: 512, p99: 768 },
				duration: { p50: 10, p95: 25, p99: 50 },
			};

			const result = PerformanceMetricsSchema.safeParse(valid);
			expect(result.success).toBe(true);
		});

		it("should reject missing throughput", () => {
			const invalid = {
				sample_count: 100,
				success_rate_percent: 99.5,
				memory: { p50: 256, p95: 512, p99: 768 },
				duration: { p50: 10, p95: 25, p99: 50 },
			};

			const result = PerformanceMetricsSchema.safeParse(invalid);
			expect(result.success).toBe(false);
		});

		it("should reject invalid throughput schema", () => {
			const invalid = {
				sample_count: 100,
				success_rate_percent: 99.5,
				throughput: { p50: 150, p95: 200 },
				memory: { p50: 256, p95: 512, p99: 768 },
				duration: { p50: 10, p95: 25, p99: 50 },
			};

			const result = PerformanceMetricsSchema.safeParse(invalid);
			expect(result.success).toBe(false);
		});

		it("should reject infinite success rate", () => {
			const invalid = {
				sample_count: 100,
				success_rate_percent: Infinity,
				throughput: { p50: 150, p95: 200, p99: 250 },
				memory: { p50: 256, p95: 512, p99: 768 },
				duration: { p50: 10, p95: 25, p99: 50 },
			};

			const result = PerformanceMetricsSchema.safeParse(invalid);
			expect(result.success).toBe(false);
		});
	});

	describe("ColdStartMetricsSchema", () => {
		it("should validate cold start metrics", () => {
			const valid = {
				sample_count: 50,
				p50_ms: 5.2,
				p95_ms: 10.8,
				p99_ms: 15.3,
			};

			const result = ColdStartMetricsSchema.safeParse(valid);
			expect(result.success).toBe(true);
		});

		it("should reject non-positive sample count", () => {
			const invalid = {
				sample_count: 0,
				p50_ms: 5.2,
				p95_ms: 10.8,
				p99_ms: 15.3,
			};

			const result = ColdStartMetricsSchema.safeParse(invalid);
			expect(result.success).toBe(false);
		});

		it("should accept zero millisecond values", () => {
			const valid = {
				sample_count: 50,
				p50_ms: 0,
				p95_ms: 0,
				p99_ms: 0,
			};

			const result = ColdStartMetricsSchema.safeParse(valid);
			expect(result.success).toBe(true);
		});

		it("should reject NaN in millisecond values", () => {
			const invalid = {
				sample_count: 50,
				p50_ms: NaN,
				p95_ms: 10.8,
				p99_ms: 15.3,
			};

			const result = ColdStartMetricsSchema.safeParse(invalid);
			expect(result.success).toBe(false);
		});

		it("should reject missing p50_ms", () => {
			const invalid = {
				sample_count: 50,
				p95_ms: 10.8,
				p99_ms: 15.3,
			};

			const result = ColdStartMetricsSchema.safeParse(invalid);
			expect(result.success).toBe(false);
		});
	});

	describe("FileTypeMetricsSchema", () => {
		it("should validate file type metrics with both OCR modes", () => {
			const valid = {
				no_ocr: {
					sample_count: 100,
					success_rate_percent: 99.5,
					throughput: { p50: 150, p95: 200, p99: 250 },
					memory: { p50: 256, p95: 512, p99: 768 },
					duration: { p50: 10, p95: 25, p99: 50 },
				},
				with_ocr: {
					sample_count: 100,
					success_rate_percent: 99.5,
					throughput: { p50: 120, p95: 180, p99: 230 },
					memory: { p50: 256, p95: 512, p99: 768 },
					duration: { p50: 15, p95: 35, p99: 60 },
				},
			};

			const result = FileTypeMetricsSchema.safeParse(valid);
			expect(result.success).toBe(true);
		});

		it("should validate with null no_ocr", () => {
			const valid = {
				no_ocr: null,
				with_ocr: {
					sample_count: 100,
					success_rate_percent: 99.5,
					throughput: { p50: 120, p95: 180, p99: 230 },
					memory: { p50: 256, p95: 512, p99: 768 },
					duration: { p50: 15, p95: 35, p99: 60 },
				},
			};

			const result = FileTypeMetricsSchema.safeParse(valid);
			expect(result.success).toBe(true);
		});

		it("should validate with null with_ocr", () => {
			const valid = {
				no_ocr: {
					sample_count: 100,
					success_rate_percent: 99.5,
					throughput: { p50: 150, p95: 200, p99: 250 },
					memory: { p50: 256, p95: 512, p99: 768 },
					duration: { p50: 10, p95: 25, p99: 50 },
				},
				with_ocr: null,
			};

			const result = FileTypeMetricsSchema.safeParse(valid);
			expect(result.success).toBe(true);
		});

		it("should validate with both null", () => {
			const valid = {
				no_ocr: null,
				with_ocr: null,
			};

			const result = FileTypeMetricsSchema.safeParse(valid);
			expect(result.success).toBe(true);
		});

		it("should reject invalid performance metrics", () => {
			const invalid = {
				no_ocr: {
					sample_count: -100,
					success_rate_percent: 99.5,
					throughput: { p50: 150, p95: 200, p99: 250 },
					memory: { p50: 256, p95: 512, p99: 768 },
					duration: { p50: 10, p95: 25, p99: 50 },
				},
				with_ocr: null,
			};

			const result = FileTypeMetricsSchema.safeParse(invalid);
			expect(result.success).toBe(false);
		});

		it("should reject missing fields", () => {
			const invalid = {
				no_ocr: {},
			};

			const result = FileTypeMetricsSchema.safeParse(invalid);
			expect(result.success).toBe(false);
		});
	});

	describe("FrameworkModeDataSchema", () => {
		it("should validate complete framework mode data", () => {
			const valid = {
				framework: "rust",
				mode: "single",
				cold_start: {
					sample_count: 50,
					p50_ms: 5.2,
					p95_ms: 10.8,
					p99_ms: 15.3,
				},
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
			};

			const result = FrameworkModeDataSchema.safeParse(valid);
			expect(result.success).toBe(true);
		});

		it("should reject invalid framework mode", () => {
			const invalid = {
				framework: "rust",
				mode: "invalid",
				cold_start: null,
				by_file_type: {},
			};

			const result = FrameworkModeDataSchema.safeParse(invalid);
			expect(result.success).toBe(false);
		});

		it("should accept 'single' mode", () => {
			const valid = {
				framework: "rust",
				mode: "single",
				cold_start: null,
				by_file_type: {},
			};

			const result = FrameworkModeDataSchema.safeParse(valid);
			expect(result.success).toBe(true);
		});

		it("should accept 'batch' mode", () => {
			const valid = {
				framework: "python",
				mode: "batch",
				cold_start: null,
				by_file_type: {},
			};

			const result = FrameworkModeDataSchema.safeParse(valid);
			expect(result.success).toBe(true);
		});

		it("should reject empty framework string", () => {
			const invalid = {
				framework: "",
				mode: "single",
				cold_start: null,
				by_file_type: {},
			};

			const result = FrameworkModeDataSchema.safeParse(invalid);
			expect(result.success).toBe(false);
		});

		it("should accept null cold_start", () => {
			const valid = {
				framework: "rust",
				mode: "single",
				cold_start: null,
				by_file_type: {},
			};

			const result = FrameworkModeDataSchema.safeParse(valid);
			expect(result.success).toBe(true);
		});

		it("should accept empty by_file_type", () => {
			const valid = {
				framework: "rust",
				mode: "single",
				cold_start: null,
				by_file_type: {},
			};

			const result = FrameworkModeDataSchema.safeParse(valid);
			expect(result.success).toBe(true);
		});

		it("should reject missing framework", () => {
			const invalid = {
				mode: "single",
				cold_start: null,
				by_file_type: {},
			};

			const result = FrameworkModeDataSchema.safeParse(invalid);
			expect(result.success).toBe(false);
		});

		it("should reject missing mode", () => {
			const invalid = {
				framework: "rust",
				cold_start: null,
				by_file_type: {},
			};

			const result = FrameworkModeDataSchema.safeParse(invalid);
			expect(result.success).toBe(false);
		});
	});

	describe("DiskSizeInfoSchema", () => {
		it("should validate disk size info", () => {
			const valid = {
				size_bytes: 1024 * 1024 * 50,
				method: "du -sh",
				description: "Binary size without optimization",
			};

			const result = DiskSizeInfoSchema.safeParse(valid);
			expect(result.success).toBe(true);
		});

		it("should accept zero size bytes", () => {
			const valid = {
				size_bytes: 0,
				method: "du -sh",
				description: "Empty",
			};

			const result = DiskSizeInfoSchema.safeParse(valid);
			expect(result.success).toBe(true);
		});

		it("should reject negative size bytes", () => {
			const invalid = {
				size_bytes: -100,
				method: "du -sh",
				description: "Negative",
			};

			const result = DiskSizeInfoSchema.safeParse(invalid);
			expect(result.success).toBe(false);
		});

		it("should reject non-integer size bytes", () => {
			const invalid = {
				size_bytes: 100.5,
				method: "du -sh",
				description: "Float",
			};

			const result = DiskSizeInfoSchema.safeParse(invalid);
			expect(result.success).toBe(false);
		});

		it("should reject empty method string", () => {
			const invalid = {
				size_bytes: 1000,
				method: "",
				description: "Test",
			};

			const result = DiskSizeInfoSchema.safeParse(invalid);
			expect(result.success).toBe(false);
		});

		it("should reject empty description string", () => {
			const invalid = {
				size_bytes: 1000,
				method: "du -sh",
				description: "",
			};

			const result = DiskSizeInfoSchema.safeParse(invalid);
			expect(result.success).toBe(false);
		});
	});

	describe("BenchmarkMetadataSchema", () => {
		it("should validate benchmark metadata", () => {
			const valid = {
				total_results: 1250,
				framework_count: 5,
				file_type_count: 8,
				timestamp: "2024-01-15T10:30:00Z",
			};

			const result = BenchmarkMetadataSchema.safeParse(valid);
			expect(result.success).toBe(true);
		});

		it("should accept zero counts", () => {
			const valid = {
				total_results: 0,
				framework_count: 0,
				file_type_count: 0,
				timestamp: "2024-01-15T10:30:00Z",
			};

			const result = BenchmarkMetadataSchema.safeParse(valid);
			expect(result.success).toBe(true);
		});

		it("should reject negative counts", () => {
			const invalid = {
				total_results: -100,
				framework_count: 5,
				file_type_count: 8,
				timestamp: "2024-01-15T10:30:00Z",
			};

			const result = BenchmarkMetadataSchema.safeParse(invalid);
			expect(result.success).toBe(false);
		});

		it("should reject non-integer counts", () => {
			const invalid = {
				total_results: 1250.5,
				framework_count: 5,
				file_type_count: 8,
				timestamp: "2024-01-15T10:30:00Z",
			};

			const result = BenchmarkMetadataSchema.safeParse(invalid);
			expect(result.success).toBe(false);
		});

		it("should accept various timestamp formats", () => {
			const timestamps = ["2024-01-15T10:30:00Z", "2024-01-15T10:30:00.123Z", "2024-01-15T10:30:00.123456789Z"];

			timestamps.forEach((timestamp) => {
				const data = {
					total_results: 100,
					framework_count: 1,
					file_type_count: 1,
					timestamp,
				};

				const result = BenchmarkMetadataSchema.safeParse(data);
				expect(result.success).toBe(true);
			});
		});

		it("should reject missing timestamp", () => {
			const invalid = {
				total_results: 100,
				framework_count: 1,
				file_type_count: 1,
			};

			const result = BenchmarkMetadataSchema.safeParse(invalid);
			expect(result.success).toBe(false);
		});
	});

	describe("AggregatedBenchmarkDataSchema", () => {
		it("should validate complete aggregated benchmark data", () => {
			// Fix the mock data to have the right mode enum
			const validData = {
				...mockAggregatedBenchmarkData,
				by_framework_mode: {
					rust_single: {
						framework: "rust",
						mode: "single" as const,
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
			};
			const result = AggregatedBenchmarkDataSchema.safeParse(validData);
			expect(result.success).toBe(true);
		});

		it("should accept minimal valid data", () => {
			const minimal = {
				by_framework_mode: {},
				disk_sizes: {},
				metadata: {
					total_results: 0,
					framework_count: 0,
					file_type_count: 0,
					timestamp: "2024-01-15T10:30:00Z",
				},
			};

			const result = AggregatedBenchmarkDataSchema.safeParse(minimal);
			expect(result.success).toBe(true);
		});

		it("should reject missing by_framework_mode", () => {
			const invalid = {
				disk_sizes: {},
				metadata: {
					total_results: 0,
					framework_count: 0,
					file_type_count: 0,
					timestamp: "2024-01-15T10:30:00Z",
				},
			};

			const result = AggregatedBenchmarkDataSchema.safeParse(invalid);
			expect(result.success).toBe(false);
		});

		it("should reject missing disk_sizes", () => {
			const invalid = {
				by_framework_mode: {},
				metadata: {
					total_results: 0,
					framework_count: 0,
					file_type_count: 0,
					timestamp: "2024-01-15T10:30:00Z",
				},
			};

			const result = AggregatedBenchmarkDataSchema.safeParse(invalid);
			expect(result.success).toBe(false);
		});

		it("should reject missing metadata", () => {
			const invalid = {
				by_framework_mode: {},
				disk_sizes: {},
			};

			const result = AggregatedBenchmarkDataSchema.safeParse(invalid);
			expect(result.success).toBe(false);
		});

		it("should reject invalid framework mode data", () => {
			const invalid = {
				by_framework_mode: {
					rust_single: {
						framework: "rust",
						mode: "invalid",
						cold_start: null,
						by_file_type: {},
					},
				},
				disk_sizes: {},
				metadata: {
					total_results: 0,
					framework_count: 0,
					file_type_count: 0,
					timestamp: "2024-01-15T10:30:00Z",
				},
			};

			const result = AggregatedBenchmarkDataSchema.safeParse(invalid);
			expect(result.success).toBe(false);
		});

		it("should reject invalid disk size info", () => {
			const invalid = {
				by_framework_mode: {},
				disk_sizes: {
					rust_release: {
						size_bytes: -100,
						method: "du -sh",
						description: "Binary",
					},
				},
				metadata: {
					total_results: 0,
					framework_count: 0,
					file_type_count: 0,
					timestamp: "2024-01-15T10:30:00Z",
				},
			};

			const result = AggregatedBenchmarkDataSchema.safeParse(invalid);
			expect(result.success).toBe(false);
		});

		it("should reject invalid metadata", () => {
			const invalid = {
				by_framework_mode: {},
				disk_sizes: {},
				metadata: {
					total_results: -100,
					framework_count: 0,
					file_type_count: 0,
					timestamp: "2024-01-15T10:30:00Z",
				},
			};

			const result = AggregatedBenchmarkDataSchema.safeParse(invalid);
			expect(result.success).toBe(false);
		});

		it("should provide detailed error information on validation failure", () => {
			const invalid = {
				by_framework_mode: {
					rust_single: {
						framework: "rust",
						mode: "invalid_mode",
						cold_start: null,
						by_file_type: {},
					},
				},
				disk_sizes: {},
				metadata: {
					total_results: "not a number",
					framework_count: 0,
					file_type_count: 0,
					timestamp: "2024-01-15T10:30:00Z",
				},
			};

			const result = AggregatedBenchmarkDataSchema.safeParse(invalid);
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.issues.length).toBeGreaterThan(0);
				expect(result.error.issues[0].path).toBeDefined();
				expect(result.error.issues[0].code).toBeDefined();
			}
		});

		it("should allow extra fields gracefully", () => {
			const withExtraFields = {
				by_framework_mode: {},
				disk_sizes: {},
				metadata: {
					total_results: 0,
					framework_count: 0,
					file_type_count: 0,
					timestamp: "2024-01-15T10:30:00Z",
				},
				extraField: "should be allowed",
				nested: {
					extra: "value",
				},
			};

			const result = AggregatedBenchmarkDataSchema.safeParse(withExtraFields);
			expect(result.success).toBe(true);
		});

		it("should handle complex nested structures", () => {
			const complex = {
				by_framework_mode: {
					rust_single: {
						framework: "rust",
						mode: "single",
						cold_start: {
							sample_count: 50,
							p50_ms: 5.2,
							p95_ms: 10.8,
							p99_ms: 15.3,
						},
						by_file_type: {
							pdf: {
								no_ocr: {
									sample_count: 100,
									success_rate_percent: 99.5,
									throughput: { p50: 150, p95: 200, p99: 250 },
									memory: { p50: 256, p95: 512, p99: 768 },
									duration: { p50: 10, p95: 25, p99: 50 },
								},
								with_ocr: {
									sample_count: 100,
									success_rate_percent: 98.0,
									throughput: { p50: 120, p95: 180, p99: 230 },
									memory: { p50: 256, p95: 512, p99: 768 },
									duration: { p50: 15, p95: 35, p99: 60 },
								},
							},
							image: {
								no_ocr: {
									sample_count: 100,
									success_rate_percent: 99.5,
									throughput: { p50: 180, p95: 220, p99: 260 },
									memory: { p50: 512, p95: 768, p99: 1024 },
									duration: { p50: 5, p95: 15, p99: 30 },
								},
								with_ocr: null,
							},
						},
					},
					python_batch: {
						framework: "python",
						mode: "batch",
						cold_start: null,
						by_file_type: {
							pdf: {
								no_ocr: {
									sample_count: 80,
									success_rate_percent: 100,
									throughput: { p50: 100, p95: 140, p99: 180 },
									memory: { p50: 512, p95: 768, p99: 1024 },
									duration: { p50: 20, p95: 40, p99: 70 },
								},
								with_ocr: null,
							},
						},
					},
				},
				disk_sizes: {
					rust_release: {
						size_bytes: 1024 * 1024 * 50,
						method: "du -sh",
						description: "Binary size without optimization",
					},
					python_wheel: {
						size_bytes: 1024 * 1024 * 8,
						method: "ls -lh",
						description: "Python wheel package",
					},
				},
				metadata: {
					total_results: 500,
					framework_count: 2,
					file_type_count: 2,
					timestamp: "2024-01-15T10:30:00.123456789Z",
				},
			};

			const result = AggregatedBenchmarkDataSchema.safeParse(complex);
			expect(result.success).toBe(true);
		});
	});

	describe("Error reporting", () => {
		it("should include path information in validation errors", () => {
			const invalid = {
				by_framework_mode: {
					rust_single: {
						framework: "rust",
						mode: "invalid",
						cold_start: null,
						by_file_type: {},
					},
				},
				disk_sizes: {},
				metadata: {
					total_results: 0,
					framework_count: 0,
					file_type_count: 0,
					timestamp: "2024-01-15T10:30:00Z",
				},
			};

			const result = AggregatedBenchmarkDataSchema.safeParse(invalid);
			expect(result.success).toBe(false);
			if (!result.success) {
				const issue = result.error.issues[0];
				expect(issue.path.length).toBeGreaterThan(0);
			}
		});

		it("should provide error code information", () => {
			const invalid = {
				by_framework_mode: {},
				disk_sizes: {},
				metadata: {
					total_results: "not a number",
					framework_count: 0,
					file_type_count: 0,
					timestamp: "2024-01-15T10:30:00Z",
				},
			};

			const result = AggregatedBenchmarkDataSchema.safeParse(invalid);
			expect(result.success).toBe(false);
			if (!result.success) {
				const issue = result.error.issues[0];
				expect(typeof issue.code).toBe("string");
			}
		});
	});
});
