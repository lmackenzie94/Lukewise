import Link from 'next/link';
import { navLinks, SITE_TITLE } from './constants';

const buttonColors = [
  'bg-purple-600',
  'bg-blue-600',
  'bg-green-600',
  'bg-red-600',
  'bg-yellow-600'
];

export default function Home() {
  return (
    <main className="container flex flex-col items-center justify-center pt-32">
      <div className="bg-white px-12 py-16 rounded-2xl shadow-lg text-center w-full max-w-lg">
        <h1 className="text-6xl font-black mb-12">{SITE_TITLE}</h1>

        {navLinks.map(({ label, href }, index) => (
          <Link
            href={href}
            key={href}
            className={`block text-2xl font-bold py-4 px-8 rounded-2xl text-white mb-4 ${
              buttonColors[index % buttonColors.length]
            }`}
          >
            {label}
          </Link>
        ))}
      </div>
    </main>
  );
}
