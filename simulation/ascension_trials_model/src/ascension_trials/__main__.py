"""``python -m ascension_trials`` entry point (design §13.3).

Thin shim: all CLI logic lives in :mod:`ascension_trials.cli`.
"""

from __future__ import annotations

from .cli import main

if __name__ == "__main__":
    raise SystemExit(main())
