var LRU = require('../')

test('forEach', function (done) {
  var l = new LRU(5)
  var i
  for (i = 0; i < 10; i++) {
    l.set(i, i.toString(2))
  }

  i = 9
  l.forEach(function (val, key, cache) {
    expect(cache).toBe(l)
    expect(key).toBe(i)
    expect(val).toBe(i.toString(2))
    i -= 1
  })

  // get in order of most recently used
  l.get(6)
  l.get(8)

  var order = [ 8, 6, 9, 7, 5 ]
  i = 0

  l.forEach(function (val, key, cache) {
    var j = order[i++]
    expect(cache).toBe(l)
    expect(key).toBe(j)
    expect(val).toBe(j.toString(2))
  })
  expect(i).toBe(order.length)

  i = 0
  order.reverse()
  l.rforEach(function (val, key, cache) {
    var j = order[i++]
    expect(cache).toBe(l)
    expect(key).toBe(j)
    expect(val).toBe(j.toString(2))
  })
  expect(i).toBe(order.length)

  done()
})

test('keys() and values()', function (done) {
  var l = new LRU(5)
  var i
  for (i = 0; i < 10; i++) {
    l.set(i, i.toString(2))
  }

  t.similar(l.keys(), [9, 8, 7, 6, 5])
  t.similar(l.values(), ['1001', '1000', '111', '110', '101'])

  // get in order of most recently used
  l.get(6)
  l.get(8)

  t.similar(l.keys(), [8, 6, 9, 7, 5])
  t.similar(l.values(), ['1000', '110', '1001', '111', '101'])

  done()
})

test('all entries are iterated over', function (done) {
  var l = new LRU(5)
  var i
  for (i = 0; i < 10; i++) {
    l.set(i.toString(), i.toString(2))
  }

  i = 0
  l.forEach(function (val, key, cache) {
    if (i > 0) {
      cache.del(key)
    }
    i += 1
  })

  expect(i).toBe(5)
  expect(l.keys().length).toBe(1)

  done()
})

test('all stale entries are removed', function (done) {
  var l = new LRU({ max: 5, maxAge: -5, stale: true })
  var i
  for (i = 0; i < 10; i++) {
    l.set(i.toString(), i.toString(2))
  }

  i = 0
  l.forEach(function () {
    i += 1
  })

  expect(i).toBe(5)
  expect(l.keys().length).toBe(0)

  done()
})

test('expires', function (done) {
  var l = new LRU({
    max: 10,
    maxAge: 50
  })
  var i
  for (i = 0; i < 10; i++) {
    l.set(i.toString(), i.toString(2), ((i % 2) ? 25 : undefined))
  }

  i = 0
  var order = [ 8, 6, 4, 2, 0 ]
  setTimeout(function () {
    l.forEach(function (val, key, cache) {
      var j = order[i++]
      expect(cache).toBe(l)
      expect(key).toBe(j.toString())
      expect(val).toBe(j.toString(2))
    })
    expect(i).toBe(order.length)

    setTimeout(function () {
      var count = 0
      l.forEach(function (val, key, cache) { count++ })
      expect(0).toBe(count)
      done()
    }, 25)
  }, 26)
})
