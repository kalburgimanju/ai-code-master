# Architecture Documentation

## System Architecture

The Vernacular Exam Coach follows a client-side SPA architecture with the following key design decisions:

### Component Architecture

```
App.tsx
├── LandingPage (marketing, features, pricing)
└── DemoPage (interactive study plan generator)
    ├── Language Selector
    ├── Subject Selector
    ├── Study Plan Display
    │   ├── Daily Schedule
    │   ├── MCQ Practice (interactive)
    │   └── Study Tips
```

### Data Flow

1. **User Selection**: User picks language and subject on DemoPage
2. **API Request**: Client calls OpenRouter API with language + subject
3. **AI Generation**: OpenRouter (nvidia/nemotron-3-ultra-550b-a55b:free) generates study plan
4. **Response Parsing**: JSON response parsed into typed interfaces
5. **Interactive Display**: Schedule, MCQs, and tips rendered with interactive MCQ answering

### API Integration

The app integrates with OpenRouter API (`https://openrouter.ai/api/v1/chat/completions`) using:

- **Model**: `nvidia/nemotron-3-ultra-550b-a55b:free` (free tier)
- **Auth**: Bearer token from `VITE_OPENROUTER_API_KEY` env var
- **Fallback**: Demo responses when API key is missing or API call fails

The API call is entirely client-side (browser), with no backend server required.

### Error Handling

- API failures gracefully fall back to pre-built demo responses
- JSON parsing failures fall back to demo responses
- Invalid response structures fall back to demo responses
- All errors logged to console for debugging

### Type Safety

All data structures are defined in TypeScript interfaces:

- `StudyPlanRequest` - input parameters
- `StudyPlanResponse` - full response structure
- `DailySchedule` - time slot items
- `MCQQuestion` - question with options and explanation
- `Language` - language metadata
- `Subject` - subject with topics

### Styling

- Tailwind CSS v4 with `@import "tailwindcss"` syntax
- Custom theme colors: primary (purple #7C3AED) and accent (blue #3b82f6)
- Responsive design: mobile-first with md/lg breakpoints
- Gradient backgrounds for hero and CTA sections
- Inter font family via Google Fonts
