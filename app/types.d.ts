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

export type FavouriteHighlight = BaseHighlight & {
  original_text: string | null;
  location_type: string;
  location: number;
  is_supp: boolean;
  is_pop_fill: boolean;
  is_favorite: boolean;
  is_discard: boolean;
  user_book_id: number;
  keyphrase: string | null;
  review_format: string;
  amazon_id: string;
  title: string;
  author: string;
  readable_title: string;
  tags: Tag[];
  book_tags: Tag[];
  note: string;
  section: string[];
  cover_image_url: string | null;
  highlighted_at: string;
  user_book_type: string;
  user_book_unique_url: string | null;
  book_data_id: number;
  url: string | null;
  category: BookCategory;
  last_reviewed: string;
}

   