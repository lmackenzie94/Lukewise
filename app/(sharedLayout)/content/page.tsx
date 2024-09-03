import Link from 'next/link';
import { getAllContent } from '@/app/lib/readwise';
import { Metadata } from 'next';
import { SITE_DESCRIPTION, SITE_TITLE } from '@/app/constants';
import { BookCategory } from '@/app/lib/readwise/types';
import { BookWithHiddenStatus } from '@/app/types';
import { ContentList } from '@/app/components/ContentList';

export const revalidate = false; // cached indefinitely

const PAGE_TITLE = 'My Content';

export const metadata: Metadata = {
  title: `${SITE_TITLE} | ${PAGE_TITLE}`,
  description: SITE_DESCRIPTION
};

export default async function ContentPage({
  searchParams
}: {
  searchParams: {
    category: BookCategory | undefined;
    author: string | undefined;
    showHidden: string | undefined;
  };
}) {
  const currentCategory = searchParams.category;
  const currentAuthor = searchParams.author;
  const showHidden = searchParams.showHidden === 'true';

  const allContent = await getAllContent();
  let filteredContent: BookWithHiddenStatus[] = allContent;
  let authorsToDisplay: string[] = [];

  if (currentCategory || currentAuthor) {
    if (currentCategory) {
      filteredContent = filteredContent.filter(
        content => content.category === currentCategory
      );
    }

    // do this here so authors list doesn't get reduced to a single author when currentAuthor is set
    authorsToDisplay = getAuthors(filteredContent, showHidden);

    if (currentAuthor) {
      filteredContent = filteredContent.filter(
        content => content.author === currentAuthor
      );
    }
  } else {
    authorsToDisplay = getAuthors(allContent, showHidden);
  }

  const contentToDisplay = getContentToDisplay(
    filteredContent,
    currentCategory,
    currentAuthor,
    showHidden
  );

  return (
    <main className="container">
      <h1 className="text-2xl font-bold mb-6 sr-only">{PAGE_TITLE}</h1>
      <div className="flex flex-col md:flex-row gap-4 items-start">
        <Sidebar
          currentCategory={currentCategory}
          currentAuthor={currentAuthor}
          showHidden={showHidden}
          authorsToDisplay={authorsToDisplay}
        />
        <ContentList
          currentCategory={currentCategory}
          currentAuthor={currentAuthor}
          showHidden={showHidden}
          allContent={contentToDisplay}
        />
      </div>
    </main>
  );
}

const Sidebar = ({
  currentCategory,
  currentAuthor,
  showHidden,
  authorsToDisplay
}: {
  currentCategory: BookCategory | undefined;
  currentAuthor: string | undefined;
  showHidden: boolean;
  authorsToDisplay: string[];
}) => {
  return (
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
  );
};

const getContentToDisplay = (
  content: BookWithHiddenStatus[],
  currentCategory: BookCategory | undefined,
  currentAuthor: string | undefined,
  showHidden: boolean
) => {
  if (!showHidden) {
    content = content.filter(item => !item.hidden);
  }

  // if a category or author is set, sort by title
  if (currentCategory || currentAuthor) {
    return content.sort((a, b) => a.title.localeCompare(b.title));
  }

  // otherwise, use default sort (newest first)
  return content;
};

const getAuthors = (content: BookWithHiddenStatus[], showHidden: boolean) => {
  const visibleContent = showHidden ? content : content.filter(c => !c.hidden);
  return Array.from(new Set(visibleContent.map(c => c.author))).sort();
};
