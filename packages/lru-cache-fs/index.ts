import { readFileSync, writeJSONSync, outputJSONSync, WriteOptions } from 'fs-extra';
import LRUCache from 'lru-cache2';
import { IOptions, ILruEntry } from 'lru-cache2/lib';
import { loadCacheFile } from './lib/loadCacheFile';
import { cacheFilePath } from './lib/cacheFilePath';

const FILENAME = Symbol.for("filename");
const AUTO_CREATE_FILE_PATH = Symbol.for("AUTO_CREATE_FILE_PATH");

export interface IOptionsLRUCacheFS<K, V> extends IOptions<K, V>
{
	cacheName: string;
	cwd?: string;
	autoCreate?: boolean;
}

export class LRUCacheFS<K, V> extends LRUCache<K, V>
{
	protected [FILENAME]: string;
	protected [AUTO_CREATE_FILE_PATH]: boolean;

	constructor(options: IOptionsLRUCacheFS<K, V>)
	{
		super(options);

		this[FILENAME] = cacheFilePath(options);
		this[AUTO_CREATE_FILE_PATH] = !!options.autoCreate;

		this.load(loadCacheFile<K, V>(this[FILENAME]));

		return this;
	}

	fsDump(autoCreate?: boolean, options?: WriteOptions)
	{
		const fn = (autoCreate ?? (this[AUTO_CREATE_FILE_PATH] === true)) ? outputJSONSync : writeJSONSync;

		fn(this[FILENAME], this.dump(), {
			spaces: 2,
			...options
		});

		return this
	}

	static fromFile<K, V>(filename: string, options?: Partial<IOptionsLRUCacheFS<K, V>>)
	{
		options = {
			...options,
			cacheName: filename,
		} as IOptionsLRUCacheFS<K, V>;

		options.cwd ??= process.cwd();

		let cache = new this(options as any);

		return cache;
	}

	static override create<K, V>(options: IOptionsLRUCacheFS<K, V>)
	{
		return new this(options);
	}

}

export default LRUCacheFS;
