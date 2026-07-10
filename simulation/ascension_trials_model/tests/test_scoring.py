"""Task 4 — standard Recognition Points q(S) (REQ-3.3, REQ-3.4, REQ-3.10).

q(S) is loaded from the current standard scoring reference
``rulebook/Scoring System Reference.md`` (v3.1). Expected values are transcribed
from that rulebook table (never reverse-engineered from code, REQ-9.4):

    Conjuration:            3 -> 0,  7 -> 7,  15 -> 100
    Transfiguration:        3 -> 3,  5 -> 5,  15 -> 48
    Perfect Transmutation:  3 -> 5,  6 -> 24, 15 -> 100
    Enchantment:            3 -> 4,  4 -> 10, 5 -> 16   (max size 5)

Maya Spellbook standard score:
    7-card Conjuration (7) + 5-card Transfiguration (5)
    + 4-card Enchantment (10) + 6-card Perfect Transmutation (24) = 46
"""

from __future__ import annotations

import pytest

from ascension_trials import scoring
from ascension_trials.scoring import ScoringReference, ScoringReferenceError

MAYA_Q_S = 46  # 7 + 5 + 10 + 24, from the v3.1 Recognition Points table


# --------------------------------------------------------------------------- #
# Loading the current rulebook reference + provenance                          #
# --------------------------------------------------------------------------- #


def test_loads_current_reference_version(scoring_ref):
    assert scoring_ref.version == "v3.1"
    assert scoring_ref.source.endswith("Scoring System Reference.md")


def test_content_hash_is_sha256_prefixed_hex(scoring_ref):
    assert scoring_ref.content_hash.startswith("sha256:")
    digest = scoring_ref.content_hash.split(":", 1)[1]
    assert len(digest) == 64
    assert all(c in "0123456789abcdef" for c in digest)


def test_content_hash_is_newline_stable():
    """The hash must not change with CRLF vs LF line endings (NFR-1)."""
    text = "---\nversion: v9\n---\n| Size | Conjuration |\n|:-:|:-:|\n| 3 | 0 |\n"
    assert scoring.content_hash(text) == scoring.content_hash(text.replace("\n", "\r\n"))


# --------------------------------------------------------------------------- #
# The parsed table matches the rulebook cells                                  #
# --------------------------------------------------------------------------- #


@pytest.mark.parametrize(
    "spell_type,size,expected",
    [
        ("conjuration", 3, 0),
        ("conjuration", 7, 7),
        ("conjuration", 15, 100),
        ("transfiguration", 3, 3),
        ("transfiguration", 5, 5),
        ("transfiguration", 15, 48),
        ("perfect_transmutation", 3, 5),
        ("perfect_transmutation", 6, 24),
        ("perfect_transmutation", 15, 100),
        ("enchantment", 3, 4),
        ("enchantment", 4, 10),
        ("enchantment", 5, 16),
    ],
)
def test_reference_cells_match_rulebook(scoring_ref, spell_type, size, expected):
    assert scoring_ref.score(spell_type, size) == expected


def test_enchantment_capped_at_size_5(scoring_ref):
    """Enchantment has no score above size 5 (rulebook: Echo-only 5-card cap)."""
    assert 5 in scoring_ref.table["enchantment"]
    assert 6 not in scoring_ref.table["enchantment"]
    with pytest.raises(ScoringReferenceError):
        scoring_ref.score("enchantment", 6)


def test_unknown_spell_type_raises(scoring_ref):
    with pytest.raises(ScoringReferenceError):
        scoring_ref.score("summoning", 3)


# --------------------------------------------------------------------------- #
# Maya q(S) and provenance carried onto the score                              #
# --------------------------------------------------------------------------- #


def test_maya_standard_score(maya_spellbook, scoring_ref):
    assert scoring.score_spellbook(maya_spellbook, scoring_ref) == MAYA_Q_S


def test_independent_score_carries_provenance(maya_spellbook, scoring_ref):
    q = scoring.independent_score(maya_spellbook, scoring_ref)
    assert q.value == MAYA_Q_S
    assert q.scoring_version == "v3.1"
    assert q.content_hash == scoring_ref.content_hash


# --------------------------------------------------------------------------- #
# Alternate table injection without editing the rulebook                       #
# --------------------------------------------------------------------------- #


def test_alternate_table_injected_by_construction(maya_spellbook, scoring_ref):
    """A test can adapt the scoring table directly, proving the numbers are not
    embedded in code (design §5.1.1)."""
    bumped = {
        stype: {size: pts + 1000 for size, pts in sizes.items()}
        for stype, sizes in scoring_ref.table.items()
    }
    alt = ScoringReference(
        table=bumped, version="test-alt", content_hash="sha256:alt", source="in-memory"
    )
    # 4 spells, each +1000 over the rulebook score.
    assert scoring.score_spellbook(maya_spellbook, alt) == MAYA_Q_S + 4000
    assert scoring.independent_score(maya_spellbook, alt).scoring_version == "test-alt"


def test_alternate_table_injected_by_file(tmp_path, maya_spellbook):
    """The loader can be pointed at a different Markdown file (no rulebook edit)."""
    alt_md = (
        "---\n"
        "version: alt-1.0\n"
        "---\n\n"
        "| Size (components) | Conjuration | Transfiguration | "
        "Perfect Transmutation | Enchantment |\n"
        "|:-:|:-:|:-:|:-:|:-:|\n"
        "| 3 | 1 | 1 | 1 | 1 |\n"
        "| 4 | 1 | 1 | 1 | 1 |\n"
        "| 5 | 1 | 1 | 1 | 1 |\n"
        "| 6 | 1 | 1 | 1 | — |\n"
        "| 7 | 1 | 1 | 1 | — |\n"
    )
    path = tmp_path / "alt_scoring.md"
    path.write_text(alt_md, encoding="utf-8")

    ref = scoring.load_scoring_reference(path)
    assert ref.version == "alt-1.0"
    # Every Maya spell scores 1 under this flat table -> 4 spells -> 4.
    assert scoring.score_spellbook(maya_spellbook, ref) == 4
