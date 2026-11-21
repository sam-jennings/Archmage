"""Bring board/archmage_a3_landscape_board.pdf to rulebook v3.3 (content only).

The original ReportLab source for the board is not in the repo, so this script edits the
existing PDF in place: it removes the out-of-date text spans (vector art, panels and table
row shading are kept untouched) and writes the v3.3 text back in the same fonts, sizes and
colours (Helvetica / Helvetica-Oblique / Times-Bold, WinAnsi).

Run from the repo root:  python board/regen_board_v33.py
Needs PyMuPDF (tested 1.28). Reads the PDF, writes it back over itself.
Text values follow rulebook/Archmage Ascension - Complete Rulebook.md and
rulebook/Scoring System Reference.md (v3.3).
"""
import os
import pymupdf

PDF = os.path.join(os.path.dirname(__file__), "archmage_a3_landscape_board.pdf")

WHITE = 0xF0EADB   # body text
DIM = 0xCBBFDB     # box / reminder text
GOLDL = 0xE6D08A   # table header / tiebreaker


def rgb(c):
    return ((c >> 16) / 255, ((c >> 8) & 255) / 255, (c & 255) / 255)


# Canon Recognition Points (Scoring System Reference v3.3): size, Conj, Transfig, Perfect, Ench
ROWS = [
    (3, 0, 3, 5, 4), (4, 1, 4, 11, 10), (5, 2, 5, 18, 16), (6, 3, 7, 24, None),
    (7, 7, 8, 31, None), (8, 13, 10, 39, None), (9, 20, 13, 47, None), (10, 29, 16, 56, None),
    (11, 38, 20, 65, None), (12, 50, 25, 74, None), (13, 63, 31, 85, None),
    (14, 79, 38, 97, None), (15, 100, 48, 100, None),
]
COL_X = [270.75, 313.25, 372.75, 440.8, 501.75]  # column centres measured off the old PDF
ROW0, ROW_DY = 549.11, 15.025                      # first-row baseline, row pitch

SETUP = [
    "2-4 players: Radiance, Void, Flux, Aether \u00d7 ranks 1-15 (60 cards + 2 wilds = 62 cards).",
    "5-6 players: the four energies + Echo \u00d7 ranks 1-15 (75 cards + 4 wilds = 79 cards).",
    "Deal 7 cards to each player.",
    "Place 5 face-up to form the Array. Place the rest face-down as the Source.",
    "Randomly determine the starting player.",
    "Starting counters: 2-4 players 1 each; 5-6 players 2 each.",
    "Binding: before the first turn, each player places 1 card from hand in the Arcane Reserve.",
]
REMINDERS = [
    "Wilds never declare an energy; in a sequence a wild declares only its number.",
    "Enchantments are always active - never cast.",
    "Enchantment capacity: gains arrive next turn, losses apply at once.",
    "Counters are capacity, not a resource - all return at Recall.",
]
DROUGHT_BOX = ("The instant the Source runs dry, finish the current effect. Shuffle the Array and "
               "Reserve together into the Released Reserve. No more Casting Phase. "
               "Draw from the Released Reserve each turn.")
CONTEST_BOX = ("The player who draws the last Released Reserve card finishes that turn, "
               "including Learning. Then the contest ends. Evaluate your Spellbooks.")


def wrap(text, font, size, width):
    out, line = [], ""
    for w in text.split():
        t = (line + " " + w).strip()
        if pymupdf.get_text_length(t, fontname=font, fontsize=size) <= width:
            line = t
        else:
            out.append(line)
            line = w
    out.append(line)
    return out


def main():
    doc = pymupdf.open(PDF)
    page = doc[0]

    # 1. Remove stale text: every span whose top-left falls in one of these zones.
    zones = [
        pymupdf.Rect(55, 96, 600, 112),    # Normal Turn line 3
        pymupdf.Rect(60, 612, 212, 676),   # Drought-has-begun box body
        pymupdf.Rect(985, 612, 1125, 676), # Contest-ends box body
        pymupdf.Rect(255, 538, 520, 735),  # table body (all numbers)
        pymupdf.Rect(476, 523, 515, 537),  # "Enchant." header (rewritten, same text)
        pymupdf.Rect(255, 764, 470, 778),  # tiebreaker
        pymupdf.Rect(628, 515, 930, 600),  # set-up lines
        pymupdf.Rect(628, 729, 930, 766),  # key reminders
    ]
    for b in page.get_text("dict")["blocks"]:
        for l in b.get("lines", []):
            for s in l["spans"]:
                r = pymupdf.Rect(s["bbox"])
                if any(z.contains(r.tl + (0.5, 0.5)) for z in zones):
                    # thin band through the glyph middles, so neighbouring lines are not caught
                    mid = (r.y0 + r.y1) / 2
                    page.add_redact_annot(pymupdf.Rect(r.x0 + 0.3, mid - 1.5, r.x1 - 0.3, mid + 1.5), fill=False)
    page.apply_redactions(images=pymupdf.PDF_REDACT_IMAGE_NONE,
                          graphics=pymupdf.PDF_REDACT_LINE_ART_NONE,
                          text=pymupdf.PDF_REDACT_TEXT_REMOVE)

    def put(x, y, text, font="helv", size=8.2, color=DIM, center=False):
        if center:
            x -= pymupdf.get_text_length(text, fontname=font, fontsize=size) / 2
        page.insert_text((x, y), text, fontname=font, fontsize=size, color=rgb(color))

    # 2. Normal Turn: name the Recall step, add the Source-emptying rule.
    put(57.54, 108.69, "3. Learning - Recall: retrieve all counters, then use your capacity for "
        "Learn / Empower / Reshape / Unlearn.", size=10.2, color=WHITE)
    put(57.54, 125.0, "If the Source runs dry: finish the current effect, cast nothing more, "
        "go to Learning (Drought rules).", font="heit", size=9.8, color=DIM)

    # 3. Corner boxes (centred, wrapped to the old text width).
    for text, cx in ((DROUGHT_BOX, 136.0), (CONTEST_BOX, 1054.5)):
        for i, ln in enumerate(wrap(text, "helv", 8.2, 140)):
            put(cx, 626.2 + i * 9.2, ln, center=True)

    # 4. Recognition Points table.
    put(493.7, 532.91, "Ench.", font="hebo", size=7.35, color=GOLDL, center=True)
    for ri, row in enumerate(ROWS):
        for ci, v in enumerate(row):
            put(COL_X[ci], ROW0 + ri * ROW_DY, "-" if v is None else str(v), size=7.35,
                color=WHITE, center=True)
    put(257.1, 746.5, "Enchantment capacity: +1 / +3 / +5 counters at 3 / 4 / 5 cards (cumulative totals).",
        size=7.15, color=WHITE)
    put(257.1, 756.0, "5-card Enchantments: 5-6 players (Echo deck) only - at 2-4 players the cap is 4 cards.",
        size=7.15, color=WHITE)
    put(257.1, 773.86, "Highest total wins. Tiebreaker: most spells -> most components in largest single spell",
        font="heit", size=7.15, color=GOLDL)

    # 5. Set-up and Key Reminders (bulleted, wrapped).
    def bullets(items, y, size, step, color):
        for it in items:
            for j, ln in enumerate(wrap(it, "helv", size, 290)):
                if j == 0:
                    put(630.7, y, "-", size=size, color=color)
                put(640.3, y, ln, size=size, color=color)
                y += step
        return y

    bullets(SETUP, 529.23, 9.45, 10.9, WHITE)
    bullets(REMINDERS, 741.26, 8.2, 9.3, DIM)

    doc.save(PDF + ".tmp", garbage=3, deflate=True)
    doc.close()
    os.replace(PDF + ".tmp", PDF)
    print("board written:", PDF)


if __name__ == "__main__":
    main()
