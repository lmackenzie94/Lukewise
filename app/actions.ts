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
  highlightId: number,
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

  const text = formData.get('text') as string;
  const note = formData.get('note') as string;

  const updatedHighlight = await updateHighlightReadwise(
    highlightId.toString(),
    {
      text,
      note
    }
  );

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
  highlightId: number,
  bookId: number | null,
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

  await deleteHighlightReadwise(highlightId.toString());

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

export const refreshContent = async (bookId: number, _: FormData) => {
  console.log(`Refreshing content for book ${bookId}`);
  revalidatePath(`/content/${bookId}`);
};

const passwordIsCorrect = (formData: FormData) => {
  const password = formData.get('password');
  return password === process.env.EDIT_PASSWORD;
};
