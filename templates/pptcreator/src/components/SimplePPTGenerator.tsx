import React, { useState } from 'react';

interface Slide {
  number: number;
  title: string;
  content: string[];
}

export const SimplePPTGenerator = () => {
  const [prompt, setPrompt] = useState('react basics to advanced learning');
  const [slides, setSlides] = useState<Slide[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePresentation = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setSlides([]);

    // Simulate AI generation
    setTimeout(() => {
      const generatedSlides: Slide[] = [
        {
          number: 1,
          title: prompt.split('.')[0] || 'React Basics to Advanced Learning',
          content: [
            'Introduction to React learning journey',
            'From basic concepts to advanced patterns',
            'Hands-on implementation and best practices'
          ]
        },
        {
          number: 2,
          title: 'React Fundamentals',
          content: [
            'Component basics and JSX syntax',
            'Props and state management',
            'Event handling and component lifecycle',
            'Styling approaches (CSS, styled-components, Tailwind)'
          ]
        },
        {
          number: 3,
          title: 'Intermediate Concepts',
          content: [
            'Hooks (useState, useEffect, useContext, useReducer)',
            'Custom hooks and compound components',
            'Context API for state management',
            'React Router for navigation',
            'Form handling with controlled components'
          ]
        },
        {
          number: 4,
          title: 'Advanced Patterns',
          content: [
            'Higher-order components and render props',
            'Component libraries (Material-UI, Ant Design)',
            'Performance optimization techniques',
            'React Fiber and concurrent rendering',
            'Server-side rendering (Next.js, SSR)'
          ]
        },
        {
          number: 5,
          title: 'Modern React & Future Trends',
          content: [
            'React 18 new features (concurrent features, transitions)',
            'Custom hooks for reusable logic',
            'Testing strategies (Jest, React Testing Library)',
            'Build tools and bundlers (Vite, Webpack)',
            'Deployment and hosting options'
          ]
        }
      ];

      setSlides(generatedSlides);
      setIsGenerating(false);
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-2xl font-bold mb-4">AI Presentation Generator</h2>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter topic for presentation..."
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyPress={(e) => e.key === 'Enter' && generatePresentation()}
          />
          <button
            onClick={generatePresentation}
            disabled={isGenerating || !prompt.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isGenerating ? 'Generating...' : 'Generate'}
          </button>
        </div>
      </div>

      {slides.length > 0 && (
        <div className="space-y-4">
          {slides.map((slide) => (
            <div key={slide.number} className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center mb-3">
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  Slide {slide.number}
                </span>
                <h3 className="text-xl font-bold ml-4 flex-1">{slide.title}</h3>
              </div>
              <ul className="space-y-2">
                {slide.content.map((item, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};