import { db } from '../index';
import {
  bookSummariesTable,
  hiddenContentTable,
  InsertUser,
  usersTable
} from '../schema';

export async function createUser(data: InsertUser) {
  await db.insert(usersTable).values(data);
}

export async function hideContentById(contentId: number) {
  await db.insert(hiddenContentTable).values({ contentId });
}

export async function addSummary(
  bookId: number,
  summary: string,
  quiz: string
) {
  await db.insert(bookSummariesTable).values({ bookId, summary, quiz });
}
