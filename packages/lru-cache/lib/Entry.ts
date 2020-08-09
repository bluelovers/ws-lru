export class Entry<K, V>
{
	constructor(public key: K, public value: V, public length: number, public now: number, public maxAge?: number)
	{
		this.key = key
		this.value = value
		this.length = length
		this.now = now
		this.maxAge = maxAge || 0
	}
}
