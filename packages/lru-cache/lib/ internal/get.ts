import { CACHE, ALLOW_STALE, UPDATE_AGE_ON_GET, LRU_LIST } from '../symbol';
import { isStale } from './isStale';
import { del } from './del';
import { LRUCache } from '../LRUCache';

export const get = <K, V>(self: LRUCache<K, V>, key: K, doUse: boolean) =>
{
	const node = self[CACHE].get(key)
	if (node)
	{
		const hit = node.value
		if (isStale(self, hit))
		{
			del(self, node)
			if (!self[ALLOW_STALE])
			{
				return undefined
			}
		}
		else
		{
			if (doUse)
			{
				if (self[UPDATE_AGE_ON_GET])
				{
					node.value.now = Date.now()
				}
				self[LRU_LIST].unshiftNode(node)
			}
		}
		return hit.value
	}
}
