export interface Chapter {
  slug: string;
  number: number;
  title: string;
  filename: string;
  part: string;
  partNumber: number;
  description: string;
}

export const BOOK = {
  title: "Python Mastery: From Zero to Hero",
  subtitle: "The Complete Guide to Python Programming",
  author: "Manjunath Kalburgi",
  description:
    "A comprehensive guide covering Python fundamentals, data structures, OOP, web development, data science, design patterns, and real-world projects. Whether you are a beginner or an experienced developer, this book will take your Python skills to the next level.",
};

export const PARTS = [
  { number: 1, title: "Python Foundations" },
  { number: 2, title: "Intermediate Python" },
  { number: 3, title: "Advanced Python" },
  { number: 4, title: "Applied Python" },
  { number: 5, title: "Professional Python" },
];

export const CHAPTERS: Chapter[] = [
  {
    slug: "py-introduction",
    number: 1,
    title: "Introduction to Python",
    filename: "chapter-01-introduction.md",
    part: "Python Foundations",
    partNumber: 1,
    description: "History of Python, installation, REPL, your first programs, and setting up the perfect IDE for productive development.",
  },
  {
    slug: "py-fundamentals",
    number: 2,
    title: "Python Fundamentals",
    filename: "chapter-02-fundamentals.md",
    part: "Python Foundations",
    partNumber: 1,
    description: "Variables, data types, operators, strings, input/output, type casting, and the building blocks of every Python program.",
  },
  {
    slug: "py-control-flow",
    number: 3,
    title: "Control Flow & Logic",
    filename: "chapter-03-control-flow.md",
    part: "Python Foundations",
    partNumber: 1,
    description: "Conditional statements, pattern matching, loops, comprehensions, and how to direct the flow of your programs.",
  },
  {
    slug: "py-functions",
    number: 4,
    title: "Functions & Modules",
    filename: "chapter-04-functions.md",
    part: "Intermediate Python",
    partNumber: 2,
    description: "Defining functions, arguments, lambdas, closures, decorators, modules, and packages for organized, reusable code.",
  },
  {
    slug: "py-data-structures",
    number: 5,
    title: "Data Structures",
    filename: "chapter-05-data-structures.md",
    part: "Intermediate Python",
    partNumber: 2,
    description: "Lists, tuples, sets, dictionaries, deques, namedtuples, and the collections module for efficient data management.",
  },
  {
    slug: "py-oop",
    number: 6,
    title: "Object-Oriented Programming",
    filename: "chapter-06-oop.md",
    part: "Intermediate Python",
    partNumber: 2,
    description: "Classes, inheritance, polymorphism, dunder methods, metaclasses, dataclasses, and mastering OOP in Python.",
  },
  {
    slug: "py-file-io",
    number: 7,
    title: "File I/O & Serialization",
    filename: "chapter-07-file-io.md",
    part: "Intermediate Python",
    partNumber: 2,
    description: "File operations, context managers, CSV, JSON, pickle, pathlib, and working with external data.",
  },
  {
    slug: "py-error-handling",
    number: 8,
    title: "Error Handling & Testing",
    filename: "chapter-08-error-handling.md",
    part: "Advanced Python",
    partNumber: 3,
    description: "Exception handling, custom exceptions, pytest, unittest, mocking, and test coverage for robust applications.",
  },
  {
    slug: "py-advanced",
    number: 9,
    title: "Advanced Python",
    filename: "chapter-09-advanced.md",
    part: "Advanced Python",
    partNumber: 3,
    description: "Generators, iterators, context managers, async/await, type hints, and understanding the GIL.",
  },
  {
    slug: "py-concurrency",
    number: 10,
    title: "Concurrency & Parallelism",
    filename: "chapter-10-concurrency.md",
    part: "Advanced Python",
    partNumber: 3,
    description: "Threading, multiprocessing, asyncio, concurrent.futures, and async patterns for high-performance Python.",
  },
  {
    slug: "py-web",
    number: 11,
    title: "Web Development",
    filename: "chapter-11-web.md",
    part: "Applied Python",
    partNumber: 4,
    description: "Flask, FastAPI, Django basics, REST APIs, templates, databases, and building real web applications.",
  },
  {
    slug: "py-data-science",
    number: 12,
    title: "Data Science & ML",
    filename: "chapter-12-data-science.md",
    part: "Applied Python",
    partNumber: 4,
    description: "NumPy, Pandas, Matplotlib, scikit-learn, and building your first machine learning pipeline.",
  },
  {
    slug: "py-best-practices",
    number: 13,
    title: "Best Practices & Design Patterns",
    filename: "chapter-13-best-practices.md",
    part: "Professional Python",
    partNumber: 5,
    description: "PEP 8, SOLID principles, common design patterns, packaging, virtual environments, and Poetry.",
  },
  {
    slug: "py-projects",
    number: 14,
    title: "Hands-On Projects",
    filename: "chapter-14-projects.md",
    part: "Professional Python",
    partNumber: 5,
    description: "Five complete projects with step-by-step guides: CLI tool, web scraper, REST API, data dashboard, and ML classifier.",
  },
];

export function getChapterBySlug(slug: string): Chapter | undefined {
  return CHAPTERS.find((ch) => ch.slug === slug);
}

export function getChaptersByPart(partNumber: number): Chapter[] {
  return CHAPTERS.filter((ch) => ch.partNumber === partNumber);
}
