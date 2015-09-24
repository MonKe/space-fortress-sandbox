var State = {
  grid: Grid.conf (29, 17, [])
}

var IO = {}

document.body.onload = function () {
  // data init
  IO.mtx = Mtx.mk (Vol.mk (20, 20, 20), Grp.mk ([]))
  IO.focus = Vol.center (IO.mtx)
  IO.shape = Shape.mk (Grp.mk ([]))
  // gfx hooks
  IO.unit = Vol.mk (36, 28, 28)
  IO.grid = Vol.mk (29, 17, 1)
  IO.board = Board.mk (document.getElementById ('sf_board'), '#000')
  IO.view = View.mk ()
  IO.tileset = Tileset.mk (document.images, {
    focus: {  sprite: 'static', cover: false },
    metal: { sprite: 'custom', cover: true, sp: {
      top: '* u f b l r bl lr br blr', bottom: '* f u d l r dl lr dr dlr',
      alias: { u: 'lu ru blu bru blru', f: 'fl fr dfl dfr dflr' }
    }, covermask: 'bu blu bru blru df dfl dfr dflr' },
    poly_black: { sprite: 'links', cover: true },
    poly_white: { sprite: 'links', cover: true },
    poly_blue: { sprite: 'links', cover: true },
    poly_cyan: { sprite: 'links', cover: true },
    poly_green: { sprite: 'links', cover: true },
    poly_yellow: { sprite: 'links', cover: true },
    poly_red: { sprite: 'links', cover: true },
    poly_pink: { sprite: 'links', cover: true }
  })
  IO.palette = Palette.mk ()
  Rec.update (IO.focus, { ref: IO.palette.wheel[IO.palette.id] })
  IO.sprite = Sprite.mk ()
  IO.logger = Logger.mk (document.getElementById ('sf_log'))
  // main of dom with proper size
  /*Rec.update (document.querySelector ('main'), {
    style: 'width: ' + IO.board.ctxEl.width + 'px;'
  })*/
  // keyboard controls
  IO.kbd = Kbd.mk ([
    Key.mk (37, "left"),
    Key.mk (38, "up"),
    Key.mk (39, "right"),
    Key.mk (40, "down"),
    Key.mk (67, "cut"),
    Key.mk (68, "delete"),
    Key.mk (78, "next"),
    Key.mk (80, "paint"),
    Key.mk (83, "shape")
  ])
  // global refresh func
  IO.refresh = function (force) {
    Board.refresh (IO.board, IO.focus, IO.mtx, force)
    Logger.refresh (IO.logger, Pos.format (IO.focus) +
      ' -- cells: ' + IO.mtx.ms.length +
      (IO.shape.on ? ' -- shape #' + IO.shape.id + '(cells: ' +
        Shape.getCells (IO.shape).length + ')' : ' -- points') +
      ' -- view: ' + (IO.view.cut ? 'cut' : 'full'))
  }
  // initial refresh
  IO.refresh (true)
}
