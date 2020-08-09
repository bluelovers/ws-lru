import { DISPOSE, LENGTH, CACHE, LRU_LIST } from '../symbol';
import { LRUCache } from '../LRUCache';
import { INode } from '../types';

export const del = <K, V>(self: LRUCache<K, V>, node: INode<K, V>) =>
{
	if (node)
	{
		const hit = node.value
		if (self[DISPOSE])
		{
			self[DISPOSE](hit.key, hit.value)
		}

		self[LENGTH] -= hit.length
		self[CACHE].delete(hit.key)
		self[LRU_LIST].removeNode(node)
	}
}
