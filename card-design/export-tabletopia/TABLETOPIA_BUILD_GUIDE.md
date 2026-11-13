# Tabletopia build guide — Archmage Ascension (v3.1, 2–4p)

State as of 2026-07-20: **steps 1–3 are DONE** (performed by agent in-browser).
Only step 4 — the in-editor scene assembly — remains, and it must be done by
hand (~10 minutes). The Unity editor resists synthetic-event automation.

## What already exists (do not redo)

- **Game:** `tabletopia.com/workshop/games/azcps` — "Archmage Ascension",
  private ("For personal use only"), Classical, 16+.
- **Objects** (workshop → Objects → group "Archmage Ascension"):
  - 62 card objects, created via one Card Deck form: faces from
    `cards-jpg/` (JPEG), shared back `back.jpg`, 6.0×8.5 cm each.
    Names = filenames (`radiance-01` … `wild-2`).
  - `Archmage Board v3.1` — Game Board, 41.9×29.6 cm (169% scale on the
    2481×1754 px PNG ≈ physical A3).
  - `Capacity Counter` — Token, 3×3 cm.
- **Setup shell:** "Archmage Ascension - 2-4 players" (players 2–4,
  personal-use access, Web/Steam platform).

## Step 4 — assemble the scene (manual)

Open the game page → the setup → **EDIT SETUP**. In the editor:

1. Bottom tray: the tabs (Cards / Tokens / Boards …) are **toggle filters**,
   not tabs — orange = on. Toggle **Boards** on, drag the board to the table
   centre. (Optional: right-click it → lock, if offered.)
2. Toggle **Cards** on. Drag all 62 cards one by one onto **THE SOURCE**
   panel (bottom-left of the board). Hold each card over the pile until the
   stack highlight shows, then release — drops without the highlight land
   beside the pile. The tray pages with the ► arrow (15 per page; order:
   aether, flux, radiance, void, wild + the board thumbnail mixed in).
   Each tray item shows an orange usage badge once placed — every card
   should end at exactly **1** (the badge is the dedupe check).
3. Right-click the finished stack → **Shuffle**, then **Flip** face-down.
4. Deal 5 cards from the top of the stack face-up onto the five Array
   frames. (Or skip — players can deal at session start.)
5. Toggle **Tokens** on; drag the Capacity Counter out ~20 times into a
   supply pile beside the board (right edge, near the Arcane Reserve).
   The Reserve starts **empty by design** — no object needed.
6. **Save before leaving.** The editor does NOT autosave — a reload after
   assembling (without saving) loses the whole scene. Use the Back button
   and accept the save prompt if offered; verify by reopening the setup.

## Verification (after saving)

- Setup page → **Objects Usage** tab: every card ×1 (62 rows), board ×1,
  counter ×20. Any card at ×2 / ×0 = mis-drop — fix in the editor.
- Solo dry-run one full round (join a seat: shuffle, draw, take-from-Array,
  counters) before recruiting.

## Editor quirks (learned the hard way, 2026-07-20)

- The whole editor is one Unity WebGL canvas — no DOM to script against.
- Card drops do **not** auto-stack unless the drag *dwells* over the target
  stack until the highlight appears (real mouse does this naturally).
- Dragging over empty felt moves the **camera** — a missed grab pans the view.
- Exiting without saving silently discards everything (see step 6).
- The tray Search box filters the tray, but applies with a multi-second lag.

## Sharing the table

Game page → play/room link (private game: invite via room link in the
lobby). Testers need a free Tabletopia account; browser only, no install.
Fallback: the Screentop table `@samjennings/Arcane-Drought` remains live.
