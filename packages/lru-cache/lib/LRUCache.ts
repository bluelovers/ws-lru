import {
	MAX,
	LENGTH_CALCULATOR,
	ALLOW_STALE,
	MAX_AGE,
	DISPOSE,
	NO_DISPOSE_ON_SET,
	UPDATE_AGE_ON_GET,
	LENGTH,
	LRU_LIST,
	CACHE,
} from './symbol';
import { naiveLength } from './naiveLength';
import { trim } from './ internal/trim';
import { forEachStep } from './ internal/forEachStep';
import Yallist from 'yallist';
import { isStale } from './ internal/isStale';
import { Entry } from './Entry';
import { get } from './ internal/get';
import { del } from './ internal/del';
import { IOptions, INode, IFn, ILruEntry } from './types';

/**
 * lruList is a yallist where the head is the youngest
 * item, and the tail is the oldest.  the list contains the Hit
 * objects as the entries.
 * Each Hit object has a reference to its Yallist.Node.  This
 * never changes.
 *
 * cache is a Map (or PseudoMap) that matches the keys to
 * the Yallist.Node object.
 */
export class LRUCache<K, V>
{
	/**
	 * Kind of weird to have a default max of Infinity, but oh well.
	 */
	[MAX]: number;
	[LENGTH_CALCULATOR]: (value: V, key?: K) => number;
	[ALLOW_STALE]: boolean;
	[MAX_AGE]: number;
	[DISPOSE]: (key: K, value: V) => void;
	[NO_DISPOSE_ON_SET]: boolean;
	[UPDATE_AGE_ON_GET]: boolean;
	/**
	 * length of items in the list
	 */
	[LENGTH]: number;
	/**
	 * list of items in order of use recency
	 */
	[LRU_LIST]: Yallist<Entry<K, V>>;
	/**
	 * hash of items by key
	 */
	[CACHE]: Map<K, INode<K, V>>

	constructor(options?: IOptions<K, V> | number)
	{
		if (typeof options === 'number')
		{
			options = { max: options }
		}

		if (!options)
		{
			options = {}
		}

		if (options.max && (typeof options.max !== 'number' || options.max < 0))
		{
			throw new TypeError('max must be a non-negative number')
		}
		// Kind of weird to have a default max of Infinity, but oh well.
		const max = this[MAX] = options.max || Infinity

		const lc = options.length || naiveLength
		this[LENGTH_CALCULATOR] = (typeof lc !== 'function') ? naiveLength : lc
		this[ALLOW_STALE] = options.stale || false
		if (options.maxAge && typeof options.maxAge !== 'number')
		{
			throw new TypeError('maxAge must be a number')
		}
		this[MAX_AGE] = options.maxAge || 0
		this[DISPOSE] = options.dispose
		this[NO_DISPOSE_ON_SET] = options.noDisposeOnSet || false
		this[UPDATE_AGE_ON_GET] = options.updateAgeOnGet || false
		this.reset()
	}

	/**
	 * resize the cache when the max changes.
	 * Same as Options.max. Resizes the cache when the `max` changes.
	 */
	set max(mL)
	{
		if (typeof mL !== 'number' || mL < 0)
		{
			throw new TypeError('max must be a non-negative number')
		}

		this[MAX] = mL || Infinity
		trim(this)
	}

	/**
	 * resize the cache when the max changes.
	 * Same as Options.max. Resizes the cache when the `max` changes.
	 */
	get max()
	{
		return this[MAX]
	}

	/**
	 * Same as Options.allowStale.
	 */
	set allowStale(allowStale)
	{
		this[ALLOW_STALE] = !!allowStale
	}

	/**
	 * Same as Options.allowStale.
	 */
	get allowStale()
	{
		return this[ALLOW_STALE]
	}

	/**
	 * Same as Options.maxAge. Resizes the cache when the `maxAge` changes.
	 */
	set maxAge(mA)
	{
		if (typeof mA !== 'number')
		{
			throw new TypeError('maxAge must be a non-negative number')
		}

		this[MAX_AGE] = mA
		trim(this)
	}

	/**
	 * Same as Options.maxAge. Resizes the cache when the `maxAge` changes.
	 */
	get maxAge()
	{
		return this[MAX_AGE]
	}

	/**
	 * resize the cache when the lengthCalculator changes.
	 * Same as Options.length.
	 */
	set lengthCalculator(lC)
	{
		if (typeof lC !== 'function')
		{
			lC = naiveLength
		}

		if (lC !== this[LENGTH_CALCULATOR])
		{
			this[LENGTH_CALCULATOR] = lC
			this[LENGTH] = 0
			this[LRU_LIST].forEach(hit =>
			{
				hit.length = this[LENGTH_CALCULATOR](hit.value, hit.key)
				this[LENGTH] += hit.length
			})
		}
		trim(this)
	}

	/**
	 * resize the cache when the lengthCalculator changes.
	 * Same as Options.length.
	 */
	get lengthCalculator()
	{ return this[LENGTH_CALCULATOR] }

	/**
	 * Return total length of objects in cache taking into account `length` options function.
	 */
	get length()
	{ return this[LENGTH] }

	/**
	 * Return total quantity of objects currently in cache. Note,
	 * that `stale` (see options) items are returned as part of this item count.
	 */
	get itemCount()
	{ return this[LRU_LIST].length }

	/**
	 * The same as `cache.forEach(...)` but items are iterated over in reverse order.
	 * (ie, less recently used items are iterated over first.)
	 */
	rforEach(fn: IFn<K, V>, thisp?: LRUCache<K, V>)
	{
		thisp = thisp || this
		for (let walker = this[LRU_LIST].tail; walker !== null;)
		{
			const prev = walker.prev
			forEachStep(this, fn, walker, thisp)
			walker = prev
		}
	}

	/**
	 * Just like `Array.prototype.forEach`. Iterates over all the keys in the cache,
	 * in order of recent-ness. (Ie, more recently used items are iterated over first.)
	 */
	forEach(fn: IFn<K, V>, thisp?: LRUCache<K, V>)
	{
		thisp = thisp || this
		for (let walker = this[LRU_LIST].head; walker !== null;)
		{
			const next = walker.next
			forEachStep(this, fn, walker, thisp)
			walker = next
		}
	}

	/**
	 * Return an array of the keys in the cache.
	 */
	keys()
	{
		return this[LRU_LIST].toArray().map(k => k.key)
	}

	/**
	 * Return an array of the values in the cache.
	 */
	values()
	{
		return this[LRU_LIST].toArray().map(k => k.value)
	}

	/**
	 * Clear the cache entirely, throwing away all values.
	 */
	reset()
	{
		if (this[DISPOSE] &&
			this[LRU_LIST] &&
			this[LRU_LIST].length)
		{
			this[LRU_LIST].forEach(hit => this[DISPOSE](hit.key, hit.value))
		}

		this[CACHE] = new Map() // hash of items by key
		// A linked list to keep track of recently-used-ness
		this[LRU_LIST] = new Yallist() // list of items in order of use recency
		this[LENGTH] = 0 // length of items in the list
	}

	/**
	 * Return an array of the cache entries ready for serialization and usage with `destinationCache.load(arr)`.
	 */
	dump(): ILruEntry<K, V>[]
	{
		return this[LRU_LIST].map(hit =>
			isStale(this, hit) ? null : {
				k: hit.key,
				v: hit.value,
				e: hit.now + (hit.maxAge || 0),
			}).toArray().filter(h => h)
	}

	dumpLru()
	{
		return this[LRU_LIST]
	}

	/**
	 * Will update the "recently used"-ness of the key. They do what you think.
	 * `maxAge` is optional and overrides the cache `maxAge` option if provided.
	 */
	set(key: K, value: V, maxAge?: number)
	{
		maxAge ||= this[MAX_AGE]

		if (maxAge && typeof maxAge !== 'number')
		{
			throw new TypeError('maxAge must be a number')
		}

		const now = maxAge ? Date.now() : 0
		const len = this[LENGTH_CALCULATOR](value, key)

		if (this[CACHE].has(key))
		{
			if (len > this[MAX])
			{
				del(this, this[CACHE].get(key))
				return false
			}

			const node = this[CACHE].get(key)
			const item = node.value

			// dispose of the old one before overwriting
			// split out into 2 ifs for better coverage tracking
			if (this[DISPOSE])
			{
				if (!this[NO_DISPOSE_ON_SET])
				{
					this[DISPOSE](key, item.value)
				}
			}

			item.now = now
			item.maxAge = maxAge
			item.value = value
			this[LENGTH] += len - item.length
			item.length = len
			this.get(key)
			trim(this)
			return true
		}

		const hit = new Entry(key, value, len, now, maxAge)

		// oversized objects fall out of cache automatically.
		if (hit.length > this[MAX])
		{
			if (this[DISPOSE])
			{
				this[DISPOSE](key, value)
			}

			return false
		}

		this[LENGTH] += hit.length
		this[LRU_LIST].unshift(hit)
		this[CACHE].set(key, this[LRU_LIST].head)
		trim(this)
		return true
	}

	/**
	 * Check if a key is in the cache, without updating the recent-ness
	 * or deleting it for being stale.
	 */
	has(key: K)
	{
		if (!this[CACHE].has(key)) return false
		const hit = this[CACHE].get(key).value
		return !isStale(this, hit)
	}

	/**
	 * Will update the "recently used"-ness of the key. They do what you think.
	 * `maxAge` is optional and overrides the cache `maxAge` option if provided.
	 *
	 * If the key is not found, will return `undefined`.
	 */
	get(key: K)
	{
		return get(this, key, true)
	}

	/**
	 * Returns the key value (or `undefined` if not found) without updating
	 * the "recently used"-ness of the key.
	 *
	 * (If you find yourself using this a lot, you might be using the wrong
	 * sort of data structure, but there are some use cases where it's handy.)
	 */
	peek(key: K)
	{
		return get(this, key, false)
	}

	pop()
	{
		const node = this[LRU_LIST].tail
		if (!node)
		{
			return null
		}

		del(this, node)
		return node.value
	}

	/**
	 * Deletes a key out of the cache.
	 */
	del(key: K)
	{
		del(this, this[CACHE].get(key))
	}

	/**
	 * Loads another cache entries array, obtained with `sourceCache.dump()`,
	 * into the cache. The destination cache is reset before loading new entries
	 *
	 * @param cacheEntries Obtained from `sourceCache.dump()`
	 */
	load(arr: ILruEntry<K, V>[])
	{
		// reset the cache
		this.reset()

		const now = Date.now()
		// A previous serialized cache has the most recent items first
		for (let l = arr.length - 1; l >= 0; l--)
		{
			const hit = arr[l]
			const expiresAt = hit.e || 0
			if (expiresAt === 0)
				// the item was created without expiration in a non aged cache
			{
				this.set(hit.k, hit.v)
			}
			else
			{
				const maxAge = expiresAt - now
				// dont add already expired items
				if (maxAge > 0)
				{
					this.set(hit.k, hit.v, maxAge)
				}
			}
		}
	}

	/**
	 * Manually iterates over the entire cache proactively pruning old entries.
	 */
	prune()
	{
		this[CACHE].forEach((value, key) => get(this, key, false))
	}
}
