import { type NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

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
    return NextResponse.json({ revalidated: true, now: Date.now() });
  } catch (err) {
    // If there was an error, Next.js will continue
    // to show the last successfully generated page
    return NextResponse.json({ revalidated: false, now: Date.now() });
  }
}
