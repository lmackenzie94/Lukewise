import Image from 'next/image';
import { getDailyReview } from '@/app/lib/readwise';
import { ReviewHighlight } from '../../types';
import Link from 'next/link';

export default async function Home({
  searchParams
}: {
  searchParams: { highlight: string };
}) {
  const dailyReview = await getDailyReview();

  const todaysDate = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
  const highlightsToReview = dailyReview.highlights.length;
  const currentHighlightIdx = searchParams.highlight
    ? parseInt(searchParams.highlight)
    : 0;

  const currentHighlight = dailyReview.highlights[currentHighlightIdx];

  return (
    <main className="container max-w-screen-sm mx-auto">
      <p className="text-blue-500 mb-2 text-center font-semibold">
        {todaysDate}
      </p>
      <h1 className="text-4xl font-bold mb-14 text-center">Daily Review</h1>
      <HighlightStack currentHighlight={currentHighlight} />

      <p className="text-center mt-4 text-gray-500">
        {currentHighlightIdx + 1} of {highlightsToReview}
      </p>

      {/* next and previous links */}
      <div className="flex justify-center gap-4 mt-12">
        {currentHighlightIdx > 0 && (
          <Link
            href={`/daily-review?highlight=${currentHighlightIdx - 1}`}
            className="bg-blue-500 text-white px-4 py-2 rounded-md"
          >
            Previous
          </Link>
        )}
        {currentHighlightIdx < highlightsToReview - 1 && (
          <Link
            href={`/daily-review?highlight=${currentHighlightIdx + 1}`}
            className="bg-green-500 text-white px-4 py-2 rounded-md"
          >
            Next
          </Link>
        )}
      </div>
    </main>
  );
}

function HighlightStack({
  currentHighlight
}: {
  currentHighlight: ReviewHighlight;
}) {
  return (
    <div className="relative">
      {/* fake cards */}
      {Array.from({ length: 5 }).map((_, idx) => {
        const randRotation = Math.round(Math.random() * 6 - 3);
        return (
          <div
            key={idx}
            aria-hidden={true}
            className={`absolute bg-gray-50 rounded-md shadow-md inset-0`}
            style={{ transform: `rotate(${randRotation}deg)` }}
          ></div>
        );
      })}
      {/* current highlight */}

      <div
        key={currentHighlight.id}
        className="relative bg-white rounded-md shadow-md p-6 sm:p-8"
      >
        <div className="flex items-center gap-4 mb-8">
          {currentHighlight.image_url && (
            <Image
              src={currentHighlight.image_url}
              alt={currentHighlight.title}
              width={200}
              height={200}
              className="rounded-full w-14 h-14"
            />
          )}
          <div>
            <h2 className="text-lg font-bold">{currentHighlight.title}</h2>
            {currentHighlight.author && (
              <p className="text-gray-500 text-sm">{currentHighlight.author}</p>
            )}
          </div>
        </div>
        <p>{currentHighlight.text}</p>
      </div>
    </div>
  );
}
