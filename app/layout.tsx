import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Lukewise',
  description: 'My personal Readwise'
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col mb-24">{children}</body>
    </html>
  );
}
