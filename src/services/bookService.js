// src/services/bookService.js
import api from './api.js';

const sampleBooks = [
  {
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    yearPublished: 1925,
    rating: 4.5,
    isbn: "978-0743273565",
    published: true,
    link: "https://www.gutenberg.org/ebooks/64317",
    image: "https://www.gutenberg.org/cache/epub/64317/pg64317.cover.medium.jpg"
  },
  {
    title: "Pride and Prejudice",
    author: "Jane Austen",
    yearPublished: 1813,
    rating: 4.6,
    isbn: "978-0141439518",
    published: true,
    link: "https://www.gutenberg.org/ebooks/1342",
    image: "https://www.gutenberg.org/cache/epub/1342/pg1342.cover.medium.jpg"
  },
  {
    title: "Frankenstein",
    author: "Mary Shelley",
    yearPublished: 1818,
    rating: 4.4,
    isbn: "978-0486282114",
    published: true,
    link: "https://www.gutenberg.org/ebooks/84",
    image: "https://www.gutenberg.org/cache/epub/84/pg84.cover.medium.jpg"
  },
  {
    title: "Dracula",
    author: "Bram Stoker",
    yearPublished: 1897,
    rating: 4.3,
    isbn: "978-0486411095",
    published: true,
    link: "https://www.gutenberg.org/ebooks/345",
    image: "https://www.gutenberg.org/cache/epub/345/pg345.cover.medium.jpg"
  },
  {
    title: "Alice's Adventures in Wonderland",
    author: "Lewis Carroll",
    yearPublished: 1865,
    rating: 4.7,
    isbn: "978-0486275437",
    published: true,
    link: "https://www.gutenberg.org/ebooks/11",
    image: "https://www.gutenberg.org/cache/epub/11/pg11.cover.medium.jpg"
  }
];

export async function loadSampleBooks(isAdmin, loadBooksCallback) {
  if (!isAdmin) {
    alert('Only administrators can load sample books.');
    return;
  }

  try {
    let successCount = 0;
    let errorCount = 0;

    for (const book of sampleBooks) {
      try {
        await api.createBook(book);
        successCount++;
      } catch (err) {
        errorCount++;
      }
    }

    if (successCount > 0) {
      alert(`Successfully added ${successCount} sample books!${errorCount > 0 ? ` (${errorCount} already existed)` : ''}`);
      if (loadBooksCallback) loadBooksCallback();
    } else {
      alert('All sample books already exist in the database.');
    }
  } catch (err) {
    alert('Error loading sample books: ' + err.message);
  }
}

export async function loadBooks() {
  const response = await api.getAllBooks();
  return response.data.data;
}

export async function deleteBook(id) {
  return await api.deleteBook(id);
}

export async function createBook(bookData) {
  return await api.createBook(bookData);
}

export async function updateBook(id, bookData) {
  return await api.updateBook(id, bookData);
}
