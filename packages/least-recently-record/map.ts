export class LeastRecentlyMap<K, V> extends Map<K, V>
{

	override set(key: K, value: V)
	{
		if (this.has(key))
		{
			this.delete(key)
		}
		return super.set(key, value);
	}

}

export default LeastRecentlyMap
