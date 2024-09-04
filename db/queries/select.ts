import { eq } from 'drizzle-orm';
import { db } from '../index';
import { bookSummariesTable, SelectUser, usersTable } from '../schema';

export async function getUserById(id: SelectUser['id']): Promise<
  Array<{
    id: number;
    name: string;
    age: number;
    email: string;
  }>
> {
  return db.select().from(usersTable).where(eq(usersTable.id, id));
}

export async function getHiddenContent() {
  return db.query.hiddenContentTable.findMany();
}

// TODO: retrun single object, not array
export async function getBookSummary(bookId: number) {
  return db
    .select()
    .from(bookSummariesTable)
    .where(eq(bookSummariesTable.bookId, bookId));
}

// export async function getPostsForLast24Hours(
//   page = 1,
//   pageSize = 5
// ): Promise<
//   Array<{
//     id: number;
//     title: string;
//   }>
// > {
//   return db
//     .select({
//       id: postsTable.id,
//       title: postsTable.title
//     })
//     .from(postsTable)
//     .where(gt(postsTable.createdAt, sql`(datetime('now','-24 hour'))`))
//     .orderBy(asc(postsTable.title), asc(postsTable.id))
//     .limit(pageSize)
//     .offset((page - 1) * pageSize);
// }
