"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeastRecentlyMap = void 0;
class LeastRecentlyMap extends Map {
    set(key, value) {
        if (this.has(key)) {
            this.delete(key);
        }
        return super.set(key, value);
    }
}
exports.LeastRecentlyMap = LeastRecentlyMap;
exports.default = LeastRecentlyMap;
//# sourceMappingURL=map.js.map