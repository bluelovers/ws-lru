import { isStale } from './isStale';
import { del } from './del';
import { ALLOW_STALE } from '../symbol';
import { LRUCache } from '../LRUCache';
import { INode, IFn } from '../types';

export const forEachStep = <K, V>(self: LRUCache<K, V>, fn: IFn<K, V>, node: INode<K, V>, thisp: LRUCache<K, V>) =>
{
	let hit = node.value
	if (isStale(self, hit))
	{
		del(self, node)
		if (!self[ALLOW_STALE])
		{
			hit = undefined
		}
	}
	if (hit)
	{
		fn.call(thisp, hit.value, hit.key, self)
	}
}
