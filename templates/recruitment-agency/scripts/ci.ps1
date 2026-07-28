# CI script for the recruitment agency platform (PowerShell).
# Runs formatting, linting, type checking, and tests.
param(
    [string]$Only = "",
    [string]$Skip = "",
    [switch]$DryRun
)

$ErrorActionPreference = "Stop"
$Passed = 0
$Failed = 0

function Run-Check {
    param([string]$Name, [scriptblock]$Command)
    Write-Host "▶ Running: $Name" -ForegroundColor Yellow
    try {
        & $Command
        Write-Host "✓ $Name passed" -ForegroundColor Green
        $script:Passed++
    } catch {
        Write-Host "✗ $Name failed" -ForegroundColor Red
        $script:Failed++
    }
    Write-Host ""
}

function Should-Run {
    param([string]$Name)
    if ($Only -and $Only -ne $Name) { return $false }
    if ($Skip -and $Skip -eq $Name) { return $false }
    return $true
}

Write-Host "============================================"
Write-Host " Recruitment Agency Platform - CI"
Write-Host "============================================"
Write-Host ""

# 1. Ruff Format
if (Should-Run "ruff-format") {
    if ($DryRun) {
        Write-Host "▶ [dry-run] ruff format ." -ForegroundColor Yellow
    } else {
        Run-Check "ruff-format" { uv run ruff format . }
    }
}

# 2. Ruff Check
if (Should-Run "ruff-check") {
    if ($DryRun) {
        Write-Host "▶ [dry-run] ruff check --fix ." -ForegroundColor Yellow
    } else {
        Run-Check "ruff-check" { uv run ruff check --fix . }
    }
}

# 3. Type checking (mypy)
if (Should-Run "type-check") {
    if ($DryRun) {
        Write-Host "▶ [dry-run] mypy backend cli" -ForegroundColor Yellow
    } else {
        Run-Check "type-check" { uv run mypy backend cli --ignore-missing-imports }
    }
}

# 4. Tests
if (Should-Run "pytest") {
    if ($DryRun) {
        Write-Host "▶ [dry-run] pytest" -ForegroundColor Yellow
    } else {
        Run-Check "pytest" { uv run pytest -v --tb=short }
    }
}

Write-Host "============================================"
Write-Host " Results: $Passed passed, $Failed failed"
Write-Host "============================================"

if ($Failed -gt 0) { exit 1 }
