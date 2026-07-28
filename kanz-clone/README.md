# Kanz Clone

A responsive clone of the [Kanz website](https://try.ka.nz/) - an AI-powered recruitment platform.

## Features

- **Modern Design**: Clean, professional layout with green accent colors
- **Fully Responsive**: Works on desktop, tablet, and mobile devices
- **Smooth Navigation**: Sticky header with smooth scroll to sections
- **Interactive Elements**: Hover effects, transitions, and mobile menu
- **Comprehensive Sections**: All major sections from the original site

## Sections Included

1. **Navigation**: Sticky header with mobile hamburger menu
2. **Hero**: Main value proposition with CTAs
3. **How It Works**: 3-step process with animated pipeline
4. **Before vs After**: Comparison table
5. **Proof/Stats**: Key statistics and employer table
6. **Testimonials**: Customer success stories
7. **Trusted By**: Logo carousel of partner companies
8. **Problem/Solution**: HR tech challenges comparison
9. **AI Training**: 4-week course program
10. **AI Showroom**: Project showcase
11. **Pricing**: Multiple pricing tiers and plans
12. **Infrastructure**: Government/enterprise solutions
13. **Contact**: Team contact information
14. **Footer**: Complete site navigation

## Tech Stack

- **React 18**: UI library
- **TypeScript**: Type safety
- **Vite**: Build tool and dev server
- **Tailwind CSS**: Utility-first CSS framework
- **Inter Font**: Modern sans-serif typography

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

```bash
# Clone the repository
git clone <repository-url>

# Navigate to project directory
cd kanz-clone

# Install dependencies
npm install

# Start development server
npm run dev
```

### Development

The development server will start at `http://localhost:5173/`

- **Hot Module Replacement**: Changes reflect instantly
- **TypeScript Checking**: Real-time type errors in terminal
- **Tailwind CSS**: Utility classes for styling

### Building for Production

```bash
npm run build
```

This creates a `dist/` folder with optimized production files.

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
kanz-clone/
├── public/
│   └── favicon.svg          # Kanz logo favicon
├── src/
│   ├── App.tsx              # Main application component
│   ├── index.css            # Tailwind CSS and custom styles
│   └── main.tsx             # React entry point
├── index.html               # HTML template
├── package.json             # Dependencies and scripts
├── tsconfig.json            # TypeScript configuration
└── vite.config.ts           # Vite configuration
```

## Customization

### Colors

The primary green color can be customized in `src/index.css`:

```css
:root {
  --kanz-green: #22c55e;        /* Primary green */
  --kanz-green-dark: #16a34a;   /* Darker shade */
  --kanz-green-light: #bbf7d0;  /* Lighter shade */
}
```

### Fonts

The Inter font is loaded from Google Fonts in `index.html`. You can change it by:

1. Updating the Google Fonts link in `index.html`
2. Modifying the font-family in `src/index.css`

### Content

All content is hardcoded in `src/App.tsx`. To update:

1. Open `src/App.tsx`
2. Find the relevant component (e.g., `Hero`, `Pricing`, etc.)
3. Update the text content or data arrays

## Performance

- **Optimized Build**: Vite bundles and minifies code
- **Lazy Loading**: Images and components can be lazy loaded
- **Tailwind CSS**: Only used styles are included in production
- **Fast Refresh**: Hot module replacement for development

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is a clone for educational purposes. The original website and brand belong to Kanz.

## Acknowledgments

- [Kanz](https://try.ka.nz/) for the original design inspiration
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- [Vite](https://vitejs.dev/) for the fast build tool
- [React](https://react.dev/) for the UI library
