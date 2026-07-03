# Architecture

## Overview

GST Automation Agent is a client-side React SPA that uses AI to process Indian GST invoices. It runs entirely in the browser with no backend server required.

## High-Level Architecture

```
┌─────────────────────────────────────────────┐
│                  Browser                     │
│                                              │
│  ┌──────────┐   ┌──────────┐   ┌─────────┐ │
│  │ Landing  │   │   Demo   │   │   lib   │ │
│  │  Page    │──▶│  Page    │──▶│  api.ts │ │
│  └──────────┘   └──────────┘   └────┬────┘ │
│                                     │       │
└─────────────────────────────────────┼───────┘
                                      │
                              fetch() │ HTTPS
                                      │
                               ┌──────▼──────┐
                               │  OpenRouter  │
                               │     API      │
                               └─────────────┘
```

## Data Flow

1. **Input**: User pastes raw invoice text into the demo textarea
2. **Extraction** (`extractInvoiceData`): Sends invoice text to OpenRouter with a structured extraction prompt. AI returns parsed JSON with supplier/buyer info, line items, HSN codes, and tax calculations.
3. **HSN Mapping** (`mapHsnCodes`): Sends extracted line items to OpenRouter for HSN code validation and UQC (Unit Quantity Code) assignment per GST requirements.
4. **GSTR-1 Generation** (`buildGstr1Json`): Client-side transformation of extracted data into GSTN-compliant GSTR-1 JSON format, including intra-state (CGST+SGST) vs inter-state (IGST) tax logic.
5. **Display**: Results are rendered in tabbed cards (Invoice Data, HSN Summary, GSTR-1 JSON) with download capability.

## Key Design Decisions

### Client-Side Only (No Server)
- All API calls go directly from the browser to OpenRouter
- Enables zero-infrastructure deployment (Netlify/Vercel/Cloudflare Pages)
- Demo mode uses a free model when no API key is configured

### AI-Powered Extraction
- Uses structured prompts with explicit JSON schemas for reliable parsing
- Temperature set to 0.1 for deterministic output
- Robust JSON parsing with markdown fence stripping

### GST Compliance
- Intra-state vs inter-state tax calculation (CGST+SGST vs IGST)
- HSN code mapping per Indian GST tariff
- GSTIN format validation (state code + PAN + entity code + checksum)
- GSTR-1 JSON schema follows GSTN portal format

## Component Structure

- **App**: Root component with SPA navigation (landing ↔ demo)
- **LandingPage**: Marketing page with hero, features, how-it-works, pricing
- **DemoPage**: Interactive invoice processing with step progress and tabbed results

## API Layer (lib/api.ts)

- `extractInvoiceData(text)`: Invoice text → structured InvoiceData
- `mapHsnCodes(items)`: Line items → HSN-mapped items with UQC
- `isDemoMode()`: Check if running without API key
- Demo mode falls back to `meta-llama/llama-3.1-8b-instruct:free`

## Type System (lib/types.ts)

- `InvoiceData`: Full parsed invoice with supplier, buyer, line items, totals
- `LineItem`: Individual line item with description, HSN, quantities, tax breakdowns
- `GSTR1Item`: GSTN-compliant GSTR-1 line item structure
- `ProcessingStep`: State machine for UI progress tracking
