import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, PlayCircle, Headphones, Video, FileText } from 'lucide-react';
import { gradeCurriculum } from '../data';

const CurriculumPage: React.FC = () => {
  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-slate-800 mb-6 text-center">
          Sanskrit Learning Curriculum
        </h1>
        <p className="text-slate-600 text-center max-w-3xl mx-auto mb-12">
          Structured learning paths for Sanskrit from grades 1-10, designed for systematic progression from basics to advanced concepts.
        </p>

        <div className="space-y-12">
          {gradeCurriculum.map((curriculum) => (
            <div key={curriculum.grade} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-sanskritBlue-50 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800">
                      Grade {curriculum.grade}: {curriculum.title}
                    </h2>
                    <p className="text-slate-600 mt-1">{curriculum.description}</p>
                  </div>
                  <span className="text-3xl font-bold text-sanskritBlue-300">
                    {curriculum.grade}
                  </span>
                </div>
              </div>

              <div className="p-6">
                {/* Lessons */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">Lessons</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {curriculum.lessons.map((lesson) => (
                      <Link
                        key={lesson.id}
                        to={`/lesson/${lesson.id}`}
                        className="p-4 bg-sanskrit-50 rounded-lg hover:bg-sanskrit-100 transition-colors"
                      >
                        <h4 className="font-medium text-slate-800 mb-1">{lesson.title}</h4>
                        <p className="text-sm text-slate-600">{lesson.description}</p>
                        <p className="text-xs text-slate-500 mt-2">{lesson.duration}</p>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Resources */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">Resources</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    {curriculum.resources.map((resource) => {
                      const Icon = resource.type === 'book' ? BookOpen :
                                   resource.type === 'audio' ? Headphones :
                                   resource.type === 'video' ? Video : PlayCircle;
                      return (
                        <div
                          key={resource.id}
                          className="p-4 bg-slate-50 rounded-lg flex items-start space-x-3"
                        >
                          <Icon className="h-6 w-6 text-sanskritBlue-500 flex-shrink-0" />
                          <div>
                            <h4 className="font-medium text-slate-800 text-sm">{resource.title}</h4>
                            <p className="text-xs text-slate-600 mt-1">{resource.type}</p>
                            {resource.duration && (
                              <p className="text-xs text-slate-500 mt-1">{resource.duration}</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CurriculumPage;