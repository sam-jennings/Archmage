"""Standard Recognition Points q(S) — design §5.0, §5.1.1.

q(S) is the standard, non-Trials Spellbook score. This module is its ONLY code
path: it loads (or adapts) the current standard scoring reference
``rulebook/Scoring System Reference.md``, parses its Recognition Points table,
and records the reference version plus a SHA-256 content hash as provenance. It
never reads a Trials power profile, so changing the scoring table moves q(S)
while leaving Trials domain power F_C(S) untouched (REQ-3.3, REQ-3.4, REQ-3.10).

The numeric score table is deliberately NOT embedded here; it lives in the
rulebook and is read at load time. Tests can inject an alternate table (to prove
independence) by constructing a :class:`ScoringReference` directly or by pointing
:func:`load_scoring_reference` at a different Markdown file — no rulebook edit is
required.
"""

from __future__ import annotations

import hashlib
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Mapping

from .schema import IndependentScore, Spellbook

# Location of the current standard scoring reference, relative to the repo root.
DEFAULT_REFERENCE_RELPATH = "rulebook/Scoring System Reference.md"

# Normalized column header -> canonical spell type.
_HEADER_TO_TYPE = {
    "conjuration": "conjuration",
    "transfiguration": "transfiguration",
    "perfect_transmutation": "perfect_transmutation",
    "enchantment": "enchantment",
}


class ScoringReferenceError(Exception):
    """Raised when the standard scoring reference cannot be located or parsed."""


@dataclass(frozen=True)
class ScoringReference:
    """A loaded (or adapted) standard scoring table with its provenance.

    ``table`` maps spell type -> spell size -> standard Recognition Points. A
    ``ScoringReference`` is the sole input to q(S); it carries no Trials power
    data, which is what keeps q(S) independent of F_C(S).
    """

    table: Mapping[str, Mapping[int, int]]
    version: str
    content_hash: str
    source: str

    def score(self, spell_type: str, size: int) -> int:
        by_type = self.table.get(spell_type)
        if by_type is None:
            raise ScoringReferenceError(
                f"scoring reference has no column for spell type {spell_type!r}"
            )
        if size not in by_type:
            raise ScoringReferenceError(
                f"scoring reference has no {spell_type} score for size {size} "
                f"(available sizes: {sorted(by_type)})"
            )
        return by_type[size]


def _normalize_header(cell: str) -> str:
    return re.sub(r"[^a-z0-9]+", "_", cell.strip().lower()).strip("_")


def content_hash(text: str) -> str:
    """Deterministic ``sha256:`` digest of a scoring reference.

    Newlines are normalized to ``\\n`` first so the hash is stable regardless of
    the platform/checkout line-ending convention (NFR-1).
    """
    normalized = text.replace("\r\n", "\n").replace("\r", "\n")
    digest = hashlib.sha256(normalized.encode("utf-8")).hexdigest()
    return f"sha256:{digest}"


def parse_version(text: str) -> str:
    """Extract the ``version:`` field from the reference's YAML front-matter."""
    fm = re.match(r"^---\s*\n(.*?)\n---", text, flags=re.DOTALL)
    block = fm.group(1) if fm else text
    vm = re.search(r"^\s*version:\s*(.+?)\s*$", block, flags=re.MULTILINE)
    if not vm:
        raise ScoringReferenceError("scoring reference has no 'version' in front-matter")
    return vm.group(1).strip()


def parse_scoring_table(text: str) -> dict[str, dict[int, int]]:
    """Parse the Recognition Points Markdown table into type -> size -> points.

    Cells that are not integers (e.g. the ``—`` used where a size is unreachable)
    are treated as "no score at this size" and omitted.
    """
    lines = text.splitlines()
    header_idx = None
    for i, line in enumerate(lines):
        low = line.lower()
        if "size" in low and line.count("|") >= 2 and ("conjuration" in low or "enchantment" in low):
            header_idx = i
            break
    if header_idx is None:
        raise ScoringReferenceError("could not locate the Recognition Points table header")

    header_cells = [c.strip() for c in lines[header_idx].strip().strip("|").split("|")]
    col_types: dict[int, str] = {}
    for col, cell in enumerate(header_cells[1:], start=1):  # column 0 is Size
        stype = _HEADER_TO_TYPE.get(_normalize_header(cell))
        if stype is not None:
            col_types[col] = stype
    if not col_types:
        raise ScoringReferenceError("no spell-type columns recognized in scoring table header")

    table: dict[str, dict[int, int]] = {t: {} for t in col_types.values()}
    for line in lines[header_idx + 2:]:  # +2 skips the |:---:| separator row
        stripped = line.strip()
        if not stripped.startswith("|"):
            break  # table ended
        cells = [c.strip() for c in stripped.strip("|").split("|")]
        if not cells or not re.fullmatch(r"\d+", cells[0]):
            break  # not a data row (blank / separator / prose)
        size = int(cells[0])
        for col, stype in col_types.items():
            if col >= len(cells):
                continue
            cell = cells[col]
            if not any(ch.isdigit() for ch in cell):
                continue  # unavailable marker (—, –, -, blank, ...)
            if not re.fullmatch(r"-?\d+", cell):
                raise ScoringReferenceError(
                    f"non-integer score {cell!r} for {stype} size {size}"
                )
            table[stype][size] = int(cell)
    return {t: sizes for t, sizes in table.items() if sizes}


def _find_default_reference() -> Path:
    here = Path(__file__).resolve()
    for parent in here.parents:
        candidate = parent / DEFAULT_REFERENCE_RELPATH
        if candidate.is_file():
            return candidate
    raise ScoringReferenceError(
        f"could not locate {DEFAULT_REFERENCE_RELPATH!r} in any parent of {here}"
    )


def load_scoring_reference(path: str | Path | None = None) -> ScoringReference:
    """Load and parse a standard scoring reference.

    With ``path=None`` the current rulebook reference is located by walking up
    from this module. Passing an explicit ``path`` lets a caller/test adapt an
    alternate scoring table without editing the rulebook.
    """
    if path is None:
        ref_path = _find_default_reference()
        source = DEFAULT_REFERENCE_RELPATH  # deterministic provenance for the default
    else:
        ref_path = Path(path)
        source = str(path).replace("\\", "/")
    try:
        text = ref_path.read_text(encoding="utf-8")
    except OSError as exc:
        raise ScoringReferenceError(f"cannot read scoring reference {ref_path}: {exc}") from exc
    return ScoringReference(
        table=parse_scoring_table(text),
        version=parse_version(text),
        content_hash=content_hash(text),
        source=source,
    )


def score_spellbook(spellbook: Spellbook, reference: ScoringReference) -> int:
    """Sum standard Recognition Points q(S) for every spell in the Spellbook."""
    return sum(reference.score(spell.type, spell.size) for spell in spellbook.spells)


def independent_score(spellbook: Spellbook, reference: ScoringReference) -> IndependentScore:
    """Compute q(S) as a provenanced :class:`~ascension_trials.schema.IndependentScore`."""
    return IndependentScore(
        value=score_spellbook(spellbook, reference),
        scoring_version=reference.version,
        content_hash=reference.content_hash,
    )
