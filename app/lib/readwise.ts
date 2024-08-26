import 'server-only';

import {
  Content,
  ContentCategory,
  ContentList,
  DailyReview,
  FavouriteHighlight,
  HighlightsList,
  HighlightsListWithContentInfo,
  ListHighlight,
  ReviewResponse
} from '@/app/types';

import { decode } from 'html-entities';

const READWISE_API_BASE = 'https://readwise.io/api/v2';
const READWISE_API_KEY = process.env.READWISE_API_KEY;

import favouritesData from '@/app/data/favourites.json';

// Readwise calls them "Books" but I'm calling them "Content" because "books" is a category
const BOOKS_TO_HIDE = [41615353, 41515405];

export async function fetchReadwise(
  endpoint: string,
  options: RequestInit = {}
) {
  try {
    const response = await fetch(`${READWISE_API_BASE}/${endpoint}`, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Token ${READWISE_API_KEY}`
      }
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

  const highlightsWithContentIds = await Promise.all(
    data.highlights.map(async highlight => {
      // fetch the content (i.e. "book") id based on highlight id
      const highlightDetail = await getHighlight(highlight.id);
      return {
        ...highlight,
        book_id: highlightDetail.book_id
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
}): Promise<HighlightsListWithContentInfo> {
  const { pageSize = 10, page = 1 } = options || {};

  const data = await fetchReadwise(
    `highlights/?page_size=${pageSize}&page=${page}`
  );
  const allContentIds: string[] = data.results.map(
    (highlight: ListHighlight) => highlight.book_id
  );
  const contentIds = Array.from(new Set(allContentIds));
  const content = await Promise.all(contentIds.map(id => getContent(id)));
  const contentMap = Object.fromEntries(content.map(c => [c.id, c]));

  const highlightsWithContentInfo = data.results.map(
    (highlight: { book_id: string }) => ({
      ...highlight,
      book: contentMap[highlight.book_id]
    })
  );

  return {
    ...data,
    results: highlightsWithContentInfo
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

// CONTENT ----------------------------------------------------------------------
export async function getAllContent(): Promise<Content[]> {
  let allContent: Content[] = [];
  let currentPage = 1;
  let hasNextPage = false;

  do {
    // max page_size is 1000
    const data: ContentList = await fetchReadwise(
      `books/?page_size=1000&page=${currentPage}`
    );
    allContent = allContent.concat(data.results);
    hasNextPage = Boolean(data.next);
    currentPage++;
  } while (hasNextPage);

  const visibleContent = allContent.filter(
    book => !BOOKS_TO_HIDE.includes(book.id)
  );

  // filter out content with no highlights
  const contentWithHighlights = visibleContent.filter(content => {
    return content.num_highlights > 0;
  });

  const decodedContent = contentWithHighlights.map(decodeContentTitle);

  return decodedContent;
}

export async function getContent(id: string): Promise<Content> {
  const data: Content = await fetchReadwise(`books/${id}/`);
  return decodeContentTitle(data);
}

export async function getContentHighlights(
  id: string
): Promise<HighlightsList> {
  const data = await fetchReadwise(`highlights/?book_id=${id}`);
  return data;
}

export async function getContentForCategory(
  category: ContentCategory
): Promise<Content[]> {
  const allContent = await getAllContent();
  const content = allContent.filter(content => content.category === category);
  return content;
}

export async function getContentForAuthor(author: string): Promise<Content[]> {
  const allContent = await getAllContent();
  const content = allContent.filter(content => content.author === author);
  return content;
}

// AUTHORS --------------------------------------------------------------------
export async function getAllAuthors(): Promise<string[]> {
  const allContent = await getAllContent();

  const authors = allContent.map(content => content.author);
  const uniqueAuthors = Array.from(new Set(authors));

  return uniqueAuthors;
}

// HELPERS --------------------------------------------------------------------
function decodeContentTitle(content: Content): Content {
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
