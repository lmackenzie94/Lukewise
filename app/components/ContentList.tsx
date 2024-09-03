'use client';

import Link from 'next/link';
import { BookCategory } from '../lib/readwise/types';
import { BookWithHiddenStatus } from '../types';
import { CATEGORIES } from '../constants';
import { refreshAllContent } from '../actions';
import { RefreshButton } from './RefreshButton';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useDebounce } from '../hooks/useDebounce';

export const ContentList = ({
  currentCategory,
  currentAuthor,
  showHidden,
  allContent
}: {
  currentCategory: BookCategory | undefined;
  currentAuthor: string | undefined;
  showHidden: boolean;
  allContent: BookWithHiddenStatus[];
}) => {
  const [contentToDisplay, setContentToDisplay] = useState(allContent);
  const [searchTerm, setSearchTerm] = useState('');

  const debouncedSearch = useDebounce<string>(searchTerm, 500);

  useEffect(() => {
    const userSearch = debouncedSearch.toLowerCase().trim();
    if (userSearch === '') {
      setContentToDisplay(allContent);
      return;
    }

    const filteredContent = getFilteredContent(allContent, userSearch);

    setContentToDisplay(filteredContent);
  }, [allContent, debouncedSearch]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="flex-1">
      <div id="content" className="mb-4 sm:mb-2">
        <div className="flex justify-center sm:justify-between items-center flex-col-reverse sm:flex-row gap-4">
          <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
            <Link
              prefetch={false}
              key="all"
              href={`/content/${showHidden ? `?showHidden=${showHidden}` : ''}`}
              className={`inline-block text-xs py-1 px-2 rounded-md font-mono uppercase ${
                !currentCategory
                  ? 'bg-gray-800 text-gray-200 '
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              All
            </Link>
            {CATEGORIES.map(category => (
              <Link
                prefetch={false}
                key={category.title}
                href={`/content/?category=${category.title}${
                  showHidden ? `&showHidden=${showHidden}` : ''
                }`}
                className={`inline-block text-xs py-1 px-2 rounded-md font-mono uppercase ${
                  category.title === currentCategory
                    ? `${category.colour} text-white`
                    : `bg-gray-200 text-gray-800 hover:bg-gray-300`
                }`}
              >
                {category.title}
              </Link>
            ))}
          </div>

          <form
            action={refreshAllContent}
            className="inline-flex text-gray-600"
          >
            <RefreshButton />
          </form>
        </div>
      </div>

      <label htmlFor="search">
        <input
          type="search"
          name="search"
          id="search"
          placeholder="Search..."
          className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
          value={searchTerm}
          onChange={handleSearch}
        />
      </label>

      <Link
        prefetch={false}
        href={`/content/?showHidden=${!showHidden}${
          currentCategory ? `&category=${currentCategory}` : ''
        }${currentAuthor ? `&author=${currentAuthor}` : ''}`}
        className="flex justify-center sm:inline-flex sm:justify-start text-xs text-gray-500 hover:text-gray-700 items-center gap-1 mt-2"
      >
        {showHidden ? (
          <>
            <FaEyeSlash aria-hidden="true" />
            Hide hidden content
          </>
        ) : (
          <>
            <FaEye aria-hidden="true" />
            Show hidden content
          </>
        )}
      </Link>

      {contentToDisplay.length === 0 ? (
        <div className="flex justify-center items-center mt-5">
          <p className="text-gray-500 text-sm">No results found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-y-6 gap-x-4 flex-1 mt-5">
          {contentToDisplay.map(c => (
            <ContentCard key={c.id} content={c} showHidden={showHidden} />
          ))}
        </div>
      )}
    </div>
  );
};

const ContentCard = ({
  content,
  showHidden
}: {
  content: BookWithHiddenStatus;
  showHidden: boolean;
}) => {
  const category = CATEGORIES.find(c => c.title === content.category);
  return (
    <article
      className={`flex gap-4 rounded-md shadow-md py-5 px-4 relative items-center ${
        content.hidden ? 'bg-purple-100' : 'bg-white'
      }`}
    >
      {content.cover_image_url && (
        <Image
          src={content.cover_image_url}
          alt={content.title}
          width={200}
          height={200}
          className="object-cover w-12 h-12 rounded-full flex-shrink-0"
        />
      )}
      <div>
        <div className="absolute -top-2 -right-1 flex items-center gap-1">
          <p
            className={`rounded-full text-white text-[.55rem] py-1 px-2 uppercase inline-block leading-none font-medium ${category?.colour}`}
          >
            {category?.titleSingular}
          </p>
          {content.hidden && (
            <div
              className="rounded-full bg-black text-white text-[.8rem] p-[3px]"
              title="Hidden"
            >
              <span className="sr-only">Hidden</span>
              <FaEyeSlash aria-hidden="true" />
            </div>
          )}
        </div>
        <Link
          prefetch={false}
          href={`/content/${content.id}`}
          className="block hover:underline"
        >
          <h2
            className="font-bold text-sm line-clamp-3 leading-4"
            style={{ wordBreak: 'break-word' }}
          >
            {content.title}
          </h2>
        </Link>
        <Link
          prefetch={false}
          href={`/content/?author=${content.author}${
            showHidden ? `&showHidden=${showHidden}` : ''
          }`}
          className="block hover:underline"
        >
          <p className="text-gray-500 text-xs mt-[2px]">{content.author}</p>
        </Link>
      </div>
    </article>
  );
};

const getFilteredContent = (
  content: BookWithHiddenStatus[],
  searchTerm: string
) => {
  return content.filter(content => {
    const title = content?.title?.toLowerCase();
    const author = content?.author?.toLowerCase();

    return title?.includes(searchTerm) || author?.includes(searchTerm);
  });
};
