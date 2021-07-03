"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadCacheFile = void 0;
const fs_1 = require("fs");
function loadCacheFile(filename) {
    try {
        const file = (0, fs_1.readFileSync)(filename, 'utf8');
        return JSON.parse(file.toString());
    }
    catch (e) {
        return [];
    }
}
exports.loadCacheFile = loadCacheFile;
//# sourceMappingURL=loadCacheFile.js.map