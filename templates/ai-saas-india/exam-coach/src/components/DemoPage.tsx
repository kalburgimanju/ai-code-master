import { useState } from 'react';
import {
  ArrowLeft,
  Brain,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  BookOpen,
  Globe,
  Target,
  Lightbulb,
  ChevronRight,
} from 'lucide-react';
import { languages } from '../data/languages';
import { subjects } from '../data/subjects';
import {
  generateStudyPlan,
  type StudyPlanResponse,
  type MCQQuestion,
} from '../api/openrouter';

interface DemoPageProps {
  onBack: () => void;
}

export default function DemoPage({ onBack }: DemoPageProps) {
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<StudyPlanResponse | null>(null);
  const [activeTab, setActiveTab] = useState<'schedule' | 'mcq' | 'tips'>('schedule');
  const [mcqAnswers, setMcqAnswers] = useState<Record<number, number | null>>({});
  const [mcqSubmitted, setMcqSubmitted] = useState<Record<number, boolean>>({});

  const canGenerate = selectedLanguage && selectedSubject;

  async function handleGenerate() {
    if (!canGenerate) return;
    setLoading(true);
    try {
      const response = await generateStudyPlan({
        language: selectedLanguage,
        subject: selectedSubject,
      });
      setResult(response);
      setMcqAnswers({});
      setMcqSubmitted({});
      setActiveTab('schedule');
    } catch (error) {
      console.error('Failed to generate study plan:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleMcqAnswer(questionIndex: number, optionIndex: number) {
    if (mcqSubmitted[questionIndex]) return;
    setMcqAnswers((prev) => ({ ...prev, [questionIndex]: optionIndex }));
  }

  function handleSubmitMcq(questionIndex: number) {
    if (mcqAnswers[questionIndex] === undefined || mcqAnswers[questionIndex] === null) return;
    setMcqSubmitted((prev) => ({ ...prev, [questionIndex]: true }));
  }

  function renderMCQ(q: MCQQuestion, index: number) {
    const selected = mcqAnswers[index] ?? null;
    const submitted = mcqSubmitted[index] ?? false;
    const isCorrect = submitted && selected === q.correctAnswer;

    return (
      <div
        key={index}
        className="bg-white rounded-2xl p-6 border border-gray-200"
      >
        <div className="flex items-start gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center shrink-0">
            <span className="text-sm font-bold text-primary-600">{index + 1}</span>
          </div>
          <p className="font-medium text-gray-900">{q.question}</p>
        </div>
        <div className="space-y-2 mb-4">
          {q.options.map((option, optIdx) => {
            let optionClass = 'bg-gray-50 hover:bg-gray-100';
            if (submitted) {
              if (optIdx === q.correctAnswer) {
                optionClass = 'bg-green-50 border-green-300';
              } else if (optIdx === selected && !isCorrect) {
                optionClass = 'bg-red-50 border-red-300';
              }
            } else if (optIdx === selected) {
              optionClass = 'bg-primary-50 border-primary-300';
            }

            return (
              <button
                key={optIdx}
                onClick={() => handleMcqAnswer(index, optIdx)}
                disabled={submitted}
                className={`w-full text-left p-3 rounded-xl border border-transparent transition-all ${optionClass} flex items-center gap-3`}
              >
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    submitted && optIdx === q.correctAnswer
                      ? 'border-green-500 bg-green-500'
                      : submitted && optIdx === selected && !isCorrect
                        ? 'border-red-500 bg-red-500'
                        : optIdx === selected
                          ? 'border-primary-500 bg-primary-500'
                          : 'border-gray-300'
                  }`}
                >
                  {submitted && optIdx === q.correctAnswer && (
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  )}
                  {submitted && optIdx === selected && !isCorrect && (
                    <XCircle className="w-4 h-4 text-white" />
                  )}
                  {!submitted && optIdx === selected && (
                    <div className="w-2 h-2 rounded-full bg-white" />
                  )}
                </div>
                <span className="text-sm">{option}</span>
              </button>
            );
          })}
        </div>
        {!submitted ? (
          <button
            onClick={() => handleSubmitMcq(index)}
            disabled={selected === null}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selected !== null
                ? 'bg-primary-500 text-white hover:bg-primary-600'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            Submit Answer
          </button>
        ) : (
          <div
            className={`p-4 rounded-xl ${isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}
          >
            <div className="flex items-center gap-2 mb-1">
              {isCorrect ? (
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              ) : (
                <XCircle className="w-5 h-5 text-red-500" />
              )}
              <span className={`font-medium ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                {isCorrect ? 'Correct!' : 'Incorrect'}
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-1">{q.explanation}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-gray-600 hover:text-primary-500 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back to Home</span>
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900">
                Vernacular<span className="text-primary-500">Coach</span>
              </span>
            </div>
            <div className="w-32" />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!result ? (
          <>
            {/* Configuration Panel */}
            <div className="bg-white rounded-2xl p-8 border border-gray-200 mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center">
                  <Target className="w-6 h-6 text-primary-500" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Generate Study Plan</h2>
                  <p className="text-gray-500">Choose your language and subject to get started</p>
                </div>
              </div>

              {/* Language Selector */}
              <div className="mb-6">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                  <Globe className="w-4 h-4" />
                  Select Language
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => setSelectedLanguage(lang.code)}
                      className={`p-3 rounded-xl text-left transition-all ${
                        selectedLanguage === lang.code
                          ? 'bg-primary-500 text-white ring-2 ring-primary-500 ring-offset-2'
                          : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      <div className="font-medium text-sm">{lang.name}</div>
                      <div
                        className={`text-xs ${selectedLanguage === lang.code ? 'text-white/80' : 'text-gray-500'}`}
                      >
                        {lang.nativeName}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Subject Selector */}
              <div className="mb-8">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                  <BookOpen className="w-4 h-4" />
                  Select Subject
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  {subjects.map((subject) => (
                    <button
                      key={subject.id}
                      onClick={() => setSelectedSubject(subject.id)}
                      className={`p-4 rounded-xl text-center transition-all ${
                        selectedSubject === subject.id
                          ? 'bg-primary-500 text-white ring-2 ring-primary-500 ring-offset-2'
                          : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      <div className="text-2xl mb-1">
                        {subject.id === 'polity'
                          ? '⚖️'
                          : subject.id === 'history'
                            ? '📚'
                            : subject.id === 'geography'
                              ? '🌍'
                              : subject.id === 'economy'
                                ? '📈'
                                : '🔬'}
                      </div>
                      <div className="font-medium text-sm">{subject.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={!canGenerate || loading}
                className={`w-full py-4 rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-2 ${
                  canGenerate && !loading
                    ? 'bg-gradient-to-r from-primary-500 to-accent-500 text-white hover:from-primary-600 hover:to-accent-600 shadow-lg shadow-primary-500/25'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating Your Study Plan...
                  </>
                ) : (
                  <>
                    Generate Study Plan
                    <ChevronRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>

            {/* Language Info */}
            {selectedLanguage && selectedSubject && (
              <div className="bg-primary-50 border border-primary-200 rounded-xl p-4 flex items-center gap-3">
                <Lightbulb className="w-5 h-5 text-primary-500 shrink-0" />
                <p className="text-sm text-primary-700">
                  Your study plan will be generated in{' '}
                  <strong>
                    {languages.find((l) => l.code === selectedLanguage)?.name}
                  </strong>{' '}
                  for the subject{' '}
                  <strong>
                    {subjects.find((s) => s.id === selectedSubject)?.name}
                  </strong>
                  . The AI will create a personalized daily schedule with MCQ practice and study tips.
                </p>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Results */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Your Study Plan</h2>
                <p className="text-gray-500">
                  {subjects.find((s) => s.id === selectedSubject)?.name} in{' '}
                  {languages.find((l) => l.code === selectedLanguage)?.name}
                </p>
              </div>
              <button
                onClick={() => setResult(null)}
                className="px-4 py-2 bg-gray-100 rounded-xl text-gray-700 hover:bg-gray-200 transition-colors text-sm font-medium"
              >
                Generate New Plan
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6">
              {[
                { key: 'schedule' as const, label: 'Daily Schedule', icon: Clock },
                { key: 'mcq' as const, label: 'MCQ Practice', icon: Target },
                { key: 'tips' as const, label: 'Study Tips', icon: Lightbulb },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-all ${
                    activeTab === tab.key
                      ? 'bg-white text-primary-600 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            {activeTab === 'schedule' && (
              <div className="space-y-3">
                {result.dailySchedule.map((slot, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-xl p-5 border border-gray-200 flex items-start gap-4"
                  >
                    <div className="w-20 text-center shrink-0">
                      <div className="text-sm font-mono font-semibold text-primary-600">
                        {slot.time}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{slot.duration}</div>
                    </div>
                    <div className="w-px h-12 bg-gray-200 shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900">{slot.activity}</h4>
                      <p className="text-sm text-gray-600 mt-1">{slot.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'mcq' && (
              <div className="space-y-4">
                <div className="bg-primary-50 rounded-xl p-4 flex items-center gap-3">
                  <Target className="w-5 h-5 text-primary-500 shrink-0" />
                  <p className="text-sm text-primary-700">
                    Test your knowledge with these practice questions. Select an answer and click
                    submit to check.
                  </p>
                </div>
                {result.mcqPractice.map((q, index) => renderMCQ(q, index))}
              </div>
            )}

            {activeTab === 'tips' && (
              <div className="space-y-3">
                <div className="bg-primary-50 rounded-xl p-4 flex items-center gap-3">
                  <Lightbulb className="w-5 h-5 text-primary-500 shrink-0" />
                  <p className="text-sm text-primary-700">
                    Follow these tips to maximize your preparation effectiveness.
                  </p>
                </div>
                {result.studyTips.map((tip, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-xl p-5 border border-gray-200 flex items-start gap-4"
                  >
                    <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    </div>
                    <p className="text-gray-700">{tip}</p>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
