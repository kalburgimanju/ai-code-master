"""Conftest for scripts tests — adds scripts/ to sys.path for imports."""

from __future__ import annotations

import sys
from pathlib import Path

# Add the scripts directory to sys.path so test files can import scripts directly
_scripts_dir = str(Path(__file__).resolve().parents[2] / "scripts")
if _scripts_dir not in sys.path:
    sys.path.insert(0, _scripts_dir)
