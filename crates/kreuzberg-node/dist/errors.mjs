var ErrorCode = /* @__PURE__ */ ((ErrorCode2) => {
  ErrorCode2[ErrorCode2["Success"] = 0] = "Success";
  ErrorCode2[ErrorCode2["GenericError"] = 1] = "GenericError";
  ErrorCode2[ErrorCode2["Panic"] = 2] = "Panic";
  ErrorCode2[ErrorCode2["InvalidArgument"] = 3] = "InvalidArgument";
  ErrorCode2[ErrorCode2["IoError"] = 4] = "IoError";
  ErrorCode2[ErrorCode2["ParsingError"] = 5] = "ParsingError";
  ErrorCode2[ErrorCode2["OcrError"] = 6] = "OcrError";
  ErrorCode2[ErrorCode2["MissingDependency"] = 7] = "MissingDependency";
  return ErrorCode2;
})(ErrorCode || {});
class KreuzbergError extends Error {
  /**
   * Panic context if error was caused by a panic in native code.
   * Will be null for non-panic errors.
   */
  panicContext;
  constructor(message, panicContext) {
    super(message);
    this.name = "KreuzbergError";
    this.panicContext = panicContext ?? null;
    Object.setPrototypeOf(this, KreuzbergError.prototype);
  }
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      panicContext: this.panicContext,
      stack: this.stack
    };
  }
}
class ValidationError extends KreuzbergError {
  constructor(message, panicContext) {
    super(message, panicContext);
    this.name = "ValidationError";
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}
class ParsingError extends KreuzbergError {
  constructor(message, panicContext) {
    super(message, panicContext);
    this.name = "ParsingError";
    Object.setPrototypeOf(this, ParsingError.prototype);
  }
}
class OcrError extends KreuzbergError {
  constructor(message, panicContext) {
    super(message, panicContext);
    this.name = "OcrError";
    Object.setPrototypeOf(this, OcrError.prototype);
  }
}
class CacheError extends KreuzbergError {
  constructor(message, panicContext) {
    super(message, panicContext);
    this.name = "CacheError";
    Object.setPrototypeOf(this, CacheError.prototype);
  }
}
class ImageProcessingError extends KreuzbergError {
  constructor(message, panicContext) {
    super(message, panicContext);
    this.name = "ImageProcessingError";
    Object.setPrototypeOf(this, ImageProcessingError.prototype);
  }
}
class PluginError extends KreuzbergError {
  /**
   * Name of the plugin that threw the error.
   */
  pluginName;
  constructor(message, pluginName, panicContext) {
    super(`Plugin error in '${pluginName}': ${message}`, panicContext);
    this.name = "PluginError";
    this.pluginName = pluginName;
    Object.setPrototypeOf(this, PluginError.prototype);
  }
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      pluginName: this.pluginName,
      panicContext: this.panicContext,
      stack: this.stack
    };
  }
}
class MissingDependencyError extends KreuzbergError {
  constructor(message, panicContext) {
    super(message, panicContext);
    this.name = "MissingDependencyError";
    Object.setPrototypeOf(this, MissingDependencyError.prototype);
  }
}
export {
  CacheError,
  ErrorCode,
  ImageProcessingError,
  KreuzbergError,
  MissingDependencyError,
  OcrError,
  ParsingError,
  PluginError,
  ValidationError
};
//# sourceMappingURL=errors.mjs.map