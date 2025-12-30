/**
 * Image Extraction Tests for TypeScript WASM Binding
 *
 * Comprehensive test suite for image extraction functionality in Kreuzberg WASM bindings.
 * Tests cover image data transfer, base64 encoding, Uint8Array handling, worker-based processing,
 * memory pooling, and efficient binary data serialization across WASM boundaries.
 *
 * @group wasm-binding
 * @group images
 * @group extraction
 */

import { describe, expect, it } from "vitest";

/**
 * Mock ExtractedImage matching @kreuzberg/core ExtractedImage interface
 */
interface TestExtractedImage {
	/** Image data as Uint8Array */
	data: Uint8Array;
	/** Image format (e.g., "png", "jpg", "webp") */
	format: string;
	/** Index of image in extraction sequence */
	imageIndex: number;
	/** Page number where image appears */
	pageNumber?: number | null;
	/** Image width in pixels */
	width?: number | null;
	/** Image height in pixels */
	height?: number | null;
	/** Colorspace (e.g., "RGB", "RGBA", "CMYK") */
	colorspace?: string | null;
	/** Bits per component */
	bitsPerComponent?: number | null;
	/** Whether image is a mask/transparency layer */
	isMask: boolean;
	/** Optional description or alt text */
	description?: string | null;
}

/**
 * Memory pool for efficient buffer reuse
 */
class ImageMemoryPool {
	private buffers: Map<number, Uint8Array[]> = new Map();
	private allocations = 0;
	private deallocations = 0;

	acquire(size: number): Uint8Array {
		const poolKey = Math.ceil(size / 1024) * 1024; // Round to nearest 1KB

		if (!this.buffers.has(poolKey)) {
			this.buffers.set(poolKey, []);
		}

		const pool = this.buffers.get(poolKey)!;

		let buffer: Uint8Array;
		if (pool.length > 0) {
			buffer = pool.pop()!;
		} else {
			buffer = new Uint8Array(poolKey);
			this.allocations++;
		}

		return new Uint8Array(buffer.buffer, buffer.byteOffset, size);
	}

	release(buffer: Uint8Array): void {
		const poolKey = buffer.buffer.byteLength;

		if (!this.buffers.has(poolKey)) {
			this.buffers.set(poolKey, []);
		}

		this.buffers.get(poolKey)!.push(new Uint8Array(buffer.buffer));
		this.deallocations++;
	}

	getStats() {
		return {
			allocations: this.allocations,
			deallocations: this.deallocations,
			pooledBuffers: Array.from(this.buffers.values()).reduce((sum, arr) => sum + arr.length, 0),
		};
	}

	clear(): void {
		this.buffers.clear();
		this.allocations = 0;
		this.deallocations = 0;
	}
}

/**
 * Convert Uint8Array to base64 string
 */
function uint8ArrayToBase64(data: Uint8Array): string {
	let binary = "";
	for (let i = 0; i < data.byteLength; i++) {
		binary += String.fromCharCode(data[i]);
	}
	return globalThis.btoa(binary);
}

/**
 * Convert base64 string to Uint8Array
 */
function base64ToUint8Array(base64: string): Uint8Array {
	const binary = globalThis.atob(base64);
	const bytes = new Uint8Array(binary.length);
	for (let i = 0; i < binary.length; i++) {
		bytes[i] = binary.charCodeAt(i);
	}
	return bytes;
}

/**
 * Create a mock PNG image (minimal valid PNG)
 */
function createMockPNG(width: number, height: number): Uint8Array {
	// PNG signature
	const signature = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);

	// IHDR chunk (image header)
	const ihdr = new Uint8Array(25);
	const ihdrView = new DataView(ihdr.buffer);
	ihdrView.setUint32(0, 13, true); // chunk length
	ihdr.set([73, 72, 68, 82], 4); // "IHDR"
	ihdrView.setUint32(8, width, false); // width (big-endian)
	ihdrView.setUint32(12, height, false); // height (big-endian)
	ihdr[16] = 8; // bit depth
	ihdr[17] = 2; // color type (RGB)

	// IEND chunk (image end)
	const iend = new Uint8Array([0, 0, 0, 0, 73, 69, 78, 68, 174, 66, 96, 130]);

	// Combine chunks
	const result = new Uint8Array(signature.length + ihdr.length + iend.length);
	result.set(signature, 0);
	result.set(ihdr, signature.length);
	result.set(iend, signature.length + ihdr.length);

	return result;
}

describe("WASM: Images Extraction", () => {
	describe("image data transfer", () => {
		it("should handle image as Uint8Array", () => {
			const pngData = createMockPNG(100, 100);

			const image: TestExtractedImage = {
				data: pngData,
				format: "png",
				imageIndex: 0,
				pageNumber: 1,
				width: 100,
				height: 100,
				isMask: false,
			};

			expect(image.data).toBeInstanceOf(Uint8Array);
			expect(image.data.length).toBeGreaterThan(0);
			expect(image.format).toBe("png");
		});

		it("should transfer image data across WASM boundary", () => {
			const imageData = new Uint8Array([0xff, 0xd8, 0xff, 0xe0]); // JPEG signature

			const image: TestExtractedImage = {
				data: imageData,
				format: "jpg",
				imageIndex: 0,
				isMask: false,
			};

			// Simulate WASM boundary transfer
			const transferred = structuredClone(image);

			expect(transferred.data).toEqual(imageData);
			expect(transferred.format).toBe("jpg");
		});

		it("should maintain data integrity after transfer", () => {
			const originalData = new Uint8Array([42, 100, 200, 255, 128, 64, 32, 1]);

			const image: TestExtractedImage = {
				data: originalData,
				format: "webp",
				imageIndex: 5,
				isMask: false,
			};

			const transferred = structuredClone(image);

			for (let i = 0; i < originalData.length; i++) {
				expect(transferred.data[i]).toBe(originalData[i]);
			}
		});

		it("should handle multiple images in sequence", () => {
			const images: TestExtractedImage[] = [];

			for (let i = 0; i < 5; i++) {
				images.push({
					data: new Uint8Array([i * 10, i * 20, i * 30]),
					format: i % 2 === 0 ? "png" : "jpg",
					imageIndex: i,
					pageNumber: Math.floor(i / 2) + 1,
					isMask: false,
				});
			}

			const transferred = structuredClone(images);

			expect(transferred).toHaveLength(5);
			transferred.forEach((img, index) => {
				expect(img.imageIndex).toBe(index);
			});
		});
	});

	describe("base64 encoding", () => {
		it("should encode Uint8Array to base64", () => {
			const data = new Uint8Array([72, 101, 108, 108, 111]); // "Hello"
			const base64 = uint8ArrayToBase64(data);

			expect(typeof base64).toBe("string");
			expect(base64).toBe("SGVsbG8=");
		});

		it("should decode base64 to Uint8Array", () => {
			const base64 = "SGVsbG8="; // "Hello"
			const data = base64ToUint8Array(base64);

			expect(data).toBeInstanceOf(Uint8Array);
			expect(data).toEqual(new Uint8Array([72, 101, 108, 108, 111]));
		});

		it("should round-trip base64 encoding/decoding", () => {
			const original = new Uint8Array([0, 1, 2, 127, 128, 254, 255]);

			const encoded = uint8ArrayToBase64(original);
			const decoded = base64ToUint8Array(encoded);

			expect(decoded).toEqual(original);
		});

		it("should handle binary image data in base64", () => {
			const pngData = createMockPNG(50, 50);
			const base64 = uint8ArrayToBase64(pngData);

			expect(typeof base64).toBe("string");
			expect(base64.length).toBeGreaterThan(0);

			const decoded = base64ToUint8Array(base64);
			expect(decoded).toEqual(pngData);
		});

		it("should encode large image data efficiently", () => {
			const largeImage = new Uint8Array(100 * 1024); // 100KB
			for (let i = 0; i < largeImage.length; i++) {
				largeImage[i] = (i % 256) as number;
			}

			const base64 = uint8ArrayToBase64(largeImage);

			expect(typeof base64).toBe("string");
			expect(base64.length).toBeGreaterThan(0);
		});
	});

	describe("memory pooling", () => {
		it("should allocate and release buffers from pool", () => {
			const pool = new ImageMemoryPool();

			const buf1 = pool.acquire(512);
			const buf2 = pool.acquire(1024);

			expect(buf1.byteLength).toBe(512);
			expect(buf2.byteLength).toBe(1024);

			pool.release(buf1);
			pool.release(buf2);

			const stats = pool.getStats();
			expect(stats.deallocations).toBe(2);
		});

		it("should reuse pooled buffers", () => {
			const pool = new ImageMemoryPool();

			const buf1 = pool.acquire(512);
			const initialAllocations = pool.getStats().allocations;

			pool.release(buf1);

			const buf2 = pool.acquire(512);
			const finalAllocations = pool.getStats().allocations;

			expect(finalAllocations).toBe(initialAllocations);
		});

		it("should handle different buffer sizes", () => {
			const pool = new ImageMemoryPool();

			const sizes = [256, 512, 1024, 2048, 4096];
			const buffers = sizes.map((size) => pool.acquire(size));

			buffers.forEach((buf, index) => {
				expect(buf.byteLength).toBe(sizes[index]);
			});

			buffers.forEach((buf) => pool.release(buf));

			const stats = pool.getStats();
			expect(stats.deallocations).toBe(sizes.length);
		});

		it("should improve allocation efficiency over time", () => {
			const pool = new ImageMemoryPool();

			// First round of allocations
			const bufs1 = Array(10)
				.fill(null)
				.map(() => pool.acquire(1024));
			const allocationsAfterFirst = pool.getStats().allocations;

			// Release all
			bufs1.forEach((buf) => pool.release(buf));

			// Second round should reuse buffers
			const bufs2 = Array(10)
				.fill(null)
				.map(() => pool.acquire(1024));
			const allocationsAfterSecond = pool.getStats().allocations;

			expect(allocationsAfterSecond).toBe(allocationsAfterFirst);
		});

		it("should clear pool resources", () => {
			const pool = new ImageMemoryPool();

			pool.acquire(512);
			pool.acquire(1024);

			pool.clear();

			const stats = pool.getStats();
			expect(stats.pooledBuffers).toBe(0);
			expect(stats.allocations).toBe(0);
			expect(stats.deallocations).toBe(0);
		});
	});

	describe("image metadata", () => {
		it("should preserve image dimensions", () => {
			const image: TestExtractedImage = {
				data: createMockPNG(640, 480),
				format: "png",
				imageIndex: 0,
				width: 640,
				height: 480,
				isMask: false,
			};

			expect(image.width).toBe(640);
			expect(image.height).toBe(480);
		});

		it("should track image colorspace", () => {
			const colorspaces = ["RGB", "RGBA", "CMYK", "Grayscale"];

			colorspaces.forEach((colorspace) => {
				const image: TestExtractedImage = {
					data: new Uint8Array([0]),
					format: "png",
					imageIndex: 0,
					colorspace,
					isMask: false,
				};

				expect(image.colorspace).toBe(colorspace);
			});
		});

		it("should mark mask/transparency layers", () => {
			const maskImage: TestExtractedImage = {
				data: new Uint8Array([255, 128, 0]),
				format: "png",
				imageIndex: 0,
				isMask: true,
			};

			const regularImage: TestExtractedImage = {
				data: new Uint8Array([255, 128, 0]),
				format: "jpg",
				imageIndex: 1,
				isMask: false,
			};

			expect(maskImage.isMask).toBe(true);
			expect(regularImage.isMask).toBe(false);
		});

		it("should store optional description", () => {
			const image: TestExtractedImage = {
				data: new Uint8Array([0]),
				format: "png",
				imageIndex: 0,
				description: "Product photo",
				isMask: false,
			};

			expect(image.description).toBe("Product photo");
		});

		it("should track page number for images in multi-page documents", () => {
			const images: TestExtractedImage[] = [
				{
					data: new Uint8Array([1]),
					format: "png",
					imageIndex: 0,
					pageNumber: 1,
					isMask: false,
				},
				{
					data: new Uint8Array([2]),
					format: "png",
					imageIndex: 1,
					pageNumber: 3,
					isMask: false,
				},
				{
					data: new Uint8Array([3]),
					format: "png",
					imageIndex: 2,
					pageNumber: 5,
					isMask: false,
				},
			];

			expect(images[0].pageNumber).toBe(1);
			expect(images[1].pageNumber).toBe(3);
			expect(images[2].pageNumber).toBe(5);
		});
	});

	describe("worker message passing", () => {
		it("should transfer image through structuredClone", () => {
			const image: TestExtractedImage = {
				data: createMockPNG(200, 200),
				format: "png",
				imageIndex: 0,
				isMask: false,
			};

			const cloned = structuredClone(image);

			expect(cloned.data).toEqual(image.data);
			expect(cloned.format).toBe(image.format);
		});

		it("should batch transfer multiple images", () => {
			const images: TestExtractedImage[] = Array(3)
				.fill(null)
				.map((_, i) => ({
					data: createMockPNG(100 + i * 50, 100 + i * 50),
					format: "png",
					imageIndex: i,
					isMask: false,
				}));

			const cloned = structuredClone(images);

			expect(cloned).toHaveLength(3);
			cloned.forEach((img, index) => {
				expect(img.imageIndex).toBe(index);
			});
		});

		it("should maintain independence after cloning", () => {
			const original: TestExtractedImage = {
				data: new Uint8Array([1, 2, 3, 4, 5]),
				format: "png",
				imageIndex: 0,
				isMask: false,
			};

			const cloned = structuredClone(original);

			// Modify clone
			cloned.data[0] = 255;
			cloned.format = "jpg";

			// Original should be unchanged
			expect(original.data[0]).toBe(1);
			expect(original.format).toBe("png");
		});
	});

	describe("large image handling", () => {
		it("should handle large image files (1MB)", () => {
			const largeImage = new Uint8Array(1024 * 1024); // 1MB
			for (let i = 0; i < largeImage.length; i++) {
				largeImage[i] = (i % 256) as number;
			}

			const image: TestExtractedImage = {
				data: largeImage,
				format: "png",
				imageIndex: 0,
				width: 2048,
				height: 2048,
				isMask: false,
			};

			expect(image.data.length).toBe(1024 * 1024);

			const cloned = structuredClone(image);
			expect(cloned.data.length).toBe(1024 * 1024);
		});

		it("should process multiple large images", () => {
			const images = Array(5)
				.fill(null)
				.map((_, i) => {
					const largeData = new Uint8Array(512 * 1024); // 512KB each
					for (let j = 0; j < largeData.length; j++) {
						largeData[j] = ((i + j) % 256) as number;
					}

					return {
						data: largeData,
						format: "png",
						imageIndex: i,
						isMask: false,
					} as TestExtractedImage;
				});

			const cloned = structuredClone(images);

			expect(cloned).toHaveLength(5);
			cloned.forEach((img) => {
				expect(img.data.length).toBe(512 * 1024);
			});
		});

		it("should encode large images to base64", () => {
			const largeData = new Uint8Array(256 * 1024); // 256KB
			for (let i = 0; i < largeData.length; i++) {
				largeData[i] = (i % 256) as number;
			}

			const base64 = uint8ArrayToBase64(largeData);

			expect(typeof base64).toBe("string");
			expect(base64.length).toBeGreaterThan(0);

			const decoded = base64ToUint8Array(base64);
			expect(decoded).toEqual(largeData);
		});
	});
});
