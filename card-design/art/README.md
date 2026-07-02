# art/

An **art variant** is the central artwork of a card that communicates its
suit. Each file here is one complete visual language applied consistently
across all five currents (Radiance, Void, Flux, Aether, Echo) plus the Wild.

## Primary — arcana

**`arcana.js` is the primary and only shipped art variant.** All other
variants (sigil, ritual, glyph, relic, emblem, runic, crystalline, engraved,
mixed) have been archived to
`_archive/card-design-non-primary-2026-07-02/art/`.

Arcana is fully procedural (SVG, no bitmap assets) and covers every energy
including the fifth-suit echo, so it needs no companion files.

## How each file registers

```js
(function(){
  const AA = window.AA_ART = window.AA_ART || {};
  AA['arcana'] = {
    name: 'Arcana',
    notes: 'Equation-driven relic style: seeded grain, bloom, dust, wobble.',
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
| `elem`    | `'radiance' \| 'void' \| 'flux' \| 'aether' \| 'echo' \| 'wild'` |
| `cx`, `cy`| centre of the artwork area in px                          |
| `artR`    | radius of the artwork area in px                          |
| `e`       | suit palette object                                        |
| `meta`    | `{ W, H, sc, OL, TM, ST, val }` — whole-card metrics       |

`meta.val` is handy if you want the art to react to the card's numeric
value (e.g. denser pattern at higher values).

## Exploring a new variant

If you want to try something new alongside the primary:

1. Copy `arcana.js` to `<your-name>.js`.
2. Change the registry key (`AA['your-name']`).
3. Edit the render body — add per-suit branching based on `elem`.
4. Add `<script src="art/<your-name>.js"></script>` to `playtable.html`
   (after the `arcana.js` tag). The dropdown updates automatically.

If a new variant supersedes arcana, promote it in `card-design/README.md`
and archive the previous primary.
