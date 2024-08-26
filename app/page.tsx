import Link from 'next/link';
import { navLinks, SITE_TITLE, SITE_DESCRIPTION } from './constants';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: `${SITE_TITLE} | Home`,
  description: SITE_DESCRIPTION
};

export default function Home() {
  return (
    <main className="container flex flex-col items-center justify-center pt-24 sm:pt-32">
      <div className="bg-white p-8 sm:p-16 rounded-2xl shadow-lg text-center w-full max-w-xl">
        <h1 className="text-4xl md:text-5xl font-black mb-8 pb-6 border-b">
          {SITE_TITLE}
        </h1>

        {navLinks.map(({ label, href, colours, emoji }) => (
          <Link
            href={href}
            key={href}
            className={`block text-lg md:text-2xl font-bold py-4 px-8 rounded-2xl text-white mb-5 shadow-md font-mono tracking-tight ${colours.bg} hover:saturate-150`}
          >
            {label} {emoji}
          </Link>
        ))}
      </div>
    </main>
  );
}
