// RULES DATA — rulebook v3.1 (UNDER TEST).
//
// Every number, table and short rule string the v2 pages show comes from this module.
// Pages never hard-code a rule. Verified against the rulebook, the Scoring System
// Reference and meta/canon.yml by tools/check-rules-data.mjs.
//
// A new rules version is a new file (rules.v3.2.js, or rules.v3.0.js for a rollback) and
// one changed import in data/current.js. Variants are flagged entries in `variants`; they
// never edit the base values in this file.
//
// Text conventions: **bold**, *italic*, [label](#section-id), and {placeholders} filled
// from this data ({title} comes from data/site.js). Blocks: p, ul, ol, flavour, callout,
// example, ref (a component rendered from the structured data), h (sub-heading with id).

const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);

export const RULES = {
  id: 'v3.1',
  version: '3.1',
  status: 'under-test', // 'canon' | 'under-test'
  statusNote:
    'Rules v3.1 are in play but still under test: one live session will confirm or revert them. If they are reverted, this site switches back to v3.0 in one step.',
  sources: {
    canon: 'meta/canon.yml',
    rulebook: 'rulebook/Archmage Ascension - Complete Rulebook.md',
    scoring: 'rulebook/Scoring System Reference.md',
    board: 'board/archmage_a3_landscape_board.pdf',
  },

  // ── Players and decks ────────────────────────────────────────────────────────────
  players: {
    min: 2,
    max: 6,
    groups: [
      { id: '2-4', min: 2, max: 4, deck: 'base', startingCounters: 1 },
      { id: '5-6', min: 5, max: 6, deck: 'echo', startingCounters: 2, status: 'under-test' },
    ],
  },

  energies: [
    { key: 'radiance', name: 'Radiance', colour: 'gold', mark: 'radiant corona', blurb: 'The emissive current. Warm and gold.' },
    { key: 'void', name: 'Void', colour: 'violet', mark: 'inward spiral', blurb: 'The absorptive current. Quiet, deep violet.' },
    { key: 'flux', name: 'Flux', colour: 'teal', mark: 'flowing wave', blurb: 'The transitive current. Cold teal, always moving.' },
    { key: 'aether', name: 'Aether', colour: 'crimson', mark: 'bound lattice', blurb: 'The stabilising current. Crimson, exact, binding.' },
    { key: 'echo', name: 'Echo', colour: 'bone grey', mark: 'returning rings', blurb: 'The resonant current. A pale, returning echo.', decks: ['echo'] },
  ],
  wild: { key: 'wild', name: 'Wild', glyph: '✶', blurb: 'Stands in for any energy and value in the deck you are playing with.' },

  decks: {
    base: { energies: ['radiance', 'void', 'flux', 'aether'], minValue: 1, maxValue: 15, wilds: 2 },
    echo: { energies: ['radiance', 'void', 'flux', 'aether', 'echo'], minValue: 1, maxValue: 15, wilds: 4, status: 'under-test', statusNote: 'The 5–6 player deck with Echo is under test.' },
  },

  setup: { handSize: 7, arraySize: 5, openingDiscard: 1 },
  limits: { minSpellSize: 3, maxSpellSize: 15 },

  // ── Spells ───────────────────────────────────────────────────────────────────────
  spellOrder: ['conjuration', 'transfiguration', 'enchantment', 'perfect'],
  spells: {
    conjuration: {
      key: 'conjuration',
      name: 'Conjuration',
      short: 'Conj.',
      pattern: 'Same energy',
      requirement: '{minSpellSize}+ components of the same energy.',
      note: 'Values need not be in sequence.',
      flavour: 'A sustained connection to one energy, drawing more of it from the Source.',
      example: [{ e: 'void', v: 2 }, { e: 'void', v: 5 }, { e: 'void', v: 9 }, { e: 'void', v: 13 }],
      exampleNote: 'Four Void components. The values do not matter.',
      minSize: 3,
      maxSize: 15,
      cast: { kind: 'draw', tiers: [{ min: 3, max: 5, draw: 1 }, { min: 6, max: 15, draw: 2 }] },
      castNotes: [],
    },
    transfiguration: {
      key: 'transfiguration',
      name: 'Transfiguration',
      short: 'Transfig.',
      pattern: 'Values in sequence',
      requirement: '{minSpellSize}+ components with consecutive values, any energies.',
      note: 'A sequence cannot loop around: 13-14-15 is valid, 14-15-1 is not.',
      flavour: 'Turning what you hold into what you need, through the regulated Array.',
      example: [{ e: 'void', v: 5 }, { e: 'flux', v: 6 }, { e: 'radiance', v: 7 }, { e: 'aether', v: 8 }],
      exampleNote: 'Values 5-6-7-8. The energies can be anything.',
      minSize: 3,
      maxSize: 15,
      cast: { kind: 'trade', tiers: [{ min: 3, max: 3, discard: 2, take: 1 }, { min: 4, max: 15, discard: 1, take: 1 }] },
      castNotes: [
        'The trade is mandatory once you cast.',
        'Discarded components go to the Arcane Reserve, not back to the Array.',
        'Refill the Array from the Source straight away.',
        'If you cannot discard enough components, you cannot cast this spell.',
      ],
    },
    enchantment: {
      key: 'enchantment',
      name: 'Enchantment',
      short: 'Enchant.',
      pattern: 'Matching values',
      requirement: '{minSpellSize} to {enchantmentMaxAny} components of the same value.',
      note: 'Always active. Never cast, never takes a counter.',
      flavour: 'Energy bound into yourself: capacity that stays.',
      example: [{ e: 'radiance', v: 7 }, { e: 'void', v: 7 }, { e: 'flux', v: 7 }],
      exampleNote: 'Three 7s from three different energies.',
      minSize: 3,
      maxSize: 5,
      cast: { kind: 'always-active' },
      castNotes: [
        'Capacity you gain arrives at the start of your next turn.',
        'Each energy has one component of each value, and a wild must be declared as an energy in the deck, so an Enchantment can be no larger than the number of energies in play.',
      ],
    },
    perfect: {
      key: 'perfect',
      name: 'Perfect Transmutation',
      short: 'Perfect',
      pattern: 'Same energy, in sequence',
      requirement: '{minSpellSize}+ components with consecutive values, all of one energy.',
      note: 'Cannot loop around.',
      flavour: 'Pure power and transformation at once: perfect alignment within one energy.',
      example: [{ e: 'aether', v: 8 }, { e: 'aether', v: 9 }, { e: 'aether', v: 10 }],
      exampleNote: 'Aether 8-9-10.',
      minSize: 3,
      maxSize: 15,
      cast: { kind: 'both', order: ['conjuration', 'transfiguration'] },
      castNotes: [
        'Both effects are mandatory, in that order, for a single counter.',
        'If you cannot complete the trade, you cannot cast this spell.',
      ],
    },
  },

  // Counter grants are cumulative totals for the Enchantment's size, not increments.
  enchantmentLadder: [
    { size: 3, counters: 1 },
    { size: 4, counters: 3 },
    { size: 5, counters: 5, decks: ['echo'] },
  ],

  // ── Scoring (Scoring System Reference, board column order) ───────────────────────
  scoreTable: {
    sizes: range(3, 15),
    columns: ['conjuration', 'transfiguration', 'perfect', 'enchantment'],
    conjuration: [0, 1, 2, 3, 7, 13, 20, 29, 38, 50, 63, 79, 100],
    transfiguration: [3, 4, 5, 7, 8, 10, 13, 16, 20, 25, 31, 38, 48],
    perfect: [5, 11, 18, 24, 31, 39, 47, 56, 65, 74, 85, 97, 100],
    enchantment: [4, 10, 16],
  },
  tiebreakers: ['Most spells', 'Most components in the largest single spell'],
  scoringExample: [
    { kind: 'conjuration', size: 5 },
    { kind: 'transfiguration', size: 4 },
    { kind: 'enchantment', size: 3 },
    { kind: 'perfect', size: 6 },
  ],

  // ── The turn ─────────────────────────────────────────────────────────────────────
  turn: {
    normal: [
      { key: 'collection', n: 1, name: 'Collection', short: 'Draw 1 from the Source, **or** take 1 from the Array and refill it from the Source.' },
      { key: 'casting', n: 2, name: 'Casting', short: 'Cast spells one at a time, a counter on each. Resolve each effect before the next.' },
      { key: 'recall', n: null, name: 'Recall', short: 'Pick up every counter from your cast spells. The same counters now pay for Learning.' },
      { key: 'learning', n: 3, name: 'Learning', short: 'Spend your counters on Learn, Empower, Reshape or Unlearn.' },
    ],
    drought: [
      { key: 'collection', n: 1, name: 'Collection', short: 'Draw 1 from the Released Reserve. There is no choice: the Source and the Array are gone.' },
      { key: 'casting', n: null, name: 'No Casting', absent: true, short: 'Nothing can be cast. Enchantments stay active on their own.' },
      { key: 'learning', n: 2, name: 'Learning', short: 'Works normally. Your last chance to shape your Spellbook.' },
    ],
  },

  casting: {
    lines: [
      'Cast up to one spell for each counter you have.',
      'To cast: choose a spell in your Spellbook, place a counter on it, and resolve its effect at once.',
      'Each spell can be cast once a turn.',
      'Order matters: each effect resolves before you cast the next spell.',
      'Enchantments are never cast. They are always active.',
      'If you cannot legally resolve a spell’s effect, you cannot cast it.',
    ],
  },

  learning: [
    {
      key: 'learn',
      name: 'Learn',
      cost: { counters: 1 },
      short: 'Place a new, valid spell from your hand into your Spellbook.',
      details: [
        'It must be a Conjuration, Transfiguration, Enchantment or Perfect Transmutation.',
        'Declare any wilds in it now: an energy and a value.',
        'A new Enchantment raises your capacity from the start of your next turn.',
      ],
    },
    {
      key: 'empower',
      name: 'Empower',
      cost: { counters: 1 },
      short: 'Add components from your hand to a spell you already have.',
      details: [
        'The spell may grow and keep its type, or change among Conjuration, Transfiguration and Perfect Transmutation.',
        'Empower can never turn a spell into an Enchantment, or an Enchantment into anything else. That takes Learn or Unlearn.',
        'Wilds already in the spell keep their declaration.',
      ],
    },
    {
      key: 'reshape',
      name: 'Reshape',
      cost: { counters: 1, per: 'spell broken down', perShort: 'spell' },
      short: 'Break down one or more spells and rebuild them from the same components.',
      details: [
        'One counter for each spell you break down: break three, pay three.',
        'Every freed component must end in a valid spell.',
        'Rebuilt spells declare their wilds again.',
        'Make an Enchantment smaller and its capacity drops at once.',
      ],
    },
    {
      key: 'unlearn',
      name: 'Unlearn',
      cost: { counters: 1 },
      short: 'Take one or more components from a single spell back to your hand.',
      details: [
        'What is left must still be a valid spell. If not, the whole spell comes apart and all of it returns to your hand.',
        'One counter however many components you take, but only from one spell. A second spell is a second Unlearn.',
        'From a run (Transfiguration or Perfect Transmutation), a single component must come off an end. You cannot pull one out of the middle.',
        'Components you take back cannot be learned into a new spell until your next turn.',
        'Make an Enchantment smaller, or take it apart, and its capacity drops at once.',
      ],
    },
  ],

  capacity: {
    perCounter: { casts: 1, learningActions: 1 },
    gain: 'next-turn',
    loss: 'immediate',
    lines: [
      'Counters are your capacity, not a resource you spend away.',
      'They work twice each turn: once to cast, then, after the Recall, once to learn.',
      'Casting fewer spells does not give you more learning actions. You always get every counter back.',
      'You gain capacity by learning Enchantments. An Enchantment’s capacity always matches its current size.',
    ],
    timing: [
      '**Gains** (Learn or Empower an Enchantment) arrive at the start of your **next turn**.',
      '**Losses** (Unlearn or Reshape an Enchantment smaller, or take it apart) apply **immediately**.',
      'You may only shrink or take apart an Enchantment if you can pay the action’s counter **and** absorb the lost capacity from the counters you still have free this turn. If you cannot, the action is blocked.',
    ],
    workedExample:
      'Your only Enchantment is a 4-component set of 8s at 2–4 players, so your capacity is 4 (1 to start, 3 from the Enchantment). Taking it apart costs 1 action and 3 lost capacity: 4 in all, possible only if you have used no capacity this turn. Stepping it down to 3 components costs 1 action and 2 lost capacity: 3 in all, and leaves a scoring Enchantment worth 1 counter.',
  },

  wildRule: {
    summary: 'A wild stands in for any energy and value in the deck you are playing with.',
    lines: [
      'When a wild becomes part of a learned spell, declare what it is: an energy and a value.',
      'It can only be an energy that is in the deck you are playing with. It cannot stand for an energy that is not in play.',
      'The declaration is fixed for as long as that spell exists. Empowering the spell does not change it.',
      'If the spell is broken down and rebuilt, its wilds are declared again.',
      'No spell may hold more than {maxSpellSize} components. Wilds cannot push a spell past the 1–{maxValue} span.',
    ],
    enchantmentConsequence:
      'So a wild cannot be a “fifth energy” in a four-energy deck: at 2–4 players an Enchantment stops at 4 components. The 5-component Enchantment needs Echo, at 5–6 players.',
  },

  drought: {
    trigger: 'The instant the Source runs dry.',
    steps: [
      'Shuffle the Array together with the Arcane Reserve.',
      'That pile is the **Released Reserve**.',
      'The Array no longer exists.',
      'Turn order continues as normal.',
    ],
    whyNoCasting: [
      { kind: 'conjuration', works: false, text: 'Conjurations drew on the Source. It is gone.' },
      { kind: 'transfiguration', works: false, text: 'Transfigurations needed the Array. It is gone.' },
      { kind: 'perfect', works: false, text: 'Perfect Transmutations needed both.' },
      { kind: 'enchantment', works: true, text: 'Enchantments still work. They are always active and keep giving their full capacity.' },
    ],
    end: 'When the Released Reserve is empty, the contest ends at once. Evaluate your Spellbooks.',
  },

  keyReminders: [
    'Wilds stand in for any energy and value.',
    'Enchantments are always active. Never cast.',
    'Counters are capacity, not a resource. All return at Learning.',
  ],

  goal:
    'Arrange components into spells in your Spellbook while the Source lasts. When it runs dry the Drought begins. When the Drought ends, the strongest Spellbook wins on Recognition Points, and its wizard becomes the Renewer.',

  // ── Variants: decided or proposed changes that are NOT part of the base rules ────
  // `patches` are applied by data/current.js only when the variant is switched on.
  variants: [
    {
      key: 'array-attunement',
      name: 'Array Attunement',
      status: 'proposed',
      decided: '2026-07-17',
      default: false,
      rule:
        'During Collection you may take from the Array only if you have at least one Transfiguration or Perfect Transmutation in your Spellbook. Otherwise you must draw from the Source.',
      notes: [
        'Checked at the moment you take. Lose your last Transfiguration or Perfect Transmutation and the access goes with it.',
        'Cast effects are unchanged.',
      ],
      patches: [
        { op: 'set', path: 'turn.normal.0.short', value: 'Draw 1 from the Source. If you have a Transfiguration or Perfect Transmutation in your Spellbook you may **instead** take 1 from the Array and refill it from the Source.' },
        { op: 'note', section: 'collection', text: 'Array Attunement is on: taking from the Array needs a Transfiguration or Perfect Transmutation in your Spellbook.' },
      ],
    },
  ],

  // Ascension Trials are being reconciled (decision F8). Numbers are deliberately absent:
  // the companion carries the rules it implements; Prompt 3 rebuilds it against this slot.
  trials: {
    name: 'Ascension Trials',
    status: 'reconciling',
    summary:
      'An optional finale for experienced tables that replaces the Standard Evaluation. Each wizard turns their Spellbook into power, secretly commits it across a set of trials, and everyone reveals at once. The trials award the Recognition Points.',
    statusNote:
      'The Trials rules are being reconciled and may change shape. Until they settle, the companion app is the reference for the version it runs.',
  },

  // ── Glossary ─────────────────────────────────────────────────────────────────────
  glossary: [
    { term: 'Component', def: 'A card: one energy and one value from 1 to {maxValue}. Example: Void 7.' },
    { term: 'The Source', def: 'The face-down deck. When it runs dry, the Drought begins.' },
    { term: 'The Array', def: 'The {arraySize} face-up components anyone may take from. It is refilled from the Source and ends when the Source does.' },
    { term: 'Arcane Reserve', def: 'The discard pile. It is released when the Source runs dry.' },
    { term: 'The Opening', def: 'Before the first turn, every player places {openingDiscard} component from their hand into the Arcane Reserve.' },
    { term: 'The Drought', def: 'The final phase. The Array and Arcane Reserve merge into the Released Reserve. No casting: only Collection and Learning.' },
    { term: 'Released Reserve', def: 'The last draw pile: the Array and the Arcane Reserve shuffled together. When it is empty the contest ends.' },
    { term: 'Spellbook', def: 'The spells laid out in front of you. It is what gets scored.' },
    { term: 'Conjuration', def: '{minSpellSize}+ components of the same energy. Cast it to draw extra components from the Source.' },
    { term: 'Transfiguration', def: '{minSpellSize}+ components with consecutive values, any energies. Cast it to trade through the Array.' },
    { term: 'Enchantment', def: '{minSpellSize} to {enchantmentMaxAny} components of the same value. Always active, never cast. Raises your capacity.' },
    { term: 'Perfect Transmutation', def: '{minSpellSize}+ consecutive values of one energy. Cast it for both the Conjuration and the Transfiguration effect.' },
    { term: 'Wild', def: 'A card that stands in for any energy and value in the current deck. Declared when learned; fixed while the spell exists.' },
    { term: 'Counter', def: 'A token for one unit of capacity. Placed on a spell to cast it, picked up at the Recall, then used to pay for a learning action.' },
    { term: 'Capacity', def: 'How many spells you may cast and how many learning actions you may take each turn. One of each per counter.' },
    { term: 'Casting', def: 'Placing a counter on a spell in your Spellbook and resolving its effect at once.' },
    { term: 'Recall', def: 'The step between Casting and Learning: pick up every counter from your cast spells.' },
    { term: 'Learn', def: 'Learning action: place a new spell from your hand into your Spellbook.' },
    { term: 'Empower', def: 'Learning action: add components from your hand to a spell you already have.' },
    { term: 'Reshape', def: 'Learning action: break down spells and rebuild them from the same components. One counter per spell broken down.' },
    { term: 'Unlearn', def: 'Learning action: take components from one spell back to your hand.' },
    { term: 'Recognition Points', def: 'What a Spellbook scores at the end. Each spell scores by its type and size.' },
    { term: 'Renewer', def: 'The winner: the wizard whose Spellbook becomes the pattern that ends the Drought.' },
  ],

  // ── Full rules, in the board's order. Section ids are stable deep links. ─────────
  chapters: [
    {
      id: 'set-up',
      title: 'Set-up',
      play: 'set-up',
      blocks: [
        { t: 'flavour', x: 'The currents are failing. The Academy gathers its wizards while the Source still holds.' },
        { t: 'p', x: '**The goal.** {goal}' },
        { t: 'h', id: 'deck', x: 'Choose the deck' },
        { t: 'ref', name: 'deckTable' },
        { t: 'callout', kind: 'under-test', x: '{echoStatus}' },
        { t: 'h', id: 'deal', x: 'Deal and lay out' },
        { t: 'ref', name: 'setupSteps' },
        { t: 'h', id: 'the-opening', x: 'The Opening' },
        { t: 'p', x: 'Before the first turn, every player chooses {openingDiscard} component from their hand at the same time and places it in the Arcane Reserve.' },
        { t: 'p', x: 'This guarantees the Released Reserve holds enough for the final turns when the Drought comes.' },
      ],
    },
    {
      id: 'components',
      title: 'Components',
      play: 'set-up',
      blocks: [
        { t: 'p', x: 'Each card is a **component**: one energy and one value from {minValue} to {maxValue}. *Void 7* is a Void component of value 7.' },
        { t: 'ref', name: 'energyLegend' },
        { t: 'p', x: 'Echo joins only in the 5–6 player deck. Wilds are covered under [Wilds](#wilds).' },
        { t: 'ul', items: [
          '**Your Spellbook** is the area in front of you where you lay out learned spells. It is what gets scored.',
          '**Counters** are tokens that track your capacity. See [Counters and capacity](#counters).',
          '**The Source** is the face-down deck.',
          '**The Array** is the row of {arraySize} face-up components.',
          '**The Arcane Reserve** is the discard pile. Everything discarded goes here.',
        ] },
      ],
    },
    {
      id: 'spells',
      title: 'Spells',
      play: 'spells',
      blocks: [
        { t: 'flavour', x: 'Four ways to arrange what you hold. Your Spellbook is the proof.' },
        { t: 'p', x: 'A spell is {minSpellSize} or more components in one of four patterns. No spell may hold more than {maxSpellSize}.' },
        { t: 'ref', name: 'spell:conjuration' },
        { t: 'ref', name: 'spell:transfiguration' },
        { t: 'ref', name: 'spell:enchantment' },
        { t: 'ref', name: 'spell:perfect' },
        { t: 'p', x: 'Not sure what your cards make? [Check your hand](play:check).' },
        { t: 'h', id: 'wilds', x: 'Wilds' },
        { t: 'p', x: '{wildSummary}' },
        { t: 'ref', name: 'wildLines' },
        { t: 'callout', kind: 'clarification', x: '{wildEnchantment}' },
      ],
    },
    {
      id: 'normal-turn',
      title: 'Normal Turn',
      play: 'turn',
      blocks: [
        { t: 'ref', name: 'turnSteps:normal' },
        { t: 'h', id: 'collection', x: '1 · Collection' },
        { t: 'p', x: 'Choose one:' },
        { t: 'ul', items: ['Draw 1 component from the Source, **or**', 'Take 1 component from the Array and replace it from the Source at once.'] },
        { t: 'p', x: 'That is all. Extra draws come from casting Conjurations, next.' },
        { t: 'ref', name: 'variantNotes:collection' },
        { t: 'h', id: 'casting', x: '2 · Casting' },
        { t: 'ref', name: 'castingLines' },
        { t: 'ref', name: 'castEffects' },
        { t: 'h', id: 'recall', x: 'Recall' },
        { t: 'p', x: 'Pick up every counter sitting on a cast spell and return it to your pool. That is the whole step, and every player does it every turn.' },
        { t: 'p', x: 'It is a named step because it is the hinge of the turn: the counters you just cast with are the counters you now learn with.' },
        { t: 'h', id: 'learning', x: '3 · Learning' },
        { t: 'p', x: 'Take up to one learning action for each counter you have. Each costs 1 counter, except Reshape, which costs 1 for each spell broken down.' },
        { t: 'ref', name: 'learningActions' },
        { t: 'h', id: 'counters', x: 'Counters and capacity' },
        { t: 'ref', name: 'capacityLines' },
        { t: 'ref', name: 'startingCounters' },
        { t: 'ref', name: 'ladder' },
        { t: 'h', id: 'enchantment-timing', x: 'When capacity changes' },
        { t: 'ref', name: 'capacityTiming' },
        { t: 'example', x: '{capacityExample}' },
      ],
    },
    {
      id: 'drought-turn',
      title: 'Drought Turn',
      play: 'drought',
      blocks: [
        { t: 'flavour', x: 'The Source is dry. What remains is the Reserve, released for the last preparations.' },
        { t: 'h', id: 'the-drought-has-begun', x: 'The Drought has begun' },
        { t: 'p', x: '**Trigger.** {droughtTrigger}' },
        { t: 'ref', name: 'droughtSteps' },
        { t: 'h', id: 'drought-turns', x: 'Turns during the Drought' },
        { t: 'ref', name: 'turnSteps:drought' },
        { t: 'p', x: 'No counters are placed on spells. Collect 1 component, then go straight to Learning, which works exactly as before: Learn, Empower, Reshape and Unlearn, with your full capacity.' },
        { t: 'h', id: 'why-casting-stops', x: 'Why casting stops' },
        { t: 'ref', name: 'whyNoCasting' },
        { t: 'h', id: 'the-contest-ends', x: 'The contest ends' },
        { t: 'p', x: '{droughtEnd}' },
      ],
    },
    {
      id: 'recognition-points',
      title: 'Recognition Points',
      play: 'score',
      blocks: [
        { t: 'p', x: 'Tally Recognition Points for every spell in your Spellbook. The highest total wins.' },
        { t: 'ref', name: 'scoreTable' },
        { t: 'ref', name: 'tiebreakers' },
        { t: 'callout', kind: 'under-test', x: 'This is the v{version} table. It is under test.' },
        { t: 'h', id: 'scoring-example', x: 'Example' },
        { t: 'ref', name: 'scoringExample' },
        { t: 'h', id: 'score-calculator', x: 'Score calculator' },
        { t: 'ref', name: 'calculator' },
      ],
    },
    {
      id: 'ascension-trials',
      title: 'Ascension Trials',
      blocks: [
        { t: 'p', x: '{trialsSummary}' },
        { t: 'callout', kind: 'variant', x: '{trialsStatus}' },
        { t: 'ref', name: 'trialsLinks' },
      ],
    },
    {
      id: 'variants',
      title: 'Variants under test',
      blocks: [
        { t: 'p', x: 'These are not part of the base rules. Play them only if the table agrees before the game.' },
        { t: 'ref', name: 'variants' },
      ],
    },
    {
      id: 'glossary',
      title: 'Glossary',
      blocks: [{ t: 'ref', name: 'glossary' }],
    },
  ],
};
