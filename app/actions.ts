'use server';

import { revalidatePath } from 'next/cache';
import { fetchReadwise } from './lib/readwise';

export const updateHighlight = async (
  formData: FormData
): Promise<{
  status: number;
  ok: boolean;
  message: string;
}> => {
  // check password
  const password = formData.get('password');
  if (password !== process.env.EDIT_PASSWORD) {
    return {
      ok: false,
      status: 401,
      message: 'Wrong password, my guy 🙅🏻‍♂️'
    };
  }

  const id = formData.get('id');
  const text = formData.get('text');
  const note = formData.get('note');

  const data = await fetchReadwise(`highlights/${id}/`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      text,
      note
    })
  });

  // TODO: better way to do this? use tags?
  revalidatePath(`/books/${data.book_id}`);
  revalidatePath(`/highlights/${id}`);

  return {
    ok: true,
    status: 200,
    message: 'Highlight updated'
  };
};

export const deleteHighlight = async (id: number, book_id: number) => {
  await fetchReadwise(`highlights/${id}/`, {
    method: 'DELETE'
  });

  revalidatePath(`/books/${book_id}`);
  revalidatePath(`/highlights/${id}`);
};
