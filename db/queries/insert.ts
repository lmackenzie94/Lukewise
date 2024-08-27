import { db } from '../index';
import { hiddenContentTable, InsertUser, usersTable } from '../schema';

export async function createUser(data: InsertUser) {
  await db.insert(usersTable).values(data);
}

export async function hideContentById(contentId: number) {
  await db.insert(hiddenContentTable).values({ contentId });
}
