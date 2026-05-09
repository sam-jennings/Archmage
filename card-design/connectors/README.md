# connectors/

A **connector** is the strip along the edge of a card that shows how it
resonates with neighbouring cards. Different connectors feel different at
the join — a bloom is soft and warm, a beacon is crisp and lock-in. Each
file in this folder is one such design.

## How each file registers

Each file is an IIFE that writes a single entry into the global registry:

```js
(function(){
  const AA = window.AA_CONNECTORS = window.AA_CONNECTORS || {};
  AA['bloom-soft'] = {
    name: 'Bloom Soft',
    notes: 'Torchlight through a crack — current LIVE default.',
    render: function(val, e, opts){
      // opts = { OL, TM, ST, W, sc, id, side: 'left' | 'right' }
      // return an SVG fragment string (no outer <svg>)
      return '...';
    }
  };
})();
```

## Render contract

The renderer is called **twice** per card — once with `side:'left'`,
once with `side:'right'`. It returns a string of SVG elements that is
concatenated into the card's `<svg>` root. Elements drawn outside the
overlap strip (width `OL`, positioned at the card edge) will not bleed
onto neighbours correctly.

Arguments it is given:

| name | meaning                                                      |
|------|--------------------------------------------------------------|
| `val`| the card value (1–16)                                        |
| `e`  | the suit palette object: `{b, m, dim, bg1, bg2, border, ...}`|
| `opts.OL`  | overlap width in px                                    |
| `opts.TM`  | top-margin of the value scale                          |
| `opts.ST`  | vertical step per value                                |
| `opts.W`   | card width in px                                       |
| `opts.sc`  | scale factor (1.0 = full size)                         |
| `opts.id`  | unique id prefix (for `<defs>`)                        |
| `opts.side`| `'left'` or `'right'`                                  |

## Adding a new connector

1. Copy `bloom-soft.js` to `<your-name>.js`.
2. Change the registry key (`AA['your-name']`) to the new name.
3. Edit the render body.
4. Add a `<script src="connectors/<your-name>.js"></script>` line to
   `playtable.html` (in the Connectors block). That's it — the dropdown
   will pick it up automatically.

## Current files

- `bloom-soft.js`   — soft radial bloom. Current live default.
- `parallelogram.js` — sharp bands, vertical gradient peaking at value line.
- `notch.js`         — hard rectangular notch at value Y, like a lock tab.
- `triangle.js`      — inward-pointing triangular wedge at value Y.
- `beacon.js`        — round glowing orb at value Y with rings around it.
