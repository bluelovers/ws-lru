import LRUCache from 'lru-cache2';
import { IOptions } from 'lru-cache2/lib';
declare const FILENAME: unique symbol;
declare const AUTO_CREATE_FILE_PATH: unique symbol;
export interface IOptionsLRUCacheFS<K, V> extends IOptions<K, V> {
    cacheName: string;
    cwd?: string;
    autoCreate?: boolean;
}
export declare class LRUCacheFS<K, V> extends LRUCache<K, V> {
    protected [FILENAME]: string;
    protected [AUTO_CREATE_FILE_PATH]: boolean;
    constructor(options: IOptionsLRUCacheFS<K, V>);
    fsDump(autoCreate?: boolean): this;
    static fromFile<K, V>(filename: string, options?: Partial<IOptionsLRUCacheFS<K, V>>): LRUCacheFS<unknown, unknown>;
    static create<K, V>(options: IOptionsLRUCacheFS<K, V>): LRUCacheFS<K, V>;
}
export default LRUCacheFS;
