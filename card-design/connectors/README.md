# connectors/

A **connector** is the strip along the edge of a card that shows how it
resonates with neighbouring cards. When two cards abut, their connector
strips visually align (or fail to), which is how matching-value and
sequential resonance are read at the table.

## Primary — beacon

**`beacon.js` is the primary and only shipped connector.** All other
connectors (bloom-soft, parallelogram, notch, triangle) have been archived
to `_archive/card-design-non-primary-2026-07-02/connectors/`.

Beacon renders a round glowing orb at the value's Y position with concentric
halo rings around it. The orb is clamped inward from the card corners so it
stays inside the 5mm print safe zone.

## How each file registers

```js
(function(){
  const AA = window.AA_CONNECTORS = window.AA_CONNECTORS || {};
  AA['beacon'] = {
    name: 'Beacon',
    notes: 'Round glowing orb at value Y, concentric halo rings.',
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

## Exploring a new connector

If you want to try a different strip design alongside the primary:

1. Copy `beacon.js` to `<your-name>.js`.
2. Change the registry key (`AA['your-name']`) to the new name.
3. Edit the render body.
4. Add a `<script src="connectors/<your-name>.js"></script>` line to
   `playtable.html` (after the `beacon.js` tag). The dropdown updates
   automatically.

If a new connector supersedes beacon, promote it in `card-design/README.md`
and archive the previous primary.
