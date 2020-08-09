import Cache from '../index';
import path, { basename, dirname } from 'path';
import { readFileSync, writeFileSync } from 'fs';
import { dirSync, fileSync } from 'tmp';

test("no cacheName provided", done =>
{
	// @ts-ignore
	expect(() => {new Cache({ max: 100 });}).toThrowErrorMatchingSnapshot();
	done();
});

test("retrieve missing cache", done =>
{
	const { name: cwd, removeCallback } = dirSync();

	const cache = new Cache({
		max: 100,
		cacheName: "cache",
		cwd,
	});
	expect(cache.get("first-item")).toEqual(undefined);

	removeCallback();

	done();
});

test("cache file missing", done =>
{
	const cache = new Cache({
		max: 100,
		cacheName: "cache",
		cwd: __dirname,
	});
	expect(cache.dump()).toMatchSnapshot();
	done();
});

test("retrieve existing cache", done =>
{

	const { name, removeCallback } = fileSync();

	writeFileSync(name, '[{"k":"second-item","v":["foo","echo"],"e":0},{"k":"first-item","v":["foo","bar"],"e":0}]');

	const cwd = dirname(name)
	const cacheName = basename(name)

	const cache = new Cache({
		max: 100,
		cacheName,
		cwd,
	});
	expect(cache.get("first-item")).toEqual(["foo", "bar"]);
	expect(cache.get("second-item")).toEqual(["foo", "echo"]);

	removeCallback();

	done();
});

test("set to existing cache", done =>
{

	const { name, removeCallback } = fileSync();

	writeFileSync(name, '[{"k":"second-item","v":["foo","echo"],"e":0},{"k":"first-item","v":["foo","bar"],"e":0}]');

	const cwd = dirname(name)
	const cacheName = basename(name)

	const cache = new Cache({
		max: 100,
		cacheName,
		cwd,
	});
	cache.set("third-item", { foo: "bar" });

	expect(cache.dump()).toMatchSnapshot();

	removeCallback();
	done();
});

test("set more than max", done =>
{

	const { name, removeCallback } = fileSync();

	writeFileSync(name, '[{"k":"second-item","v":["foo","echo"],"e":0},{"k":"first-item","v":["foo","bar"],"e":0}]');

	const cwd = dirname(name)
	const cacheName = basename(name)

	const cache = new Cache({
		max: 2,
		cacheName,
		cwd,
	});
	cache.set("third-item", { foo: "bar" });
	expect(cache.dump()).toMatchSnapshot();
	removeCallback();
	done();
});

test("write cache to fs on fsDump", done =>
{

	const { name, removeCallback } = fileSync();

	writeFileSync(name, '[{"k":"second-item","v":["foo","echo"],"e":0},{"k":"first-item","v":["foo","bar"],"e":0}]');

	const cwd = dirname(name)
	const cacheName = basename(name)

	const cache = new Cache({
		cacheName,
		cwd,
	});
	cache.set("third-item", { foo: "bar" });

	// dump to fs
	cache.fsDump();

	// read cache file manually
	const cacheFile = readFileSync(name, "utf8");

	expect(JSON.parse(cacheFile)).toMatchSnapshot();
	removeCallback();
	done();
});
