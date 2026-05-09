# Lesson 14: The Business of Board Games

## TL;DR
- Supply chain: Publisher → Distributor → Game Stores → Customers. Times Five Model: production cost × 5 = MSRP
- $50 MSRP breakdown: Customers pay $50, Stores pay ~$35, Distributors pay ~$20, Production ~$10
- Crowdfunding danger: Using ×2 multiplier then ×5 for retail creates massive price gaps (Gloomhaven: $79 KS → $200 retail)
- Fixed costs: per-unit manufacturing. One-time costs: art, design, tooling, divided across print run
- Simple game mock budget: $3.55 fixed → ~$21 MSRP at 5,000 copies. Complex game: $7.25 fixed → ~$56 MSRP at 5,000 copies
- Print run realities: KS indie 1,000-2,000 copies. Publishers expect 5,000+. Overprinting = dead money.
- First print run must fund reprints. Underpricing crowdfunding cuts reprint funding.

## Core Concepts
- **Times Five Model** — Production cost × 5 = MSRP baseline. Example: $10 per unit → $50 MSRP. This accounts for retailer margin (~40%), distributor margin (~50%), and publisher operating costs. It's the floor multiplier; higher multipliers (×6, ×7) are safer but reduce competitiveness.

- **Fixed vs. One-Time Costs** — Fixed costs scale with print run (components, assembly, shipping). One-time costs are amortized across units (art: $10K ÷ 5,000 = $2/unit vs. ÷ 1,000 = $10/unit). Print run size massively impacts per-unit cost. Small runs have high fixed-cost impact; large runs amortize better.

- **The Supply Chain Markup Structure** — At $50 MSRP: Customer $50 → Store (40% margin) pays ~$35 → Distributor (50% margin) pays ~$20 → Publisher receives $10 per unit. Distributors handle warehousing, logistics, market relationships. This efficiency is worth the margin compression.

- **Crowdfunding Price Problem** — Applying ×2 multiplier in crowdfunding then ×5 in retail creates 2.5x price gap for retail customers, poisoning perception. Gloomhaven ($79 KS → $200 retail) learned this hard. Solution: consistent ×5 application, max 10% KS discount on MSRP.

- **Print Run Economics** — KS indie typical: 1,000-2,000 copies (top 1% break 5,000). Publishers expect 5,000+ (distribution reach). Overprinting is dead money; sometimes selling out is financially smarter than warehousing surplus.

## Design Principles
- If using crowdfunding → apply ×5 model consistently; offer max 10% discount on MSRP, not aggressive multiplier discounting
- If targeting retail → plan 5,000+ copies; undercost on first run if necessary, fund reprints from profit
- If avoiding retail → direct sales only (Fowers Games model) eliminates price gap but limits audience
- One-time costs ÷ print run = per-unit impact: factor this into run size decision
- Without shipping factored in, use ×7 or ×8 instead of ×5
- Overprinting risk outweighs volume profit; scale conservatively on first runs
- Work backward from target MSRP: divide by 5 to find required per-unit cost; adjust components if cost too high

## Heuristics (Fast Decision Rules)
- **The ×5 Check:** Is per-unit cost × 5 reasonable for your market category? If MSRP seems too high or too low, recheck your fixed costs.
- **Print Run Signal:** KS 1,000-2,000 is realistic; >5,000 is exceptional. Publishers want 5,000+. Underestimate your print run; overprinting is worse than selling out.
- **One-Time Cost Leverage:** High one-time costs (art, tooling) favor large print runs. Favor ×7/×8 multiplier if one-time costs >$15K.
- **Price Gap Test:** KS price ÷ retail MSRP should be 0.9-1.0. If ratio <0.8, price gap will hurt retail perception.
- **Reprint Funding:** First print run profit must cover reprint setup costs. Underprice first, overprice later? No—underprices reprints too.

## Design Frameworks
- **Mock Budget Template:**
  ```
  Fixed Costs (per unit):
  - Components list: [total of all physical items]
  - Assembly: [estimated labor cost]
  - Shipping to warehouse: [logistics cost]
  = Fixed cost/unit

  One-Time Costs (amortized):
  - Art: [budget]
  - Design/graphic design: [budget]
  - Tooling (if custom components): [budget]
  = One-time total ÷ print run size = per-unit cost
  
  Total per unit = Fixed + Amortized One-Time
  MSRP = Total per unit × 5 (or ×7/×8 if high one-time)
  ```

- **Print Run Decision Matrix:**
  - Crowdfunding (indie first game): 1,000-2,000 copies, higher per-unit cost, lower financial risk
  - Traditional publishing (established): 5,000+, lower per-unit cost, needs distribution partnerships
  - Direct-to-consumer only (niche): 500-2,000, no margin compression, limited growth

- **Pricing Strategy by Model:**
  - Crowdfunding: MSRP ÷ 1.1 (max 10% discount) 
  - Retail: Use ×5-×8 multiplier on actual per-unit cost
  - Direct only: Optimize for profit, not market positioning

## Common Pitfalls
- **Using ×2 for crowdfunding** → Why fails: Retail price becomes 2.5× KS price, alienating backers, damaging brand. How to fix: Use ×5 consistently, max 10% KS discount. Accept lower margin on first run if necessary.

- **Vague component list in budget** → Why fails: Inaccurate fixed cost estimates, inflated MSRP, look unprofessional. How to fix: Count every component, get quotes from manufacturers (Panda, Game Crafter), use their online tools.

- **Ignoring one-time costs** → Why fails: Per-unit cost appears lower than reality; MSRP too low or undercuts margin. How to fix: List all one-time costs (art, tooling, design). Divide by realistic print run. Adjust MSRP or print run size accordingly.

- **Overprinting to reduce per-unit cost** → Why fails: Unsold inventory = dead money. $50K inventory at $10/unit = 5,000 units unsold takes all profit. How to fix: Conservative first print run (1,000-2,000). Reprint if demand exists.

- **First run pricing funds nothing for reprint** → Why fails: Low margin on first run leaves no capital for reprint setup/tooling. Second run impossible. How to fix: Ensure first run margin covers reprint costs. May need slightly higher first MSRP or lower component cost.

- **Inconsistent multiplier across channels** → Why fails: Perception of arbitrage (KS backers feel ripped off at retail). Retail customers see different KS customers got better deal. How to fix: Consistent ×5 model everywhere. Offer KS exclusives or limited add-ons instead of price discounting.

## Connections
- **Lesson 13 (The Art of the Board Game Pitch):** Component list precision feeds into budget accuracy. Vague pitch components = unreliable cost estimates.
- **Lesson 15 (Bringing It All Together):** Production estimates form part of final project business plan. Must demonstrate realistic ×5 budgeting.
- **Lesson 16 (Board Game Pitch Presentations):** Presentation feedback reveals budgeting errors; frame MSRP as estimate ("based on estimates, could retail for $X depending on publisher margins").

## Application
- **When estimating MSRP early in design:** Use mock budget with industry standard fixed costs + ballpark one-time costs ($10-20K for art/design). Get actual manufacturer quote mid-development for accuracy.

- **When deciding print run for crowdfunding:** Start with 1,000 minimum (easier to achieve 100% funded). Plan for 1,000-2,000 range. Only exceed if pre-marketing shows demand (email list, social media).

- **When pitching to publishers:** Provide component list, fixed cost estimate, one-time cost estimate, and realistic print run (5,000+). Let publisher apply their multiplier based on their margin model.

- **Tradeoff: Component Cost vs. MSRP** → Expensive components force higher MSRP. If target MSRP won't support full component vision, cut components (fewer cards, simpler tokens, thinner rulebook) or accept lower margin.

- **Tradeoff: First Run vs. Reprints** → Small first run = higher per-unit cost, higher MSRP, lower sales risk. Large first run = lower per-unit cost, lower MSRP, higher capital risk and reprint funding. Choose based on demand confidence and capital.

- **Example:** Simple card game (60 cards, small box, 4-page rules): $3-4 fixed cost → ×5 = $15-20 MSRP. Complex dungeon crawler (200 cards, board, dice, 20-page rules, miniatures): $10-15 fixed cost → ×5 = $50-75 MSRP.

## Source Notes (Condensed)
- Times Five Model is industry standard for retail board games, accounts for supply chain markups (store 40%, distributor 50%) and publisher operating costs.
- Fixed vs. one-time cost distinction is fundamental to manufacturing accounting; critical for accurate per-unit cost estimation.
- Print run size dramatically impacts per-unit cost; smaller runs have higher per-unit cost due to one-time cost concentration.
- Gloomhaven case study ($79 KS → $200 retail) is cautionary tale of aggressive crowdfunding pricing creating market perception problems.
- Crowdfunding economics differ from traditional retail; direct-to-consumer model eliminates distributor margin but limits scale.
- Overprinting risk observed in traditional publishing; inventory management is major cost concern for publishers.
- First print run profit margin must support reprint investment; underpricing first run leaves capital unavailable for growth reprints.
