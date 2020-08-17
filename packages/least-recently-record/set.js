"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeastRecentlySet = void 0;
class LeastRecentlySet extends Set {
    add(value) {
        if (this.has(value)) {
            this.delete(value);
        }
        return super.add(value);
    }
}
exports.LeastRecentlySet = LeastRecentlySet;
exports.default = LeastRecentlySet;
//# sourceMappingURL=set.js.map