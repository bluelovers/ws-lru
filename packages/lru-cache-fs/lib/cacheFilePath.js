"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cacheFilePath = void 0;
const path_1 = require("path");
const env_paths_1 = __importDefault(require("env-paths"));
const err_code_1 = __importDefault(require("err-code"));
function cacheFilePath(options) {
    if (typeof options.cacheName !== 'string' || !options.cacheName.length) {
        const err = err_code_1.default(new TypeError("cacheName is required"), "ECACHENAME");
        throw err;
    }
    return (options.cwd && path_1.resolve(options.cwd, options.cacheName)) ||
        env_paths_1.default(options.cacheName, { suffix: "nodejs" }).cache;
}
exports.cacheFilePath = cacheFilePath;
//# sourceMappingURL=cacheFilePath.js.map