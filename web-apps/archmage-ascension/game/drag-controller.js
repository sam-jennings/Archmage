/* global window, document */
// ════════════════════════════════════════════════════════════════
// Archmage Ascension — Pointer Events drag controller.
//
// Replaces HTML5 native drag-and-drop (which is unreliable on Android Chrome
// and effectively non-functional on iOS Safari). Works for both mouse and
// touch via the unified Pointer Events API.
//
// Coexists with onClick handlers: a quick tap/click never starts a drag —
// activation requires the pointer to travel > DRAG_THRESHOLD pixels. This
// preserves the existing tap-to-toggle path through the React onClick props.
//
// Markup contract:
//   Drag source: [data-card-id="..."][data-draggable="true"]
//   Drop target: [data-drop-zone="<name>"]
//
// Drop event: a CustomEvent('aa-card-drop', { detail: { cardId, zone } }) is
// dispatched on the drop target (bubbles). Components listen via addEventListener.
//
// CSS classes the controller toggles:
//   body.aa-dragging          — set while a drag is active
//   .aa-drag-source           — set on the source card while dragging
//   .aa-drop-over             — set on the current hovered drop target
//
// Stage scale: hit-testing uses elementFromPoint(clientX, clientY) which is
// already in post-transform (viewport) coordinates, so the 1440x900 CSS
// transform scale on #stage doesn't require manual compensation. The ghost
// follows the pointer in viewport coords for the same reason.
// ════════════════════════════════════════════════════════════════
(function(){
  const DRAG_THRESHOLD = 6;
  let dragState = null;

  function findSource(el){
    while (el && el !== document.body){
      const ds = el.dataset;
      if (ds && ds.draggable === 'true' && ds.cardId) return el;
      el = el.parentElement;
    }
    return null;
  }

  function findDropZone(el){
    while (el && el !== document.body){
      if (el.dataset && el.dataset.dropZone) return el;
      el = el.parentElement;
    }
    return null;
  }

  function createGhost(sourceEl, x, y){
    const r = sourceEl.getBoundingClientRect();
    const g = sourceEl.cloneNode(true);
    g.classList.add('aa-drag-ghost');
    g.style.position = 'fixed';
    g.style.left = '0';
    g.style.top = '0';
    g.style.width = r.width + 'px';
    g.style.height = r.height + 'px';
    g.style.transform = `translate(${x - r.width/2}px, ${y - r.height/2}px) scale(1.04)`;
    g.style.pointerEvents = 'none';
    g.style.zIndex = '99999';
    g.style.opacity = '0.92';
    g.style.transition = 'none';
    document.body.appendChild(g);
    return g;
  }

  function setOver(zone){
    const s = dragState;
    if (zone === s.overEl) return;
    if (s.overEl) s.overEl.classList.remove('aa-drop-over');
    if (zone) zone.classList.add('aa-drop-over');
    s.overEl = zone;
  }

  function hitTest(x, y){
    const s = dragState;
    // Hide ghost so elementFromPoint sees what's underneath.
    const prev = s.ghostEl.style.display;
    s.ghostEl.style.display = 'none';
    const hit = document.elementFromPoint(x, y);
    s.ghostEl.style.display = prev;
    return findDropZone(hit);
  }

  function cleanup(){
    const s = dragState;
    if (!s) return;
    if (s.ghostEl && s.ghostEl.parentNode) s.ghostEl.parentNode.removeChild(s.ghostEl);
    if (s.overEl) s.overEl.classList.remove('aa-drop-over');
    if (s.sourceEl) s.sourceEl.classList.remove('aa-drag-source');
    document.body.classList.remove('aa-dragging');
    try { s.sourceEl && s.sourceEl.releasePointerCapture(s.pointerId); } catch(_){}
    dragState = null;
  }

  function onPointerDown(e){
    if (e.button != null && e.button !== 0) return;
    const sourceEl = findSource(e.target);
    if (!sourceEl) return;
    dragState = {
      sourceEl,
      cardId: sourceEl.dataset.cardId,
      ghostEl: null,
      startX: e.clientX,
      startY: e.clientY,
      overEl: null,
      activated: false,
      pointerId: e.pointerId,
      ghostW: 0,
      ghostH: 0
    };
    try { sourceEl.setPointerCapture(e.pointerId); } catch(_){}
  }

  function activate(e){
    const s = dragState;
    s.ghostEl = createGhost(s.sourceEl, e.clientX, e.clientY);
    s.ghostW = parseFloat(s.ghostEl.style.width);
    s.ghostH = parseFloat(s.ghostEl.style.height);
    s.activated = true;
    s.sourceEl.classList.add('aa-drag-source');
    document.body.classList.add('aa-dragging');
  }

  function onPointerMove(e){
    const s = dragState;
    if (!s || e.pointerId !== s.pointerId) return;
    const dx = e.clientX - s.startX, dy = e.clientY - s.startY;
    if (!s.activated){
      if (Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
      activate(e);
    }
    s.ghostEl.style.transform =
      `translate(${e.clientX - s.ghostW/2}px, ${e.clientY - s.ghostH/2}px) scale(1.04)`;
    setOver(hitTest(e.clientX, e.clientY));
    if (e.cancelable) e.preventDefault();
  }

  function onPointerUp(e){
    const s = dragState;
    if (!s || e.pointerId !== s.pointerId) return;
    if (!s.activated){
      cleanup();
      return; // never moved past threshold — let click fire normally
    }
    if (s.overEl){
      const ev = new CustomEvent('aa-card-drop', {
        bubbles: true,
        detail: { cardId: s.cardId, zone: s.overEl.dataset.dropZone }
      });
      s.overEl.dispatchEvent(ev);
      // Suppress the trailing click that some browsers fire on the source
      // after a touch-drag, which would re-trigger the tap-to-toggle path.
      const suppress = (ce) => { ce.stopPropagation(); ce.preventDefault(); };
      window.addEventListener('click', suppress, { capture: true, once: true });
      window.setTimeout(() => window.removeEventListener('click', suppress, true), 350);
    }
    cleanup();
    if (e.cancelable) e.preventDefault();
  }

  function onPointerCancel(e){
    const s = dragState;
    if (!s || e.pointerId !== s.pointerId) return;
    cleanup();
  }

  window.addEventListener('pointerdown', onPointerDown, { passive: false });
  window.addEventListener('pointermove', onPointerMove, { passive: false });
  window.addEventListener('pointerup', onPointerUp, { passive: false });
  window.addEventListener('pointercancel', onPointerCancel);

  window.AADragController = { version: 1 };
})();
