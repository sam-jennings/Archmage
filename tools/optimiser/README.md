# Final Hand Optimiser

Designer-only tool for Archmage Ascension balance testing. Given a player's
full set of cards at game end (hand + spellbook), it returns the partition
into a scoring spellbook that maximises Recognition Points under the standard
evaluation, plus a couple of runner-up partitions for comparison.

**Not part of the public reference.** Don't include this in
`web-apps/archmage-reference.html` or any player-facing material — it's a
balance-analysis tool.

## Files

- `ALGORITHM.md` — design rationale (problem framing, complexity analysis,
  wild handling).
- `optimise.py` — the optimiser plus the CLI entry point.
- `test_optimise.py` — pytest suite, including hand-worked optimal cases.

## Card notation

Each card is `<suit-letter><value>`:

- Suits: `R` Radiance, `V` Void, `F` Flux, `A` Aether
- Values: `1`-`15` (2-4 player deck) or `1`-`20` (5-7 player deck)
- Wild card: `W` (no value)

Cards are comma-separated. Whitespace is ignored. Case-insensitive.

## Usage

From `tools/optimiser/`:

```
python optimise.py --cards "V5,V6,V7,V8,V9,R3,V3,F3,A3"
```

Sample output:

```
Hand: 9 cards (0 wild), max value 15
Candidate spells: 28
Optimal score: 25
(searched 41 nodes; returning top 3 partitions)

#1: 25 Recognition Points (2 spells, 0 cards unused)
  [PerfectTransmutation k=5 = 14 pts] V5 V6 V7 V8 V9
  [Enchantment k=4 = 15 pts] R3 V3 F3 A3
```

(The above showed 25 to illustrate format; actual numbers depend on the hand.)

### Flags

- `--cards` (required) — the card list.
- `--max-value` `{15, 20}` — deck size (default 15).
- `--top-k N` — how many partitions to report; default 3. Use 1 for the
  optimum only.
- `--node-budget N` — cap on the runner-up search tree (default 2,000,000).
  The optimum is always exact; runners-up are best-effort if the cap is hit
  on a worst-case hand.

### More examples

20-card deck:

```
python optimise.py --cards "V18,V19,V20,F18,R19,A20" --max-value 20
```

With wilds (a wild can stand in for any suit/value to complete a spell):

```
python optimise.py --cards "R7,V7,F7,W,V3,V4,V5"
```

## Tests

```
python -m pytest test_optimise.py -v
```

The suite covers each spell-type validator, wild handling, the scoring
table, and several hand-worked optimal cases (see docstrings on the
`test_hand_worked_*` tests).

## Scope

- Standard evaluation (Recognition Points table from
  `rulebook/Scoring System Reference.md` v2.8) only.
- The Ascension Trials power-allocation variant is out of scope — different
  scoring formula, separate tool if/when needed.
- Tiebreaks (more spells, then largest single spell) are computed and used
  to rank equal-score partitions in the output.
