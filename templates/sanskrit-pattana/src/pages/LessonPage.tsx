import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { BookOpen, Volume2, Pause, Play, ExternalLink, Reference } from 'lucide-react';
import { lessons } from '../data';

const LessonPage: React.FC = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const [isPlaying, setIsPlaying] = useState(false);
  const [showTranslation, setShowTranslation] = useState(true);

  const lesson = lessons.find(l => l.id === lessonId);

  if (!lesson) {
    return (
      <div className="py-12 text-center">
        <h1 className="text-2xl font-bold text-slate-800">Lesson Not Found</h1>
        <p className="text-slate-600 mt-2">The requested lesson could not be found.</p>
      </div>
    );
  }

  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Lesson Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">{lesson.title}</h1>
          <p className="text-slate-600">Grade {lesson.grade} • {lesson.englishTranslation}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Sanskrit Text */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-slate-800">संस्कृतम् (Sanskrit Text)</h2>
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="flex items-center space-x-2 px-3 py-1 bg-sanskritBlue-100 text-sanskritBlue-700 rounded-lg text-sm"
                >
                  <Volume2 className="h-4 w-4" />
                  <span>{isPlaying ? 'Pause' : 'Listen'}</span>
                </button>
              </div>
              <div className="text-2xl font-sanskrit text-right leading-relaxed mb-6">
                {lesson.sanskritText}
              </div>
              <div className="text-sm text-slate-500 italic">
                (Click the listen button to hear the pronunciation)
              </div>
            </div>

            {/* English Translation */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-slate-800">अंग्रेजी अनुवादः (English Translation)</h2>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showTranslation}
                    onChange={(e) => setShowTranslation(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:ring-4 peer-focus:ring-sanskritBlue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:duration-300"></div>
                </label>
              </div>

              {showTranslation && (
                <>
                  <div className="prose prose-lg max-w-none text-slate-700 mb-4">
                    {lesson.englishTranslation}
                  </div>
                  {lesson.romanTranslation && (
                    <div className="bg-sanskrit-50 p-4 rounded-lg">
                      <h3 className="text-sm font-medium text-slate-600 mb-2">Roman Transliteration</h3>
                      <p className="text-slate-700">{lesson.romanTranslation}</p>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Explanation */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-xl font-semibold text-slate-800 mb-4">विवरणम् (Explanation)</h2>
              <div className="prose prose-lg max-w-none text-slate-700">
                {lesson.explanation}
              </div>
            </div>

            {/* Practice Questions */}
            {lesson.practiceQuestions && lesson.practiceQuestions.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h2 className="text-xl font-semibold text-slate-800 mb-4">Practice Questions</h2>
                <div className="space-y-4">
                  {lesson.practiceQuestions.map((q) => (
                    <div key={q.id} className="border border-slate-200 rounded-lg p-4">
                      <p className="font-medium text-slate-800 mb-2">{q.question}</p>
                      <div className="bg-sanskrit-50 p-3 rounded">
                        <span className="text-sm font-medium text-slate-600">Answer: </span>
                        <span className="text-slate-700">{q.answer}</span>
                      </div>
                      {q.explanation && (
                        <p className="text-sm text-slate-600 mt-2">{q.explanation}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Resources & References */}
          <div className="space-y-6">
            {/* Resources */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center space-x-2">
                <BookOpen className="h-5 w-5 text-sanskritBlue-500" />
                <span>Resources</span>
              </h3>
              <div className="space-y-3">
                {lesson.resources.map((resource) => (
                  <a
                    key={resource.id}
                    href={resource.url}
                    className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <ExternalLink className="h-4 w-4 text-slate-500" />
                    <div>
                      <p className="text-sm font-medium text-slate-700">{resource.title}</p>
                      <p className="text-xs text-slate-500">{resource.type}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* References */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center space-x-2">
                <Reference className="h-5 w-5 text-sanskritBlue-500" />
                <span>References</span>
              </h3>
              <div className="space-y-3">
                {lesson.references.map((ref) => (
                  <div key={ref.id} className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-sm font-medium text-slate-700">{ref.title}</p>
                    <p className="text-xs text-slate-500">by {ref.author}</p>
                    {ref.page && (
                      <p className="text-xs text-slate-400">Page: {ref.page}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonPage;