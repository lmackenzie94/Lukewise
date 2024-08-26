import 'server-only';

import {
  Book,
  BookCategory,
  BooksList,
  DailyReview,
  FavouriteHighlight,
  HighlightsList,
  HighlightsListWithBookInfo,
  ListHighlight,
  ReviewResponse
} from '@/app/types';

import { decode } from 'html-entities';

const READWISE_API_BASE = 'https://readwise.io/api/v2';
const READWISE_API_KEY = process.env.READWISE_API_KEY;

import favouritesData from '@/app/data/favourites.json';

const BOOKS_TO_HIDE = [41615353, 41515405];

export async function fetchReadwise(
  endpoint: string,
  options: RequestInit = {}
) {
  try {
    const response = await fetch(`${READWISE_API_BASE}/${endpoint}`, {
      headers: {
        Authorization: `Token ${READWISE_API_KEY}`,
        ...options.headers
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
  const data: ReviewResponse = await fetchReadwise('review/');

  const highlightsWithBookIds = await Promise.all(
    data.highlights.map(async highlight => {
      // fetch the book id based on highlight id
      const highlightDetail = await getHighlight(highlight.id);
      return {
        ...highlight,
        book_id: highlightDetail.book_id
      };
    })
  );

  const visibleHighlights = highlightsWithBookIds.filter(highlight => {
    if (highlight.book_id) {
      return !BOOKS_TO_HIDE.includes(highlight.book_id);
    }
    return true;
  });

  return {
    ...data,
    highlights: visibleHighlights
  };
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

export async function getHighlight(id: number): Promise<ListHighlight> {
  const data = await fetchReadwise(`highlights/${id}/`);
  return data;
}

//! Didn't work once deployed to Vercel
// import { promises as fs } from 'fs';
// export async function getFavouriteHighlights({
//   pageSize = 10,
//   page = 1
// }: {
//   pageSize?: number;
//   page?: number;
// }): Promise<{ count: number; results: FavouriteHighlight[] }> {
//   const file = await fs.readFile(
//     process.cwd() + '/app/data/favourites.json',
//     'utf8'
//   );
//   const data: FavouriteHighlight[] = JSON.parse(file);

//   return {
//     count: data.length,
//     results: data.slice((page - 1) * pageSize, page * pageSize)
//   };
// }

export function getFavouriteHighlights({
  pageSize = 10,
  page = 1
}: {
  pageSize?: number;
  page?: number;
}): { count: number; results: FavouriteHighlight[] } {
  const data: FavouriteHighlight[] = favouritesData;

  const paginatedResults = data.slice((page - 1) * pageSize, page * pageSize);
  const visibleHighlights = paginatedResults.filter(highlight => {
    if (highlight.user_book_id) {
      return !BOOKS_TO_HIDE.includes(highlight.user_book_id);
    }
    return true;
  });

  return {
    count: data.length,
    results: visibleHighlights
  };
}

// BOOKS ----------------------------------------------------------------------
export async function getAllBooks(): Promise<Book[]> {
  let allBooks: Book[] = [];
  let currentPage = 1;
  let hasNextPage = false;

  do {
    // max page_size is 1000
    const data: BooksList = await fetchReadwise(
      `books/?page_size=1000&page=${currentPage}`
    );
    allBooks = allBooks.concat(data.results);
    hasNextPage = Boolean(data.next);
    currentPage++;
  } while (hasNextPage);

  const visibleBooks = allBooks.filter(
    book => !BOOKS_TO_HIDE.includes(book.id)
  );

  const decodedBooks = visibleBooks.map(decodeBookTitle);

  return decodedBooks;
}

export async function getBook(id: string): Promise<Book> {
  const data: Book = await fetchReadwise(`books/${id}/`);
  return decodeBookTitle(data);
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

// HELPERS --------------------------------------------------------------------
function decodeBookTitle(book: Book): Book {
  // decode the title because some contain HTML entities like &#39; (ex. "What's Our Problem?" book)

  return {
    ...book,
    title: decode(book.title)
  };
}

export function getLargerImage(
  imageUrl: string,
  width: number = 300,
  height: number = 300
): string {
  // some URLs have hardcoded width and height values at 100px, so we need to replace them with larger values
  return imageUrl.replace('w=100&h=100', `w=${width}&h=${height}`);
}
