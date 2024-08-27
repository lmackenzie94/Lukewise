type CommonHighlight = {
  id: number;
  text: string;
  note: string;
  location: number | null;
  location_type: string;
  highlighted_at: string;
  url: string | null;
};

export type HighlightTag = {
  id: number;
  name: string;
};

export type BookTag = {
  id: number;
  name: string;
  user_book?: number | null;
};

// these are the only possible Readwise categories
export type BookCategory =
  | 'books'
  | 'articles'
  | 'podcasts'
  | 'tweets'
  | 'supplementals';

export type SourceType =
  | 'book'
  | 'article'
  | 'podcast'
  | 'tweet'
  | 'supplemental';

export type Highlight = CommonHighlight & {
  color: string;
  updated: string;
  book_id: number | null;
  tags: HighlightTag[];
};

export type ReviewHighlight = CommonHighlight & {
  title: string;
  author: string | null;
  source_url: string | null;
  source_type: SourceType;
  category: string | null;
  note: string;
  highlight_url: string | null;
  image_url: string | null;
  api_source: string | null;
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
  tags: BookTag[];
  document_note: string;
};
