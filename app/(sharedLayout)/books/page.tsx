import Link from 'next/link';
import {
  getAllBooks,
  getBooksForAuthor,
  getBooksForCategory
} from '@/app/lib/readwise';
import Image from 'next/image';
import { Book, BookCategory } from '../../types';
import { Suspense } from 'react';

const BOOKS_TO_SHOW_ON_LOAD = 12;

export default async function BooksPage({
  searchParams
}: {
  searchParams: {
    category: BookCategory | undefined;
    author: string | undefined;
  };
}) {
  return (
    <Suspense fallback={<BookSkeleton />}>
      <ListOfBooks
        currentCategory={searchParams.category}
        currentAuthor={searchParams.author}
      />
    </Suspense>
  );
}

const ListOfBooks = async ({
  currentCategory,
  currentAuthor
}: {
  currentCategory: BookCategory | undefined;
  currentAuthor: string | undefined;
}) => {
  let booksToDisplay: Book[] = [];
  let authorsToDisplay: string[] = [];

  if (currentCategory || currentAuthor) {
    if (currentCategory && currentAuthor) {
      const booksForCategory = await getBooksForCategory(currentCategory);
      authorsToDisplay = getAuthors(booksForCategory);
      booksToDisplay = booksForCategory.filter(
        book => book.author === currentAuthor
      );
    } else if (currentCategory) {
      const booksForCategory = await getBooksForCategory(currentCategory);
      authorsToDisplay = getAuthors(booksForCategory);
      booksToDisplay = booksForCategory;
    } else if (currentAuthor) {
      const booksForAuthor = await getBooksForAuthor(currentAuthor);
      const allBooks = await getAllBooks();
      authorsToDisplay = getAuthors(allBooks);
      booksToDisplay = booksForAuthor;
    }
  } else {
    const allBooks = await getAllBooks();
    authorsToDisplay = getAuthors(allBooks);
    booksToDisplay = allBooks.slice(0, BOOKS_TO_SHOW_ON_LOAD);
  }

  booksToDisplay.sort((a, b) => a.title.localeCompare(b.title));

  const categories: BookCategory[] = [
    'books',
    'articles',
    'podcasts',
    'tweets',
    'supplementals'
  ];

  return (
    <main className="container">
      <h1 className="text-2xl font-bold mb-6 sr-only">Content</h1>
      <div className="flex flex-col md:flex-row gap-4 items-start">
        <div className="bg-gray-200 p-4 rounded-md w-full md:w-1/4 flex-shrink-0 md:sticky md:top-4 md:h-[80vh]">
          {authorsToDisplay.length > 0 && (
            <div>
              <h2 className="text-lg font-bold mb-2">Authors</h2>
              <ul className="h-56 md:h-[calc(80vh-70px)] overflow-y-auto border border-gray-300 rounded-md text-sm">
                {authorsToDisplay.map(author => (
                  <li
                    key={author}
                    className="hover:bg-blue-100 odd:bg-gray-50 bg-gray-100"
                  >
                    <Link
                      href={`/books/?author=${author}${
                        currentCategory ? `&category=${currentCategory}` : ''
                      }`}
                      className={`block p-2 ${
                        author === currentAuthor
                          ? 'font-bold bg-blue-500 text-white'
                          : ''
                      }`}
                    >
                      {author}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <div className="flex-1">
          <div className="flex flex-wrap gap-1 mb-5">
            {categories.map(category => (
              <Link
                key={category}
                href={`/books/?category=${category}`}
                className={`inline-block text-xs py-1 px-2 rounded-md font-mono uppercase ${
                  category === currentCategory
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-300 text-gray-700'
                }`}
              >
                {category}
              </Link>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1">
            {booksToDisplay.map(book => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
};

function getAuthors(books: Book[]) {
  return Array.from(new Set(books.map(book => book.author))).sort();
}

const BookCard = ({ book }: { book: Book }) => (
  <article className="flex gap-4 bg-white rounded-md shadow-md p-4">
    {book.cover_image_url && (
      <Image
        src={book.cover_image_url}
        alt={book.title}
        width={200}
        height={200}
        className="object-cover w-12 h-12 rounded-full flex-shrink-0"
      />
    )}
    <div>
      <Link href={`/books/${book.id}`} className="hover:underline">
        <h2
          className="font-bold text-base line-clamp-3 leading-5"
          style={{ wordBreak: 'break-word' }}
        >
          {book.title}
        </h2>
      </Link>
      <Link href={`/books/?author=${book.author}`} className="hover:underline">
        <p className="text-gray-500 text-xs mt-1">{book.author}</p>
      </Link>
    </div>
  </article>
);

const BookSkeleton = () => (
  <div className="container">
    <div className="flex flex-col md:flex-row gap-4 items-start">
      <div className="bg-gray-300 rounded-md w-full md:w-1/4 flex-shrink-0 h-screen animate-pulse"></div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1 animate-pulse">
        {Array.from({ length: 12 }).map((_, index) => (
          <div key={index} className="bg-gray-200 rounded-md h-20"></div>
        ))}
      </div>
    </div>
  </div>
);
