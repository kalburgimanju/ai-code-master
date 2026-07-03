import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, PlayCircle, Headphones, Globe, GraduationCap, Library } from 'lucide-react';
import { gradeCurriculum } from '../data';

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-sanskritBlue-50 to-sanskrit-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6">
            Learn Sanskrit the Right Way
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-8">
            A comprehensive platform offering books, audio, video, and interactive lessons for learners from beginner to advanced levels (Grades 1-10).
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/curriculum"
              className="px-8 py-3 bg-sanskritBlue-500 text-white font-medium rounded-lg hover:bg-sanskritBlue-600 transition-colors"
            >
              Start Learning
            </Link>
            <Link
              to="/resources"
              className="px-8 py-3 bg-white text-sanskritBlue-600 font-medium rounded-lg hover:bg-sanskrit-100 transition-colors"
            >
              Browse Resources
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-sanskrit-50 rounded-xl">
              <BookOpen className="h-12 w-12 text-sanskritBlue-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Sanskrit Books</h3>
              <p className="text-slate-600">Access to classic and modern Sanskrit texts</p>
            </div>
            <div className="text-center p-6 bg-sanskrit-50 rounded-xl">
              <PlayCircle className="h-12 w-12 text-sanskritBlue-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Video Lessons</h3>
              <p className="text-slate-600">Step-by-step video tutorials for each concept</p>
            </div>
            <div className="text-center p-6 bg-sanskrit-50 rounded-xl">
              <Headphones className="h-12 w-12 text-sanskritBlue-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Audio Practice</h3>
              <p className="text-slate-600">Listen and practice with native pronunciation</p>
            </div>
          </div>
        </div>
      </section>

      {/* Grade Curriculum Preview */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-800 mb-8 text-center">Grade-wise Learning Path</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {gradeCurriculum.slice(0, 5).map((curriculum) => (
              <Link
                key={curriculum.grade}
                to={`/curriculum/${curriculum.grade}`}
                className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="text-3xl font-bold text-sanskritBlue-500 mb-2">
                  {curriculum.grade}
                </div>
                <h3 className="font-semibold text-slate-800 mb-2">
                  {curriculum.title}
                </h3>
                <p className="text-sm text-slate-600">
                  {curriculum.description}
                </p>
              </Link>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link
              to="/curriculum"
              className="inline-block px-6 py-3 text-sanskritBlue-600 font-medium hover:underline"
            >
              View Full Curriculum →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;