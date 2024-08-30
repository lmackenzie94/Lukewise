import Link from 'next/link';
import {
  getAllContent,
  getContentForAuthor,
  getContentForCategory
} from '@/app/lib/readwise';
import Image from 'next/image';
import { Suspense } from 'react';
import { Metadata } from 'next';
import { CATEGORIES, SITE_DESCRIPTION, SITE_TITLE } from '@/app/constants';
import { BookCategory } from '@/app/lib/readwise/types';
import { BookWithHiddenStatus } from '@/app/types';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { refreshAllContent } from '@/app/actions';
import { RefreshButton } from '@/app/components/RefreshButton';

export const revalidate = false; // cached indefinitely

const PAGE_TITLE = 'My Content';

export const metadata: Metadata = {
  title: `${SITE_TITLE} | ${PAGE_TITLE}`,
  description: SITE_DESCRIPTION
};

const CONTENT_TO_SHOW_ON_LOAD = 18;

export default function ContentPage({
  searchParams
}: {
  searchParams: {
    category: BookCategory | undefined;
    author: string | undefined;
    showHidden: string | undefined;
  };
}) {
  return (
    <ContentList
      currentCategory={searchParams.category}
      currentAuthor={searchParams.author}
      showHidden={searchParams.showHidden === 'true'}
    />
  );
}

const ContentList = async ({
  currentCategory,
  currentAuthor,
  showHidden
}: {
  currentCategory: BookCategory | undefined;
  currentAuthor: string | undefined;
  showHidden: boolean;
}) => {
  let contentToDisplay: BookWithHiddenStatus[] = [];
  let authorsToDisplay: string[] = [];

  // TODO: do this better
  if (currentCategory || currentAuthor) {
    if (currentCategory && currentAuthor) {
      let contentForCategory = await getContentForCategory(currentCategory);
      if (!showHidden) {
        contentForCategory = contentForCategory.filter(
          content => !content.hidden
        );
      }
      authorsToDisplay = getAuthors(contentForCategory);
      contentToDisplay = contentForCategory.filter(
        content => content.author === currentAuthor
      );
    } else if (currentCategory) {
      let contentForCategory = await getContentForCategory(currentCategory);
      if (!showHidden) {
        contentForCategory = contentForCategory.filter(
          content => !content.hidden
        );
      }
      authorsToDisplay = getAuthors(contentForCategory);
      contentToDisplay = contentForCategory;
    } else if (currentAuthor) {
      const contentForAuthor = await getContentForAuthor(currentAuthor);
      let allContent = await getAllContent();
      if (!showHidden) {
        allContent = allContent.filter(content => !content.hidden);
      }
      authorsToDisplay = getAuthors(allContent);
      contentToDisplay = contentForAuthor;
    }
  } else {
    let allContent = await getAllContent();
    if (!showHidden) {
      allContent = allContent.filter(content => !content.hidden);
    }
    authorsToDisplay = getAuthors(allContent);
    contentToDisplay = allContent.slice(0, CONTENT_TO_SHOW_ON_LOAD);
  }

  contentToDisplay.sort((a, b) => a.title.localeCompare(b.title));

  return (
    <main className="container">
      <h1 className="text-2xl font-bold mb-6 sr-only">{PAGE_TITLE}</h1>
      <div className="flex flex-col md:flex-row gap-4 items-start">
        <div className="bg-gray-200 p-4 rounded-md w-full md:w-1/4 min-w-[200px] flex-shrink-0 md:sticky md:top-4 md:h-[80vh]">
          {authorsToDisplay.length > 0 && (
            <div>
              <h2 className="text-lg font-bold mb-2">Authors</h2>
              {/* skip to main content */}
              <a href="#content" className="block sr-only focus:not-sr-only">
                Skip to main content
              </a>
              <ul className="h-56 md:h-[calc(80vh-70px)] overflow-y-auto border border-gray-300 rounded-md text-xs lg:text-sm">
                {authorsToDisplay.map(author => (
                  <li
                    key={author}
                    className="hocus:bg-blue-100 odd:bg-gray-50 bg-gray-100"
                  >
                    <Link
                      prefetch={false}
                      href={`/content/?author=${author}${
                        currentCategory ? `&category=${currentCategory}` : ''
                      }${showHidden ? `&showHidden=${showHidden}` : ''}`}
                      // don't scroll to the top of the next page
                      scroll={false}
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
          <div id="content" className="mb-4 sm:mb-2">
            <div className="flex justify-center sm:justify-between items-center flex-col-reverse sm:flex-row gap-4">
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                <Link
                  prefetch={false}
                  key="all"
                  href={`/content/${
                    showHidden ? `?showHidden=${showHidden}` : ''
                  }`}
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

          <Link
            prefetch={false}
            href={`/content/?showHidden=${!showHidden}${
              currentCategory ? `&category=${currentCategory}` : ''
            }${currentAuthor ? `&author=${currentAuthor}` : ''}`}
            className="flex justify-center sm:inline-flex sm:justify-start text-xs text-gray-500 hover:text-gray-700 items-center gap-1"
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

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-y-6 gap-x-4 flex-1 mt-5">
            {contentToDisplay.map(c => (
              <ContentCard key={c.id} content={c} showHidden={showHidden} />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
};

function getAuthors(content: BookWithHiddenStatus[]) {
  return Array.from(new Set(content.map(c => c.author))).sort();
}

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
