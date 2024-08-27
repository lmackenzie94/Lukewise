'use server';

import { revalidatePath } from 'next/cache';
import { fetchReadwise } from './lib/readwise';
// import { redirect } from 'next/navigation';
import { hideContentById } from '@/db/queries/insert';
import { unhideContentById } from '@/db/queries/delete';
import {
  updateHighlight as updateHighlightReadwise,
  deleteHighlight as deleteHighlightReadwise
} from './lib/readwise';

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

  const id = formData.get('id') as string;
  const text = formData.get('text') as string;
  const note = formData.get('note') as string;

  const updatedHighlight = await updateHighlightReadwise(id, {
    text,
    note
  });

  if (!updatedHighlight) {
    return {
      ok: false,
      status: 500,
      message: 'Failed to update highlight'
    };
  }

  if (updatedHighlight.book_id) {
    revalidatePath(`/content/${updatedHighlight.book_id}`);
  }

  revalidatePath('/favourites');
  revalidatePath('/daily-review');

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

  const highlightId = formData.get('highlight_id') as string;
  const bookId = formData.get('book_id') as string;

  await deleteHighlightReadwise(highlightId);

  if (bookId) {
    revalidatePath(`/content/${bookId}`);
  }

  revalidatePath('/favourites');
  revalidatePath('/daily-review');

  return {
    ok: true,
    status: 200,
    message: 'Highlight deleted'
  };
};

export const hideContent = async (formData: FormData) => {
  // if (!passwordIsCorrect(formData)) {
  //   return {
  //     ok: false,
  //     status: 401,
  //     message: 'Wrong password 🙅🏻‍♂️'
  //   };
  // }

  const contentId = formData.get('contentId');

  if (!contentId) {
    return {
      ok: false,
      status: 400,
      message: 'Content ID is required'
    };
  }

  await hideContentById(Number(contentId));

  revalidatePath(`/content/${contentId}`);
  revalidatePath('/content');
  revalidatePath('/favourites');
  revalidatePath('/daily-review');

  // redirect('/content');
};

export const unhideContent = async (formData: FormData) => {
  const contentId = formData.get('contentId');

  if (!contentId) {
    return {
      ok: false,
      status: 400,
      message: 'Content ID is required'
    };
  }

  await unhideContentById(Number(contentId));

  revalidatePath(`/content/${contentId}`);
  revalidatePath('/content');
  revalidatePath('/favourites');
  revalidatePath('/daily-review');

  // redirect('/content');
};

const passwordIsCorrect = (formData: FormData) => {
  const password = formData.get('password');
  return password === process.env.EDIT_PASSWORD;
};
