export class LeastRecentlySet<T> extends Set<T>
{

	override add(value: T)
	{
		if (this.has(value))
		{
			this.delete(value)
		}
		return super.add(value);
	}

}

export default LeastRecentlySet
