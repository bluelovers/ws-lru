"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cacheFilePath = void 0;
const tslib_1 = require("tslib");
const path_1 = require("path");
const env_paths_1 = (0, tslib_1.__importDefault)(require("env-paths"));
const err_code_1 = (0, tslib_1.__importDefault)(require("err-code"));
function cacheFilePath(options) {
    if (typeof options.cacheName !== 'string' || !options.cacheName.length) {
        const err = (0, err_code_1.default)(new TypeError("cacheName is required"), "ECACHENAME");
        throw err;
    }
    return (options.cwd && (0, path_1.resolve)(options.cwd, options.cacheName)) ||
        (0, env_paths_1.default)(options.cacheName, { suffix: "nodejs" }).cache;
}
exports.cacheFilePath = cacheFilePath;
//# sourceMappingURL=cacheFilePath.js.map