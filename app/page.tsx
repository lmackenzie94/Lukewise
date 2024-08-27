import Link from 'next/link';
import { NAV_LINKS, SITE_TITLE, SITE_DESCRIPTION } from './constants';
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

        {NAV_LINKS.map(({ label, href, colours, emoji }) => (
          <Link
            href={href}
            key={href}
            className={`block text-lg md:text-2xl font-bold py-4 px-8 rounded-2xl text-white mb-5 shadow-md font-mono tracking-tight ${colours.bg} hover:saturate-150`}
          >
            {label} {emoji}
          </Link>
        ))}
      </div>

      {/* <form
        className="mt-16 flex flex-col items-center justify-center"
        action={async (formData: FormData) => {
          'use server';
          const name = formData.get('name') as string;
          const age = formData.get('age') as string;
          const email = formData.get('email') as string;

          if (!name || !age || !email) {
            throw new Error('Missing required fields');
          }

          try {
            await createUser({
              name,
              age: parseInt(age),
              email
            });
          } catch (error) {
            console.error('Something went wrong', error);
          }
        }}
      >
        <input type="text" name="name" placeholder="Name" required />
        <input type="number" name="age" placeholder="Age" required />
        <input type="email" name="email" placeholder="Email" required />
        <button type="submit">Create User</button>
      </form> */}
    </main>
  );
}
