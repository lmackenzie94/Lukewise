type BaseHighlight = {
  id: number;
  text: string;
  note: string;
  location: number | null;
  location_type: string;
  highlighted_at: string;
  url: string | null;
};

type Tag = {
  id: number;
  name: string;
};

export type BookCategory =
  | 'books'
  | 'articles'
  | 'podcasts'
  | 'tweets'
  | 'supplementals'; // these are the only possible Readwise categories

export type ReviewHighlight = BaseHighlight & {
  title: string;
  author: string | null;
  source_url: string | null;
  source_type: string;
  category: string | null;
  note: string;
  highlight_url: string | null;
  image_url: string | null;
  api_source: string | null;
};

export type DailyReview = {
  review_id: number;
  review_url: string;
  review_completed: boolean;
  highlights: ReviewHighlight[];
};

export type ListHighlight = BaseHighlight & {
  color: string;
  updated: string;
  book_id: number;
  tags: Tag[];
};

export type ListHighlightWithBookInfo = ListHighlight & {
  book: Book;
};

export type HighlightsList = {
  count: number;
  next: string | null;
  previous: string | null;
  results: ListHighlight[];
};

export type HighlightsListWithBookInfo = {
  count: number;
  next: string | null;
  previous: string | null;
  results: ListHighlightWithBookInfo[];
};

export type Book = {
  id: number;
  title: string;
  author: string;
  category: BookCategory;
  source: string;
  num_highlights: number;
  last_highlight_at: string | null;
  updated: string;
  cover_image_url: string | null;
  highlights_url: string | null;
  source_url: string | null;
  asin: string | null;
  tags: Tag[];
  document_note: string;
};

export type BooksList = {
  count: number;
  next: string | null;
  previous: string | null;
  results: Book[];
};
