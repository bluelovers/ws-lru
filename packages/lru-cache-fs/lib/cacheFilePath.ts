import { IOptionsLRUCacheFS } from '../index';
import { resolve } from "path";
import envPaths from 'env-paths';
import errcode from 'err-code';

export function cacheFilePath<K, V>(options: IOptionsLRUCacheFS<K, V>)
{
	if (typeof options.cacheName !== 'string' || !options.cacheName.length)
	{
		const err = errcode(new TypeError("cacheName is required"), "ECACHENAME")
		throw err;
	}

	return (options.cwd && resolve(options.cwd, options.cacheName)) ||
		envPaths(options.cacheName, { suffix: "nodejs" }).cache;
}
