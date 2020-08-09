import { readFileSync } from "fs";
import { ILruEntry } from 'lru-cache2/lib/types';

export function loadCacheFile<K, V>(filename: string): ILruEntry<K, V>[]
{
	try
	{
		const file = readFileSync(filename, 'utf8')
		return JSON.parse(file.toString());
	}
	catch (e)
	{
		return [];
	}
}
