"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
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
var __reExport = (target, mod, secondTarget) => (__copyProps(target, mod, "default"), secondTarget && __copyProps(secondTarget, mod, "default"));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var index_exports = {};
__export(index_exports, {
  CacheError: () => import_errors.CacheError,
  ErrorCode: () => import_errors.ErrorCode,
  ExtractionConfig: () => ExtractionConfig,
  GutenOcrBackend: () => import_guten_ocr.GutenOcrBackend,
  ImageProcessingError: () => import_errors.ImageProcessingError,
  KreuzbergError: () => import_errors.KreuzbergError,
  MissingDependencyError: () => import_errors.MissingDependencyError,
  OcrError: () => import_errors.OcrError,
  ParsingError: () => import_errors.ParsingError,
  PluginError: () => import_errors.PluginError,
  ValidationError: () => import_errors.ValidationError,
  __resetBindingForTests: () => __resetBindingForTests,
  __setBindingForTests: () => __setBindingForTests,
  __version__: () => __version__,
  batchExtractBytes: () => batchExtractBytes,
  batchExtractBytesSync: () => batchExtractBytesSync,
  batchExtractFiles: () => batchExtractFiles,
  batchExtractFilesInWorker: () => batchExtractFilesInWorker,
  batchExtractFilesSync: () => batchExtractFilesSync,
  classifyError: () => classifyError,
  clearDocumentExtractors: () => clearDocumentExtractors,
  clearOcrBackends: () => clearOcrBackends,
  clearPostProcessors: () => clearPostProcessors,
  clearValidators: () => clearValidators,
  closeWorkerPool: () => closeWorkerPool,
  createWorkerPool: () => createWorkerPool,
  detectMimeType: () => detectMimeType,
  detectMimeTypeFromPath: () => detectMimeTypeFromPath,
  extractBytes: () => extractBytes,
  extractBytesSync: () => extractBytesSync,
  extractFile: () => extractFile,
  extractFileInWorker: () => extractFileInWorker,
  extractFileSync: () => extractFileSync,
  getEmbeddingPreset: () => getEmbeddingPreset,
  getErrorCodeDescription: () => getErrorCodeDescription,
  getErrorCodeName: () => getErrorCodeName,
  getExtensionsForMime: () => getExtensionsForMime,
  getLastErrorCode: () => getLastErrorCode,
  getLastPanicContext: () => getLastPanicContext,
  getWorkerPoolStats: () => getWorkerPoolStats,
  listDocumentExtractors: () => listDocumentExtractors,
  listEmbeddingPresets: () => listEmbeddingPresets,
  listOcrBackends: () => listOcrBackends,
  listPostProcessors: () => listPostProcessors,
  listValidators: () => listValidators,
  registerOcrBackend: () => registerOcrBackend,
  registerPostProcessor: () => registerPostProcessor,
  registerValidator: () => registerValidator,
  unregisterDocumentExtractor: () => unregisterDocumentExtractor,
  unregisterOcrBackend: () => unregisterOcrBackend,
  unregisterPostProcessor: () => unregisterPostProcessor,
  unregisterValidator: () => unregisterValidator,
  validateMimeType: () => validateMimeType
});
module.exports = __toCommonJS(index_exports);
var import_node_fs = require("node:fs");
var import_node_module = require("node:module");
var import_errors = require("./errors.js");
var import_guten_ocr = require("./ocr/guten-ocr.js");
__reExport(index_exports, require("./types.js"), module.exports);
const import_meta = {};
let binding = null;
let bindingInitialized = false;
function createNativeBindingError(error) {
  const hintParts = [];
  let detail = "Unknown error while requiring native module.";
  if (error instanceof Error) {
    detail = error.message || error.toString();
    if (/pdfium/i.test(detail)) {
      hintParts.push(
        "Pdfium runtime library was not found. Ensure the bundled libpdfium (dll/dylib/so) is present next to the native module."
      );
    }
    return new Error(
      [
        "Failed to load Kreuzberg native bindings.",
        hintParts.length ? hintParts.join(" ") : "",
        "Report this error and attach the logs/stack trace for investigation.",
        `Underlying error: ${detail}`
      ].filter(Boolean).join(" "),
      { cause: error }
    );
  }
  return new Error(
    [
      "Failed to load Kreuzberg native bindings.",
      "Report this error and attach the logs/stack trace for investigation.",
      `Underlying error: ${String(error)}`
    ].join(" ")
  );
}
function assertUint8Array(value, name) {
  if (!(value instanceof Uint8Array)) {
    throw new TypeError(`${name} must be a Uint8Array`);
  }
  return value;
}
function assertUint8ArrayList(values, name) {
  if (!Array.isArray(values)) {
    throw new TypeError(`${name} must be an array of Uint8Array`);
  }
  const array = values;
  return array.map((value, index) => {
    try {
      return assertUint8Array(value, `${name}[${index}]`);
    } catch {
      throw new TypeError(`${name}[${index}] must be a Uint8Array`);
    }
  });
}
function __setBindingForTests(mock) {
  binding = mock;
  bindingInitialized = true;
}
function __resetBindingForTests() {
  binding = null;
  bindingInitialized = false;
}
function loadNativeBinding() {
  let localRequire;
  if (typeof require !== "undefined") {
    localRequire = require;
  } else {
    try {
      localRequire = (0, import_node_module.createRequire)(import_meta.url);
    } catch {
      localRequire = void 0;
    }
  }
  if (!localRequire) {
    throw new Error("Unable to resolve native binding loader (require not available).");
  }
  const loadedModule = localRequire("../index.js");
  if (typeof loadedModule !== "object" || loadedModule === null) {
    throw new Error(
      "Native binding is not a valid object. Ensure the native module is properly built and compatible."
    );
  }
  const module2 = loadedModule;
  const requiredMethods = [
    "extractFileSync",
    "extractFile",
    "extractBytesSync",
    "extractBytes",
    "batchExtractFilesSync",
    "batchExtractFiles",
    "batchExtractBytesSync",
    "batchExtractBytes"
  ];
  for (const method of requiredMethods) {
    if (typeof module2[method] !== "function") {
      throw new Error(
        `Native binding is missing required method: ${method}. Ensure the native module is properly built and compatible.`
      );
    }
  }
  return module2;
}
function getBinding() {
  if (bindingInitialized) {
    if (binding === null) {
      throw new Error("Native binding was previously failed to load.");
    }
    return binding;
  }
  try {
    if (typeof process !== "undefined" && process.versions && process.versions.node) {
      binding = loadNativeBinding();
      bindingInitialized = true;
      return binding;
    }
  } catch (error) {
    bindingInitialized = true;
    throw createNativeBindingError(error);
  }
  throw new Error(
    "Failed to load Kreuzberg bindings. Neither NAPI (Node.js) nor WASM (browsers/Deno) bindings are available. Make sure you have installed the @kreuzberg/node package for Node.js/Bun."
  );
}
function parseMetadata(metadataStr) {
  try {
    const parsed = JSON.parse(metadataStr);
    if (typeof parsed === "object" && parsed !== null) {
      return parsed;
    }
    return {};
  } catch {
    return {};
  }
}
function ensureUint8Array(value) {
  if (value instanceof Uint8Array) {
    return value;
  }
  if (typeof Buffer !== "undefined" && value instanceof Buffer) {
    return new Uint8Array(value);
  }
  if (Array.isArray(value)) {
    return new Uint8Array(value);
  }
  return new Uint8Array();
}
function convertChunk(rawChunk) {
  if (!rawChunk || typeof rawChunk !== "object") {
    return {
      content: "",
      metadata: {
        byteStart: 0,
        byteEnd: 0,
        tokenCount: null,
        chunkIndex: 0,
        totalChunks: 0
      },
      embedding: null
    };
  }
  const chunk = rawChunk;
  const metadata = chunk["metadata"] ?? {};
  return {
    // biome-ignore lint/complexity/useLiteralKeys: required for strict TypeScript noPropertyAccessFromIndexSignature
    content: chunk["content"] ?? "",
    // biome-ignore lint/complexity/useLiteralKeys: required for strict TypeScript noPropertyAccessFromIndexSignature
    embedding: chunk["embedding"] ?? null,
    metadata: {
      // biome-ignore lint/complexity/useLiteralKeys: required for strict TypeScript noPropertyAccessFromIndexSignature
      byteStart: metadata["byte_start"] ?? metadata["charStart"] ?? 0,
      // biome-ignore lint/complexity/useLiteralKeys: required for strict TypeScript noPropertyAccessFromIndexSignature
      byteEnd: metadata["byte_end"] ?? metadata["charEnd"] ?? 0,
      // biome-ignore lint/complexity/useLiteralKeys: required for strict TypeScript noPropertyAccessFromIndexSignature
      tokenCount: metadata["token_count"] ?? metadata["tokenCount"] ?? null,
      // biome-ignore lint/complexity/useLiteralKeys: required for strict TypeScript noPropertyAccessFromIndexSignature
      chunkIndex: metadata["chunk_index"] ?? metadata["chunkIndex"] ?? 0,
      // biome-ignore lint/complexity/useLiteralKeys: required for strict TypeScript noPropertyAccessFromIndexSignature
      totalChunks: metadata["total_chunks"] ?? metadata["totalChunks"] ?? 0,
      // biome-ignore lint/complexity/useLiteralKeys: required for strict TypeScript noPropertyAccessFromIndexSignature
      firstPage: metadata["first_page"] ?? metadata["firstPage"] ?? null,
      // biome-ignore lint/complexity/useLiteralKeys: required for strict TypeScript noPropertyAccessFromIndexSignature
      lastPage: metadata["last_page"] ?? metadata["lastPage"] ?? null
    }
  };
}
function convertImage(rawImage) {
  if (!rawImage || typeof rawImage !== "object") {
    return {
      data: new Uint8Array(),
      format: "unknown",
      imageIndex: 0,
      pageNumber: null,
      width: null,
      height: null,
      colorspace: null,
      bitsPerComponent: null,
      isMask: false,
      description: null,
      ocrResult: null
    };
  }
  const image = rawImage;
  return {
    // biome-ignore lint/complexity/useLiteralKeys: required for strict TypeScript noPropertyAccessFromIndexSignature
    data: ensureUint8Array(image["data"]),
    // biome-ignore lint/complexity/useLiteralKeys: required for strict TypeScript noPropertyAccessFromIndexSignature
    format: image["format"] ?? "unknown",
    // biome-ignore lint/complexity/useLiteralKeys: required for strict TypeScript noPropertyAccessFromIndexSignature
    imageIndex: image["imageIndex"] ?? 0,
    // biome-ignore lint/complexity/useLiteralKeys: required for strict TypeScript noPropertyAccessFromIndexSignature
    pageNumber: image["pageNumber"] ?? null,
    // biome-ignore lint/complexity/useLiteralKeys: required for strict TypeScript noPropertyAccessFromIndexSignature
    width: image["width"] ?? null,
    // biome-ignore lint/complexity/useLiteralKeys: required for strict TypeScript noPropertyAccessFromIndexSignature
    height: image["height"] ?? null,
    // biome-ignore lint/complexity/useLiteralKeys: required for strict TypeScript noPropertyAccessFromIndexSignature
    colorspace: image["colorspace"] ?? null,
    // biome-ignore lint/complexity/useLiteralKeys: required for strict TypeScript noPropertyAccessFromIndexSignature
    bitsPerComponent: image["bitsPerComponent"] ?? null,
    // biome-ignore lint/complexity/useLiteralKeys: required for strict TypeScript noPropertyAccessFromIndexSignature
    isMask: image["isMask"] ?? false,
    // biome-ignore lint/complexity/useLiteralKeys: required for strict TypeScript noPropertyAccessFromIndexSignature
    description: image["description"] ?? null,
    // biome-ignore lint/complexity/useLiteralKeys: required for strict TypeScript noPropertyAccessFromIndexSignature
    ocrResult: image["ocrResult"] ? convertResult(image["ocrResult"]) : null
  };
}
function convertPageContent(rawPage) {
  if (!rawPage || typeof rawPage !== "object") {
    return {
      pageNumber: 0,
      content: "",
      tables: [],
      images: []
    };
  }
  const page = rawPage;
  return {
    // biome-ignore lint/complexity/useLiteralKeys: required for strict TypeScript noPropertyAccessFromIndexSignature
    pageNumber: page["pageNumber"] ?? 0,
    // biome-ignore lint/complexity/useLiteralKeys: required for strict TypeScript noPropertyAccessFromIndexSignature
    content: page["content"] ?? "",
    // biome-ignore lint/complexity/useLiteralKeys: required for strict TypeScript noPropertyAccessFromIndexSignature
    tables: Array.isArray(page["tables"]) ? page["tables"] : [],
    // biome-ignore lint/complexity/useLiteralKeys: required for strict TypeScript noPropertyAccessFromIndexSignature
    images: Array.isArray(page["images"]) ? page["images"].map((image) => convertImage(image)) : []
  };
}
function convertResult(rawResult) {
  if (!rawResult || typeof rawResult !== "object") {
    return {
      content: "",
      mimeType: "application/octet-stream",
      metadata: {},
      tables: [],
      detectedLanguages: null,
      chunks: null,
      images: null,
      pages: null
    };
  }
  const result = rawResult;
  const metadata = result["metadata"];
  const metadataValue = typeof metadata === "string" ? parseMetadata(metadata) : metadata ?? {};
  const returnObj = {
    // biome-ignore lint/complexity/useLiteralKeys: required for strict TypeScript noPropertyAccessFromIndexSignature
    content: result["content"] ?? "",
    // biome-ignore lint/complexity/useLiteralKeys: required for strict TypeScript noPropertyAccessFromIndexSignature
    mimeType: result["mimeType"] ?? "application/octet-stream",
    metadata: metadataValue,
    // biome-ignore lint/complexity/useLiteralKeys: required for strict TypeScript noPropertyAccessFromIndexSignature
    tables: Array.isArray(result["tables"]) ? result["tables"] : [],
    // biome-ignore lint/complexity/useLiteralKeys: required for strict TypeScript noPropertyAccessFromIndexSignature
    detectedLanguages: Array.isArray(result["detectedLanguages"]) ? result["detectedLanguages"] : null,
    chunks: null,
    images: null,
    pages: null
  };
  const chunksData = result["chunks"];
  if (Array.isArray(chunksData)) {
    returnObj.chunks = chunksData.map((chunk) => convertChunk(chunk));
  }
  const imagesData = result["images"];
  if (Array.isArray(imagesData)) {
    returnObj.images = imagesData.map((image) => convertImage(image));
  }
  const pagesData = result["pages"];
  if (Array.isArray(pagesData)) {
    returnObj.pages = pagesData.map((page) => convertPageContent(page));
  }
  return returnObj;
}
function setIfDefined(target, key, value) {
  if (value !== void 0) {
    target[key] = value;
  }
}
function normalizeTesseractConfig(config) {
  if (!config) {
    return void 0;
  }
  const normalized = {};
  setIfDefined(normalized, "psm", config.psm);
  setIfDefined(normalized, "enableTableDetection", config.enableTableDetection);
  setIfDefined(normalized, "tesseditCharWhitelist", config.tesseditCharWhitelist);
  return normalized;
}
function normalizeOcrConfig(ocr) {
  if (!ocr) {
    return void 0;
  }
  const normalized = {
    backend: ocr.backend
  };
  setIfDefined(normalized, "language", ocr.language);
  const tesseract = normalizeTesseractConfig(ocr.tesseractConfig);
  if (tesseract) {
    setIfDefined(normalized, "tesseractConfig", tesseract);
  }
  return normalized;
}
function normalizeChunkingConfig(chunking) {
  if (!chunking) {
    return void 0;
  }
  const normalized = {};
  setIfDefined(normalized, "maxChars", chunking.maxChars);
  setIfDefined(normalized, "maxOverlap", chunking.maxOverlap);
  setIfDefined(normalized, "preset", chunking.preset);
  setIfDefined(normalized, "embedding", chunking.embedding);
  setIfDefined(normalized, "enabled", chunking.enabled);
  return normalized;
}
function normalizeImageExtractionConfig(images) {
  if (!images) {
    return void 0;
  }
  const normalized = {};
  setIfDefined(normalized, "extractImages", images.extractImages);
  setIfDefined(normalized, "targetDpi", images.targetDpi);
  setIfDefined(normalized, "maxImageDimension", images.maxImageDimension);
  setIfDefined(normalized, "autoAdjustDpi", images.autoAdjustDpi);
  setIfDefined(normalized, "minDpi", images.minDpi);
  setIfDefined(normalized, "maxDpi", images.maxDpi);
  return normalized;
}
function normalizePdfConfig(pdf) {
  if (!pdf) {
    return void 0;
  }
  const normalized = {};
  setIfDefined(normalized, "extractImages", pdf.extractImages);
  setIfDefined(normalized, "passwords", pdf.passwords);
  setIfDefined(normalized, "extractMetadata", pdf.extractMetadata);
  return normalized;
}
function normalizeTokenReductionConfig(tokenReduction) {
  if (!tokenReduction) {
    return void 0;
  }
  const normalized = {};
  setIfDefined(normalized, "mode", tokenReduction.mode);
  setIfDefined(normalized, "preserveImportantWords", tokenReduction.preserveImportantWords);
  return normalized;
}
function normalizeLanguageDetectionConfig(languageDetection) {
  if (!languageDetection) {
    return void 0;
  }
  const normalized = {};
  setIfDefined(normalized, "enabled", languageDetection.enabled);
  setIfDefined(normalized, "minConfidence", languageDetection.minConfidence);
  setIfDefined(normalized, "detectMultiple", languageDetection.detectMultiple);
  return normalized;
}
function normalizePostProcessorConfig(postprocessor) {
  if (!postprocessor) {
    return void 0;
  }
  const normalized = {};
  setIfDefined(normalized, "enabled", postprocessor.enabled);
  setIfDefined(normalized, "enabledProcessors", postprocessor.enabledProcessors);
  setIfDefined(normalized, "disabledProcessors", postprocessor.disabledProcessors);
  return normalized;
}
function normalizeHtmlPreprocessing(options) {
  if (!options) {
    return void 0;
  }
  const normalized = {};
  setIfDefined(normalized, "enabled", options.enabled);
  setIfDefined(normalized, "preset", options.preset);
  setIfDefined(normalized, "removeNavigation", options.removeNavigation);
  setIfDefined(normalized, "removeForms", options.removeForms);
  return normalized;
}
function normalizeHtmlOptions(options) {
  if (!options) {
    return void 0;
  }
  const normalized = {};
  setIfDefined(normalized, "headingStyle", options.headingStyle);
  setIfDefined(normalized, "listIndentType", options.listIndentType);
  setIfDefined(normalized, "listIndentWidth", options.listIndentWidth);
  setIfDefined(normalized, "bullets", options.bullets);
  setIfDefined(normalized, "strongEmSymbol", options.strongEmSymbol);
  setIfDefined(normalized, "escapeAsterisks", options.escapeAsterisks);
  setIfDefined(normalized, "escapeUnderscores", options.escapeUnderscores);
  setIfDefined(normalized, "escapeMisc", options.escapeMisc);
  setIfDefined(normalized, "escapeAscii", options.escapeAscii);
  setIfDefined(normalized, "codeLanguage", options.codeLanguage);
  setIfDefined(normalized, "autolinks", options.autolinks);
  setIfDefined(normalized, "defaultTitle", options.defaultTitle);
  setIfDefined(normalized, "brInTables", options.brInTables);
  setIfDefined(normalized, "hocrSpatialTables", options.hocrSpatialTables);
  setIfDefined(normalized, "highlightStyle", options.highlightStyle);
  setIfDefined(normalized, "extractMetadata", options.extractMetadata);
  setIfDefined(normalized, "whitespaceMode", options.whitespaceMode);
  setIfDefined(normalized, "stripNewlines", options.stripNewlines);
  setIfDefined(normalized, "wrap", options.wrap);
  setIfDefined(normalized, "wrapWidth", options.wrapWidth);
  setIfDefined(normalized, "convertAsInline", options.convertAsInline);
  setIfDefined(normalized, "subSymbol", options.subSymbol);
  setIfDefined(normalized, "supSymbol", options.supSymbol);
  setIfDefined(normalized, "newlineStyle", options.newlineStyle);
  setIfDefined(normalized, "codeBlockStyle", options.codeBlockStyle);
  setIfDefined(normalized, "keepInlineImagesIn", options.keepInlineImagesIn);
  setIfDefined(normalized, "encoding", options.encoding);
  setIfDefined(normalized, "debug", options.debug);
  setIfDefined(normalized, "stripTags", options.stripTags);
  setIfDefined(normalized, "preserveTags", options.preserveTags);
  const preprocessing = normalizeHtmlPreprocessing(options.preprocessing);
  setIfDefined(normalized, "preprocessing", preprocessing);
  return normalized;
}
function normalizeKeywordConfig(config) {
  if (!config) {
    return void 0;
  }
  const normalized = {};
  setIfDefined(normalized, "algorithm", config.algorithm);
  setIfDefined(normalized, "maxKeywords", config.maxKeywords);
  setIfDefined(normalized, "minScore", config.minScore);
  setIfDefined(normalized, "ngramRange", config.ngramRange);
  setIfDefined(normalized, "language", config.language);
  setIfDefined(normalized, "yakeParams", config.yakeParams);
  setIfDefined(normalized, "rakeParams", config.rakeParams);
  return normalized;
}
function normalizePageConfig(pages) {
  if (!pages) {
    return void 0;
  }
  const normalized = {};
  setIfDefined(normalized, "extractPages", pages.extractPages);
  setIfDefined(normalized, "insertPageMarkers", pages.insertPageMarkers);
  setIfDefined(normalized, "markerFormat", pages.markerFormat);
  return normalized;
}
function normalizeExtractionConfig(config) {
  if (!config) {
    return null;
  }
  const normalized = {};
  setIfDefined(normalized, "useCache", config.useCache);
  setIfDefined(normalized, "enableQualityProcessing", config.enableQualityProcessing);
  setIfDefined(normalized, "forceOcr", config.forceOcr);
  setIfDefined(normalized, "maxConcurrentExtractions", config.maxConcurrentExtractions);
  const ocr = normalizeOcrConfig(config.ocr);
  setIfDefined(normalized, "ocr", ocr);
  const chunking = normalizeChunkingConfig(config.chunking);
  setIfDefined(normalized, "chunking", chunking);
  const images = normalizeImageExtractionConfig(config.images);
  setIfDefined(normalized, "images", images);
  const pdf = normalizePdfConfig(config.pdfOptions);
  setIfDefined(normalized, "pdfOptions", pdf);
  const tokenReduction = normalizeTokenReductionConfig(config.tokenReduction);
  setIfDefined(normalized, "tokenReduction", tokenReduction);
  const languageDetection = normalizeLanguageDetectionConfig(config.languageDetection);
  setIfDefined(normalized, "languageDetection", languageDetection);
  const postprocessor = normalizePostProcessorConfig(config.postprocessor);
  setIfDefined(normalized, "postprocessor", postprocessor);
  const keywords = normalizeKeywordConfig(config.keywords);
  setIfDefined(normalized, "keywords", keywords);
  const pages = normalizePageConfig(config.pages);
  setIfDefined(normalized, "pages", pages);
  const htmlOptions = normalizeHtmlOptions(config.htmlOptions);
  setIfDefined(normalized, "htmlOptions", htmlOptions);
  return normalized;
}
function extractFileSync(filePath, mimeTypeOrConfig, maybeConfig) {
  let mimeType = null;
  let config = null;
  if (typeof mimeTypeOrConfig === "string") {
    mimeType = mimeTypeOrConfig;
    config = maybeConfig ?? null;
  } else if (mimeTypeOrConfig !== null && typeof mimeTypeOrConfig === "object") {
    config = mimeTypeOrConfig;
    mimeType = null;
  } else {
    config = maybeConfig ?? null;
    mimeType = null;
  }
  const normalizedConfig = normalizeExtractionConfig(config);
  const rawResult = getBinding().extractFileSync(filePath, mimeType, normalizedConfig);
  return convertResult(rawResult);
}
async function extractFile(filePath, mimeTypeOrConfig, maybeConfig) {
  let mimeType = null;
  let config = null;
  if (typeof mimeTypeOrConfig === "string") {
    mimeType = mimeTypeOrConfig;
    config = maybeConfig ?? null;
  } else if (mimeTypeOrConfig !== null && typeof mimeTypeOrConfig === "object") {
    config = mimeTypeOrConfig;
    mimeType = null;
  } else {
    config = maybeConfig ?? null;
    mimeType = null;
  }
  const normalizedConfig = normalizeExtractionConfig(config);
  const rawResult = await getBinding().extractFile(filePath, mimeType, normalizedConfig);
  return convertResult(rawResult);
}
function extractBytesSync(dataOrPath, mimeType, config = null) {
  let data;
  if (typeof dataOrPath === "string") {
    data = (0, import_node_fs.readFileSync)(dataOrPath);
  } else {
    data = dataOrPath;
  }
  const validated = assertUint8Array(data, "data");
  const normalizedConfig = normalizeExtractionConfig(config);
  const rawResult = getBinding().extractBytesSync(Buffer.from(validated), mimeType, normalizedConfig);
  return convertResult(rawResult);
}
async function extractBytes(dataOrPath, mimeType, config = null) {
  let data;
  if (typeof dataOrPath === "string") {
    data = (0, import_node_fs.readFileSync)(dataOrPath);
  } else {
    data = dataOrPath;
  }
  const validated = assertUint8Array(data, "data");
  if (process.env["KREUZBERG_DEBUG_GUTEN"] === "1") {
    console.log("[TypeScript] Debug input header:", Array.from(validated.slice(0, 8)));
  }
  const normalizedConfig = normalizeExtractionConfig(config);
  const rawResult = await getBinding().extractBytes(Buffer.from(validated), mimeType, normalizedConfig);
  return convertResult(rawResult);
}
function batchExtractFilesSync(paths, config = null) {
  const normalizedConfig = normalizeExtractionConfig(config);
  const rawResults = getBinding().batchExtractFilesSync(paths, normalizedConfig);
  return rawResults.map(convertResult);
}
async function batchExtractFiles(paths, config = null) {
  const normalizedConfig = normalizeExtractionConfig(config);
  const rawResults = await getBinding().batchExtractFiles(paths, normalizedConfig);
  return rawResults.map(convertResult);
}
function batchExtractBytesSync(dataList, mimeTypes, config = null) {
  const buffers = assertUint8ArrayList(dataList, "dataList").map((data) => Buffer.from(data));
  if (buffers.length !== mimeTypes.length) {
    throw new TypeError("dataList and mimeTypes must have the same length");
  }
  const normalizedConfig = normalizeExtractionConfig(config);
  const rawResults = getBinding().batchExtractBytesSync(buffers, mimeTypes, normalizedConfig);
  return rawResults.map(convertResult);
}
async function batchExtractBytes(dataList, mimeTypes, config = null) {
  const buffers = assertUint8ArrayList(dataList, "dataList").map((data) => Buffer.from(data));
  if (buffers.length !== mimeTypes.length) {
    throw new TypeError("dataList and mimeTypes must have the same length");
  }
  const normalizedConfig = normalizeExtractionConfig(config);
  const rawResults = await getBinding().batchExtractBytes(buffers, mimeTypes, normalizedConfig);
  return rawResults.map(convertResult);
}
function registerPostProcessor(processor) {
  const binding2 = getBinding();
  const wrappedProcessor = {
    name: typeof processor.name === "function" ? processor.name() : processor.name,
    processingStage: typeof processor.processingStage === "function" ? processor.processingStage() : processor.processingStage,
    async process(...args) {
      const wrappedValue = args[0];
      const jsonString = wrappedValue[0];
      const wireResult = JSON.parse(jsonString);
      const result = {
        content: wireResult.content,
        mimeType: wireResult.mime_type,
        metadata: typeof wireResult.metadata === "string" ? JSON.parse(wireResult.metadata) : wireResult.metadata,
        tables: wireResult.tables || [],
        detectedLanguages: wireResult.detected_languages ?? null,
        chunks: wireResult.chunks ?? null,
        images: wireResult.images ?? null
      };
      const updated = await processor.process(result);
      const wireUpdated = {
        content: updated.content,
        mime_type: updated.mimeType,
        metadata: updated.metadata,
        tables: updated.tables,
        detected_languages: updated.detectedLanguages,
        chunks: updated.chunks,
        images: updated.images
      };
      return JSON.stringify(wireUpdated);
    }
  };
  Object.defineProperty(wrappedProcessor, "__original", {
    value: processor,
    enumerable: false
  });
  const stage = processor.processingStage?.() ?? "middle";
  Object.defineProperty(wrappedProcessor, "__stage", {
    value: stage,
    enumerable: false
  });
  binding2.registerPostProcessor(wrappedProcessor);
}
function unregisterPostProcessor(name) {
  const binding2 = getBinding();
  binding2.unregisterPostProcessor(name);
}
function clearPostProcessors() {
  const binding2 = getBinding();
  binding2.clearPostProcessors();
}
function listPostProcessors() {
  const binding2 = getBinding();
  return binding2.listPostProcessors();
}
function registerValidator(validator) {
  const binding2 = getBinding();
  const wrappedValidator = {
    name: typeof validator.name === "function" ? validator.name() : validator.name,
    priority: typeof validator.priority === "function" ? validator.priority() : validator.priority,
    async validate(...args) {
      const jsonString = args[0];
      if (!jsonString || jsonString === "undefined") {
        throw new Error("Validator received invalid JSON string");
      }
      const wireResult = JSON.parse(jsonString);
      const result = {
        content: wireResult.content,
        mimeType: wireResult.mime_type,
        metadata: typeof wireResult.metadata === "string" ? JSON.parse(wireResult.metadata) : wireResult.metadata,
        tables: wireResult.tables || [],
        detectedLanguages: wireResult.detected_languages,
        chunks: wireResult.chunks,
        images: wireResult.images ?? null
      };
      await Promise.resolve(validator.validate(result));
      return "";
    }
  };
  binding2.registerValidator(wrappedValidator);
}
function unregisterValidator(name) {
  const binding2 = getBinding();
  binding2.unregisterValidator(name);
}
function clearValidators() {
  const binding2 = getBinding();
  binding2.clearValidators();
}
function listValidators() {
  const binding2 = getBinding();
  return binding2.listValidators();
}
function isOcrProcessTuple(value) {
  return Array.isArray(value) && value.length === 2 && typeof value[1] === "string" && (typeof value[0] === "string" || Buffer.isBuffer(value[0]) || value[0] instanceof Uint8Array);
}
function isNestedOcrProcessTuple(value) {
  return Array.isArray(value) && value.length === 1 && isOcrProcessTuple(value[0]);
}
function describePayload(value) {
  if (typeof value === "string") {
    return { ctor: "String", length: value.length };
  }
  return { ctor: value.constructor?.name ?? "Buffer", length: value.length };
}
function registerOcrBackend(backend) {
  const binding2 = getBinding();
  const wrappedBackend = {
    name: typeof backend.name === "function" ? backend.name() : backend.name,
    supportedLanguages: typeof backend.supportedLanguages === "function" ? backend.supportedLanguages() : backend.supportedLanguages ?? ["en"],
    async processImage(...processArgs) {
      const [imagePayload, maybeLanguage] = processArgs;
      if (process.env["KREUZBERG_DEBUG_GUTEN"] === "1") {
        console.log("[registerOcrBackend] JS arguments", { length: processArgs.length });
        console.log("[registerOcrBackend] Raw args", {
          imagePayloadType: Array.isArray(imagePayload) ? "tuple" : typeof imagePayload,
          maybeLanguageType: typeof maybeLanguage,
          metadata: Array.isArray(imagePayload) ? { tupleLength: imagePayload.length } : describePayload(imagePayload)
        });
      }
      let rawBytes;
      let language = maybeLanguage;
      if (isNestedOcrProcessTuple(imagePayload)) {
        [rawBytes, language] = imagePayload[0];
      } else if (isOcrProcessTuple(imagePayload)) {
        [rawBytes, language] = imagePayload;
      } else {
        rawBytes = imagePayload;
      }
      if (typeof language !== "string") {
        throw new Error("OCR backend did not receive a language parameter");
      }
      if (process.env["KREUZBERG_DEBUG_GUTEN"] === "1") {
        const length = typeof rawBytes === "string" ? rawBytes.length : rawBytes.length;
        console.log(
          "[registerOcrBackend] Received payload",
          Array.isArray(imagePayload) ? "tuple" : typeof rawBytes,
          "ctor",
          describePayload(rawBytes).ctor,
          "length",
          length
        );
      }
      const buffer = typeof rawBytes === "string" ? Buffer.from(rawBytes, "base64") : Buffer.from(rawBytes);
      const result = await backend.processImage(new Uint8Array(buffer), language);
      return JSON.stringify(result);
    }
  };
  binding2.registerOcrBackend(wrappedBackend);
}
function listOcrBackends() {
  const binding2 = getBinding();
  return binding2.listOcrBackends();
}
function unregisterOcrBackend(name) {
  const binding2 = getBinding();
  binding2.unregisterOcrBackend(name);
}
function clearOcrBackends() {
  const binding2 = getBinding();
  binding2.clearOcrBackends();
}
function listDocumentExtractors() {
  const binding2 = getBinding();
  return binding2.listDocumentExtractors();
}
function unregisterDocumentExtractor(name) {
  const binding2 = getBinding();
  binding2.unregisterDocumentExtractor(name);
}
function clearDocumentExtractors() {
  const binding2 = getBinding();
  binding2.clearDocumentExtractors();
}
const ExtractionConfig = {
  /**
   * Load extraction configuration from a file.
   *
   * Automatically detects the file format based on extension:
   * - `.toml` - TOML format
   * - `.yaml` - YAML format
   * - `.json` - JSON format
   *
   * @param filePath - Path to the configuration file (absolute or relative)
   * @returns ExtractionConfig object loaded from the file
   *
   * @throws {Error} If file does not exist or is not accessible
   * @throws {Error} If file content is not valid TOML/YAML/JSON
   * @throws {Error} If configuration structure is invalid
   * @throws {Error} If file extension is not supported
   *
   * @example
   * ```typescript
   * import { ExtractionConfig } from '@kreuzberg/node';
   *
   * // Load from TOML file
   * const config1 = ExtractionConfig.fromFile('kreuzberg.toml');
   *
   * // Load from YAML file
   * const config2 = ExtractionConfig.fromFile('./config.yaml');
   *
   * // Load from JSON file
   * const config3 = ExtractionConfig.fromFile('./config.json');
   * ```
   */
  fromFile(filePath) {
    const binding2 = getBinding();
    return binding2.loadExtractionConfigFromFile(filePath);
  },
  /**
   * Discover and load configuration from current or parent directories.
   *
   * Searches for a `kreuzberg.toml` file starting from the current working directory
   * and traversing up the directory tree. Returns the first configuration file found.
   *
   * @returns ExtractionConfig object if found, or null if no configuration file exists
   *
   * @example
   * ```typescript
   * import { ExtractionConfig } from '@kreuzberg/node';
   *
   * // Try to find config in current or parent directories
   * const config = ExtractionConfig.discover();
   * if (config) {
   *   console.log('Found configuration');
   *   // Use config for extraction
   * } else {
   *   console.log('No configuration file found, using defaults');
   * }
   * ```
   */
  discover() {
    const binding2 = getBinding();
    return binding2.discoverExtractionConfig();
  }
};
function detectMimeType(bytes) {
  const binding2 = getBinding();
  return binding2.detectMimeTypeFromBytes(bytes);
}
function detectMimeTypeFromPath(filePath, checkExists) {
  const binding2 = getBinding();
  return binding2.detectMimeTypeFromPath(filePath, checkExists);
}
function validateMimeType(mimeType) {
  const binding2 = getBinding();
  return binding2.validateMimeType(mimeType);
}
function getExtensionsForMime(mimeType) {
  const binding2 = getBinding();
  return binding2.getExtensionsForMime(mimeType);
}
function listEmbeddingPresets() {
  const binding2 = getBinding();
  return binding2.listEmbeddingPresets();
}
function getEmbeddingPreset(name) {
  const binding2 = getBinding();
  const result = binding2.getEmbeddingPreset(name);
  return result;
}
function getLastErrorCode() {
  const binding2 = getBinding();
  return binding2.getLastErrorCode();
}
function getLastPanicContext() {
  const binding2 = getBinding();
  const result = binding2.getLastPanicContext();
  return result;
}
function getErrorCodeName(code) {
  const binding2 = getBinding();
  return binding2.getErrorCodeName(code);
}
function getErrorCodeDescription(code) {
  const binding2 = getBinding();
  return binding2.getErrorCodeDescription(code);
}
function classifyError(errorMessage) {
  const binding2 = getBinding();
  const result = binding2.classifyError(errorMessage);
  return result;
}
function createWorkerPool(size) {
  const binding2 = getBinding();
  const rawPool = binding2.createWorkerPool(size);
  return rawPool;
}
function getWorkerPoolStats(pool) {
  const binding2 = getBinding();
  const rawStats = binding2.getWorkerPoolStats(pool);
  return rawStats;
}
async function extractFileInWorker(pool, filePath, mimeTypeOrConfig, maybeConfig) {
  let mimeType = null;
  let config = null;
  if (typeof mimeTypeOrConfig === "string") {
    mimeType = mimeTypeOrConfig;
    config = maybeConfig ?? null;
  } else if (mimeTypeOrConfig !== null && typeof mimeTypeOrConfig === "object") {
    config = mimeTypeOrConfig;
    mimeType = null;
  } else {
    config = maybeConfig ?? null;
    mimeType = null;
  }
  const normalizedConfig = normalizeExtractionConfig(config);
  const binding2 = getBinding();
  const rawResult = await binding2.extractFileInWorker(
    pool,
    filePath,
    mimeType,
    normalizedConfig
  );
  return convertResult(rawResult);
}
async function batchExtractFilesInWorker(pool, paths, config = null) {
  const normalizedConfig = normalizeExtractionConfig(config);
  const binding2 = getBinding();
  const rawResults = await binding2.batchExtractFilesInWorker(
    pool,
    paths,
    normalizedConfig
  );
  return rawResults.map(convertResult);
}
async function closeWorkerPool(pool) {
  const binding2 = getBinding();
  await binding2.closeWorkerPool(pool);
}
const __version__ = "4.0.0";
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  CacheError,
  ErrorCode,
  ExtractionConfig,
  GutenOcrBackend,
  ImageProcessingError,
  KreuzbergError,
  MissingDependencyError,
  OcrError,
  ParsingError,
  PluginError,
  ValidationError,
  __resetBindingForTests,
  __setBindingForTests,
  __version__,
  batchExtractBytes,
  batchExtractBytesSync,
  batchExtractFiles,
  batchExtractFilesInWorker,
  batchExtractFilesSync,
  classifyError,
  clearDocumentExtractors,
  clearOcrBackends,
  clearPostProcessors,
  clearValidators,
  closeWorkerPool,
  createWorkerPool,
  detectMimeType,
  detectMimeTypeFromPath,
  extractBytes,
  extractBytesSync,
  extractFile,
  extractFileInWorker,
  extractFileSync,
  getEmbeddingPreset,
  getErrorCodeDescription,
  getErrorCodeName,
  getExtensionsForMime,
  getLastErrorCode,
  getLastPanicContext,
  getWorkerPoolStats,
  listDocumentExtractors,
  listEmbeddingPresets,
  listOcrBackends,
  listPostProcessors,
  listValidators,
  registerOcrBackend,
  registerPostProcessor,
  registerValidator,
  unregisterDocumentExtractor,
  unregisterOcrBackend,
  unregisterPostProcessor,
  unregisterValidator,
  validateMimeType,
  ...require("./types.js")
});
//# sourceMappingURL=index.js.map