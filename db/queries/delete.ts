import { eq } from 'drizzle-orm';
import { db } from '../index';
import { hiddenContentTable } from '../schema';

export async function unhideContentById(contentId: number) {
  return db
    .delete(hiddenContentTable)
    .where(eq(hiddenContentTable.contentId, contentId));
}
