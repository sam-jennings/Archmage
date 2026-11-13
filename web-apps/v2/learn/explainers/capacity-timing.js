// EXPLAINER 2 — When capacity changes.
// Aha: gains wait for next turn; losses hit now, and you need room for them.
// A sandbox over one Enchantment: learn it, grow it, shrink it, take it apart, end the turn.
import { RULES, plain, tx, n, startCounters, grant, actionCost, maxEnchantment, minEnchantment, step } from './kit.js';

export const id = 'capacity-timing';
const T = (key, vars) => tx(id + '.' + key, vars);
export const VALUE = 8; // the rulebook's worked example uses a set of 8s
const ENERGY_ORDER = (group) => RULES.decks[RULES.players.groups.find((g) => g.id === group).deck].energies;

export const capacity = (s) => s.start + s.now;
export const free = (s) => capacity(s) - s.used;

export function init(group) {
  const start = startCounters(group);
  return { group, start, size: 0, now: 0, next: 0, used: 0, turn: 1, notes: [], say: T('start', { capacity: n.counters(start) }) };
}

/** What shrinking the Enchantment to `size` would cost right now. */
export function lossCheck(s, size, actionKey) {
  const cost = actionCost(actionKey);
  const loss = Math.max(0, s.now - grant(size)); // capacity you hold now that the smaller size no longer gives
  const need = cost + loss;
  return { cost, loss, need, free: free(s), allowed: free(s) >= need, pending: s.next > s.now };
}

export function actions(s) {
  const min = minEnchantment();
  const out = [];
  const can = free(s) >= actionCost('learn');
  if (s.size === 0) out.push({ id: 'learn', label: T('learn', { size: min }), disabled: !can });
  if (s.size > 0 && s.size < maxEnchantment(s.group)) out.push({ id: 'grow', label: T('grow', { size: s.size + 1 }), disabled: !can });
  if (s.size > min) out.push({ id: 'shrink', label: T('shrink', { size: s.size - 1 }), blocked: !lossCheck(s, s.size - 1, 'unlearn').allowed });
  if (s.size > 0) out.push({ id: 'apart', label: T('apart'), blocked: !lossCheck(s, 0, 'unlearn').allowed });
  out.push({ id: 'other', label: T('other'), disabled: !can });
  out.push({ id: 'next', label: T('nextTurn'), primary: true });
  return out;
}

export function apply(s, actionId) {
  const min = minEnchantment();
  if (actionId === 'learn' || actionId === 'grow') {
    const key = actionId === 'learn' ? 'learn' : 'empower';
    if (free(s) < actionCost(key)) return step(s, { say: T('noFree') });
    const size = actionId === 'learn' ? min : s.size + 1;
    if (size > maxEnchantment(s.group)) return s;
    const t = step(s, { size, next: grant(size), used: s.used + actionCost(key) });
    return { ...t, say: plain(RULES.capacity.timing[0]) + ' ' + T('gained', { grant: grant(size), capacity: capacity(t) }) };
  }
  if (actionId === 'shrink' || actionId === 'apart') {
    const size = actionId === 'apart' ? 0 : s.size - 1;
    if (s.size === 0 || (actionId === 'shrink' && s.size <= min)) return s;
    const check = lossCheck(s, size, 'unlearn');
    if (!check.allowed) {
      return step(s, { say: T('blocked', { need: check.need, cost: n.counters(check.cost), loss: check.loss, free: check.free }) + ' ' + plain(RULES.capacity.timing[2]), blockedBy: check });
    }
    const t = step(s, { size, now: Math.min(s.now, grant(size)), next: grant(size), used: s.used + check.cost, blockedBy: null });
    const say = check.loss > 0
      ? plain(RULES.capacity.timing[1]) + ' ' + T('lost', { cost: n.counters(check.cost), loss: check.loss, capacity: capacity(t) })
      : T('lostNone', { cost: n.counters(check.cost) });
    return { ...t, say, notes: check.pending ? [{ kind: 'unclear', text: T('pendingNote') }] : [] };
  }
  if (actionId === 'other') {
    if (free(s) < actionCost('learn')) return step(s, { say: T('noFree') });
    const t = step(s, { used: s.used + actionCost('learn') });
    return { ...t, say: T('spent', { free: n.counters(free(t)) }) };
  }
  if (actionId === 'next') {
    const t = step(s, { turn: s.turn + 1, now: s.next, used: 0, blockedBy: null });
    return { ...t, say: T('newTurn', { capacity: n.counters(capacity(t)) }) };
  }
  return s;
}

export const facts = (s) => [
  { label: T('now'), value: capacity(s) },
  { label: T('free'), value: free(s) },
  { label: T('next'), value: s.next > s.now ? '+' + (s.next - s.now) : '—' },
];

export function stage(s, kit) {
  const cards = ENERGY_ORDER(s.group).slice(0, s.size).map((e) => ({ e, v: VALUE }));
  return [
    kit.label(T('turn', { n: s.turn })),
    kit.pool(T('now'), free(s), capacity(s), s.next > s.now ? s.next - s.now : 0, T('next')),
    s.size ? kit.spell({ title: RULES.spells.enchantment.name, cards, badge: '+' + grant(s.size) }) : kit.label(T('none')),
  ];
}
