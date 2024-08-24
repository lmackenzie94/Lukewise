import { HighlightCard } from '@/app/components/HighlightCard';
import { getBook, getBookHighlights } from '@/app/lib/readwise';
import Image from 'next/image';
import Link from 'next/link';

export const revalidate = 3600; // 1 hour

export default async function BookPage({ params }: { params: { id: string } }) {
  const book = await getBook(params.id);
  const highlights = await getBookHighlights(params.id);

  return (
    <main className="container max-w-screen-md">
      <div className="flex items-center gap-4 mb-8">
        {book.cover_image_url && (
          <Image
            src={book.cover_image_url}
            alt={book.title}
            width={100}
            height={100}
            className="rounded-full w-28 h-28"
          />
        )}
        <div>
          <h1 className="text-2xl font-bold">{book.title}</h1>
          <p className="text-sm text-gray-500">{book.author}</p>
          <p className="text-sm text-gray-500">Category: {book.category}</p>
          {book.last_highlight_at && (
            <p className="text-sm text-gray-500">
              Last Highlighted:{' '}
              {new Date(book.last_highlight_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </p>
          )}
          {book.source_url && (
            <Link
              href={book.source_url}
              target="_blank"
              className="text-sm text-gray-500"
            >
              View Source ({book.source})
            </Link>
          )}
          {book.num_highlights > 0 && (
            <p className="text-sm text-gray-500">
              {book.num_highlights} highlights
            </p>
          )}
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
