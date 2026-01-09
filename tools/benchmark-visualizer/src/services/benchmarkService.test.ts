import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { AggregatedBenchmarkData } from "@/types/benchmark";
import { mockAggregatedBenchmarkDataMinimal } from "../../tests/fixtures/benchmarkData";
import { fetchData, fetchMetadata } from "./benchmarkService";

describe("benchmarkService", () => {
	let fetchMock: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		fetchMock = vi.spyOn(global, "fetch");
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe("fetchData", () => {
		it("should fetch and validate benchmark data successfully", async () => {
			// Create valid test data with proper modes
			const validData = {
				by_framework_mode: {
					rust_single: {
						framework: "rust",
						mode: "single" as const,
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
									throughput: { p50: 150.5, p95: 200.3, p99: 250.8 },
									memory: { p50: 256.5, p95: 512.2, p99: 768.9 },
									duration: { p50: 10.5, p95: 25.3, p99: 50.8 },
								},
								with_ocr: null,
							},
						},
					},
				},
				disk_sizes: {},
				metadata: {
					total_results: 100,
					framework_count: 1,
					file_type_count: 1,
					timestamp: "2024-01-01T00:00:00Z",
				},
			};

			fetchMock.mockResolvedValueOnce({
				ok: true,
				status: 200,
				json: async () => validData,
			});

			const result = await fetchData();

			expect(result).toEqual(validData);
			expect(fetchMock).toHaveBeenCalledWith(
				"./aggregated.json",
				expect.objectContaining({
					signal: expect.any(AbortSignal),
				}),
			);
		});

		it("should handle minimal valid data", async () => {
			fetchMock.mockResolvedValueOnce({
				ok: true,
				status: 200,
				json: async () => mockAggregatedBenchmarkDataMinimal,
			});

			const result = await fetchData();

			expect(result).toEqual(mockAggregatedBenchmarkDataMinimal);
		});

		it("should throw error on non-200 status", async () => {
			fetchMock.mockResolvedValueOnce({
				ok: false,
				status: 404,
				statusText: "Not Found",
			});

			await expect(fetchData()).rejects.toThrow("Failed to fetch benchmark data: 404 Not Found");
		});

		it("should throw error on 500 server error", async () => {
			fetchMock.mockResolvedValueOnce({
				ok: false,
				status: 500,
				statusText: "Internal Server Error",
			});

			await expect(fetchData()).rejects.toThrow("Failed to fetch benchmark data: 500 Internal Server Error");
		});

		it("should handle invalid JSON response", async () => {
			fetchMock.mockResolvedValueOnce({
				ok: true,
				status: 200,
				json: async () => {
					throw new SyntaxError("Unexpected token");
				},
			});

			await expect(fetchData()).rejects.toThrow("Failed to parse benchmark data JSON");
		});

		it("should validate schema and reject invalid data", async () => {
			const invalidData = {
				by_framework_mode: {},
				disk_sizes: {},
				metadata: {
					// Missing required fields
					total_results: 0,
				},
			};

			fetchMock.mockResolvedValueOnce({
				ok: true,
				status: 200,
				json: async () => invalidData,
			});

			await expect(fetchData()).rejects.toThrow("Benchmark data validation failed");
		});

		it("should detect and report schema validation errors", async () => {
			const invalidData = {
				by_framework_mode: {
					rust_single: {
						framework: "rust",
						mode: "invalid_mode" as any,
						cold_start: null,
						by_file_type: {},
					},
				},
				disk_sizes: {},
				metadata: {
					total_results: 100,
					framework_count: 1,
					file_type_count: 0,
					timestamp: "2024-01-01T00:00:00Z",
				},
			};

			fetchMock.mockResolvedValueOnce({
				ok: true,
				status: 200,
				json: async () => invalidData,
			});

			try {
				await fetchData();
				expect.fail("Should have thrown an error");
			} catch (error) {
				expect(error instanceof Error).toBe(true);
				if (error instanceof Error) {
					expect(error.message).toContain("validation failed");
				}
			}
		});

		it("should handle network errors gracefully", async () => {
			fetchMock.mockRejectedValueOnce(new Error("Failed to fetch"));

			await expect(fetchData()).rejects.toThrow();
		});

		it("should handle unexpected errors", async () => {
			fetchMock.mockRejectedValueOnce(new Error("Unexpected network error"));

			await expect(fetchData()).rejects.toThrow("Unexpected network error");
		});

		it("should preserve data structure integrity", async () => {
			const complexData: AggregatedBenchmarkData = {
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
									throughput: { p50: 150.5, p95: 200.3, p99: 250.8 },
									memory: { p50: 256.5, p95: 512.2, p99: 768.9 },
									duration: { p50: 10.5, p95: 25.3, p99: 50.8 },
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
						description: "Binary size",
					},
				},
				metadata: {
					total_results: 100,
					framework_count: 1,
					file_type_count: 1,
					timestamp: "2024-01-15T10:30:00Z",
				},
			};

			fetchMock.mockResolvedValueOnce({
				ok: true,
				status: 200,
				json: async () => complexData,
			});

			const result = await fetchData();

			expect(result.by_framework_mode.rust_single.framework).toBe("rust");
			expect(result.disk_sizes.rust_release.size_bytes).toBe(1024 * 1024 * 50);
			expect(result.metadata.timestamp).toBe("2024-01-15T10:30:00Z");
		});
	});

	describe("fetchMetadata", () => {
		it("should fetch metadata successfully", async () => {
			const mockMetadata = {
				updated_at: "2024-01-15T10:30:00Z",
				commit: "abc123def456",
				run_id: "run-12345",
				run_url: "https://github.com/runs/12345",
			};

			fetchMock.mockResolvedValueOnce({
				ok: true,
				status: 200,
				json: async () => mockMetadata,
			});

			const result = await fetchMetadata();

			expect(result).toEqual(mockMetadata);
			expect(fetchMock).toHaveBeenCalledWith(
				"./metadata.json",
				expect.objectContaining({
					signal: expect.any(AbortSignal),
				}),
			);
		});

		it("should return null on 404 Not Found", async () => {
			fetchMock.mockResolvedValueOnce({
				ok: false,
				status: 404,
				statusText: "Not Found",
			});

			const result = await fetchMetadata();

			expect(result).toBeNull();
		});

		it("should return null on network error", async () => {
			fetchMock.mockRejectedValueOnce(new TypeError("Failed to fetch"));

			const result = await fetchMetadata();

			expect(result).toBeNull();
		});

		it("should return null on timeout", async () => {
			fetchMock.mockRejectedValueOnce(new DOMException("The operation was aborted", "AbortError"));

			const result = await fetchMetadata();

			expect(result).toBeNull();
		});

		it("should return null on invalid JSON", async () => {
			fetchMock.mockResolvedValueOnce({
				ok: true,
				status: 200,
				json: async () => {
					throw new SyntaxError("Invalid JSON");
				},
			});

			const result = await fetchMetadata();

			expect(result).toBeNull();
		});

		it("should handle partial metadata gracefully", async () => {
			const partialMetadata = {
				updated_at: "2024-01-15T10:30:00Z",
			};

			fetchMock.mockResolvedValueOnce({
				ok: true,
				status: 200,
				json: async () => partialMetadata,
			});

			const result = await fetchMetadata();

			expect(result).toEqual(partialMetadata);
		});

		it("should handle complete metadata with all fields", async () => {
			const completeMetadata = {
				updated_at: "2024-01-15T10:30:00Z",
				commit: "abc123",
				run_id: "run-123",
				run_url: "https://github.com/runs/123",
			};

			fetchMock.mockResolvedValueOnce({
				ok: true,
				status: 200,
				json: async () => completeMetadata,
			});

			const result = await fetchMetadata();

			expect(result).toEqual(completeMetadata);
		});

		it("should return null on server error (500)", async () => {
			fetchMock.mockResolvedValueOnce({
				ok: false,
				status: 500,
				statusText: "Internal Server Error",
			});

			const result = await fetchMetadata();

			expect(result).toBeNull();
		});

		it("should handle empty metadata object", async () => {
			fetchMock.mockResolvedValueOnce({
				ok: true,
				status: 200,
				json: async () => ({}),
			});

			const result = await fetchMetadata();

			expect(result).toEqual({});
		});

		it("should preserve metadata field types", async () => {
			const typedMetadata = {
				updated_at: "2024-01-15T10:30:00Z",
				commit: "abc123",
				run_id: "run-456",
				run_url: "https://example.com/runs/456",
			};

			fetchMock.mockResolvedValueOnce({
				ok: true,
				status: 200,
				json: async () => typedMetadata,
			});

			const result = await fetchMetadata();

			expect(result?.updated_at).toBe("2024-01-15T10:30:00Z");
			expect(result?.commit).toBe("abc123");
			expect(result?.run_id).toBe("run-456");
			expect(result?.run_url).toBe("https://example.com/runs/456");
		});
	});

	describe("Error handling and edge cases", () => {
		it("should handle malformed error responses", async () => {
			fetchMock.mockResolvedValueOnce({
				ok: false,
				status: 500,
				statusText: "Internal Server Error",
				json: async () => {
					throw new Error("Cannot parse error response");
				},
			});

			await expect(fetchData()).rejects.toThrow();
		});
	});
});
