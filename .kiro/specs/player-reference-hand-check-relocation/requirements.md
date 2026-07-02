# Requirements Document

## Introduction

The interactive "Check your hand" hand checker currently appears prominently near the top of the Spells screen in the quick reference (`player-reference.html`). This feature relocates the complete, fully interactive tool into the full rules (`archmage-reference.html`), appending it as the final block of the existing Spells tab, and removes it entirely from the quick reference. The quick reference's "First game?" tip is updated to point players to the full rules for the tool. The goal is to de-emphasize the tool in the quick reference while preserving identical interactive behavior in the full rules.

## Glossary

- **Quick_Reference**: The `web-apps/player-reference/player-reference.html` document, a condensed at-the-table player aid.
- **Full_Rules**: The `web-apps/archmage-reference.html` document, the complete tabbed rules reference.
- **Hand_Checker**: The interactive "Check your hand" tool comprising its HTML markup (root `div.hc` with element IDs `hcEnergies`, `hcEntry`, `hcHand`, `hcClear`, `hcResults`), its CSS (the `/* ── Hand checker ── */` block), and its JavaScript (the `HAND CHECKER` section with its state object and render/compute functions).
- **Spells_Tab**: The `<div id="spells" class="tab-content">` container within Full_Rules.
- **Spells_Screen**: The `<section id="screen-spells">` container within Quick_Reference.
- **Start_Screen**: The starting screen of Quick_Reference containing the "First game?" tip list.
- **First_Game_Tip**: The list item on the Start_Screen reading "Mid-game questions: use Check your hand on the Spells screen."

## Requirements

### Requirement 1

**User Story:** As a player using the full rules, I want the complete interactive hand checker available in the Spells section, so that I can check which spells my components can form directly within the full rules.

#### Acceptance Criteria

1. THE Full_Rules SHALL contain the Hand_Checker markup, CSS, and JavaScript.
2. THE Full_Rules SHALL place the Hand_Checker markup as the final content block within the Spells_Tab.
3. WHEN a user selects an energy and a value in the Hand_Checker within Full_Rules, THE Hand_Checker SHALL add the corresponding component to the current hand.
4. WHEN the current hand changes in the Hand_Checker within Full_Rules, THE Hand_Checker SHALL display every spell the current components can form.
5. WHEN a user activates the clear control in the Hand_Checker within Full_Rules, THE Hand_Checker SHALL remove all components from the current hand.
6. THE Hand_Checker in Full_Rules SHALL produce results identical to the prior behavior in Quick_Reference for the same component inputs.

### Requirement 2

**User Story:** As a maintainer, I want the ported hand checker to integrate with the full rules document's own structure, so that it renders and functions correctly without breaking the existing page.

#### Acceptance Criteria

1. THE Hand_Checker CSS in Full_Rules SHALL be adapted to the token and style system of Full_Rules so that the Hand_Checker renders as intended.
2. THE Hand_Checker JavaScript in Full_Rules SHALL resolve its dependencies (energy definitions, wild value, element helpers, spell definitions, short spell-effect text, and mini-card markup) within Full_Rules.
3. WHEN Full_Rules is loaded, THE Full_Rules SHALL initialize the Hand_Checker without raising script errors.
4. THE Full_Rules SHALL preserve all existing Spells_Tab content and all other tabs unchanged apart from the appended Hand_Checker.

### Requirement 3

**User Story:** As a player using the quick reference, I want the hand checker removed from the Spells screen, so that the quick reference stays concise and uncluttered.

#### Acceptance Criteria

1. THE Quick_Reference SHALL NOT contain the Hand_Checker markup.
2. THE Quick_Reference SHALL NOT contain the Hand_Checker CSS block.
3. THE Quick_Reference SHALL NOT contain the Hand_Checker JavaScript section.
4. THE Quick_Reference SHALL NOT contain references to the element IDs `hcEnergies`, `hcEntry`, `hcHand`, `hcClear`, and `hcResults`.
5. WHEN Quick_Reference is loaded, THE Quick_Reference SHALL initialize the Spells_Screen without raising script errors.
6. THE Quick_Reference SHALL preserve all remaining Spells_Screen content unchanged apart from the removed Hand_Checker.

### Requirement 4

**User Story:** As a new player reading the first-game tip, I want the mid-game guidance to point me to the full rules, so that I can find the hand checker after it has moved.

#### Acceptance Criteria

1. THE First_Game_Tip SHALL direct the reader to the Hand_Checker in Full_Rules.
2. THE First_Game_Tip SHALL NOT reference the Spells screen of Quick_Reference as the location of the Hand_Checker.
