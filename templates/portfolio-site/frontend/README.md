# Developer Portfolio Template

A modern, responsive portfolio website template built with React and TypeScript. Features a clean design with smooth animations, dark mode support, and a comprehensive showcase of skills, experience, and projects.

## Features

- **Responsive Design**: Fully responsive across all devices (mobile, tablet, desktop)
- **Dark Mode**: Built-in dark mode support with smooth transitions
- **Smooth Animations**: Complex Framer Motion animations throughout the site
- **Component Architecture**: Modular component structure for maintainability
- **TypeScript**: Full type safety with TypeScript
- **Modern Stack**: React, TypeScript, Tailwind CSS, Framer Motion
- **Lucide Icons**: Beautiful icon library for all interactive elements
- **Routing**: Smooth scrolling navigation with React Router
- **Project Gallery**: Showcase of featured projects with GitHub links
- **Experience Timeline**: Interactive timeline with staggered animations

## Project Structure

```
portfolio/
├── public/
├── src/
│   ├── components/          # React components
│   │   ├── About.tsx
│   │   ├── Contact.tsx
│   │   ├── Experience.tsx
│   │   ├── Hero.tsx
│   │   ├── Projects.tsx
│   │   └── Skills.tsx
│   ├── App.tsx              # Main application component
│   ├── App.css              # Global styles
│   └── types/              # TypeScript type definitions
├── vite.config.ts           # Vite configuration
├── package.json            # Dependencies and scripts
└── README.md
```

## Technologies Used

### Frontend
- **React 18.2.0** - Component library
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS framework
- **Vite** - Build tool and dev server
- **Framer Motion** - Animation library
- **Lucide React** - Icon library

### Dependencies
- `react-router-dom` - Client-side routing
- `date-fns` - Date formatting
- `react-typewriter` - Typewriter effect

## Running the Project

### Prerequisites

- Node.js 18+ (comes with npm/yarn)
- Package manager (npm or yarn)

### Installation

```bash
cd portfolio
npm install  # or yarn install
```

### Development

```bash
npm run dev
# or
cd portfolio && npm run dev
```

The development server will start at `http://localhost:3000` and open your browser automatically.

### Building for Production

```bash
npm run build
```

### Preview

```bash
npm run preview
```

## Customization

### Personal Information

Edit the following files to update your personal information:

- `src/components/About.tsx` - Update name, title, bio, and contact info
- `src/components/Experience.tsx` - Update work experience
- `src/components/Projects.tsx` - Add your projects
- `src/components/Skills.tsx` - Update skill levels and icons

### Colors and Theme

The template uses a blue/purple gradient theme. You can customize:

- Primary colors in CSS (search for `bg-blue-600`, `text-blue-600`)
- Gradient themes (search for `from-blue-50 via-white to-purple-50`)

### animations

All animations are controlled by Framer Motion. You can adjust:

- Animation durations (search for `duration: 0.6`)
- Animation delays (search for `delay: 0.1`)
- Easing functions (search for `transition`)

## Styling

### Tailwind CSS

The project uses Tailwind CSS for styling. All utility classes follow the convention:

```jsx
<p className="text-xl font-bold text-slate-900 dark:text-white">
```

### Responsive Design

The template uses Tailwind's responsive prefixes:

```jsx
<div className="text-5xl md:text-7xl font-bold">
//   - mobile: text-5xl
//   - md (tablet): text-7xl
```

## Features Showcase

### Navigation

- Responsive mobile menu with hamburger button
- Smooth scrolling anchor links
- Glass-morphism effect on scroll
- Active section highlighting

### About Section

- Profile image placeholder with gradient background
- Quick facts grid with icons
- Download resume button mock

### Experience Timeline

- Interactive timeline with alternating layout
- Hover effects on experience cards
- Technology tags filtering
- Staggered animation for each entry

### Projects Gallery

- Grid layout with featured project highlighting
- Project cards with hover effects and scaling
- Technology tags display
- GitHub and live links

### Skills Section

- Skills categorized by type
- Level indicators (Beginner, Intermediate, Advanced, Expert)
- Hover effects on skill cards

### Contact Form

- Form with validation
- Icon-based contact information
- Social media links
- Responsive layout

## Design Choices

### Color Palette

- **Primary**: Blue (#3B82F6) and Purple (#8B5CF6)
- **Background**: White/Light gray and dark slate
- **Text**: Slate gray for readability
- **Accents**: Gradient effects for visual interest

### Typography

- **Headings**: Inter font family, bold weight
- **Body**: Inter font family, regular weight
- **Sizes**: Responsive with clear hierarchy

### Animation Philosophy

- **Subtle**: Most animations are gentle and not overwhelming
- **Performance**: Animations only on desktop with reduced motion settings
- **Feedback**: Hover states and micro-interactions for better UX

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Ensure all tests pass
5. Create a pull request

## License

This template is licensed under the MIT License. Use it for any purpose, but please give credit.

## Support

For questions or support, please check the GitHub repository issues or reach out through the contact form in the template.

---

*Built with ❤️ using React and TypeScript*