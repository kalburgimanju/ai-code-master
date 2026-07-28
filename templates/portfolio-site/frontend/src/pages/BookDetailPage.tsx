import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Book, Clock, FileText, User, Star } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { sampleBooks } from '../utils/data';

const BookDetailPage: React.FC = () => {
  const { bookId } = useParams<{ bookId: string }>();
  const [activeChapter, setActiveChapter] = useState<string | null>(null);

  const book = sampleBooks.find((b) => b.id === bookId);

  if (!book) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Book size={64} className="mx-auto text-slate-400 mb-4" />
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">Book Not Found</h1>
          <p className="text-slate-600 dark:text-slate-400">
            The book you're looking for doesn't exist or has been removed.
          </p>
        </div>
      </div>
    );
  }

  const totalWords = book.chapters.reduce((sum, chapter) => sum + chapter.wordCount, 0);
  const totalReadTime = book.chapters.reduce((sum, chapter) => sum + chapter.estimatedReadTime, 0);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Books
          </button>
        </motion.div>

        {/* Book Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div className="md:col-span-1">
              <img
                src={book.coverImage}
                alt={book.title}
                className="w-full rounded-xl shadow-lg"
              />
            </div>
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <Book size={24} className="text-blue-600" />
                <span className="text-blue-600 dark:text-blue-400 font-medium">
                  {book.category}
                </span>
              </div>
              <h1 className="text-5xl font-bold text-slate-900 dark:text-white mb-4">
                {book.title}
              </h1>
              <p className="text-xl text-slate-600 dark:text-slate-300 mb-6">
                by {book.author}
              </p>
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex items-center text-slate-600 dark:text-slate-300">
                  <User size={16} className="mr-2" />
                  <span>{book.language}</span>
                </div>
                <div className="flex items-center text-slate-600 dark:text-slate-300">
                  <FileText size={16} className="mr-2" />
                  <span>{book.pageCount} pages</span>
                </div>
                <div className="flex items-center text-slate-600 dark:text-slate-300">
                  <Clock size={16} className="mr-2" />
                  <span>{totalReadTime} minutes read</span>
                </div>
                <div className="flex items-center text-slate-600 dark:text-slate-300">
                  <Star size={16} className="text-yellow-500 mr-2" />
                  <span>{book.rating} ({book.reviews} reviews)</span>
                </div>
              </div>
            </div>
          </div>

          <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
            {book.summary}
          </p>

          {book.isbn && (
            <div className="text-sm text-slate-500 dark:text-slate-400">
              ISBN: {book.isbn}
            </div>
          )}
        </motion.div>

        {/* Book Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid lg:grid-cols-4 gap-8"
        >
          {/* Table of Contents */}
          <div className="lg:col-span-1">
            <Card sticky>
              <CardHeader>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Table of Contents
                </h3>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-2">
                  {book.chapters.map((chapter, index) => (
                    <button
                      key={chapter.id}
                      onClick={() => setActiveChapter(chapter.id)}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-colors {
                        activeChapter === chapter.id
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="font-medium">Chapter {index + 1}: {chapter.title}</div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">
                        {chapter.wordCount} words • {chapter.estimatedReadTime} min
                      </div>
                    </button>
                  ))}
                </div>
                <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                  <div className="text-sm text-slate-600 dark:text-slate-300">
                    <div>Total words: {totalWords.toLocaleString()}</div>
                    <div>Estimated reading time: {totalReadTime} minutes</div>
                    <div>Chapters: {book.chapters.length}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chapter Content */}
          <div className="lg:col-span-3">
            {activeChapter ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                {book.chapters.map((chapter) => (
                  chapter.id === activeChapter && (
                    <Card key={chapter.id}>
                      <CardHeader>
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
                          Chapter {book.chapters.indexOf(chapter) + 1}: {chapter.title}
                        </h2>
                        <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                          <span>{chapter.wordCount} words</span>
                          <span>{chapter.estimatedReadTime} minutes</span>
                        </div>
                      </CardHeader>
                      <CardContent className="p-8">
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                          {chapter.content}
                        </p>
                      </CardContent>
                    </Card>
                  )
                ))}
              </motion.div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Book size={64} className="mx-auto text-slate-400 mb-4" />
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                    Select a Chapter
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    Choose a chapter from the table of contents to read its content.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Book Purchase Options */}
            <Card className="mt-8">
              <CardHeader>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Available Formats
                </h3>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid sm:grid-cols-3 gap-4">
                  {book.price.hardcover && (
                    <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                      <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">Hardcover</div>
                      <div className="font-bold text-slate-900 dark:text-white">
                        {book.price.hardcover}
                      </div>
                    </div>
                  )}
                  {book.price.paperback && (
                    <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                      <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">Paperback</div>
                      <div className="font-bold text-slate-900 dark:text-white">
                        {book.price.paperback}
                      </div>
                    </div>
                  )}
                  {book.price.ebook && (
                    <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                      <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">eBook</div>
                      <div className="font-bold text-slate-900 dark:text-white">
                        {book.price.ebook}
                      </div>
                    </div>
                  )}
                </div>
                <div className="mt-6">
                  <Button className="w-full">
                    Purchase Book
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default BookDetailPage;