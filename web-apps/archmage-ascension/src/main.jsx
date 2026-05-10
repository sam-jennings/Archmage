// Vite entry. Imports are hoisted by ESM, so install-globals.js MUST be
// the first import — it sets window.React / window.ReactDOM that all
// downstream prototype modules read at module-eval time.
import './install-globals.js';

// Card renderer + variants (each IIFE registers into window.AA_*)
import '../game/lib/cards.js';
import '../game/lib/connectors/bloom-soft.js';
import '../game/lib/connectors/notch.js';
import '../game/lib/connectors/celestial.js';
import '../game/lib/connectors/triangle.js';
import '../game/lib/art/mystic.js';
import '../game/lib/art/ritual.js';
import '../game/lib/art/sigil.js';
import '../game/lib/art/runic.js';

// Game engine + state machine
import '../game/engine.js';
import '../game/state.js';
import '../game/ai.js';

// Components, in dependency order — Vite + plugin-react transforms JSX at build
import '../game/cards-ui.jsx';
import '../game/spell-tableau.jsx';
import '../game/cauldron.jsx';
import '../game/title.jsx';
import '../game/endgame.jsx';
import '../game/play.jsx';
import '../game/tweaks-panel.jsx';
import '../game/app.jsx';
