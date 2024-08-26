// API Response Types --------------------------------------------------------
export type ReviewResponse = {
  review_id: number;
  review_url: string;
  review_completed: boolean;
  highlights: ReviewHighlight[];
};

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

export type ContentCategory =
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

export type ReviewHighlightWithContentIds = ReviewHighlight & {
  book_id: number;
};

export type DailyReview = {
  review_id: number;
  review_url: string;
  review_completed: boolean;
  highlights: ReviewHighlightWithContentIds[];
};

export type ListHighlight = BaseHighlight & {
  color: string;
  updated: string;
  book_id: number;
  tags: Tag[];
};

export type ListHighlightWithContentInfo = ListHighlight & {
  book: Content;
};

export type HighlightsList = {
  count: number;
  next: string | null;
  previous: string | null;
  results: ListHighlight[];
};

export type HighlightsListWithContentInfo = {
  count: number;
  next: string | null;
  previous: string | null;
  results: ListHighlightWithContentInfo[];
};

export type Content = {
  id: number;
  title: string;
  author: string;
  category: ContentCategory;
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

export type ContentList = {
  count: number;
  next: string | null;
  previous: string | null;
  results: Content[];
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
  tags: Tag[];
  book_tags: Tag[];
  note: string;
  section: string[];
  cover_image_url: string | null;
  highlighted_at: number;
  user_book_type: string | null;
  user_book_unique_url: string | null;
  book_data_id: number | null;
  url: string | null;
  category: ContentCategory | string | null;
  last_reviewed: number;
};
