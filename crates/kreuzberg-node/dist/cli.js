#!/usr/bin/env node
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
var cli_exports = {};
__export(cli_exports, {
  main: () => main
});
module.exports = __toCommonJS(cli_exports);
var import_node_child_process = require("node:child_process");
var import_node_fs = require("node:fs");
var import_node_path = require("node:path");
var import_node_url = require("node:url");
var import_which = __toESM(require("which"));
function getDirectory() {
  if (typeof __filename !== "undefined") {
    return (0, import_node_path.dirname)(__filename);
  }
  try {
    const url = eval("import.meta.url");
    return (0, import_node_path.dirname)((0, import_node_url.fileURLToPath)(url));
  } catch {
    return process.cwd();
  }
}
function main(argv) {
  const args = argv.slice(2);
  let cliPath;
  try {
    cliPath = import_which.default.sync("kreuzberg-cli");
  } catch {
  }
  if (!cliPath) {
    const __dirname = getDirectory();
    const devBinary = (0, import_node_path.join)(__dirname, "..", "..", "..", "target", "release", "kreuzberg");
    if ((0, import_node_fs.existsSync)(devBinary)) {
      cliPath = devBinary;
    }
  }
  if (!cliPath) {
    console.error(
      "The embedded Kreuzberg CLI binary could not be located. This indicates a packaging issue; please open an issue at https://github.com/kreuzberg-dev/kreuzberg/issues so we can investigate."
    );
    return 1;
  }
  const result = (0, import_node_child_process.spawnSync)(cliPath, args, {
    stdio: "inherit",
    shell: false
  });
  if (result.error) {
    console.error(`Failed to execute kreuzberg-cli: ${result.error.message}`);
    return 1;
  }
  return result.status ?? 1;
}
if (require.main === module) {
  process.exit(main(process.argv));
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  main
});
//# sourceMappingURL=cli.js.map