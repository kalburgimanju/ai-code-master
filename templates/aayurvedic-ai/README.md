# Ayurvedic AI Diabetes Treatment Platform

An AI-powered application for Ayurvedic diabetes treatment and education based on **Sushrita Samhita** principles.

## Features

### 🏥 **Ayurvedic Treatment Chatbot**
- Real-time AI assistant powered by OpenRouter
- Personalized recommendations for Neem, blood sugar control, and Ayurvedic herbs
- Multi-language support (English & Hindi)
- Automatic PDF report generation for treatments

### 📚 **Traditional Knowledge Base**
- Extracted wisdom from **Sushrita Samhita** (Ancient Ayurvedic Texts)
- Historical treatment protocols for diabetes management
- Kapha dosha balance techniques for metabolic health
- Traditional lifestyle and dietary recommendations

### 🌿 **Ayurvedic Herbs Database**
- **Neem (Azadirachta indica)**: Blood sugar regulation, liver support
- **Bitter Melon (Momordica charantia)**: Natural glucose-lowering properties
- **Gurmar (Gymnema sylvestre)**: "Sugar destroyer" in Ayurvedic tradition
- **Tulsi (Holy Basil)**: Anti-inflammatory and glucose-modulating effects

### 📱 **Mobile-First Design**
- Responsive interface for all devices
- PWA ready for offline access in rural areas
- Fast loading with Tailwind CSS
- Accessible design patterns

### 🎯 **Treatment Modules**
1. **Diabetes Reversal Protocol**: Personalized Ayurvedic treatment plans
2. **Neem Therapy Guide**: Dietary guidelines based on body constitution
3. **Panchakarma Detox**: Deep cleansing therapy to reset metabolic functions
4. **Yoga Integration**: Yoga and breathwork for metabolic health

## Technologies Used

- **React 19** with TypeScript
- **Vite** for fast development and builds
- **Tailwind CSS** with custom Ayurvedic color palette
- **i18next** for multilingual support (English & Hindi)
- **jsPDF** for professional report generation
- **OpenRouter API** for real AI responses
- **Lucide React** for icons

## Installation

```bash
# Navigate to the project directory
cd templates/aayurvedic-ai

# Install dependencies (using uv or npm)
uv run npm install

# Start the development server
uv run npm run dev
```

## Local Development

### Environment Variables

Create a `.env.local` file with your API key:

```env
VITE_API_KEY=your_openrouter_api_key_here
VITE_API_URL=https://openrouter.ai/api/v1/chat/completions
```

### Development Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Production Deployment

### Netlify Deployment

Deploy directly to Netlify with one click:

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/Alishahryar1/free-claude-code/tree/main)

**Or deploy manually:**

```bash
# Build the application
uv run npm run build

# Deploy to Netlify (requires Netlify CLI)
netlify deploy --prod --dir=dist
```

### Docker Deployment

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM node:18-alpine AS runtime
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3000
CMD ["node", "dist/server"]
```

## Usage Examples

### Chat with AI Assistant

1. **Start the application**
2. **Open your browser** to `http://localhost:5173`
3. **Select language**: English or Hindi from the dropdown
4. **Ask about treatment**: "What are the benefits of neem for diabetes?"
5. **Receive response**: Get detailed Ayurvedic information with recommendations
6. **Download PDF**: Click "Download Report" to save complete conversation

### Exporting Treatment Reports

The AI automatically generates PDF reports when Ayurvedic treatments are discussed:

- **Treatment relevance detected**: Neem, blood sugar, Ayurvedic keywords
- **PDF includes**: Complete conversation, treatment recommendations, dosage information
- **Professional disclaimer**: Always advises consultation with healthcare professionals
- **Timestamp and language**: PDF includes when it was generated and in which language

## Ayurveda References

### Classical Texts

1. **Sushrita Samhita** (Sushruta Samhita)
   - Ancient Indian physician
   - Detailed descriptions of "Madhumeha" (diabetes)
   - Herbal formulations for blood sugar control

2. **Charaka Samhita**
   - Foundation of Ayurvedic medicine
   - Concepts of "Kapha Dosha" and metabolic disorders
   - Detoxification therapies for metabolic health

### Key Ayurvedic Principles

- **Kapha Dosha Balance**: Essential for metabolic disorders
- **Agni (Digestive Fire)**: Central to blood sugar regulation
- **Herbal Formulation**: Evidence-based traditional medicine
- **Panchakarma**: Purification therapies for metabolic reset

## Accessibility

### Screen Reader Support

- Semantic HTML5 elements
- ARIA labels and roles
- Keyboard navigation support
- High contrast color schemes

### Mobile Optimization

- Responsive grid layouts
- Touch-friendly interfaces
- Offline capabilities (PWA)
- Fast loading for low-bandwidth areas

## Customization

### Theme Colors

The Ayurvedic color palette uses traditional colors:

- **Ayurvedic Orange**: `#FF8100` - representing energy and digestion
- **Deep Orange**: `#E66E00` - representing transformation
- **Warm Gold**: `#FFC107` - representing vitality

### Content Management

For content updates:

1. **Update `src/locales/`** for new languages or translations
2. **Modify `src/components/`** for new features
3. **Edit `package.json`** for version updates
4. **Update `README.md`** for documentation changes

## Troubleshooting

### Common Issues

#### "API Key Not Working"

```bash
# Check your .env.local file
VITE_API_KEY=your_api_key_here
# Ensure you have credits on OpenRouter
```

#### "Deployment Failed"

```bash
# Check build logs for errors
uv run npm run build
```

#### "Language Not Displaying"

```bash
# Ensure i18n files are properly formatted
# Check browser console for translation errors
```

### Community Support

For questions, issues, or feature requests:

- **GitHub Issues**: Report bugs or request features
- **Discussions**: Share ideas and best practices
- **Issues**: Bug reports and feature requests

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- **OpenRouter** for AI model access
- **Tailwind CSS** for styling
- **React** for UI framework
- **jsPDF** for report generation
- **All Ayurvedic practitioners** who contribute to traditional knowledge preservation

## Contact

For technical support or partnerships:

- **Email**: maintainer@example.com
- **GitHub**: [Repository URL]
- **Discord**: Discord community link

---

*Harboring ancient wisdom for modern health challenges*
*Tradition meets technology for a healthier tomorrow*