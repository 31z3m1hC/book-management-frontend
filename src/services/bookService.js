// src/services/bookService.js
import api from './api.js';

export async function loadSampleBooks(isAdmin, loadBooksCallback) {
  if (!isAdmin) {
    alert('Only administrators can load sample books.');
    return;
  }

  const sampleBooks = [
    {
      title: "The Great Gatsby",
      author: "F. Scott Fitzgerald",
      yearPublished: 1925,
      rating: 4.5,
      isbn: "978-0743273565",
      published: true,
      content: "https://www.gutenberg.org/ebooks/64317"
    },
    {
      title: "Pride and Prejudice",
      author: "Jane Austen",
      yearPublished: 1813,
      rating: 4.6,
      isbn: "978-0141439518",
      published: true,
      content: "https://www.gutenberg.org/ebooks/1342"
    },
    {
      title: "Alice's Adventures in Wonderland",
      author: "Lewis Carroll",
      yearPublished: 1865,
      rating: 4.5,
      isbn: "978-0141439761",
      published: true,
      content: "https://www.gutenberg.org/ebooks/11"
    },
    {
      title: "A Christmas Carol",
      author: "Charles Dickens",
      yearPublished: 1843,
      rating: 4.7,
      isbn: "978-0486268651",
      published: true,
      content: "https://www.gutenberg.org/ebooks/46"
    },
    {
      title: "The Adventures of Tom Sawyer",
      author: "Mark Twain",
      yearPublished: 1876,
      rating: 4.2,
      isbn: "978-0143107330",
      published: true,
      content: "https://www.gutenberg.org/ebooks/74"
    }
  ];

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
  const response = await api.deleteBook(id);
  return response.data;
}

export async function createBook(bookData) {
  return await api.createBook(bookData);
}

export async function updateBook(id, bookData) {
  return await api.updateBook(id, bookData);
}