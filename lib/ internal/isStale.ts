import { MAX_AGE } from '../symbol';
import { LRUCache } from '../LRUCache';
import { Entry } from '../Entry';

export const isStale = <K, V>(self: LRUCache<K, V>, hit: Entry<K, V>) =>
{
	if (!hit || (!hit.maxAge && !self[MAX_AGE]))
	{
		return false
	}

	const diff = Date.now() - hit.now
	return hit.maxAge ? diff > hit.maxAge
		: self[MAX_AGE] && (diff > self[MAX_AGE])
}
