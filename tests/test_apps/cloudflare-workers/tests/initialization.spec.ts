import { describe, it, expect } from "vitest";
import wasmModule from "@kreuzberg/wasm/kreuzberg_wasm_bg.wasm";
import { initWasm, isInitialized, getVersion } from "@kreuzberg/wasm";

describe("WASM Initialization in Cloudflare Workers", () => {
	it("should initialize the WASM module without errors", async () => {
		await initWasm({ wasmModule });
		expect(isInitialized()).toBe(true);
	});

	it("should return a version string after initialization", async () => {
		if (!isInitialized()) {
			await initWasm({ wasmModule });
		}
		const version = getVersion();
		expect(typeof version).toBe("string");
		expect(version.length).toBeGreaterThan(0);
	});

	it("should handle repeated initialization calls", async () => {
		await initWasm({ wasmModule });
		await initWasm({ wasmModule });
		expect(isInitialized()).toBe(true);
	});
});
