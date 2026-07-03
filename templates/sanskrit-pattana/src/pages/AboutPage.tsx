import React from 'react';
import { BookOpen, Globe, GraduationCap, Users, Target, Award } from 'lucide-react';

const AboutPage: React.FC = () => {
  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-slate-800 mb-6">
            About Sanskrit Pattana
          </h1>
          <p className="text-slate-600 max-w-3xl mx-auto">
            A comprehensive platform dedicated to making Sanskrit learning accessible to everyone, from beginners to advanced scholars.
          </p>
        </div>

        {/* Mission */}
        <div className="bg-sanskritBlue-50 rounded-xl p-8 mb-12">
          <div className="max-w-3xl mx-auto text-center">
            <Target className="h-12 w-12 text-sanskritBlue-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Our Mission</h2>
            <p className="text-slate-600">
              To preserve and promote Sanskrit learning by creating accessible, structured, and engaging educational content for learners of all ages. We believe that Sanskrit, as the language of eternal wisdom, should be accessible to future generations.
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-slate-200">
            <BookOpen className="h-12 w-12 text-sanskritBlue-500 mx-auto mb-4" />
            <h3 className="font-semibold text-slate-800 mb-2">Structured Curriculum</h3>
            <p className="text-sm text-slate-600">Grade-wise learning paths from 1st to 10th level</p>
          </div>
          <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-slate-200">
            <Globe className="h-12 w-12 text-sanskritBlue-500 mx-auto mb-4" />
            <h3 className="font-semibold text-slate-800 mb-2">Multiple Media</h3>
            <p className="text-sm text-slate-600">Books, audio, video, and interactive lessons</p>
          </div>
          <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-slate-200">
            <GraduationCap className="h-12 w-12 text-sanskritBlue-500 mx-auto mb-4" />
            <h3 className="font-semibold text-slate-800 mb-2">Expert Created</h3>
            <p className="text-sm text-slate-600">Content developed by Sanskrit scholars</p>
          </div>
          <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-slate-200">
            <Award className="h-12 w-12 text-sanskritBlue-500 mx-auto mb-4" />
            <h3 className="font-semibold text-slate-800 mb-2">Reference Materials</h3>
            <p className="text-sm text-slate-600">Citations and references from authoritative sources</p>
          </div>
        </div>

        {/* Content Structure */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-12">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">Content Structure</h2>
          <div classNameclass="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-700 mb-2">Grades 1-3: Foundation</h3>
              <p className="text-slate-600">Introduction to Devanagari script, basic greetings, numbers, and family terms with audio support.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-700 mb-2">Grades 4-6: Grammar Basics</h3>
              <p className="text-slate-600">Fundamental grammar rules, basic verbs, sentence construction, and simple prose.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-700 mb-2">Grades 7-8: Classical Literature</h3>
              <p className="text-slate-600">Study of Mahabharata, Ramayana, and other classical texts with commentary.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-700 mb-2">Grades 9-10: Advanced Studies</h3>
              <p className="text-slate-600">Bhagavad Gita, Upanishads, Vedas, and research methodologies.</p>
            </div>
          </div>
        </div>

        {/* Reference Sources */}
        <div className="bg-slate-50 rounded-xl p-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">Reference Sources</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-slate-700 mb-3">Primary References</h3>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>• Devavāṇipraveśaḥ by Monier-Williams</li>
                <li>• Sanskrit Grammar by William Dwyer</li>
                <li>• Basic Sanskrit by Lalita vyavhar</li>
                <li>• Learn Sanskrit in 30 Days by Ramesh Chandra</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-slate-700 mb-3">Secondary References</h3>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>• Monier-Williams Sanskrit Dictionary</li>
                <li>• Patanjali's Mahabhasya</li>
                <li>• Baudhayana Shrauta Sutra</li>
                <li>• Various scholarly articles and papers</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;