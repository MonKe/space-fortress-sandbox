// keyboard

var Key = {
  mk: function (code, id) {
    return { c: code, id: id }
  },
  slug: function (e, keys) {
    var id = []
    if (e.ctrlKey) id.push ('ctrl')
    if (e.shiftKey) id.push ('shift')
    for (var i = 0; i < keys.length; i++) {
      if (keys[i].c === e.keyCode) {
        id.push (keys[i].id)
        break
      }
    }
    // console.log (e.keyCode)
    return id.join ('+')
  }
}

var Kbd = {
  mk: function (keys) {
    document.onkeyup = Kbd.dispatch
    return { keys: keys }
  },
  // dispatches actions depending on the key
  dispatch: function (e) {
    var changes = false
    switch (Key.slug (e, IO.kbd.keys)) {
      // movements
      case 'left':
        changes = Pos.move ('left', IO.focus, IO.mtx)
        break
      case 'right':
        changes = Pos.move ('right', IO.focus, IO.mtx)
        break
      case 'up':
        changes = Pos.move ('back', IO.focus, IO.mtx)
        break
      case 'down':
        changes = Pos.move ('front', IO.focus, IO.mtx)
        break
      case 'ctrl+up':
        changes = Pos.move ('up', IO.focus, IO.mtx)
        break
      case 'ctrl+down':
        changes = Pos.move ('down', IO.focus, IO.mtx)
        break
      // rotate
      case 'shift+left':
        changes = true
        Mtx.rotate ('l', IO.focus, IO.mtx)
        break
      case 'shift+right':
        changes = true
        Mtx.rotate ('r', IO.focus, IO.mtx)
        break
      case 'shift+up':
        changes = true
        Mtx.rotate ('u', IO.focus, IO.mtx)
        break
      case 'shift+down':
        changes = true
        Mtx.rotate ('d', IO.focus, IO.mtx)
        break
      // toolbox
      case 'paint':
        changes = Cell.add (IO.focus, IO.focus.ref, IO.mtx, IO.shape)
        break
      case 'delete':
        changes = Cell.rm (IO.focus, IO.mtx, IO.shape)
        break
      case 'shape':
        changes = Shape.toggle (IO.shape, IO.focus, IO.mtx)
        break
      case 'next':
        changes = true
        Palette.next (IO.focus, IO.palette)
        break
      case 'cut':
        changes = true
        IO.view.cut = ! IO.view.cut
        break
    }
    if (changes) IO.refresh ()
    return false
  }
}
