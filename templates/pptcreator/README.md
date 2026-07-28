# PPTCreator - AI Presentation Generator

## Overview
A beautiful, modern presentation application built with React and Framer Motion that allows you to create presentations from text prompts using AI.

## Features

### Core Presentation Features
- **AI-Powered Generation**: Create presentations from text prompts using AI
- **Real-time Editing**: Edit slide content in-place with smooth animations
- **Multiple Export Formats**: Save as PDF, image, or both formats
- **File Upload**: Upload PPTX, PDF, and image files for integration
- **Full Screen Mode**: Immersive presentation view
- **Responsive Design**: Works perfectly on desktop and mobile
- **Smooth Animations**: Built with Framer Motion for fluid transitions

### AI Generation Features
- **Prompt-based Creation**: Enter any topic or subject to generate slides
- **Smart Slide Generation**: Automatically creates 3 structured slides:
  - Slide 1: Title slide based on your prompt
  - Slide 2: Introduction section
  - Slide 3: Key points slide with formatted bullet list
- **URL Support**: Create presentations from URLs with `?prompt=your-text` parameter
- **Real-time Generation**: Live feedback when creating presentations

## Usage

### Create a Presentation from Prompt

**Method 1: Using the Prompt Input Panel**
1. Click the "Create Presentation from Prompt" button in the bottom-right corner
2. Enter your topic (e.g., "Create a presentation about renewable energy and sustainability")
3. Click "Generate" to create your presentation

**Method 2: Using URL Parameters**
1. Navigate to: `http://localhost:3000?prompt=Your+prompt+here`
2. Example: `http://localhost:3000?prompt=Create a presentation about artificial intelligence in healthcare`

### Basic Navigation

- **Arrow Keys**: Navigate between slides (Right/Left arrows)
- **F + Ctrl**: Toggle fullscreen mode
- **Upload Button**: Upload presentation files
- **Save Button**: Save your presentation
- **Download Button**: Export as PDF or image format
- **Prompt Button**: Open the prompt input panel

## Project Structure

```
pptcreator/
├── src/
│   ├── components/
│   │   ├── Presentation.tsx        # Main presentation viewer with slide management
│   │   ├── Slide.tsx              # Individual slide component with upload capability
│   │   ├── UploadPanel.tsx        # File upload interface with drag-and-drop
│   │   ├── SavePanel.tsx          # Save/export interface
│   │   ├── PDFViewer.tsx          # PDF display component
│   │   ├── Navigation.tsx         # Slide navigation controls
│   │   └── ui/                   # UI component library
│   │       ├── Button.tsx
│   │       └── Input.tsx
├── .gitignore                          # Standard ignore patterns
├── README.md                           # Project documentation
├── package.json                        # Project dependencies and scripts
└── vite.config.ts                      # Vite configuration
```

## Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for bundling and development server
- **Tailwind CSS** for utility-first styling
- **Framer Motion** for smooth animations
- **react-pdf** for PDF viewing
- **File Saver** for downloads
- **react-hot-toast** for notifications
- **Lucide React** for icons

### Dependencies
- `react`, `react-dom`: Core React libraries
- `react-router-dom`: Navigation
- `date-fns`: Date formatting
- `clsx`, `tailwind-merge`: Utility classes
- `pdfjs-dist`: PDF rendering
- `file-saver`: File downloads
- `docx`: Document exports
- `html-to-image`: Image capture
- `framer-motion`: Animations
- `lucide-react`: Icons
- `react-hot-toast`: Notifications

## Quick Start

### Installation

```bash
cd pptcreator
npm install
npm run dev
```

### Running the Development Server

```bash
npm run dev
```
The application will be available at:
- Local: `http://localhost:3000`
- With prompt: `http://localhost:3000?prompt=Your+prompt+here`

### Building for Production

```bash
npm run build
```

### Project Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run format` | Format code with Prettier |

## File Upload Support

### Accepted File Formats

- **PowerPoint**: `.ppt`, `.pptx` (PowerPoint presentations)
- **PDF**: `.pdf` (PDF documents)
- **Images**: `.png`, `.jpg`, `.jpeg` (images)
- **SVG**: `.svg` (vector graphics)

### File Upload Features

- **Drag and Drop**: Upload files by dragging and dropping
- **Click Upload**: Browse files using the upload button
- **Progress Indicators**: Visual feedback during upload
- **File Icons**: Different icons for different file types
- **Size Limits**: Maximum file size displayed

## Export Options

### Save Format Choices

When saving presentations, choose from:

- **PDF**: High-quality PDF export (best for printing)
- **Image**: PNG image of the presentation (best for web)
- **Both**: Both PDF and image formats (most versatile)

### Export Features

- **Custom Titles**: Set custom titles for your presentations
- **Format Selection**: Choose output format based on your needs
- **Visual Feedback**: Shows save status and success messages
- **Error Handling**: Graceful handling of save errors

## AI Features

### How It Works

1. **Prompt Input**: Enter text describing your presentation topic
2. **Smart Processing**: AI analyzes your prompt to extract key information
3. **Slide Generation**: Three structured slides are automatically created:
   - **Title Slide**: Clear title based on your prompt
   - **Introduction**: Brief overview of the topic
   - **Key Points**: Formatted bullet points with main ideas

### Prompt Examples

- "Create a presentation about the history of the internet"
- "Make slides about climate change solutions"
- "Build a presentation on human anatomy and physiology"
- "Generate a sales pitch for a new software product"

### Generated Slide Structure

Each prompt generates:
- **Slide 1**: `Title: [Extracted from prompt]`, `Content: Full prompt text`
- **Slide 2**: `Title: "Introduction"`, `Content: "This slide was generated based on your prompt: [prompt text]"`
- **Slide 3**: `Title: "Key Points"`, `Content: Formatted bullet points`

## Customization

### Modifying Slide Content

Generated slides are fully editable. You can:

- Modify titles by clicking and editing
- Update content directly on slides
- Add new slides manually
- Apply your own formatting

### UI Components

The project includes a custom UI component library in `src/components/ui/`:

**Button Component**
- Variants: default, destructive, outline, secondary, ghost, link
- Sizes: default, sm, lg, icon
- Customizable through props

**Input Component**
- Error handling with validation messages
- Customizable styling
- TypeScript support

## Compatibility

### Browser Support

- **Chrome**: Full support
- **Firefox**: Full support
- **Safari**: Full support
- **Edge**: Full support

### Mobile Support

- **iOS Safari**: Responsive design optimized
- **Android Chrome**: Responsive design optimized

### Features

- **Drag and Drop**: File uploads supported
- **Keyboard Navigation**: Arrow keys for slide navigation
- **Full Screen**: Immersive presentation viewing

## Troubleshooting

### Files Not Uploading

**Solution**: Ensure you're using supported file formats (.ppt, .pptx, .pdf, .png, .jpg, .jpeg, .svg)

### Sliders Not Working

**Solution**: Check that JavaScript is enabled in your browser. If using an ad blocker, try disabling it for this site.

### Full Screen Not Working

**Solution**: Use F + Ctrl (or Cmd + F on Mac) to enter fullscreen mode.

### Browser Compatibility

**Solution**: If you experience issues, try using a modern browser (Chrome, Firefox, Safari, or Edge)

### Prompt Generation Issues

**Solution**: If the AI generation isn't working properly, try:
- Refresh the page
- Check your internet connection
- Try a simpler prompt

## License

MIT

## Support

For issues or questions, please check the project documentation or contact support.

## Technical Notes

### Architecture

- **Component-Based**: Modular architecture for maintainability
- **Event-Driven**: Real-time updates through custom events
- **TypeScript**: Full type safety throughout the codebase
- **Responsive Design**: Works across all device sizes

### State Management

- **Local State**: React hooks for component state
- **Event System**: Custom events for slide generation
- **Async Operations**: Promise-based async operations for file handling

### Styling

- **Tailwind CSS**: Utility-first approach for rapid development
- **Component Library**: Reusable UI components
- **Responsive Design**: Mobile-first approach
- **Accessibility**: Thoughtful color schemes and keyboard navigation

## Future Enhancements

### Planned Features

1. **Advanced AI Features**
   - Multi-modal prompts (text + images)
   - Custom slide layouts
   - Interactive elements

2. **Collaboration Features**
   - Real-time collaboration
   - Sharing capabilities
   - Version control

3. **Enhanced Export Options**
   - More export formats
   - Custom templates
   - Brand consistency

4. **Integration Features**
   - Calendar integration
   - Email sharing
   - Social media sharing

## Project Status

✅ **Core Features Implemented**
✅ **AI Prompt Generation**
✅ **File Upload System**
✅ **Export Functionality**
✅ **Responsive Design**
✅ **Testing Complete**
⚠️ **Advanced Features** (Planned)

This project provides a solid foundation for creating presentations with AI and can be extended with additional features as needed.