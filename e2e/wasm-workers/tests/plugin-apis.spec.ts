// Auto-generated from fixtures/plugin_api/ - DO NOT EDIT
/**
 * E2E tests for plugin/config/utility APIs.
 *
 * Generated from plugin API fixtures.
 * To regenerate: cargo run -p kreuzberg-e2e-generator -- generate --lang wasm-workers
 */

import {
	clearOcrBackends,
	clearPostProcessors,
	clearValidators,
	detectMimeFromBytes,
	getExtensionsForMime,
	listOcrBackends,
	listPostProcessors,
	listValidators,
	unregisterOcrBackend,
} from "@kreuzberg/wasm";
import { describe, expect, it } from "vitest";

describe("Configuration", () => {
	it.skip("Discover configuration from current or parent directories (not available in WASM)", () => {});

	it.skip("Load configuration from a TOML file (not available in WASM)", () => {});
});

describe("Document Extractor Management", () => {
	it.skip("Clear all document extractors and verify list is empty (not available in WASM)", () => {});

	it.skip("List all registered document extractors (not available in WASM)", () => {});

	it.skip("Unregister nonexistent document extractor gracefully (not available in WASM)", () => {});
});

describe("Mime Utilities", () => {
	it("Detect MIME type from file bytes", () => {
		const testData = new TextEncoder().encode("%PDF-1.4\\n");
		const result = detectMimeFromBytes(testData);
		expect(result.toLowerCase()).toContain("pdf");
	});

	it.skip("Detect MIME type from file path (not available in WASM)", () => {});

	it("Get file extensions for a MIME type", () => {
		const result = getExtensionsForMime("application/pdf");
		expect(Array.isArray(result)).toBe(true);
		expect(result).toContain("pdf");
	});
});

describe("Ocr Backend Management", () => {
	it("Clear all OCR backends and verify list is empty", () => {
		clearOcrBackends();
		const result = listOcrBackends();
		expect(result).toHaveLength(0);
	});

	it("List all registered OCR backends", () => {
		const result = listOcrBackends();
		expect(Array.isArray(result)).toBe(true);
		expect(result.every((item: unknown) => typeof item === "string")).toBe(true);
	});

	it("Unregister nonexistent OCR backend gracefully", () => {
		expect(() => unregisterOcrBackend("nonexistent-backend-xyz")).not.toThrow();
	});
});

describe("Post Processor Management", () => {
	it("Clear all post-processors and verify list is empty", () => {
		clearPostProcessors();
		const result = listPostProcessors();
		expect(result).toHaveLength(0);
	});

	it("List all registered post-processors", () => {
		const result = listPostProcessors();
		expect(Array.isArray(result)).toBe(true);
		expect(result.every((item: unknown) => typeof item === "string")).toBe(true);
	});
});

describe("Validator Management", () => {
	it("Clear all validators and verify list is empty", () => {
		clearValidators();
		const result = listValidators();
		expect(result).toHaveLength(0);
	});

	it("List all registered validators", () => {
		const result = listValidators();
		expect(Array.isArray(result)).toBe(true);
		expect(result.every((item: unknown) => typeof item === "string")).toBe(true);
	});
});
