# AI Curriculum Template

A Next.js landing page template for AI Engineering courses, modeled after the Edward Donner curriculum.

## Features

- **6-Course Roadmap**: Six courses organized into three progressive phases
- **Interactive Roadmap**: Animated timeline with scroll-based progress tracking
- **Course Cards**: Detailed course cards with images, outcomes, and tools
- **Responsive Design**: Mobile-first design that works on all devices
- **Coupon Integration**: Built-in coupon code support for course enrollments
- **YouTube Integration**: Video walkthrough support

## Courses

### Phase 1: For everyone, technical or not
1. **AI Builder** - Create agents and voice agents with n8n
2. **AI Coder** - Vibe coder to agentic engineer
3. **AI Leader** - AI engineering MLOps track

### Phase 2: For technical and aspiring technical people
4. **AI Engineer, Core Track** - Foundations of AI Engineering
5. **AI Engineer, Agentic Track** - Advanced AI Agents and Multi-Agent Systems

### Phase 3: For the technical
6. **AI Engineer, Production Track** - Deploy AI to Production

## Getting Started

### Prerequisites

- Node.js 18+ or later
- npm, yarn, or pnpm

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd ai-curriculum-template

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Edit .env.local with your details
nano .env.local

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

## Configuration

Edit `.env.local` to customize:

- **Instructor details**: Name, title, bio, social links
- **Site details**: Name, URL, statistics
- **Course links**: Udemy URLs with coupon codes
- **YouTube video**: Curriculum walkthrough video ID

## Project Structure

```
src/
├── app/
│   ├── page.tsx          # Main curriculum page
│   ├── layout.tsx        # Root layout with metadata
│   └── globals.css       # Global styles import
├── lib/
│   └── curriculum.ts     # Course data and configuration
├── styles/
│   └── globals.css       # Tailwind and custom CSS
public/
└── edc-roadmap.js        # Interactive roadmap JavaScript
```

## Deployment

### Vercel (Recommended)

```bash
npm run build
```

### Other Platforms

```bash
npm run build
npm start
```

## Customization

### Adding/Modifying Courses

Edit `src/lib/curriculum.ts` to modify the course data. Each course includes:

- Basic info (title, subtitle, description)
- Detailed content (modules, lessons, features)
- Edward Donner-style fields (outcome, audience, duration, tools, blurb)
- Visual assets (image, icon, color)

### Styling

The template uses Tailwind CSS with custom CSS variables for colors and typography. Modify `src/styles/globals.css` for visual changes.

### Interactive Elements

The roadmap JavaScript (`public/edc-roadmap.js`) handles:

- Full-bleed layout
- Scroll-based progress tracking
- Intersection Observer animations
- Choice buttons
- Detail panel toggles

## License

MIT
