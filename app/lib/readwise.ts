import 'server-only';

import {
  Book,
  BookCategory,
  BooksList,
  DailyReview,
  HighlightsList,
  HighlightsListWithBookInfo,
  ListHighlight
} from '@/app/types';

const READWISE_API_BASE = 'https://readwise.io/api/v2';
const READWISE_API_KEY = process.env.READWISE_API_KEY;

export async function fetchReadwise(
  endpoint: string,
  options: RequestInit = {},
  additionalHeaders: Record<string, string> = {}
) {
  try {
    const response = await fetch(`${READWISE_API_BASE}/${endpoint}`, {
      headers: {
        Authorization: `Token ${READWISE_API_KEY}`,
        ...additionalHeaders
      },
      ...options
    });

    if (!response.ok) {
      console.log(response);
      throw new Error(
        `Failed to fetch Readwise endpoint ${endpoint}: ${response.statusText}`
      );
    }

    //? was getting an error "Unexpected end of JSON input" when calling the deleteHighlight action
    if (!response.body) return null;

    return response.json();
  } catch (error) {
    console.error(`Error fetching Readwise endpoint ${endpoint}:`, error);
    throw error;
  }
}

// DAILY REVIEW ---------------------------------------------------------------
export async function getDailyReview(): Promise<DailyReview> {
  const data = await fetchReadwise('review/');
  return data;
}

// HIGHLIGHTS -----------------------------------------------------------------
export async function getHighlights(options?: {
  pageSize?: number;
  page?: number;
}): Promise<HighlightsListWithBookInfo> {
  const { pageSize = 10, page = 1 } = options || {};

  const data = await fetchReadwise(
    `highlights/?page_size=${pageSize}&page=${page}`
  );
  const allBookIds: string[] = data.results.map(
    (highlight: ListHighlight) => highlight.book_id
  );
  const bookIds = Array.from(new Set(allBookIds));
  const books = await Promise.all(bookIds.map(id => getBook(id)));
  const bookMap = Object.fromEntries(books.map(book => [book.id, book]));

  const highlightsWithBookInfo = data.results.map(
    (highlight: { book_id: string }) => ({
      ...highlight,
      book: bookMap[highlight.book_id]
    })
  );

  return {
    ...data,
    results: highlightsWithBookInfo
  };
}

export async function getRecentHighlights(
  num: number = 4
): Promise<HighlightsList> {
  const data = await fetchReadwise(`highlights/?page_size=${num}`);
  return data;
}

export async function getHighlight(id: string): Promise<ListHighlight> {
  const data = await fetchReadwise(`highlights/${id}/`);
  return data;
}

// BOOKS ----------------------------------------------------------------------
export async function getBooks(pageSize: number = 20): Promise<BooksList> {
  const data = await fetchReadwise(`books/?page_size=${pageSize}`);
  return data;
}

export async function getAllBooks(): Promise<Book[]> {
  let allBooks: Book[] = [];

  // max page_size is 1000
  const data: BooksList = await fetchReadwise(`books/?page_size=1000`);
  allBooks = allBooks.concat(data.results);

  // TODO: do this recursively
  if (data.next) {
    const nextPage = await fetchReadwise(data.next);
    allBooks = allBooks.concat(nextPage.results);
  }

  return allBooks;
}

export async function getRecentBooks(num: number = 4): Promise<BooksList> {
  const data = await fetchReadwise(`books/?page_size=${num}`);
  return data;
}

export async function getBook(id: string): Promise<Book> {
  const data = await fetchReadwise(`books/${id}/`);
  return data;
}

export async function getBookHighlights(id: string): Promise<HighlightsList> {
  const data = await fetchReadwise(`highlights/?book_id=${id}`);
  return data;
}

export async function getBooksForCategory(
  category: BookCategory
): Promise<Book[]> {
  const allBooks = await getAllBooks();
  const books = allBooks.filter(book => book.category === category);
  return books;
}

export async function getBooksForAuthor(author: string): Promise<Book[]> {
  const allBooks = await getAllBooks();
  const books = allBooks.filter(book => book.author === author);
  return books;
}

// AUTHORS --------------------------------------------------------------------
export async function getAllAuthors(): Promise<string[]> {
  const allBooks = await getAllBooks();

  const authors = allBooks.map(book => book.author);
  const uniqueAuthors = Array.from(new Set(authors));

  return uniqueAuthors;
}
