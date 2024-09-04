import { db } from '../index';
import {
  bookSummariesTable,
  hiddenContentTable,
  InsertBookSummary,
  InsertUser,
  usersTable
} from '../schema';

export async function createUser(data: InsertUser) {
  await db.insert(usersTable).values(data);
}

export async function hideContentById(contentId: number) {
  await db.insert(hiddenContentTable).values({ contentId });
}

export async function addSummary(data: InsertBookSummary) {
  const { bookId, summary, keyPoints, quiz } = data;
  await db
    .insert(bookSummariesTable)
    .values({ bookId, summary, keyPoints, quiz });
}
