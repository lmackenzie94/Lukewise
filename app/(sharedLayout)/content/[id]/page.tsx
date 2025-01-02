import {
  generateBookSummary,
  hideContent,
  refreshContent,
  unhideContent
} from '@/app/actions';
import { HighlightCard } from '@/app/components/HighlightCard';
import { SITE_DESCRIPTION, SITE_TITLE } from '@/app/constants';
import {
  getContent,
  getContentHighlights,
  getLargerImage
} from '@/app/lib/readwise';
import Image from 'next/image';
import Link from 'next/link';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { RefreshButton } from '../../../components/RefreshButton';
import { AIGenerateButton } from '@/app/components/AIGenerateButton';
import { getBookSummary } from '@/db/queries/select';
import ReactMarkdown from 'react-markdown';

export async function generateMetadata({ params }: { params: { id: string } }) {
  const book = await getContent(params.id);

  return {
    title: book ? `${SITE_TITLE} | ${book.title}` : `${SITE_TITLE}`,
    description: SITE_DESCRIPTION
  };
}

// ISR
export const revalidate = 86400; // 1 day
export function generateStaticParams() {
  return [];
}

export default async function BookPage({ params }: { params: { id: string } }) {
  const book = await getContent(params.id);
  const highlights = await getContentHighlights(params.id);

  if (!book) {
    return <div>Book not found</div>;
  }

  //? passes the book id to the refreshContent action as first argument
  const refreshContentWithBookId = refreshContent.bind(null, book.id);

  const bookSummary = await getBookSummary(book.id);

  return (
    <main className="container max-w-screen-md">
      <div className="flex flex-col sm:flex-row text-center sm:text-left items-center gap-4 mb-8">
        {book.cover_image_url && (
          <Image
            src={getLargerImage(book.cover_image_url)}
            alt={book.title}
            width={300}
            height={300}
            className="rounded-full w-20 sm:w-28 h-20 sm:h-28 bg-gray-300"
          />
        )}
        <div>
          <Link
            href={`/content?author=${book.author}`}
            className="block text-sm font-semibold text-blue-500 hover:underline"
          >
            {book.author}
          </Link>

          {book.source_url ? (
            <Link
              href={book.source_url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`View source for ${book.title} (opens in a new tab)`}
            >
              <h1 className="text-xl sm:text-2xl font-bold mb-2 inline-block hover:underline">
                {book.title}
              </h1>
            </Link>
          ) : (
            <h1 className="text-2xl font-bold mb-2">{book.title}</h1>
          )}
          <div className="flex justify-center sm:justify-start items-center gap-x-4 text-xs font-mono tracking-tight text-gray-500">
            <Link
              href={`/content?category=${book.category}`}
              className="bg-purple-500 text-white px-2 py-1 rounded-lg text-xs font-mono tracking-tight inline-block"
            >
              {book.category}
            </Link>
            {book.num_highlights > 0 && <p>{book.num_highlights} highlights</p>}
            {book.hidden ? (
              <UnhideButton contentId={book.id} />
            ) : (
              <HideButton contentId={book.id} />
            )}
            <form action={refreshContentWithBookId} className="inline-flex">
              <RefreshButton />
            </form>
          </div>

          {bookSummary.length === 0 && book.category === 'books' && (
            <form action={generateBookSummary} className="inline-flex">
              <input type="hidden" name="bookId" value={book.id} />
              <input type="hidden" name="bookTitle" value={book.title} />
              <input type="hidden" name="bookAuthor" value={book.author} />
              <AIGenerateButton />
            </form>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {bookSummary.length > 0 && (
          <div className="my-4 flex flex-col gap-3">
            {/* SUMMARY */}
            <details className="bg-blue-500 text-white px-4 py-2 rounded-md">
              <summary className="font-bold">Summary</summary>
              <ReactMarkdown className="text-sm whitespace-pre-line bg-white/95 text-black p-2 sm:p-4 rounded-md mt-2">
                {JSON.parse(bookSummary[0].summary)}
              </ReactMarkdown>
            </details>
            {/* KEY POINTS */}
            <details className="bg-purple-500 text-white px-4 py-2 rounded-md">
              <summary className="font-bold">Key Points</summary>
              <ReactMarkdown className="text-sm whitespace-pre-line bg-white/95 text-black px-2 sm:px-4 rounded-md mt-2">
                {JSON.parse(bookSummary[0].keyPoints)}
              </ReactMarkdown>
            </details>
            {/* QUIZ */}
            <Quiz quiz={bookSummary[0].quiz} />
          </div>
        )}
        {highlights.results.map(highlight => {
          const headingNotes = ['.h1', '.h2', '.h3', '.h4', '.h5', '.h6'];
          const isHeadingHighlight = headingNotes.some(note =>
            highlight.note?.includes(note)
          );
          return isHeadingHighlight ? (
            <h2
              key={highlight.id}
              className="text-base sm:text-lg font-bold mt-3"
            >
              {highlight.text}
            </h2>
          ) : (
            <HighlightCard key={highlight.id} highlight={highlight} />
          );
        })}
      </div>
    </main>
  );
}

async function HideButton({ contentId }: { contentId: number }) {
  return (
    <form action={hideContent} className="inline-flex">
      <input type="hidden" name="contentId" value={contentId} />

      <button type="submit" title="Hide">
        <FaEye aria-hidden="true" className="text-lg" />
        <span className="sr-only">Hide</span>
      </button>
    </form>
  );
}

async function UnhideButton({ contentId }: { contentId: number }) {
  return (
    <form action={unhideContent} className="inline-flex">
      <input type="hidden" name="contentId" value={contentId} />
      <button type="submit" title="Unhide">
        <FaEyeSlash aria-hidden="true" className="text-lg" />
        <span className="sr-only">Unhide</span>
      </button>
    </form>
  );
}

const Quiz = ({ quiz }: { quiz: string }) => {
  const quizData: { question: string; answer: string }[] = JSON.parse(quiz);

  return (
    <div className="flex flex-col gap-3 text-sm">
      {quizData.map((question, idx) => (
        <details
          key={idx}
          className="bg-white px-4 py-2 rounded-md border border-gray-300"
        >
          <summary className="font-bold">{question.question}</summary>
          <p className="mt-2">{question.answer}</p>
        </details>
      ))}
    </div>
  );
};
