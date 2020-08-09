'use strict'

import benchmark from 'benchmark';
import LRU from '../';

const suite = new benchmark.Suite();

function add(name, fn)
{
	suite.add(name, fn)
}

// SET
const lru1 = new LRU({
	max: 1000,
});
let lru1Counter = 0;

add('set', function ()
{
	lru1.set('key' + (lru1Counter++), 'value')
})

// GET and PEEK
const lru2 = new LRU({
	max: 1000,
});
let lru2Counter = 0;

for (let i = 0; i < 1000; i++)
{
	lru2.set('key' + i, 'value')
}

add('get', function ()
{
	lru2.get('key' + (lru2Counter++) % 1000)
})

add('peek', function ()
{
	lru2.peek('key' + (lru2Counter++) % 1000)
})

// SET with maxAge
const lru3 = new LRU({
	max: 1000,
});
const lru3Counter = 0;

add('set with `maxAge`', function ()
{
	lru3.set('key' + (lru1Counter++), 'value', 100000)
})

suite
	.on('cycle', (event) =>
	{
		console.log(String(event.target))
		if (event.target.error)
		{
			console.error(event.target.error)
		}
	})
	.run()
