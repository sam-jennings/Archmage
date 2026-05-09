# art/

An **art variant** is the central artwork of a card that communicates its
suit. Each file here is one complete visual language applied consistently
across all four suits (Radiance, Void, Flux, Aether) plus the Wild.

## How each file registers

```js
(function(){
  const AA = window.AA_ART = window.AA_ART || {};
  AA['sigil'] = {
    name: 'Sigil',
    notes: 'Concentric rings, starfield, waves, lattice.',
    render: function(elem, cx, cy, artR, e, meta){
      // return an SVG fragment (no outer <svg>)
      return '...';
    }
  };
})();
```

## Render contract

The renderer is called once per card, in the artwork region. It returns
a string of SVG elements concatenated into the card's `<svg>` root.

| name      | meaning                                                   |
|-----------|-----------------------------------------------------------|
| `elem`    | `'radiance' | 'void' | 'flux' | 'aether' | 'wild'`        |
| `cx`, `cy`| centre of the artwork area in px                          |
| `artR`    | radius of the artwork area in px                          |
| `e`       | suit palette object                                        |
| `meta`    | `{ W, H, sc, OL, TM, ST, val }` — whole-card metrics      |

`meta.val` is handy if you want the art to react to the card's numeric
value (e.g. denser pattern at higher values).

## Where to put image assets

Any bitmap images (PNG, JPG) go in `art/assets/`. Reference them
with a relative path from `playtable.html`, e.g.
`'art/assets/radiance.jpg'`. See `relic.js` for a working example.

## Adding a new art variant

1. Copy `sigil.js` to `<your-name>.js`.
2. Change the registry key (`AA['your-name']`).
3. Edit the render body — add per-suit branching based on `elem`.
4. Add `<script src="art/<your-name>.js"></script>` to `playtable.html`
   (in the Art variants block). The dropdown updates automatically.

## Current files

- `sigil.js`       — concentric rings, starfield, waves, lattice. Original live.
- `ritual.js`      — ceremonial sigils with layered glows + containment rings.
- `glyph.js`       — less circle-led; suit emblems with a clear central number.
- `relic.js`       — hand-painted JPEG per suit (see `assets/`).
- `emblem.js`      — vector reproduction of the relic art. Scales cleanly.
- `runic.js`       — rune-ring emblems, stripped-down ritual.
- `crystalline.js` — hex-crystal framed motifs with crystal shards.
- `engraved.js`    — inscription, orrery, plaque-style engraving.
