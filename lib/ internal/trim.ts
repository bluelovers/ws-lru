import { LENGTH, MAX, LRU_LIST } from '../symbol';
import { del } from './del';
import { LRUCache } from '../LRUCache';

export const trim = <K, V>(self: LRUCache<K, V>) =>
{
	if (self[LENGTH] > self[MAX])
	{
		for (let walker = self[LRU_LIST].tail;
			self[LENGTH] > self[MAX] && walker !== null;
		)
		{
			// We know that we're about to delete this one, and also
			// what the next least recently used key will be, so just
			// go ahead and set it now.
			const prev = walker.prev
			del(self, walker)
			walker = prev
		}
	}
}
