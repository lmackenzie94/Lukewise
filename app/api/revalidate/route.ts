import { type NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

// This endpoint is used by a Vercel cron job to revalidate the daily-review page and the content page
// CRON_SECRET is set in the Vercel dashboard
// The value of the variable will be automatically sent as an Authorization header when Vercel invokes your cron job.
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', {
      status: 401
    });
  }

  try {
    // Revalidate the daily-review page
    revalidatePath('/daily-review');
    // revalidate the content page
    revalidatePath('/content');
    return NextResponse.json({ revalidated: true, now: Date.now() });
  } catch (err) {
    // If there was an error, Next.js will continue
    // to show the last successfully generated page
    return NextResponse.json({ revalidated: false, now: Date.now() });
  }
}
