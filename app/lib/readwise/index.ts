import 'server-only';

import { decode } from 'html-entities';

const READWISE_API_BASE = 'https://readwise.io/api/v2';
const READWISE_API_KEY = process.env.READWISE_API_KEY;

import favouritesData from '@/app/data/favourites.json';
import { getHiddenContent as getHiddenContentFromDb } from '@/db/queries/select';
import {
  BookList,
  DailyReview,
  HighlightDetail,
  HighlightList,
  ReadwiseError
} from './api-endpoints';
import {
  BookWithHiddenStatus,
  DailyReviewWithContentIds,
  FavouriteHighlight,
  HighlightsListWithContentInfo
} from '@/app/types';
import { Book, BookCategory } from './types';

// Readwise calls them "Books" but I'm calling them "Content" because "books" is a category
//! TODO: temporary - use DB
const BOOKS_TO_HIDE = [41615353, 41515405];

// TODO: better error handling
export async function fetchReadwise<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T | null> {
  try {
    const response = await fetch(`${READWISE_API_BASE}/${endpoint}`, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Token ${READWISE_API_KEY}`
      }
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch Readwise endpoint ${endpoint}: ${response.statusText}`
      );
    }

    //? was getting an error "Unexpected end of JSON input" when calling the deleteHighlight action
    if (!response.body) return null;

    return response.json();
  } catch (error) {
    console.error(`Error fetching Readwise endpoint ${endpoint}:`, error);
    // Rethrow the error if you want calling functions to handle it
    // throw error;
    return null;
  }
}

// DAILY REVIEW ---------------------------------------------------------------
export async function getDailyReview(): Promise<DailyReviewWithContentIds | null> {
  const data = await fetchReadwise<DailyReview>('review/');

  if (!data) return null;

  const highlightsWithContentIds = await Promise.all(
    data.highlights.map(async highlight => {
      // fetch the content (i.e. "book") id based on highlight id
      const highlightDetail = await getHighlight(highlight.id);
      return {
        ...highlight,
        book_id: highlightDetail?.book_id ?? null
      };
    })
  );

  const visibleHighlights = highlightsWithContentIds.filter(highlight => {
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
}): Promise<HighlightsListWithContentInfo | null> {
  const { pageSize = 10, page = 1 } = options || {};

  const data = await fetchReadwise<HighlightList>(
    `highlights/?page_size=${pageSize}&page=${page}`
  );

  if (!data) return null;

  const allContentIds = data.results
    .map(highlight => highlight.book_id)
    .filter(id => id !== null);

  const contentIds = Array.from(new Set(allContentIds));
  const content = await Promise.all(
    contentIds.map(id => getContent(id.toString()))
  );
  const contentMap = Object.fromEntries(
    content.filter(c => c !== null).map(c => [c.id, c])
  );

  const highlightsWithContentInfo = data.results.map(highlight => ({
    ...highlight,
    book: highlight.book_id ? contentMap[highlight.book_id] : null
  }));

  return {
    ...data,
    results: highlightsWithContentInfo
  };
}

export async function getHighlight(
  id: number
): Promise<HighlightDetail | null> {
  const data = await fetchReadwise<HighlightDetail>(`highlights/${id}/`);
  return data;
}

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

// can only update text and note
export async function updateHighlight(
  id: string,
  data: {
    text?: string;
    note?: string;
  }
): Promise<HighlightDetail | null> {
  const response = await fetchReadwise<HighlightDetail>(`highlights/${id}/`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });

  return response;
}

export async function deleteHighlight(id: string): Promise<void> {
  await fetchReadwise(`highlights/${id}/`, {
    method: 'DELETE'
  });
}

// CONTENT ----------------------------------------------------------------------
export async function getAllContent(): Promise<BookWithHiddenStatus[]> {
  let allContent: BookWithHiddenStatus[] = [];
  let currentPage = 1;
  let hasNextPage = false;

  do {
    // max page_size is 1000
    const data = await fetchReadwise<BookList>(
      `books/?page_size=1000&page=${currentPage}`
    );

    if (!data) return [];

    const hiddenContentIds = (await getHiddenContentFromDb()).map(
      content => content.contentId
    );

    const contentWithHiddenStatus = data.results.map(content => ({
      ...content,
      hidden: hiddenContentIds.includes(content.id)
    }));

    allContent = allContent.concat(contentWithHiddenStatus);
    hasNextPage = Boolean(data.next);
    currentPage++;
  } while (hasNextPage);

  // filter out content with no highlights
  const contentWithHighlights = allContent.filter(content => {
    return content.num_highlights > 0;
  });

  const decodedContent = contentWithHighlights.map(decodeContentTitle);

  return decodedContent;
}

export async function getContent(
  id: string
): Promise<BookWithHiddenStatus | null> {
  const data = await fetchReadwise<Book>(`books/${id}/`);

  const hiddenIds = (await getHiddenContentFromDb()).map(
    content => content.contentId
  );

  if (!data) return null;

  const bookWithHiddenStatus: BookWithHiddenStatus = {
    ...data,
    hidden: hiddenIds.includes(data.id)
  };

  return decodeContentTitle(bookWithHiddenStatus);
}

export async function getContentHighlights(id: string): Promise<HighlightList> {
  const data = await fetchReadwise<HighlightList>(`highlights/?book_id=${id}`);

  if (!data)
    return {
      count: 0,
      next: null,
      previous: null,
      results: []
    };

  return data;
}

export async function getContentForCategory(
  category: BookCategory
): Promise<BookWithHiddenStatus[]> {
  const allContent = await getAllContent();
  const content = allContent.filter(content => content.category === category);
  return content;
}

export async function getContentForAuthor(
  author: string
): Promise<BookWithHiddenStatus[]> {
  const allContent = await getAllContent();
  const content = allContent.filter(content => content.author === author);
  return content;
}

export async function getHiddenContent(): Promise<BookWithHiddenStatus[]> {
  const hiddenContentData = await getHiddenContentFromDb();
  const hiddenContentIds = hiddenContentData.map(content => content.contentId);
  const hiddenContent = await Promise.all(
    hiddenContentIds.map(id => getContent(id.toString()))
  );
  // filter out null values
  return hiddenContent.filter(content => content !== null);
}

// AUTHORS --------------------------------------------------------------------
export async function getAllAuthors(): Promise<string[]> {
  const allContent = await getAllContent();

  const authors = allContent.map(content => content.author);
  const uniqueAuthors = Array.from(new Set(authors));

  return uniqueAuthors;
}

// HELPERS --------------------------------------------------------------------
function decodeContentTitle<T extends Book | BookWithHiddenStatus>(
  content: T
): T {
  // decode the title because some contain HTML entities like &#39; (ex. "What's Our Problem?" book)

  return {
    ...content,
    title: decode(content.title)
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
