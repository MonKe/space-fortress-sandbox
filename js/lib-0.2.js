// helpers

// agnostic helper
var Any = {
  // returns a deep copy of a
  clone: function (a) {
    return JSON.parse (JSON.stringify (a))
  },
  equals: function (a, b) {
    return JSON.stringify (a) === JSON.stringify (b)
  }
}

// int helper
var Num = {
  half: function (n) {
    return Num.div (n, 2)
  },
  div: function (a, b) {
    return Math.round (a / b)
  }
}

// object (record) helper
var Rec = {
  // updates a with b contents in place, no ties to b
  update: function (a, b) {
    var nb = Any.clone (b)
    for (var k in nb) a[k] = nb[k]
  },
  // returns new rec as b into a
  merge: function (a, b) {
    var c = Any.clone (a),
      d = Any.clone (b)
    for (var k in d) c[k] = d[k]
    return c
  }
}
