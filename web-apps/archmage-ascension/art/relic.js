// art/relic.js
// Relic
// Hand-painted illustrated art per suit — uses the JPEG assets in art/assets/.
(function(){
  const AA = window.AA_ART = window.AA_ART || {};

  // Path to each suit's hand-painted icon. These URLs are resolved relative to
  // playtable.html (or whatever page loads this module).
  const RELIC_ICONS = {
    radiance: 'art/assets/radiance.jpg',
    void:     'art/assets/void.jpg',
    flux:     'art/assets/flux.jpg',
    aether:   'art/assets/aether.jpg'
  };

  AA['relic'] = {
    name: 'Relic',
    notes: 'Hand-painted illustrated art per suit — uses the JPEG assets in art/assets/.',
    render: function(elem, cx, cy, artR, e, meta){
      meta = meta || {};
      const W = meta.W || 252;
      const H = meta.H || 352;
      const sc = meta.sc || 1;
      const medR = artR * 0.285;
      const imgHref = RELIC_ICONS[elem];
      const imgS = Math.min(W, H*0.78) * 0.96;
      const ix = cx - imgS / 2;
      const iy = cy - imgS / 2;
      const uid = (window.ArchmageCards && window.ArchmageCards.uid) || (p => (p||'c')+Math.random().toString(36).slice(2,8));
      const rid = 'rel-' + elem + '-' + uid('r');
      let art = '';

      // Fade-to-card radial mask so the square image melts into the dark
      art += '<defs>'
        + '<radialGradient id="' + rid + '-g" cx="0.5" cy="0.5" r="0.5">'
        +   '<stop offset="0%"  stop-color="#fff" stop-opacity="1"/>'
        +   '<stop offset="62%" stop-color="#fff" stop-opacity="1"/>'
        +   '<stop offset="100%" stop-color="#fff" stop-opacity="0"/>'
        + '</radialGradient>'
        + '<mask id="' + rid + '-m" maskContentUnits="objectBoundingBox">'
        +   '<rect x="0" y="0" width="1" height="1" fill="url(#' + rid + '-g)"/>'
        + '</mask>'
        + '</defs>';

      // The painted icon itself — screen-blended so dark background drops out
      art += '<image href="' + imgHref + '"'
           + ' x="' + ix.toFixed(1) + '" y="' + iy.toFixed(1) + '"'
           + ' width="' + imgS.toFixed(1) + '" height="' + imgS.toFixed(1) + '"'
           + ' preserveAspectRatio="xMidYMid slice"'
           + ' mask="url(#' + rid + '-m)"'
           + ' style="mix-blend-mode:screen"'
           + ' opacity="0.96"/>';

      // Subtle suit-tinted atmospheric halo to seat the icon into the frame
      art += '<circle cx="' + cx + '" cy="' + cy + '" r="' + (imgS*0.50).toFixed(1) + '" fill="none" stroke="' + e.m + '" stroke-width="' + (0.8*sc) + '" opacity=".28"/>';
      art += '<circle cx="' + cx + '" cy="' + cy + '" r="' + (imgS*0.46).toFixed(1) + '" fill="none" stroke="' + e.dim + '" stroke-width="' + (1.2*sc) + '" opacity=".40"/>';

      // Clear numeral medallion (matches the glyph-variant treatment)
      art += '<circle cx="' + cx + '" cy="' + cy + '" r="' + (medR*1.22).toFixed(1) + '" fill="' + e.bg2 + '" fill-opacity=".985"/>';
      art += '<circle cx="' + cx + '" cy="' + cy + '" r="' + (medR*1.22).toFixed(1) + '" fill="none" stroke="' + e.b + '" stroke-width="' + (1.15*sc) + '" opacity=".75"/>';
      art += '<circle cx="' + cx + '" cy="' + cy + '" r="' + (medR*1.38).toFixed(1) + '" fill="none" stroke="' + e.m + '" stroke-width="' + (0.7*sc) + '" opacity=".42"/>';

      return art;
    }
  };
})();
