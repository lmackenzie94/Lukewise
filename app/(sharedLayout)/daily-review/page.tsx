import Image from 'next/image';
import { getDailyReview } from '@/app/lib/readwise';
import { ReviewHighlight } from '../../types';
import Link from 'next/link';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import { Metadata } from 'next';
import { SITE_DESCRIPTION, SITE_TITLE } from '@/app/constants';

export const metadata: Metadata = {
  title: `${SITE_TITLE} | Daily Review`,
  description: SITE_DESCRIPTION
};

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
      <p className="text-blue-500 mb-1 text-sm sm:text-base text-center font-medium">
        {todaysDate}
      </p>
      <h1 className="text-3xl sm:text-4xl font-bold mb-8 text-center">
        Daily Review
      </h1>
      <HighlightStack currentHighlight={currentHighlight} />

      <p className="text-center mt-4 text-gray-500 text-sm">
        {currentHighlightIdx + 1} of {highlightsToReview}
      </p>

      {/* next and previous links */}
      <div className="flex justify-center gap-4 mt-6 text-xl">
        {currentHighlightIdx > 0 && (
          <Link
            href={`/daily-review?highlight=${currentHighlightIdx - 1}`}
            className="bg-blue-500 text-white p-4 rounded-full hover:bg-blue-600"
            aria-label="Previous highlight"
          >
            <FaArrowLeft aria-hidden={true} />
            <span className="sr-only">Previous highlight</span>
          </Link>
        )}
        {currentHighlightIdx < highlightsToReview - 1 && (
          <Link
            href={`/daily-review?highlight=${currentHighlightIdx + 1}`}
            className="bg-green-500 text-white p-4 rounded-full hover:bg-green-600"
            aria-label="Next highlight"
          >
            <FaArrowRight aria-hidden={true} />
            <span className="sr-only">Next highlight</span>
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
        <div className="flex items-center gap-4 mb-7">
          {currentHighlight.image_url && (
            <Image
              src={currentHighlight.image_url}
              alt={currentHighlight.title}
              width={200}
              height={200}
              className="rounded-full w-12 h-12"
            />
          )}
          <div>
            <h2 className="text-base sm:text-lg font-bold">
              {currentHighlight.title}
            </h2>
            {currentHighlight.author && (
              <p className="text-gray-500 text-xs sm:text-sm">
                {currentHighlight.author}
              </p>
            )}
          </div>
        </div>
        <p className="text-sm sm:text-base">{currentHighlight.text}</p>
      </div>
    </div>
  );
}
