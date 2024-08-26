import Link from 'next/link';
import {
  getAllContent,
  getContentForAuthor,
  getContentForCategory
} from '@/app/lib/readwise';
import Image from 'next/image';
import { Content, ContentCategory } from '../../types';
import { Suspense } from 'react';
import { Metadata } from 'next';
import { SITE_DESCRIPTION, SITE_TITLE } from '@/app/constants';

const PAGE_TITLE = 'My Content';

export const metadata: Metadata = {
  title: `${SITE_TITLE} | ${PAGE_TITLE}`,
  description: SITE_DESCRIPTION
};

const CONTENT_TO_SHOW_ON_LOAD = 12;

export default async function ContentPage({
  searchParams
}: {
  searchParams: {
    category: ContentCategory | undefined;
    author: string | undefined;
  };
}) {
  return (
    <Suspense fallback={<ContentSkeleton />}>
      <ContentList
        currentCategory={searchParams.category}
        currentAuthor={searchParams.author}
      />
    </Suspense>
  );
}

const ContentList = async ({
  currentCategory,
  currentAuthor
}: {
  currentCategory: ContentCategory | undefined;
  currentAuthor: string | undefined;
}) => {
  let contentToDisplay: Content[] = [];
  let authorsToDisplay: string[] = [];

  if (currentCategory || currentAuthor) {
    if (currentCategory && currentAuthor) {
      const contentForCategory = await getContentForCategory(currentCategory);
      authorsToDisplay = getAuthors(contentForCategory);
      contentToDisplay = contentForCategory.filter(
        content => content.author === currentAuthor
      );
    } else if (currentCategory) {
      const contentForCategory = await getContentForCategory(currentCategory);
      authorsToDisplay = getAuthors(contentForCategory);
      contentToDisplay = contentForCategory;
    } else if (currentAuthor) {
      const contentForAuthor = await getContentForAuthor(currentAuthor);
      const allContent = await getAllContent();
      authorsToDisplay = getAuthors(allContent);
      contentToDisplay = contentForAuthor;
    }
  } else {
    const allContent = await getAllContent();
    authorsToDisplay = getAuthors(allContent);
    contentToDisplay = allContent.slice(0, CONTENT_TO_SHOW_ON_LOAD);
  }

  contentToDisplay.sort((a, b) => a.title.localeCompare(b.title));

  const categories: ContentCategory[] = [
    'books',
    'articles',
    'podcasts',
    'tweets',
    'supplementals'
  ];

  return (
    <main className="container">
      <h1 className="text-2xl font-bold mb-6 sr-only">{PAGE_TITLE}</h1>
      <div className="flex flex-col md:flex-row gap-4 items-start">
        <div className="bg-gray-200 p-4 rounded-md w-full md:w-1/4 min-w-[200px] flex-shrink-0 md:sticky md:top-4 md:h-[80vh]">
          {authorsToDisplay.length > 0 && (
            <div>
              <h2 className="text-lg font-bold mb-2">Authors</h2>
              <ul className="h-56 md:h-[calc(80vh-70px)] overflow-y-auto border border-gray-300 rounded-md text-xs lg:text-sm">
                {authorsToDisplay.map(author => (
                  <li
                    key={author}
                    className="hover:bg-blue-100 odd:bg-gray-50 bg-gray-100"
                  >
                    <Link
                      href={`/content/?author=${author}${
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
          <div className="flex flex-wrap gap-1 mb-5 justify-center sm:justify-start">
            {categories.map(category => (
              <Link
                key={category}
                href={`/content/?category=${category}`}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 flex-1">
            {contentToDisplay.map(c => (
              <ContentCard key={c.id} content={c} />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
};

function getAuthors(content: Content[]) {
  return Array.from(new Set(content.map(c => c.author))).sort();
}

const ContentCard = ({ content }: { content: Content }) => (
  <article className="flex gap-4 bg-white rounded-md shadow-md p-4">
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
      <Link href={`/content/${content.id}`} className="hover:underline">
        <h2
          className="font-bold text-sm line-clamp-3 leading-4"
          style={{ wordBreak: 'break-word' }}
        >
          {content.title}
        </h2>
      </Link>
      <Link
        href={`/content/?author=${content.author}`}
        className="hover:underline"
      >
        <p className="text-gray-500 text-xs mt-1">{content.author}</p>
      </Link>
    </div>
  </article>
);

const ContentSkeleton = () => (
  <div className="container">
    <div className="flex flex-col md:flex-row gap-4 items-start">
      <div className="bg-gray-300 rounded-md w-full md:w-1/4 min-w-[200px] flex-shrink-0 h-screen animate-pulse"></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 flex-1 animate-pulse">
        {Array.from({ length: 12 }).map((_, index) => (
          <div key={index} className="bg-gray-200 rounded-md h-20"></div>
        ))}
      </div>
    </div>
  </div>
);
