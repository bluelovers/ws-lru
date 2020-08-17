# README.md

    Least Recently Map/Set, make every add/set will at end of entries

## install

```bash
yarn add least-recently-record
yarn-tool add least-recently-record
yt add least-recently-record
```

```ts
import { LeastRecentlyMap } from '../map';
import LeastRecentlySet from '../set';

test(`LeastRecentlyMap`, () =>
{
	let data = new LeastRecentlyMap();

	data.set(2, 2)
	data.set(1, 1)

	console.dir(data)

	let actual = [...data.entries()];
	let actual2 = [...data.keys()];

	expect(actual).toStrictEqual([[2, 2], [1, 1]]);
	expect(actual2).toStrictEqual([2, 1]);

	data.set(2, 2)

	actual = [...data.entries()];
	actual2 = [...data.keys()];

	expect(actual).toStrictEqual([[1, 1], [2, 2]]);
	expect(actual2).toStrictEqual([1, 2]);

	expect(data).toMatchSnapshot();

});

test(`LeastRecentlySet`, () =>
{
	let data = new LeastRecentlySet();

	data.add(2)
	data.add(1)

	console.dir(data)

	let actual = [...data.entries()];
	let actual2 = [...data.keys()];

	expect(actual).toStrictEqual([[2, 2], [1, 1]]);
	expect(actual2).toStrictEqual([2, 1]);

	data.add(2)

	actual = [...data.entries()];
	actual2 = [...data.keys()];

	expect(actual).toStrictEqual([[1, 1], [2, 2]]);
	expect(actual2).toStrictEqual([1, 2]);

	expect(data).toMatchSnapshot();

});
```
