# MKSystems Design System

A modern, open-source design system with production-ready React components, design tokens, comprehensive documentation, and an admin portal for tracking usage.

Inspired by [Lightning Design System](https://www.lightningdesignsystem.com/), [Material UI](https://mui.com/), [Bootstrap](https://getbootstrap.com/), and [Tailwind CSS](https://tailwindcss.com/).

## Features

- **6+ Components** — Button, Input, Card, Badge, Alert, Modal
- **Design Tokens** — Colors, spacing, typography, border radius, shadows
- **Full TypeScript** — Complete type definitions with autocomplete
- **Accessible** — WAI-ARIA patterns, keyboard navigation, screen reader support
- **Admin Portal** — Track downloads, active users, and component adoption
- **Beautiful Documentation** — Interactive examples with live code

## Quick Start

### 1. Install Dependencies

```bash
cd templates/mksystems
npm install
```

### 2. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page with features overview |
| `/docs` | Getting started guide |
| `/docs/tokens` | Design tokens (colors, spacing, radius) |
| `/docs/components` | Component overview |
| `/docs/components/button` | Button documentation |
| `/docs/components/input` | Input documentation |
| `/docs/components/card` | Card documentation |
| `/docs/components/badge` | Badge documentation |
| `/docs/components/alert` | Alert documentation |
| `/docs/components/modal` | Modal documentation |
| `/portal` | Admin dashboard (analytics overview) |
| `/portal/downloads` | Download history table |
| `/portal/users` | Active users table |

## Components

### Button

```tsx
import { Button } from 'mksystems';

<Button variant="primary" size="lg">Get Started</Button>
<Button variant="secondary">Cancel</Button>
<Button variant="danger" loading>Deleting...</Button>
```

**Variants:** `primary`, `secondary`, `ghost`, `outline`, `danger`
**Sizes:** `sm`, `md`, `lg`

### Input

```tsx
import { Input } from 'mksystems';

<Input label="Email" placeholder="you@example.com" />
<Input label="Password" type="password" error="Password is required" />
```

### Card

```tsx
import { Card } from 'mksystems';

<Card variant="elevated" padding="lg">
  <h3>Card Title</h3>
  <p>Card content goes here.</p>
</Card>
```

### Badge

```tsx
import { Badge } from 'mksystems';

<Badge variant="success">Active</Badge>
<Badge variant="error" size="sm">Error</Badge>
```

### Alert

```tsx
import { Alert } from 'mksystems';

<Alert variant="warning" title="Heads up" dismissible>
  Your trial expires in 3 days.
</Alert>
```

### Modal

```tsx
import { Modal, Button } from 'mksystems';

<Modal open={isOpen} onClose={() => setOpen(false)} title="Confirm">
  <p>Are you sure?</p>
  <Button onClick={() => setOpen(false)}>OK</Button>
</Modal>
```

## Design Tokens

MKSystems uses CSS custom properties for all design values. Override them to theme the system:

```css
:root {
  --color-brand-500: #8b5cf6;  /* Change primary color */
  --radius-lg: 20px;           /* Change border radius */
}
```

### Colors

| Token | Value | Usage |
|-------|-------|-------|
| `brand-500` | `#3b82f6` | Primary brand color |
| `success-500` | `#22c55e` | Success states |
| `warning-500` | `#f59e0b` | Warning states |
| `error-500` | `#ef4444` | Error states |
| `neutral-900` | `#0f172a` | Text, dark backgrounds |

### Spacing

4px grid system: `xs(4)`, `sm(8)`, `md(12)`, `lg(16)`, `xl(24)`, `2xl(32)`, `3xl(48)`

### Border Radius

`sm(4px)`, `md(8px)`, `lg(12px)`, `xl(16px)`, `full(9999px)`

## Admin Portal

The admin portal at `/portal` tracks:

- **Total Downloads** — How many times components have been installed
- **Active Users** — Unique users who have downloaded components
- **Component Usage** — Breakdown of which components are most popular
- **Download History** — Detailed log with date, component, version, and user
- **User Profiles** — Per-user stats with components used

Data is stored in `data/stats.json` (no database required).

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/stats` | Aggregate analytics |
| `GET` | `/api/downloads` | Download history |
| `POST` | `/api/downloads` | Record a download event |
| `GET` | `/api/users` | Active users list |

### Recording Downloads

```bash
curl -X POST http://localhost:3000/api/downloads \
  -H "Content-Type: application/json" \
  -d '{"component":"Button","user":{"name":"John","email":"john@example.com"},"version":"1.0.0"}'
```

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Styling:** Tailwind CSS 4
- **Language:** TypeScript
- **Icons:** Lucide React
- **Runtime:** React 19

## Project Structure

```
mksystems/
├── app/                          # Next.js pages
│   ├── page.tsx                  # Landing page
│   ├── layout.tsx                # Root layout
│   ├── globals.css               # Design tokens
│   ├── docs/                     # Documentation
│   │   ├── page.tsx              # Getting started
│   │   ├── tokens/page.tsx       # Design tokens
│   │   └── components/           # Component docs
│   ├── portal/                   # Admin dashboard
│   │   ├── page.tsx              # Overview
│   │   ├── downloads/page.tsx    # Download history
│   │   └── users/page.tsx        # User list
│   └── api/                      # API routes
│       ├── stats/route.ts
│       ├── downloads/route.ts
│       └── users/route.ts
├── components/                   # Design system components
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Card.tsx
│   ├── Badge.tsx
│   ├── Alert.tsx
│   ├── Modal.tsx
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   └── DocsSidebar.tsx
├── lib/                          # Utilities
│   └── stats.ts                  # JSON file stats storage
├── data/                         # Analytics data (auto-created)
└── README.md
```

## License

MIT
