export interface BookChapter {
  id: string;
  title: string;
  summary: string;
  wordCount: number;
  estimatedReadTime: number;
  content: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  coverImage: string;
  publishedDate: string;
  isbn?: string;
  pageCount: number;
  language: string;
  category: string;
  rating: number;
  reviews: number;
  price: {
    hardcover?: string;
    paperback?: string;
    ebook?: string;
  };
  summary: string;
  tableOfContents: string[];
  chapters: BookChapter[];
  tags: string[];
  publisher?: string;
  awards?: string[];
}