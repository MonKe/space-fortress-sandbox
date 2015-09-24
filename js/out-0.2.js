// output related functions

// handles tiling on a rectangular grid
var Grid = {
  // width, height, grid state
  conf: function (w, h, gs) {
    return { w: w, h: h, gs: gs }
  },
  // returns grid state (tiles array) from the current container
  toGS: function (focus, ctr, grd) {
    var off = Grid.offset (focus, grd)
    return Ctr.eachPos ('desc', ctr, function (p, arr) {
      if (Pos.equals (p, focus)) {
        var ts = Grid.tile (Cell.mk (p, 'focus'), off, arr)
        ts.forEach (function (t) {
          arr.push (t)
        })
      }
      if (Pos.exists (p, ctr) && View.visible (p, focus, IO.view)) {
        var ts = Grid.tile (Cell.at (p, ctr), off, arr)
        ts.forEach (function (t) {
          arr.push (t)
        })
      }
    })
  },
  // returns tiles from voxel after checking the grid state
  tile: function (vox, off, gs) {
    var tile = {
      x: off.x + vox.x,
      y: off.y + vox.y + vox.z,
      mat: vox.ref,
      links: vox.links,
      cover: IO.tileset[vox.ref].cover
    }
    if (IO.tileset[vox.ref].covermask) {
      tile.cover = Sprite.cover (tile, IO.tileset[vox.ref])
    }
    var top = Rec.merge (tile, { part: 'top' }),
      bottom = Rec.merge (tile, { y: tile.y + 1, part: 'bottom' })
    // only return if tile not occupied
    return [top, bottom].filter (function (t) {
      return ! Grid.contains (t, gs)
    })
  },
  offset: function (focus, vol) {
    return {
      x: Num.div (vol.w, 2) - focus.x - 1,
      y: Num.div (vol.h, 2) - focus.y - focus.z -1
    }
  },
  contains: function (tile, gs) {
    return gs.some (function (t) {
      return t.x === tile.x && t.y === tile.y && t.cover
    })
  }
}

// main gfx area, where tiles are displayed
var Board = {
  mk: function (el, bg) {
    var b = { bg: bg, tiles: [] }
    // setup main board
    b.ctxEl = el
    Rec.update (el, {
      width: IO.grid.w * IO.unit.w,
      height: IO.grid.h * IO.unit.h
    })
    b.ctx = el.getContext ('2d')
    // setup buffer for pre-draw
    b.buffEl = document.createElement ('canvas')
    Rec.update (b.buffEl, {
      width: el.width,
      height: el.height
    })
    b.buff = b.buffEl.getContext ('2d')
    // buffer the background
    b.buff.fillStyle = bg
    b.buff.fillRect (0, 0, el.width, el.height)
    // return board to hook in IO
    return b
  },
  refresh: function (board, focus, mtx, force) {
    var gs = Grid.toGS (focus, mtx, State.grid)
    if (gs.length > 0 || force) {
      State.grid.gs = gs
      board.buff.fillRect (0, 0, board.buffEl.width, board.buffEl.height)
      if (Board.render (gs, board.buff) || force)
        board.ctx.drawImage (board.buffEl, 0, 0)
    }
  },
  // returns array of tiles ordered by draw order (z-desc > y-desc > x-desc)
  tile: function (focus, mtx, tiles) {
    var ts = [],
      center = Vol.center (IO.grid)
      offset = Pos.mk (center.x - focus.x, center.y - focus.y, 0)
    for (var z = mtx.d -1; z >= 0; z--) {
      for (var y = 0; y < mtx.h; y++) {
        for (var x = 0; x < mtx.w; x++) {
          // add the block
          var p = Pos.mk (x, y, z)
          if (Pos.exists (p, mtx) && View.visible (p, focus, IO.view)) {
            var t = Any.clone (Cell.at (p, mtx))
            Rec.update (t, {
              x: (x + offset.x) * IO.unit.w,
              y: ((y + offset.y) * IO.unit.h) - ((focus.z - z) * IO.unit.d),
              focus: Pos.equals (p, focus)// || (IO.shape.on && t.sh === IO.shape.id)
            })
            delete t.z
            Rec.update (t, Sprite.clip (t))
            ts.push (t)
          }
          // add focus if center but no block
          else if (Pos.equals (p, focus)) {
            var f = Cell.mk (p, 'focus')
            Rec.update (f, {
              x: (x + offset.x) * IO.unit.w,
              y: ((y + offset.y) * IO.unit.h),
              focus: false
            })
            delete f.z
            Rec.update (f, Sprite.clip (f))
            ts.push (f)
          }
        }
      }
    }
    return ts
  },
  // draw on ctx, return success
  render: function (gs, ctx) {
    var u = { w: IO.unit.w, h: IO.unit.h }
    gs.reverse ().forEach (function (t) {
      var t = Rec.merge (t, Sprite.clip (t))
      ctx.drawImage (IO.tileset[t.mat].el, t.ox, t.oy + t.opart, u.w, u.h, t.x * u.w, t.y * u.h, u.w, u.h)
    })
    return true
  }
}

// describes sprites their relationship with tiles
var Sprite = {
  // preparing a sprite dictionnary
  mk: function () {
    return {
      links: Sprite.orderLinks ()
    }
  },
  // returns offsetx, offsety, offsetpart of clip based on sprite type
  clip: function (tile) {
    var opart = tile.part === 'bottom' ? IO.unit.h : 0
    switch (IO.tileset[tile.mat].sprite) {
      case 'links':
        var s = Sprite.link (tile.links.sort ().join (''))
        s.opart = opart
        return s
      case 'custom':
        var s = Sprite.custom (tile, IO.tileset[tile.mat])
        s.opart = opart
        return s
      default:
        return { ox: 0, oy: 0, opart: opart }
    }
  },
  // return sprite offset based on link ref
  link: function (lref) {
    if (lref === '') return { ox: 0, oy: 0 }
    else return {
      ox: 0,
      oy: (IO.sprite.links.indexOf (lref) +1) * (IO.unit.h + IO.unit.d)
    }
  },
  // returns all calculated link refs
  orderLinks: function () {
    // calc function
    function mix (acc, xs) {
      var xs = xs.slice (),
          x1 = xs[0],
          x2 = xs[1],
          rest = xs.slice (2)
      if (acc.indexOf (x1) === -1) acc.push (x1)
      if (xs.length > 1) {
        mix (acc, [x1 + x2].concat (rest))
        mix (acc, [x1].concat (rest))
        mix (acc, [x2].concat (rest))
      }
      return acc
    }
    // apply calc to dirs
    var dirs = "bdflru".split (""),
      lr = mix ([], dirs).sort (),
      results = []
    // order it all by length
    for (var i = 1; i <= dirs.length; i++)
      results = results.concat (lr.filter (function (l) {
        return l.length === i
      }))
    return results
  },
  // custom open dirs sprite
  custom: function (tile, mat) {
    var l = '', line = mat.sp[tile.part].split (' ')
    if (tile.part === 'top') {
      l = tile.links.filter (Dir.isTop).sort ().join ('')
    }
    else if (tile.part === 'bottom') {
      l = tile.links.filter (Dir.isBottom).sort ().join ('')
    }
    if (l === '') return { ox: 0, oy: 0 }
    else if (line.indexOf (l) != -1)
      return { ox: line.indexOf (l) * IO.unit.w, oy: 0 }
    else {
      for (var a in mat.sp.alias) {
        var al = mat.sp.alias[a].split (' ')
        if (al.indexOf (l) != -1) {
          return { ox: line.indexOf (a) * IO.unit.w, oy: 0 }
        }
      }
      return { ox: 0, oy: 0 }
    }
  },
  // true cover depending on the sprite
  cover: function (tile, mat) {
    var l = '', cv = mat.covermask.split (' '), results = tile.cover
    if (tile.part === 'top') {
      l = tile.links.filter (Dir.isTop).sort ().join ('')
    }
    else if (tile.part === 'bottom') {
      l = tile.links.filter (Dir.isBottom).sort ().join ('')
    }
    if (l === '') return (results ^ (cv.indexOf ('*') != -1)) != 0
    else return (results ^ (cv.indexOf (l) != -1)) != 0
  }
}

// tile dictionnary
var Tileset = {
  mk: function (els, set) {
    var blankEl = document.createElement ('canvas'),
      blankCtx = blankEl.getContext ('2d')
    Rec.update (blankEl, { width: IO.unit.w, height: IO.unit.h + IO.unit.d })
    blankCtx.fillStyle = IO.board.bg
    blankCtx.fillRect (0, 0, IO.unit.w, IO.unit.h + IO.unit.d)
    for (var id in set) {
      set[id].el = els['sf_' + id]
    }
    set.blank = { el: blankEl, sprite: 'static', cover: true }
    return set
  }
}

// tiles switcher
var Palette = {
  mk: function () {
    return {
      id: 0,
      wheel:[
        'metal', 'poly_white', 'poly_blue', 'poly_cyan', 'poly_green',
        'poly_yellow', 'poly_red', 'poly_pink', 'poly_black'
      ]
    }
  },
  next: function (focus, palette) {
    if (palette.id < palette.wheel.length -1) palette.id++
    else palette.id = 0
    focus.ref = palette.wheel[palette.id]
  }
}

// handles visibility of all cells
var View = {
  mk: function () {
    return { cut: false }
  },
  // returns true if the cell is visible
  visible: function (cell, focus, view) {
    return ! view.cut || cell.z > focus.z || cell.y < focus.y
  }
}

// handles what gets written down there
var Logger = {
  mk: function (el) {
    return {
      el: el
    }
  },
  // update focus pos
  refresh (logger, data) {
    logger.el.innerHTML = data
  }
}
