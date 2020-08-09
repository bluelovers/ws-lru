"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LRUCacheFS = void 0;
const fs_extra_1 = require("fs-extra");
const lru_cache2_1 = __importDefault(require("lru-cache2"));
const loadCacheFile_1 = require("./lib/loadCacheFile");
const cacheFilePath_1 = require("./lib/cacheFilePath");
const FILENAME = Symbol.for("filename");
const AUTO_CREATE_FILE_PATH = Symbol.for("AUTO_CREATE_FILE_PATH");
class LRUCacheFS extends lru_cache2_1.default {
    constructor(options) {
        super(options);
        this[FILENAME] = cacheFilePath_1.cacheFilePath(options);
        this[AUTO_CREATE_FILE_PATH] = !!options.autoCreate;
        this.load(loadCacheFile_1.loadCacheFile(this[FILENAME]));
        return this;
    }
    fsDump(autoCreate) {
        const fn = (autoCreate !== null && autoCreate !== void 0 ? autoCreate : (this[AUTO_CREATE_FILE_PATH] === true)) ? fs_extra_1.outputJSONSync : fs_extra_1.writeJSONSync;
        fn(this[FILENAME], this.dump(), {
            spaces: 2
        });
        return this;
    }
    static fromFile(filename, options) {
        var _a;
        options = {
            ...options,
            cacheName: filename,
        };
        (_a = options.cwd) !== null && _a !== void 0 ? _a : (options.cwd = process.cwd());
        let cache = new this(options);
        return cache;
    }
    static create(options) {
        return new this(options);
    }
}
exports.LRUCacheFS = LRUCacheFS;
exports.default = LRUCacheFS;
//# sourceMappingURL=index.js.map