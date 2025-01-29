import 'server-only';

import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schema';

config({ path: '.env.local' });

const client = createClient({
  url: process.env.TURSO_CONNECTION_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
  fetch: (request: Request) => {
    return fetch(request, {
      cache: 'force-cache',
      next: {
        revalidate: false
      }
    });
  }
});

export const db = drizzle(client, { schema });
