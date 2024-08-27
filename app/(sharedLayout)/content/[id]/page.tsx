import { hideContent, unhideContent } from '@/app/actions';
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

export async function generateMetadata({ params }: { params: { id: string } }) {
  const book = await getContent(params.id);

  return {
    title: book ? `${SITE_TITLE} | ${book.title}` : `${SITE_TITLE}`,
    description: SITE_DESCRIPTION
  };
}

export const revalidate = 3600; // 1 hour

export default async function BookPage({ params }: { params: { id: string } }) {
  const book = await getContent(params.id);
  const highlights = await getContentHighlights(params.id);

  if (!book) {
    return <div>Book not found</div>;
  }

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
          <p className="text-sm font-bold text-blue-500">{book.author}</p>

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
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {highlights.results.map(highlight => (
          <HighlightCard key={highlight.id} highlight={highlight} />
        ))}
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
