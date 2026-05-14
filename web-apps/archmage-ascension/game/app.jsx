/* global React, ReactDOM */
// ════════════════════════════════════════════════════════════════
// Archmage Ascension — App entry, router, AI driver, FX queue.
// ════════════════════════════════════════════════════════════════

const { useReducer, useEffect, useRef, useState, useCallback } = React;
const SAVE_KEY = 'aa:saved-duel:v1';

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "connector": "bloom-soft",
  "artStyle": "mystic",
  "aiSpeed": 1.0,
  "castDrama": 1.0,
  "tableTone": "violet"
}/*EDITMODE-END*/;

function readSavedGame(){
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && parsed.phase && parsed.players ? parsed : null;
  } catch (err) {
    console.warn('Could not read saved Archmage duel', err);
    return null;
  }
}

function App(){
  const [tweaks, setTweak] = window.useTweaks(TWEAK_DEFAULTS);
  // Fit-to-viewport for landscape mobile
  React.useEffect(() => {
    const stage = document.getElementById('stage');
    if (!stage) return;
    const fit = () => {
      const dw = 1440, dh = 900;
      const sx = window.innerWidth / dw;
      const sy = window.innerHeight / dh;
      const s = Math.min(sx, sy);
      stage.style.transform = `scale(${s})`;
      stage.style.left = `${Math.max(0, (window.innerWidth  - dw*s)/2)}px`;
      stage.style.top  = `${Math.max(0, (window.innerHeight - dh*s)/2)}px`;
    };
    fit();
    window.addEventListener('resize', fit);
    window.addEventListener('orientationchange', fit);
    return () => {
      window.removeEventListener('resize', fit);
      window.removeEventListener('orientationchange', fit);
    };
  }, []);
  // Re-route runtime values from tweaks
  React.useEffect(() => {
    document.documentElement.dataset.tableTone = tweaks.tableTone;
  }, [tweaks.tableTone]);
  // Make AI speed available to driver
  TWEAK_DEFAULTS.aiSpeed = tweaks.aiSpeed;
  const [state, dispatchRaw] = useReducer(window.AAState.reduce, null, window.AAState.initialState);
  const [aiBusy, setAiBusy] = useState(false);
  const [openingPrompt, setOpeningPrompt] = useState(null);
  const [transfigPrompt, setTransfigPrompt] = useState(null);
  const [fxQueue, setFxQueue] = useState([]);
  const [savedGame, setSavedGame] = useState(() => readSavedGame());
  const fxIdRef = useRef(0);
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    if (!state || state.phase === 'title') return;
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(state));
      setSavedGame(state);
    } catch (err) {
      console.warn('Could not save Archmage duel', err);
    }
  }, [state]);

  // Wrapped dispatch — drives FX based on actions
  const dispatch = useCallback((action) => {
    // Cast effect
    if (action.type === 'CAST_SPELL'){
      const player = stateRef.current.players[stateRef.current.currentPlayer];
      const sp = player.spellbook.find(s => s.id === action.spellId);
      if (sp && sp.spec.type !== 'ench'){
        const intensity = Math.min(6, sp.cards.length - 2);
        const labels = {
          conj: 'Conjuration',
          trans: 'Transfiguration',
          perf: 'Perfect Transmutation'
        };
        const fx = { id: ++fxIdRef.current, intensity, label: labels[sp.spec.type] || 'Cast' };
        setFxQueue(q => [...q, fx]);
        setTimeout(() => setFxQueue(q => q.filter(f => f.id !== fx.id)), 1500);
      }
    }
    if (action.type === 'NEW_GAME') setSavedGame(null);
    if (action.type === 'TO_TITLE') {
      localStorage.removeItem(SAVE_KEY);
      setSavedGame(null);
    }
    if (action.type === 'LOAD_GAME') setSavedGame(action.state);
    dispatchRaw(action);
  }, []);

  // ── Phase orchestration ──────────────────────────────────
  // 1) Opening: prompt human to discard
  useEffect(() => {
    if (state.phase === 'opening' && state.pendingOpening?.discards?.you === null){
      setOpeningPrompt({
        onPick: (cardId) => {
          dispatch({ type:'OPENING_DISCARD', playerId:'you', cardId });
          setOpeningPrompt(null);
        }
      });
    } else {
      setOpeningPrompt(null);
    }
  }, [state.phase, state.pendingOpening]);

  // 2) Transfig exchange prompt
  useEffect(() => {
    if (state.pendingTransfig && state.pendingTransfig.playerId === 'you'){
      const need = state.pendingTransfig.discardCount;
      let selected = [];
      const updateState = () => setTransfigPrompt({
        phase: 'pickHand',
        need,
        selectedHand: selected.slice(),
        toggleHand: (id) => {
          if (selected.includes(id)) selected = selected.filter(x=>x!==id);
          else if (selected.length < need) selected.push(id);
          updateState();
        },
        onHandPick: (cards) => {
          selected = cards;
          // move to array pick
          setTransfigPrompt({
            phase: 'pickArray',
            discards: selected,
            onArrayPick: (idx) => {
              const next = window.AAState.resolveTransfig(JSON.parse(JSON.stringify(stateRef.current)), selected, idx);
              dispatch({ type:'SET_STATE', state: next });
              setTransfigPrompt(null);
            }
          });
        }
      });
      updateState();
    } else if (!state.pendingTransfig && transfigPrompt) {
      setTransfigPrompt(null);
    }
  }, [state.pendingTransfig, state.currentPlayer]);

  // 3) AI auto-resolve transfig
  useEffect(() => {
    if (state.pendingTransfig && state.pendingTransfig.playerId === 'archon'){
      setAiBusy(true);
      const plan = window.AAAi.planTransfigExchange(state);
      const delay = 800 / TWEAK_DEFAULTS.aiSpeed;
      setTimeout(() => {
        const next = window.AAState.resolveTransfig(JSON.parse(JSON.stringify(stateRef.current)), plan.discards, plan.arrayIdx);
        dispatch({ type:'SET_STATE', state: next });
        setAiBusy(false);
      }, delay);
    }
  }, [state.pendingTransfig?.playerId]);

  // 4) AI turn driver
  useEffect(() => {
    if (state.phase === 'title' || state.phase === 'final') return;
    if (state.currentPlayer !== 1) return;
    if (state.phase === 'opening') return; // handled in opening_discard
    if (state.pendingTransfig) return;     // wait for resolution
    if (aiBusy) return;
    runAITurn();
    // eslint-disable-next-line
  }, [state.phase, state.currentPlayer, state.pendingTransfig]);

  const runAITurn = useCallback(async () => {
    setAiBusy(true);
    const baseDelay = 700 / TWEAK_DEFAULTS.aiSpeed;
    const sleep = (ms) => new Promise(r => setTimeout(r, ms));
    try {
      // Phase: collection
      while (stateRef.current.currentPlayer === 1 && stateRef.current.phase === 'collection'){
        await sleep(baseDelay);
        const action = window.AAAi.chooseCollection(stateRef.current);
        if (action) dispatch(action); else break;
      }
      // drought collection auto-handled (advance into drought-learning happens on END_LEARNING)
      // Phase: casting
      while (stateRef.current.currentPlayer === 1 && stateRef.current.phase === 'casting' && !stateRef.current.pendingTransfig){
        const plan = window.AAAi.planCasting(stateRef.current);
        if (plan.length === 0){
          await sleep(baseDelay/2);
          dispatch({ type:'END_CASTING' });
          break;
        }
        await sleep(baseDelay);
        dispatch(plan[0]);
        // wait for transfig if introduced
        await sleep(baseDelay);
        // re-check; if transfig pending, the other useEffect resolves it before next iteration
        // Wait until pendingTransfig clears
        let safety = 30;
        while (stateRef.current.pendingTransfig && safety-- > 0){ await sleep(120); }
      }
      // Phase: learning (or drought-learning)
      while (stateRef.current.currentPlayer === 1 &&
             (stateRef.current.phase === 'learning' || stateRef.current.phase === 'drought-learning')){
        const plan = window.AAAi.planLearning(stateRef.current);
        for (const a of plan){
          await sleep(baseDelay * 0.7);
          dispatch(a);
        }
        break;
      }
    } finally {
      // Reset busy when no longer Archon's turn
      const wait = async () => {
        let safety = 50;
        while (stateRef.current.currentPlayer === 1 && safety-- > 0){
          await sleep(80);
        }
        setAiBusy(false);
      };
      wait();
    }
  }, [dispatch]);

  // ── Render router ────────────────────────────────────────
  // Apply connector/art tweak globally — re-render cards by remounting on change
  const cardKey = `${tweaks.connector}|${tweaks.artStyle}`;
  // Patch CardFace at runtime — simplest is to set a global default
  window.AA_DEFAULT_CONNECTOR = tweaks.connector;
  window.AA_DEFAULT_ART = tweaks.artStyle;

  const TweaksPanel = window.TweaksPanel;
  const TweakSection = window.TweakSection;
  const TweakRadio = window.TweakRadio;
  const TweakSelect = window.TweakSelect;
  const TweakSlider = window.TweakSlider;

  if (state.phase === 'title'){
    return (
      <>
        <window.AATitleScreen
          onStart={() => dispatch({ type:'NEW_GAME' })}
          hasSavedGame={!!savedGame}
          onResume={() => savedGame && dispatch({ type:'LOAD_GAME', state: savedGame })}
        />
        <TweaksPanel title="Tweaks">
          <TweakSection label="Card style"/>
          <TweakSelect label="Connector" value={tweaks.connector}
            options={['bloom-soft','notch','celestial','triangle']}
            onChange={v => setTweak('connector', v)}/>
          <TweakSelect label="Art" value={tweaks.artStyle}
            options={['mystic','ritual','sigil','runic']}
            onChange={v => setTweak('artStyle', v)}/>
          <TweakSection label="Pace"/>
          <TweakSlider label="AI speed" value={tweaks.aiSpeed} min={0.5} max={3} step={0.1} unit="×"
            onChange={v => setTweak('aiSpeed', v)}/>
          <TweakSlider label="Cast drama" value={tweaks.castDrama} min={0.4} max={2} step={0.1} unit="×"
            onChange={v => setTweak('castDrama', v)}/>
        </TweaksPanel>
      </>
    );
  }
  return (
    <>
      <window.AAPlayScreen
        key={cardKey}
        state={state}
        dispatch={dispatch}
        aiBusy={aiBusy}
        transfigPrompt={transfigPrompt}
        openingPrompt={openingPrompt}
        fxQueue={fxQueue}
      />
      {state.phase === 'final' &&
        <window.AAEndScreen
          state={state}
          onRestart={() => dispatch({ type:'NEW_GAME' })}
          onTitle={() => dispatch({ type:'TO_TITLE' })}
        />
      }
      <TweaksPanel title="Tweaks">
        <TweakSection label="Card style"/>
        <TweakSelect label="Connector" value={tweaks.connector}
          options={['bloom-soft','notch','celestial','triangle']}
          onChange={v => setTweak('connector', v)}/>
        <TweakSelect label="Art" value={tweaks.artStyle}
          options={['mystic','ritual','sigil','runic']}
          onChange={v => setTweak('artStyle', v)}/>
        <TweakSection label="Pace"/>
        <TweakSlider label="AI speed" value={tweaks.aiSpeed} min={0.5} max={3} step={0.1} unit="×"
          onChange={v => setTweak('aiSpeed', v)}/>
        <TweakSlider label="Cast drama" value={tweaks.castDrama} min={0.4} max={2} step={0.1} unit="×"
          onChange={v => setTweak('castDrama', v)}/>
      </TweaksPanel>
    </>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App/>);
