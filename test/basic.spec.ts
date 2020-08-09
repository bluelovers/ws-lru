var LRU = require('../')

test('basic', function (done) {
  var cache = new LRU({ max: 10 })
  cache.set('key', 'value')
  expect(cache.get('key')).toBe('value')
  expect(cache.get('nada')).toBe(undefined)
  expect(cache.length).toBe(1)
  expect(cache.max).toBe(10)
  done()
})

test('least recently set', function (done) {
  var cache = new LRU(2)
  cache.set('a', 'A')
  cache.set('b', 'B')
  cache.set('c', 'C')
  expect(cache.get('c')).toBe('C')
  expect(cache.get('b')).toBe('B')
  expect(cache.get('a')).toBe(undefined)
  done()
})

test('lru recently gotten', function (done) {
  var cache = new LRU(2)
  cache.set('a', 'A')
  cache.set('b', 'B')
  cache.get('a')
  cache.set('c', 'C')
  expect(cache.get('c')).toBe('C')
  expect(cache.get('b')).toBe(undefined)
  expect(cache.get('a')).toBe('A')
  done()
})

test('del', function (done) {
  var cache = new LRU(2)
  cache.set('a', 'A')
  cache.del('a')
  expect(cache.get('a')).toBe(undefined)
  done()
})

test('max', function (done) {
  var cache = new LRU(3)

  // test changing the max, verify that the LRU items get dropped.
  cache.max = 100
  var i
  for (i = 0; i < 100; i++) cache.set(i, i)
  expect(cache.length).toBe(100)
  for (i = 0; i < 100; i++) {
    expect(cache.get(i)).toBe(i)
  }
  cache.max = 3
  expect(cache.length).toBe(3)
  for (i = 0; i < 97; i++) {
    expect(cache.get(i)).toBe(undefined)
  }
  for (i = 98; i < 100; i++) {
    expect(cache.get(i)).toBe(i)
  }

  // now remove the max restriction, and try again.
  cache.max = 0
  for (i = 0; i < 100; i++) cache.set(i, i)
  expect(cache.length).toBe(100)
  for (i = 0; i < 100; i++) {
    expect(cache.get(i)).toBe(i)
  }
  // should trigger an immediate resize
  cache.max = 3
  expect(cache.length).toBe(3)
  for (i = 0; i < 97; i++) {
    expect(cache.get(i)).toBe(undefined)
  }
  for (i = 98; i < 100; i++) {
    expect(cache.get(i)).toBe(i)
  }
  done()
})

test('reset', function (done) {
  var cache = new LRU(10)
  cache.set('a', 'A')
  cache.set('b', 'B')
  cache.reset()
  expect(cache.length).toBe(0)
  expect(cache.max).toBe(10)
  expect(cache.get('a')).toBe(undefined)
  expect(cache.get('b')).toBe(undefined)
  done()
})

test('basic with weighed length', function (done) {
  var cache = new LRU({
    max: 100,
    length: function (item, key) {
      expect(typeof key).toBe('string')
      return item.size
    }
  })
  cache.set('key', { val: 'value', size: 50 })
  expect(cache.get('key').val).toBe('value')
  expect(cache.get('nada')).toBe(undefined)
  expect(cache.lengthCalculator(cache.get('key'), 'key')).toBe(50)
  expect(cache.length).toBe(50)
  expect(cache.max).toBe(100)
  done()
})

test('weighed length item too large', function (done) {
  var cache = new LRU({
    max: 10,
    length: function (item) { return item.size }
  })
  expect(cache.max).toBe(10)

  // should fall out immediately
  cache.set('key', { val: 'value', size: 50 })

  expect(cache.length).toBe(0)
  expect(cache.get('key')).toBe(undefined)
  done()
})

test('least recently set with weighed length', function (done) {
  var cache = new LRU({
    max: 8,
    length: function (item) { return item.length }
  })
  cache.set('a', 'A')
  cache.set('b', 'BB')
  cache.set('c', 'CCC')
  cache.set('d', 'DDDD')
  expect(cache.get('d')).toBe('DDDD')
  expect(cache.get('c')).toBe('CCC')
  expect(cache.get('b')).toBe(undefined)
  expect(cache.get('a')).toBe(undefined)
  done()
})

test('lru recently gotten with weighed length', function (done) {
  var cache = new LRU({
    max: 8,
    length: function (item) { return item.length }
  })
  cache.set('a', 'A')
  cache.set('b', 'BB')
  cache.set('c', 'CCC')
  cache.get('a')
  cache.get('b')
  cache.set('d', 'DDDD')
  expect(cache.get('c')).toBe(undefined)
  expect(cache.get('d')).toBe('DDDD')
  expect(cache.get('b')).toBe('BB')
  expect(cache.get('a')).toBe('A')
  done()
})

test('lru recently updated with weighed length', function (done) {
  var cache = new LRU({
    max: 8,
    length: function (item) { return item.length }
  })
  cache.set('a', 'A')
  cache.set('b', 'BB')
  cache.set('c', 'CCC')
  expect(cache.length).toBe(6) // CCC BB A
  cache.set('a', '+A')
  expect(cache.length).toBe(7) // +A CCC BB
  cache.set('b', '++BB')
  expect(cache.length).toBe(6) // ++BB +A
  expect(cache.get('c')).toBe(undefined)

  cache.set('c', 'oversized')
  expect(cache.length).toBe(6) // ++BB +A
  expect(cache.get('c')).toBe(undefined)

  cache.set('a', 'oversized')
  expect(cache.length).toBe(4) // ++BB
  expect(cache.get('a')).toBe(undefined)
  expect(cache.get('b')).toBe('++BB')
  done()
})

test('set returns proper booleans', function (done) {
  var cache = new LRU({
    max: 5,
    length: function (item) { return item.length }
  })

  expect(cache.set('a', 'A')).toBe(true)

  // should return false for max exceeded
  expect(cache.set('b', 'donuts')).toBe(false)

  expect(cache.set('b', 'B')).toBe(true)
  expect(cache.set('c', 'CCCC')).toBe(true)
  done()
})

test('drop the old items', function (done) {
  var n = process.env.CI ? 1000 : 100
  var cache = new LRU({
    max: 5,
    maxAge: n * 2
  })

  cache.set('a', 'A')

  setTimeout(function () {
    cache.set('b', 'b')
    expect(cache.get('a')).toBe('A')
  }, n)

  setTimeout(function () {
    cache.set('c', 'C')
    // timed out
    expect(cache.get('a')).toBeFalsy()
  }, n * 3)

  setTimeout(function () {
    expect(cache.get('b')).toBeFalsy()
    expect(cache.get('c')).toBe('C')
  }, n * 4)

  setTimeout(function () {
    expect(cache.get('c')).toBeFalsy()
    done()
  }, n * 6)
})

test('manual pruning', function (done) {
  var cache = new LRU({
    max: 5,
    maxAge: 50
  })

  cache.set('a', 'A')
  cache.set('b', 'b')
  cache.set('c', 'C')

  setTimeout(function () {
    cache.prune()

    expect(cache.get('a')).toBeFalsy()
    expect(cache.get('b')).toBeFalsy()
    expect(cache.get('c')).toBeFalsy()

    done()
  }, 100)
})

test('individual item can have its own maxAge', function (done) {
  var cache = new LRU({
    max: 5,
    maxAge: 50
  })

  cache.set('a', 'A', 20)
  setTimeout(function () {
    expect(cache.get('a')).toBeFalsy()
    done()
  }, 25)
})

test('individual item can have its own maxAge > cache', function (done) {
  var cache = new LRU({
    max: 5,
    maxAge: 20
  })

  cache.set('a', 'A', 50)
  setTimeout(function () {
    expect(cache.get('a')).toBe('A')
    done()
  }, 25)
})

test('disposal function', function (done) {
  var disposed = false
  var cache = new LRU({
    max: 1,
    dispose: function (k, n) {
      disposed = n
    }
  })

  cache.set(1, 1)
  cache.set(2, 2)
  expect(disposed).toBe(1)
  cache.set(2, 10)
  expect(disposed).toBe(2)
  cache.set(3, 3)
  expect(disposed).toBe(10)
  cache.reset()
  expect(disposed).toBe(3)
  done()
})

test('no dispose on set', function (done) {
  var disposed = false
  var cache = new LRU({
    max: 1,
    noDisposeOnSet: true,
    dispose: function (k, n) {
      disposed = n
    }
  })

  cache.set(1, 1)
  cache.set(1, 10)
  expect(disposed).toBe(false)
  done()
})

test('disposal function on too big of item', function (done) {
  var disposed = false
  var cache = new LRU({
    max: 1,
    length: function (k) {
      return k.length
    },
    dispose: function (k, n) {
      disposed = n
    }
  })
  var obj = [ 1, 2 ]

  expect(disposed).toBe(false)
  cache.set('obj', obj)
  expect(disposed).toBe(obj)
  done()
})

test('has()', function (done) {
  var cache = new LRU({
    max: 1,
    maxAge: 10
  })

  cache.set('foo', 'bar')
  expect(cache.has('foo')).toBe(true)
  cache.set('blu', 'baz')
  expect(cache.has('foo')).toBe(false)
  expect(cache.has('blu')).toBe(true)
  setTimeout(function () {
    expect(cache.has('blu')).toBe(false)
    done()
  }, 15)
})

test('stale', function (done) {
  var cache = new LRU({
    maxAge: 10,
    stale: true
  })

  expect(cache.allowStale).toBe(true)
  cache.allowStale = false
  expect(cache.allowStale).toBe(false)
  cache.allowStale = true
  expect(cache.allowStale).toBe(true)

  cache.set('foo', 'bar')
  expect(cache.get('foo')).toBe('bar')
  expect(cache.has('foo')).toBe(true)
  setTimeout(function () {
    expect(cache.has('foo')).toBe(false)
    expect(cache.get('foo')).toBe('bar')
    expect(cache.get('foo')).toBe(undefined)
    done()
  }, 15)
})

test('lru update via set', function (done) {
  var cache = new LRU({ max: 2 })

  cache.set('foo', 1)
  cache.set('bar', 2)
  cache.del('bar')
  cache.set('baz', 3)
  cache.set('qux', 4)

  expect(cache.get('foo')).toBe(undefined)
  expect(cache.get('bar')).toBe(undefined)
  expect(cache.get('baz')).toBe(3)
  expect(cache.get('qux')).toBe(4)
  done()
})

test('least recently set w/ peek', function (done) {
  var cache = new LRU(2)
  cache.set('a', 'A')
  cache.set('b', 'B')
  expect(cache.peek('a')).toBe('A')
  cache.set('c', 'C')
  expect(cache.get('c')).toBe('C')
  expect(cache.get('b')).toBe('B')
  expect(cache.get('a')).toBe(undefined)
  done()
})

test('pop the least used item', function (done) {
  var cache = new LRU(3)
  var last

  cache.set('a', 'A')
  cache.set('b', 'B')
  cache.set('c', 'C')

  expect(cache.length).toBe(3)
  expect(cache.max).toBe(3)

  // Ensure we pop a, c, b
  cache.get('b', 'B')

  last = cache.pop()
  expect(last.key).toBe('a')
  expect(last.value).toBe('A')
  expect(cache.length).toBe(2)
  expect(cache.max).toBe(3)

  last = cache.pop()
  expect(last.key).toBe('c')
  expect(last.value).toBe('C')
  expect(cache.length).toBe(1)
  expect(cache.max).toBe(3)

  last = cache.pop()
  expect(last.key).toBe('b')
  expect(last.value).toBe('B')
  expect(cache.length).toBe(0)
  expect(cache.max).toBe(3)

  last = cache.pop()
  expect(last).toBe(null)
  expect(cache.length).toBe(0)
  expect(cache.max).toBe(3)

  done()
})

test('get and set only accepts strings and numbers as keys', function (done) {
  var cache = new LRU()

  cache.set('key', 'value')
  cache.set(123, 456)

  expect(cache.get('key')).toBe('value')
  expect(cache.get(123)).toBe(456)

  done()
})

test('peek with wierd keys', function (done) {
  var cache = new LRU()

  cache.set('key', 'value')
  cache.set(123, 456)

  expect(cache.peek('key')).toBe('value')
  expect(cache.peek(123)).toBe(456)

  expect(cache.peek({
    toString: function () { return 'key' }
  })).toBe(undefined)

  done()
})

test('invalid length calc results in basic length', function (done) {
  var l = new LRU({ length: true })
  expect(typeof l.lengthCalculator).toBe('function')
  l.lengthCalculator = 'not a function'
  expect(typeof l.lengthCalculator).toBe('function')
  done()
})

test('change length calculator recalculates', function (done) {
  var l = new LRU({ max: 3 })
  l.set(2, 2)
  l.set(1, 1)
  l.lengthCalculator = function (key, val) {
    return key + val
  }
  expect(l.itemCount).toBe(1)
  expect(l.get(2)).toBe(undefined)
  expect(l.get(1)).toBe(1)
  l.set(0, 1)
  expect(l.itemCount).toBe(2)
  l.lengthCalculator = function (key, val) {
    return key
  }
  expect(l.lengthCalculator(1, 10)).toBe(1)
  expect(l.lengthCalculator(10, 1)).toBe(10)
  l.lengthCalculator = { not: 'a function' }
  expect(l.lengthCalculator(1, 10)).toBe(1)
  expect(l.lengthCalculator(10, 1)).toBe(1)
  done()
})

test('delete non-existent item has no effect', function (done) {
  var l = new LRU({ max: 2 })
  l.set('foo', 1)
  l.set('bar', 2)
  l.del('baz')
  expect(l.dumpLru().toArray().map(function (hit) {
    return hit.key
  })).toEqual([ 'bar', 'foo' ])
  done()
})

test('maxAge on list, cleared in forEach', function (done) {
  var l = new LRU({ stale: true })
  l.set('foo', 1)

  // hacky.  make it seem older.
  l.dumpLru().head.value.now = Date.now() - 100000

  expect(l.maxAge).toBe(0)

  l.maxAge = 1

  var saw = false
  l.forEach(function (val, key) {
    saw = true
    expect(key).toBe('foo')
  })
  expect(saw).toBeTruthy()
  expect(l.length).toBe(0)

  done()
})

test('bad max/maxAge options', done => {
  expect(() => new LRU({ maxAge: true })).toThrow()
  expect(() => { new LRU().maxAge = 'foo' }).toThrow()
  expect(() => new LRU({ max: true })).toThrow()
  expect(() => { new LRU().max = 'foo' }).toThrow()
  const c = new LRU({
    max: 2
  })
  expect(() => c.set('a', 'A', 'true')).toThrow('maxAge must be a number')
  done()
})

test('update age on get', done => {
  const l = new LRU({ updateAgeOnGet: true, maxAge: 10 })
  l.set('foo', 'bar')
  const e1 = l.dump()[0].e
  // spin for 5ms
  for (let then = Date.now() + 5; then > Date.now(); );
  l.get('foo')
  const e2 = l.dump()[0].e
  // spin for 5ms
  for (let then = Date.now() + 5; then > Date.now(); );
  l.get('foo')
  const e3 = l.dump()[0].e
  expect(e1 < e2).toBeTruthy()
  expect(e2 < e3).toBeTruthy()
  done()
})
