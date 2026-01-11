"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var guten_ocr_exports = {};
__export(guten_ocr_exports, {
  GutenOcrBackend: () => GutenOcrBackend
});
module.exports = __toCommonJS(guten_ocr_exports);
class GutenOcrBackend {
  ocr = null;
  ocrModule = null;
  options;
  /**
   * Create a new Guten OCR backend.
   *
   * @param options - Optional configuration for Guten OCR
   * @param options.models - Custom model paths (default: uses bundled models)
   * @param options.isDebug - Enable debug mode (default: false)
   * @param options.debugOutputDir - Directory for debug output (default: undefined)
   * @param options.onnxOptions - Custom ONNX Runtime options (default: undefined)
   *
   * @example
   * ```typescript
   * // Default configuration
   * const backend = new GutenOcrBackend();
   *
   * // With debug enabled
   * const debugBackend = new GutenOcrBackend({
   *   isDebug: true,
   *   debugOutputDir: './ocr_debug'
   * });
   * ```
   */
  constructor(options) {
    if (options !== void 0) {
      this.options = options;
    }
  }
  /**
   * Get the backend name.
   *
   * @returns Backend name ("guten-ocr")
   */
  name() {
    return "guten-ocr";
  }
  /**
   * Get list of supported language codes.
   *
   * Guten OCR supports multiple languages depending on the model configuration.
   * The default models support English and Chinese.
   *
   * @returns Array of ISO 639-1/2 language codes
   */
  supportedLanguages() {
    return ["en", "eng", "ch_sim", "ch_tra", "chinese"];
  }
  /**
   * Initialize the OCR backend.
   *
   * This method loads the Guten OCR module and creates an OCR instance.
   * Call this before using processImage().
   *
   * @throws {Error} If @gutenye/ocr-node is not installed
   * @throws {Error} If OCR initialization fails
   *
   * @example
   * ```typescript
   * const backend = new GutenOcrBackend();
   * await backend.initialize();
   * ```
   */
  async initialize() {
    if (this.ocr !== null) {
      return;
    }
    try {
      this.ocrModule = await import("@gutenye/ocr-node").then((m) => m.default || m);
    } catch (e) {
      const error = e;
      throw new Error(
        `Guten OCR support requires the '@gutenye/ocr-node' package. Install with: npm install @gutenye/ocr-node. Error: ${error.message}`
      );
    }
    try {
      this.ocr = await this.ocrModule?.create(this.options) ?? null;
    } catch (e) {
      const error = e;
      throw new Error(`Failed to initialize Guten OCR: ${error.message}`);
    }
  }
  /**
   * Shutdown the backend and release resources.
   *
   * This method cleans up all resources associated with the backend,
   * including the GutenOCR instance and module references.
   *
   * @example
   * ```typescript
   * const backend = new GutenOcrBackend();
   * await backend.initialize();
   * // ... use backend ...
   * await backend.shutdown();
   * ```
   */
  async shutdown() {
    if (this.ocr !== null) {
      this.ocr = null;
    }
    if (this.ocrModule !== null) {
      this.ocrModule = null;
    }
  }
  /**
   * Process image bytes and extract text using Guten OCR.
   *
   * This method:
   * 1. Decodes the image using sharp (if pixel data is needed) or passes bytes directly
   * 2. Runs OCR detection to find text regions
   * 3. Runs OCR recognition on each text region
   * 4. Returns extracted text with metadata
   *
   * @param imageBytes - Raw image data (PNG, JPEG, TIFF, etc.)
   * @param language - Language code (must be in supportedLanguages())
   * @returns Promise resolving to OCR result with content and metadata
   *
   * @throws {Error} If backend is not initialized
   * @throws {Error} If OCR processing fails
   *
   * @example
   * ```typescript
   * import { readFile } from 'fs/promises';
   *
   * const backend = new GutenOcrBackend();
   * await backend.initialize();
   *
   * const imageBytes = await readFile('scanned.png');
   * const result = await backend.processImage(imageBytes, 'en');
   * console.log(result.content);
   * console.log(result.metadata.confidence);
   * ```
   */
  async processImage(imageBytes, language) {
    if (this.ocr === null) {
      await this.initialize();
    }
    if (this.ocr === null) {
      throw new Error("Guten OCR backend failed to initialize");
    }
    try {
      const buffer = typeof imageBytes === "string" ? Buffer.from(imageBytes, "base64") : Buffer.from(imageBytes);
      const debugEnv = process.env["KREUZBERG_DEBUG_GUTEN"];
      if (debugEnv === "1") {
        const header = Array.from(buffer.subarray(0, 8));
        console.log("[Guten OCR] Debug input header:", header);
        console.log(
          "[Guten OCR] Buffer?",
          Buffer.isBuffer(buffer),
          "constructor",
          imageBytes?.constructor?.name,
          "length",
          buffer.length,
          "type",
          typeof imageBytes
        );
      }
      let width = 0;
      let height = 0;
      try {
        const sharpModule = await import("sharp");
        const sharp = sharpModule.default || sharpModule;
        const image = sharp(buffer);
        const metadata = await image.metadata();
        const metadataRecord = metadata;
        width = metadataRecord["width"] ?? 0;
        height = metadataRecord["height"] ?? 0;
      } catch (metadataError) {
        const error = metadataError;
        console.warn(`[Guten OCR] Unable to read image metadata via sharp: ${error.message}`);
      }
      const result = await this.ocr.detect(buffer);
      const textLines = result.map((line) => line.text);
      const content = textLines.join("\n");
      const avgConfidence = result.length > 0 ? result.reduce((sum, line) => sum + line.mean, 0) / result.length : 0;
      return {
        content,
        mime_type: "text/plain",
        metadata: {
          width,
          height,
          confidence: avgConfidence,
          text_regions: result.length,
          language
        },
        tables: []
      };
    } catch (e) {
      const error = e;
      throw new Error(`Guten OCR processing failed: ${error.message}`);
    }
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  GutenOcrBackend
});
//# sourceMappingURL=guten-ocr.js.map