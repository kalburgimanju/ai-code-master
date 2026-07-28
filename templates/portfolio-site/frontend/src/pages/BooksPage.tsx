import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Book, Search, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../components/common/Card';
import { Input } from '../components/common/Input';
import { sampleBooks } from '../utils/data';

const BooksPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = Array.from(new Set(sampleBooks.map((book) => book.category)));

  const filteredBooks = sampleBooks.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = !selectedCategory || book.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl font-bold text-slate-900 dark:text-white mb-4">Books</h1>
          <div className="w-20 h-1 bg-blue-600 mx-auto"></div>
          <p className="text-slate-600 dark:text-slate-300 mt-6 max-w-2xl mx-auto">
            Explore my authored books covering AI agents, customer experience automation, and future insights.
          </p>
        </motion.div>

        {/* Search and Filter */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-12 space-y-6"
        >
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
            <Input
              type="text"
              placeholder="Search books by title, description, or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors {
                !selectedCategory
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
              }`}
            >
              All
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors {
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Results Count */}
        <div className="text-center mb-8">
          <p className="text-slate-600 dark:text-slate-400">
            Found {filteredBooks.length} book{filteredBooks.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Books Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredBooks.map((book, index) => (
            <motion.div
              key={book.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card hover className="h-full">
                <div className="flex flex-col h-full">
                  <div className="relative">
                    <img
                      src={book.coverImage}
                      alt={book.title}
                      className="w-full h-64 object-cover rounded-t-xl"
                    />
                    <div className="absolute top-4 right-4 px-2 py-1 bg-white/90 dark:bg-slate-900/90 rounded-full">
                      <div className="flex items-center text-sm font-medium">
                        <span className="text-yellow-500 mr-1">★</span>
                        {book.rating}
                      </div>
                    </div>
                  </div>
                  <CardHeader>
                    <div className="mb-2">
                      <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                        {book.category}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white line-clamp-2">
                      {book.title}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      by {book.author}
                    </p>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-slate-600 dark:text-slate-300 line-clamp-3">
                      {book.summary}
                    </p>
                  </CardContent>
                  <div className="p-6 pt-0">
                    <div className="flex flex-wrap gap-2 mb-4">
                      {book.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded text-xs font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-slate-500 dark:text-slate-400">
                        {book.pageCount} pages • {book.language}
                      </div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">
                        {book.reviews} reviews
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredBooks.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <Book size={64} className="mx-auto text-slate-400 mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              No books found
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Try adjusting your search criteria or filters.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default BooksPage;