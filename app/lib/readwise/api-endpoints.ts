import { Book, Highlight, ReviewHighlight } from './types';

// error
// TODO: use this
export type ReadwiseError = {
  detail: string;
};

// GET /review
export type DailyReview = {
  review_id: number;
  review_url: string;
  review_completed: boolean;
  highlights: ReviewHighlight[];
};

// GET /highlights
export type HighlightList = {
  count: number;
  next: string | null;
  previous: string | null;
  results: Highlight[];
};

// GET /highlights/{id}
export type HighlightDetail = Highlight;

// PATCH /highlights/{id}
export type HighlightUpdate = Highlight;

// GET /books/{id}
export type BookDetail = Book;

// GET /books
export type BookList = {
  count: number;
  next: string | null;
  previous: string | null;
  results: Book[];
};
