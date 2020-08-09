import { ILruEntry } from 'lru-cache2/lib/types';
export declare function loadCacheFile<K, V>(filename: string): ILruEntry<K, V>[];
