# Prompt 5 (Opus, fresh session) — QA and verification of web v2

> Run last, in a fresh session that did not build anything. Paste everything below the line.

---

You are reviewing the new v2 web surfaces of Archmage Ascension (`web-apps/v2/`) before
Sam decides whether to promote them. Report only. Do **not** edit any file outside
`web-apps/v2/QA_REPORT.md`, which you create.

Check, in this order, and give each finding a severity (blocker / fix before promote / polish):

1. **Rules accuracy.** Every number and rule statement shown on v2 pages vs
   `meta/canon.yml`, the rulebook (v3.1, under test) and `rulebook/Scoring System Reference.md`.
   Run `web-apps/v2/tools/check-rules-data.mjs`. Then independently spot-check 20 facts
   by reading the rendered pages, not the data file. Include the explainers: walk each
   one and confirm every step's outcome is legal per the rulebook.
2. **Vocabulary.** Grep v2 for `meta/canon.yml` retired terms and the banned list in
   `web-apps/v2/_plan/PROMPT_1_FABLE_foundation-and-player-site.md`.
3. **Tests.** Run every test under `web-apps/v2/` and the original
   `web-apps/tests/hand-checker/` suite; report results verbatim.
4. **Mobile + laptop.** If you can drive a browser, load each page at 375×667 and
   1280×800: layout, tap-target size, horizontal overflow, text size, sticky nav. Run
   Lighthouse (performance, accessibility, best-practices) and report scores. Test the
   service worker offline. If you can't drive a browser, say so and do a static review.
5. **Accessibility.** WCAG 2.1 AA: contrast (especially energy colours on dark), focus
   order, keyboard use of the hand checker and explainers, screen-reader text for card
   chips, reduced motion.
6. **Wayfinding test.** For each of these questions, count taps from the v2 landing on a
   phone to the answer: "Can I cast 3♦-4♦-wild?", "What does a 6-card Conjuration do?",
   "What can I do with 2 counters?", "What happens when the Source runs out?", "How many
   points is a 10-card Transfiguration?", "How do I set up for 5 players?". Flag anything over 3.
7. **Links.** Every internal link and deep-link id; the old→new id map in `REPORT_1.md`.
8. **Studio privacy.** Confirm `noindex` and that no player page links to studio content directly.

End with a one-paragraph promote / don't-promote-yet recommendation and the top 5 fixes.
