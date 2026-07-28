#!/usr/bin/env bash
# CI script for the recruitment agency platform.
# Runs formatting, linting, type checking, and tests.
set -euo pipefail

cd "$(dirname "$0")/.."

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

passed=0
failed=0
skipped=0

run_check() {
    local name="$1"
    shift
    echo -e "${YELLOW}▶ Running: ${name}${NC}"
    if "$@"; then
        echo -e "${GREEN}✓ ${name} passed${NC}"
        ((passed++))
    else
        echo -e "${RED}✗ ${name} failed${NC}"
        ((failed++))
    fi
    echo
}

# Parse arguments
only=""
skip=""
dry_run=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --only) only="$2"; shift 2 ;;
        --skip) skip="$2"; shift 2 ;;
        --dry-run) dry_run=true; shift ;;
        *) echo "Unknown option: $1"; exit 1 ;;
    esac
done

should_run() {
    local name="$1"
    if [[ -n "$only" && "$only" != "$name" ]]; then
        return 1
    fi
    if [[ -n "$skip" && "$skip" == "$name" ]]; then
        return 1
    fi
    return 0
}

echo "============================================"
echo " Recruitment Agency Platform - CI"
echo "============================================"
echo

# 1. Ruff Format
if should_run "ruff-format"; then
    if $dry_run; then
        echo -e "${YELLOW}▶ [dry-run] ruff format .${NC}"
    else
        run_check "ruff-format" uv run ruff format .
    fi
fi

# 2. Ruff Check
if should_run "ruff-check"; then
    if $dry_run; then
        echo -e "${YELLOW}▶ [dry-run] ruff check --fix .${NC}"
    else
        run_check "ruff-check" uv run ruff check --fix .
    fi
fi

# 3. Type checking (mypy)
if should_run "type-check"; then
    if $dry_run; then
        echo -e "${YELLOW}▶ [dry-run] mypy backend cli${NC}"
    else
        run_check "type-check" uv run mypy backend cli --ignore-missing-imports
    fi
fi

# 4. Tests
if should_run "pytest"; then
    if $dry_run; then
        echo -e "${YELLOW}▶ [dry-run] pytest${NC}"
    else
        run_check "pytest" uv run pytest -v --tb=short
    fi
fi

echo "============================================"
echo " Results: ${passed} passed, ${failed} failed"
echo "============================================"

if [[ $failed -gt 0 ]]; then
    exit 1
fi
