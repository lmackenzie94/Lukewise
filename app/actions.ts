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
  if (!passwordIsCorrect(formData)) {
    return {
      ok: false,
      status: 401,
      message: 'Wrong password 🙅🏻‍♂️'
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
  revalidatePath(`/content/${data.book_id}`);

  return {
    ok: true,
    status: 200,
    message: 'Highlight updated'
  };
};

export const deleteHighlight = async (
  formData: FormData
): Promise<{
  status: number;
  ok: boolean;
  message: string;
}> => {
  if (!passwordIsCorrect(formData)) {
    return {
      ok: false,
      status: 401,
      message: 'Wrong password 🙅🏻‍♂️'
    };
  }

  const highlightId = formData.get('highlight_id');
  const bookId = formData.get('book_id');

  await fetchReadwise(`highlights/${highlightId}/`, {
    method: 'DELETE'
  });

  revalidatePath(`/content/${bookId}`);

  return {
    ok: true,
    status: 200,
    message: 'Highlight deleted'
  };
};

const passwordIsCorrect = (formData: FormData) => {
  const password = formData.get('password');
  return password === process.env.EDIT_PASSWORD;
};
