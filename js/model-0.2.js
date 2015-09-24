// models

// voxel container
var Ctr = {
  // width, height, depth, solids, voxels
  conf: function (w, h, d, sols, voxs) {
    return { w: w, h: h, d: d, sols: sols, voxs: voxs }
  },
  // iterates the ctr space in order, returns array
  eachPos: function (order, ctr, callback) {
    var arr = []
    // z -> desc, y -> desc, x does not matter
    if (order === 'desc') {
      for (var z = 0; z < ctr.d; z++) {
        for (var y = ctr.h - 1; y >= 0; y--) {
          for (var x = 0; x < ctr.w; x++) callback (Pos.mk (x, y, z), arr)
        }
      }
    }
    // z -> asc, y -> asc, x does not matter
    else if (order === 'asc') {
      for (var z = ctr.d - 1; z >= 0; z--) {
        for (var y = 0; y < ctr.h; y++) {
          for (var x = 0; x < ctr.w; x++) callback (Pos.mk (x, y, z), arr)
        }
      }
    }
    return arr
  }
}

// directions
var Dir = {
  // returns if dir is visible on top tile
  isTop: function (dir) {
    return 'd'.indexOf (dir) === -1
  },
  // returns if dir is visible on bottom tile
  isBottom: function (dir) {
    return 'b'.indexOf (dir) === -1
  },
}

// volume helper
var Vol = {
  // width: x axis, height: y axis, depth: z axis
  mk: function (w, h, d) {
    return { w: w, h: h, d: d }
  },
  // returns the center pos for each length
  center: function (vol) {
    return Pos.mk (Num.half (vol.w) -1, Num.half (vol.h) -1, Num.half (vol.d) -1)
  }
}

// 3D pos in a volume
var Pos = {
  mk: function (x, y, z) {
    return { x: x, y: y, z: z }
  },
  // to string
  format: function (pos) {
    return Object.keys (pos).map (function (a) {
      return a + ': ' + pos[a]
    }).join (', ')
  },
  // move inside a volume (update pos in place), returns necessity to refresh
  move: function (dir, pos, vol) {
    switch (dir) {
      case 'left':
        if (pos.x > 0) {
          pos.x --
          return true
        }
        return false
      case 'right':
        if (pos.x < vol.w -1) {
          pos.x ++
          return true
        }
        return false
      case 'back':
        if (pos.y > 0) {
          pos.y --
          return true
        }
        return false
      case 'front':
        if (pos.y < vol.h -1) {
          pos.y ++
          return true
        }
        return false
      case 'up':
        if (pos.z > 0) {
          pos.z --
          return true
        }
        return false
      case 'down':
        if (pos.z < vol.d -1) {
          pos.z ++
          return true
        }
        return false
      default:
        return false
    }
  },
  // rotate the pos in a volume
  rotate: function (dir, pos, vol) {
    switch (dir) {
      case "r": // x -> reverse y, y -> x
        Rec.update (pos, { x: vol.h - pos.y, y: pos.x })
        break
      case "l": // x -> y, y -> reverse x
        Rec.update (pos, { y: vol.w - pos.x, x: pos.y })
        break
      case "d": // z -> reverse y, y -> z
        Rec.update (pos, { z: vol.h - pos.y, y: pos.z })
        break
      case "u": // z -> y, y -> reverse z
        Rec.update (pos, { y: vol.d - pos.z, z: pos.y })
        break
    }
  },
  // returns true if pos found in group
  exists: function (pos, grp) {
    return grp.ms.some (function (m) {
      return Pos.equals (m, pos)
    })
  },
  // compare pos
  equals: function (a, b) {
    return ['x', 'y', 'z'].every (function (k) {
      return a[k] === b[k]
    })
  },
}

// group helper
var Grp = {
  mk: function (ms) {
    return { ms: ms }
  }
}

// the map (matrix) thing is a volume & a group
var Mtx = {
  mk: function (vol, grp) {
    Rec.update (vol, grp)
    return vol
  },
  rotate: function (dir, focus, mtx) {
    mtx.ms.forEach (function (m) {
      Pos.rotate (dir, m, mtx)
      Links.rotate (dir, m)
    })
    Pos.rotate (dir, focus, mtx)
    switch (dir) {
      case "r": // x -> reverse y, y -> x
      case "l": // x -> y, y -> reverse x
        Rec.update (mtx, { w: mtx.h, h: mtx.w })
        break
      case "d": // z -> reverse y, y -> z
      case "u": // z -> y, y -> reverse z
        Rec.update (mtx, { h: mtx.d, d: mtx.h })
        break
    }
  }
}

// the cell is a pos, a block reference, links, shape
var Cell = {
  mk: function (pos, ref, sh) {
    var pos = Any.clone (pos) // in case I throw the focus in here
    Rec.update (pos, { ref: ref, links: [], sh: sh || -1 })
    return pos
  },
  // adds a cell in group, returns success boolean
  add: function (pos, ref, grp, shape) {
    if (! Pos.exists (pos, grp)) {
      var c = Cell.mk (pos, ref)
      if (shape.on) Shape.add (c, shape)
      grp.ms.push (c)
      return true
    }
    else if (shape.on) {
      var c = Cell.at (pos, grp)
      if (c.sh === -1) {
        Shape.add (c, shape)
        return true
      }
      else if (c.sh != shape.id) {
        var n = Any.clone (c.sh)
        shape.ms[n].map (function (m) {
          Shape.add (m, shape)
          return m
        })
        delete shape.ms[n]
        return true
      }
      if (c.ref != ref) {
        c.ref = ref
        return true
      }
      return false
    }
    return false
  },
  // removes cell from group, returns success boolean
  rm: function (pos, grp, shape) {
    if (Pos.exists (pos, grp)) {
      var c = Cell.at (pos, grp)
      grp.ms = grp.ms.filter (function (m) {
        return ! Pos.equals (m, pos)
      })
      if (c.sh >= 0) Shape.rm (c, shape)
      return true
    }
    return false
  },
  // returns the cell at pos in group
  at: function (pos, grp) {
    return grp.ms.filter (function (m) {
      return Pos.equals (m, pos)
    })[0]
  }
}

// shape (cell array) handler
var Shape = {
  mk: function (grp) {
    Rec.update (grp, { on: false, id: 0 })
    return grp
  },
  // toggles shape mode, return refresh need
  toggle: function (shape, focus, mtx) {
    shape.on = !shape.on
    if (shape.on) {
      if (Pos.exists (focus, mtx)) {
        var c = Cell.at (focus, mtx)
        if (c.sh >= 0) shape.id = c.sh
        else {
          shape.id = shape.ms.length
          Shape.add (c, shape)
        }
      }
      else shape.id = shape.ms.length
    }
    return true
  },
  // returns the active group ms or []
  getCells: function (shape) {
    if (shape.on && shape.ms.length > 0 && shape.id < shape.ms.length)
      return shape.ms[shape.id]
    else return []
  },
  // add a cell to a shape
  add: function (cell, shape) {
    cell.sh = shape.id
    if (shape.id < shape.ms.length) {
      shape.ms[shape.id].push (cell)
      Links.add (cell, shape)
    }
    else shape.ms.push ([cell])
  },
  // remove cell from shape
  rm: function (cell, shape) {
    Links.rm (cell, shape)
    shape.ms[cell.sh] = shape.ms[cell.sh].filter (function (m) {
      return ! Pos.equals (m, cell)
    })
    if (shape.ms[cell.sh].length === 0) Shape.toggle (shape)
  }
}

// links helper ?
var Links = {
  rotate: function (dir, cell) {
    var relative = {}
    switch (dir) {
      case "r": // x -> reverse y, y -> x
        relative = { b: "r", d: "d", f: "l", l: "b", r: "f", u: "u" }
        break
      case "l": // x -> y, y -> reverse x
        relative = { b: "l", d: "d", f: "r", l: "f", r: "b", u: "u" }
        break
      case "d": // z -> reverse y, y -> z
        relative = { b: "d", d: "f", f: "u", l: "l", r: "r", u: "b" }
        break
      case "u": // z -> y, y -> reverse z
        relative = { b: "u", d: "b", f: "d", l: "l", r: "r", u: "f" }
        break
    }
    cell.links = cell.links.map (function (l) {
      return relative[l]
    })
  },
  // returns surrounding cells of the same shape
  detect: function (cell, shape) {
    if (cell.sh === -1) return {}
    var results = {},
      lpos = {
        b: Pos.mk (cell.x, cell.y -1, cell.z),
        d: Pos.mk (cell.x, cell.y, cell.z +1),
        f: Pos.mk (cell.x, cell.y +1, cell.z),
        l: Pos.mk (cell.x -1, cell.y, cell.z),
        r: Pos.mk (cell.x +1, cell.y, cell.z),
        u: Pos.mk (cell.x, cell.y, cell.z -1)
      }
    shape.ms[cell.sh].forEach (function (c) {
      for (var p in lpos) {
        if (Pos.equals (lpos[p], c)) results[p] = c
      }
    })
    return results
  },
  // sets up links
  add: function (cell, shape) {
    var around = Links.detect (cell, shape),
      mirror = { b: "f", d: "u", f: "b", l: "r", r: "l", u: "d" }
    cell.links = []
    if (Object.keys (around).length > 0) {
      for (var dir in around) {
        cell.links.push (dir)
        around[dir].links.push (mirror[dir])
      }
    }
  },
  // remove links
  rm: function (cell, shape) {
    var around = Links.detect (cell, shape),
      mirror = { b: "f", d: "u", f: "b", l: "r", r: "l", u: "d" }
    if (Object.keys (around).length > 0) {
      for (var dir in around) {
        around[dir].links.splice (around[dir].links.indexOf (mirror[dir]), 1)
      }
    }
  }
}
