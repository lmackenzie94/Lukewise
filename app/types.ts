// CUSTOM TYPES ---------------------------------------------------------------

import {
  Book,
  BookCategory,
  BookTag,
  Highlight,
  HighlightTag,
  ReviewHighlight
} from './lib/readwise/types';

export type HighlightWithContentInfo = Highlight & {
  book: Book | null;
};

export type HighlightsListWithContentInfo = {
  count: number;
  next: string | null;
  previous: string | null;
  results: HighlightWithContentInfo[];
};

export type ReviewHighlightWithContentIds = ReviewHighlight & {
  book_id: number | null;
};

export type DailyReviewWithContentIds = {
  review_id: number;
  review_url: string;
  review_completed: boolean;
  highlights: ReviewHighlightWithContentIds[];
};

export type BookWithHiddenStatus = Book & {
  hidden: boolean;
};

export type FavouriteHighlight = {
  id: number;
  text: string;
  original_text: string | null;
  location_type: string;
  location: number | null;
  is_supp: boolean;
  is_pop_fill: boolean;
  is_favorite: boolean;
  is_discard: boolean;
  user_book_id: number | null;
  keyphrase: string | null;
  review_format: string;
  amazon_id: string | null;
  title: string;
  author: string;
  readable_title: string;
  tags: HighlightTag[];
  book_tags: BookTag[];
  note: string;
  section: string[];
  cover_image_url: string | null;
  highlighted_at: number;
  user_book_type: string | null;
  user_book_unique_url: string | null;
  book_data_id: number | null;
  url: string | null;
  category: BookCategory | string | null;
  last_reviewed: number;
};
