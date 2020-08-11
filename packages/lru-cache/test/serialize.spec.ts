import Yallist from 'yallist';

import LRU from '../';

test('dump', function (done)
{
	const cache = new LRU();

	expect(cache.dump().length).toBe(0)

	cache.set('a', 'A')
	cache.set('b', 'B')
	expect(cache.dump()).toEqual([
		{ k: 'b', v: 'B', e: 0 },
		{ k: 'a', v: 'A', e: 0 },
	])

	cache.set(123, 456)
	expect(cache.dump()).toEqual([
		{ k: 123, v: 456, e: 0 },
		{ k: 'b', v: 'B', e: 0 },
		{ k: 'a', v: 'A', e: 0 },
	])
	cache.del(123)

	cache.set('a', 'A')
	expect(cache.dump()).toEqual([
		{ k: 'a', v: 'A', e: 0 },
		{ k: 'b', v: 'B', e: 0 },
	])

	cache.get('b')
	expect(cache.dump()).toEqual([
		{ k: 'b', v: 'B', e: 0 },
		{ k: 'a', v: 'A', e: 0 },
	])

	cache.del('a')
	expect(cache.dump()).toEqual([
		{ k: 'b', v: 'B', e: 0 },
	])

	done()
})

test('do not dump stale items', function (done)
{
	const n = process.env.CI ? 1000 : 50;
	const cache = new LRU({
		max: 5,
		maxAge: Math.floor(n * 1.5),
	});

	// expires at 50
	cache.set('a', 'A')
	setTimeout(step1, n)

	function step1()
	{
		// expires at 75
		cache.set('b', 'B')
		const s = cache.dump();
		expect(s.length).toBe(2)
		expect(s[0].k).toBe('b')
		expect(s[1].k).toBe('a')
		setTimeout(step2, n)
	}

	function step2()
	{
		// expires at 110
		cache.set('c', 'C')
		const s = cache.dump();
		expect(s.length).toBe(2)
		expect(s[0].k).toBe('c')
		expect(s[1].k).toBe('b')
		setTimeout(step3, n)
	}

	function step3()
	{
		// expires at 130
		cache.set('d', 'D', n * 3)
		const s = cache.dump();
		expect(s.length).toBe(2)
		expect(s[0].k).toBe('d')
		expect(s[1].k).toBe('c')
		setTimeout(step4, n * 2)
	}

	function step4()
	{
		const s = cache.dump();
		expect(s.length).toBe(1)
		expect(s[0].k).toBe('d')
		setTimeout(step5, n)
	}

	function step5()
	{
		const s = cache.dump();
		expect(s).toEqual([])
		done()
	}
})

test('load basic cache', function (done)
{
	const cache = new LRU();
	const copy = new LRU();

	cache.set('a', 'A')
	cache.set('b', 'B')
	cache.set(123, 456)

	copy.load(cache.dump())
	expect(cache.dump()).toEqual(copy.dump())

	expect(cache.dump()).toMatchSnapshot();

	done()
})

test('load staled cache', function (done)
{
	const cache = new LRU({ maxAge: 100 });
	const copy = new LRU({ maxAge: 100 });
	let arr;

	// expires at 50
	cache.set('a', 'A')
	setTimeout(function ()
	{
		// expires at 80
		cache.set('b', 'B')
		arr = cache.dump()
		expect(arr.length).toBe(2)
	}, 50)

	setTimeout(function ()
	{
		copy.load(arr)
		expect(copy.get('a')).toBe(undefined)
		expect(copy.get('b')).toBe('B')
	}, 120)

	setTimeout(function ()
	{
		expect(copy.get('b')).toBe(undefined)
		done()
	}, 200)
})

test('load to other size cache', function ()
{
	const cache = new LRU({ max: 2 });
	const copy = new LRU({ max: 1 });

	cache.set('a', 'A')
	cache.set('b', 'B')

	copy.load(cache.dump())
	expect(copy.get('a')).toBe(undefined)
	expect(copy.get('b')).toBe('B')

	// update the last read from original cache
	cache.get('a')
	copy.load(cache.dump())
	expect(copy.get('a')).toBe('A')
	expect(copy.get('b')).toBe(undefined)
})

test('load to other age cache', function (done)
{
	const cache = new LRU({ maxAge: 250 });
	const aged = new LRU({ maxAge: 500 });
	const simple = new LRU();
	let arr;

	// created at 0
	// a would be valid till 0 + 250
	cache.set('a', 'A')
	setTimeout(function ()
	{
		// created at 20
		// b would be valid till 100 + 250
		cache.set('b', 'B')
		// b would be valid till 100 + 350
		cache.set('c', 'C', 350)
		arr = cache.dump()
		expect(arr.length).toBe(3)
	}, 100)

	setTimeout(function ()
	{
		expect(cache.get('a')).toBe(undefined)
		expect(cache.get('b')).toBe('B')
		expect(cache.get('c')).toBe('C')

		aged.load(arr)
		expect(aged.get('a')).toBe(undefined)
		expect(aged.get('b')).toBe('B')
		expect(aged.get('c')).toBe('C')

		simple.load(arr)
		expect(simple.get('a')).toBe(undefined)
		expect(simple.get('b')).toBe('B')
		expect(simple.get('c')).toBe('C')
	}, 300)

	setTimeout(function ()
	{
		expect(cache.get('a')).toBe(undefined)
		expect(cache.get('b')).toBe(undefined)
		expect(cache.get('c')).toBe('C')

		aged.load(arr)
		expect(aged.get('a')).toBe(undefined)
		expect(aged.get('b')).toBe(undefined)
		expect(aged.get('c')).toBe('C')

		simple.load(arr)
		expect(simple.get('a')).toBe(undefined)
		expect(simple.get('b')).toBe(undefined)
		expect(simple.get('c')).toBe('C')
	}, 400)

	setTimeout(function ()
	{
		expect(cache.get('a')).toBe(undefined)
		expect(cache.get('b')).toBe(undefined)
		expect(cache.get('c')).toBe(undefined)

		aged.load(arr)
		expect(aged.get('a')).toBe(undefined)
		expect(aged.get('b')).toBe(undefined)
		expect(aged.get('c')).toBe(undefined)

		simple.load(arr)
		expect(simple.get('a')).toBe(undefined)
		expect(simple.get('b')).toBe(undefined)
		expect(simple.get('c')).toBe(undefined)

		done()
	}, 500)
})

test('dumpLru', function ()
{
	const l = new LRU();
	expect(l.dumpLru()).toBeInstanceOf(Yallist)

	expect(l.dumpLru()).toMatchSnapshot();
})
