# Final Hand Optimiser — Algorithm

Designer-only tool for Archmage Ascension balance testing. Given a player's full
end-of-game card pool (hand + spellbook), it returns the partition into a scoring
spellbook that maximises Recognition Points under the **standard evaluation**.

This document is the design rationale. Code lives in `optimise.py`.

---

## 1. The problem

Each card has a suit (Radiance / Void / Flux / Aether) and a value (1..15 or
1..20). Wild cards are flexible and can stand in for any (suit, value).

We want to partition some subset of the input cards into **valid spells** so that
the sum of Recognition Points is maximised. Cards may be left out of the
spellbook (they simply contribute 0 — they were leftover hand cards at game end).

### Spell types and validity

A subset `S` of cards (size `k = |S|`, with `w` wilds and `n = k - w` non-wilds)
is a valid spell of type T if:

- **Conjuration** (3 ≤ k): all non-wild cards share one suit (or `n = 0`).
  Values are unconstrained.
- **Transfiguration** (3 ≤ k): non-wild values are pairwise distinct, and there
  exists an integer window `[a, a+k-1] ⊆ [1, MAX]` containing every non-wild
  value. Suits unconstrained. (Wilds fill missing slots in the window.)
- **Enchantment** (3 ≤ k ≤ 4): all non-wild cards share one value, and all
  non-wild suits are distinct. (k ≤ 4 because there are only 4 suits.)
- **Perfect Transmutation** (3 ≤ k): non-wild cards all share one suit AND
  satisfy the Transfiguration window constraint.

### Recognition Points table (v2.8)

```
size  Conj  Trans  PT   Ench
 3      3     5     7    6
 4      4     7    10   15
 5      6    10    14    —
 6      9    14    19    —
 7     13    19    25    —
 8     18    25    32    —
 9     24    32    40    —
10     31    40    49    —
11     39    49    59    —
12     48    59    70    —
13     58    70    82    —
14     69    82    95    —
15     81    95   109    —
```

(Source: `rulebook/Scoring System Reference.md`. Enchantment is capped at size 4.)

A subset that satisfies multiple spell types is scored as the **best** of them
(e.g. a Void 5-6-7 set is both a Conjuration and a Perfect Transmutation; we
score it as PT). The optimiser computes this once per candidate.

---

## 2. Why brute force doesn't work, and what does

Naive partition enumeration is the Bell number of `n` cards. For n=15 that's
~1.4 trillion — far too many. But we don't need to enumerate raw partitions; we
only care about partitions whose blocks are *valid spells*, and most subsets of
3+ cards aren't valid spells.

### Step 1 — enumerate candidate spells

Iterate every subset of size ≥ 3, test it against each spell-type validator,
and keep the highest-scoring valid type. For a 15-card hand there are
`2^15 − C(15,0) − C(15,1) − C(15,2) ≈ 32 600` subsets, and the validators are
O(k); the heavy work is bounded and tractable. In practice only a small fraction
of subsets are valid (a hand of 15 random cards typically yields a few hundred
candidate spells).

For each candidate we record `(bitmask, score, type, cards)`.

### Step 2 — max-weight set packing via bitmask DP

We want a collection of disjoint candidate spells maximising total score. This
is the **maximum-weight set packing** problem: NP-hard in general, but for
n ≤ ~20 a bitmask DP is exact and fast.

```
dp[mask] = max total score achievable using only cards in `mask`
```

Recurrence — pick the lowest-index card `i` in `mask`:

```
dp[mask] = max(
    dp[mask \ {i}],                                         # leave card i out
    max over candidate spells S with i ∈ S and S ⊆ mask of
        score(S) + dp[mask \ S]
)
```

Cost is `O(2^n · S_i)` where `S_i` is the average number of candidate spells
containing the chosen pivot card. For n=15 this is well under a second; for
n=20 it stays in the low seconds.

We index candidates by their lowest-set bit so the recurrence touches only
relevant spells per state.

### Step 3 — runners-up

After the optimum, the user wants the next best **distinct** partitions for
comparison. We use a search-based enumerator that walks the same "skip pivot
or take a candidate spell containing pivot" tree as the DP, but instead of
collapsing to `max` we collect every complete partition reached at the leaves
(one per skip/take choice path). Each unique partition is keyed by its sorted
multiset of spell bitmasks; we keep the top K by score.

Pruning: at each node the partial score plus a cheap upper bound on the
remaining cards (precomputed as `dp[mask]` — the very same array) means we
never explore a subtree that cannot beat the K-th-best score so far. Because
`dp[mask]` is exactly the max achievable on the remaining cards, this bound is
*tight*, so pruning is aggressive in practice.

For a 15-card hand the runner-up walk completes in well under a second. For
worst-case 20-card hands with very many valid spells we cap exploration at a
configurable node budget; the optimum is always returned (it comes from the DP),
runners-up are best-effort if the cap is hit.

---

## 3. Wild handling

Each card is represented as `Card(suit, value, is_wild)`. Validators accept
wilds in any slot:

- Conjuration: ignore wild suits when computing the shared suit.
- Enchantment: ignore wild values when computing the shared value; wilds also
  don't conflict on suit.
- Transfiguration / PT: the window-existence test only references non-wild
  values; wilds plug gaps.

Wild *identity* is implicit per spell — within one chosen partition, a wild's
"identity" is whatever it needs to be in its spell. Since spells in a partition
are disjoint, no wild has to satisfy two constraints at once.

---

## 4. Scope and non-goals

- Standard evaluation only. The Ascension Trials power-allocation variant is
  out of scope (different formula, different end state).
- Tiebreakers (most spells, then largest spell) are computed and used to
  rank equal-score partitions in the output, but the primary objective is
  raw Recognition Points.
- This tool is **not** wired into `archmage-reference.html`. Designer-only.
