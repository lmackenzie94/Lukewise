import { BookCategory, SourceType } from './lib/readwise/types';

export const SITE_TITLE = 'Lukewise';
export const SITE_DESCRIPTION = 'My personal Readwise';

export const NAV_LINKS = [
  {
    label: 'Daily Review',
    href: '/daily-review',
    emoji: '📅',
    colours: { text: 'text-purple-600', bg: 'bg-purple-600' }
  },
  {
    label: 'My Content',
    href: '/content',
    emoji: '⭐️',
    colours: { text: 'text-blue-600', bg: 'bg-blue-600' }
  },
  {
    label: 'Favourites',
    href: '/favourites',
    emoji: '💖',
    colours: { text: 'text-green-600', bg: 'bg-green-600' }
  }
];

export const CATEGORIES: {
  title: BookCategory;
  titleSingular: SourceType;
  colour: string;
}[] = [
  { title: 'books', titleSingular: 'book', colour: 'bg-blue-600' },
  { title: 'articles', titleSingular: 'article', colour: 'bg-green-600' },
  { title: 'podcasts', titleSingular: 'podcast', colour: 'bg-purple-600' },
  { title: 'tweets', titleSingular: 'tweet', colour: 'bg-red-600' },
  {
    title: 'supplementals',
    titleSingular: 'supplemental',
    colour: 'bg-yellow-600'
  }
];
