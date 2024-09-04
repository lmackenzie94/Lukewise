'use server';

import { revalidatePath } from 'next/cache';
// import { redirect } from 'next/navigation';
import { addSummary, hideContentById } from '@/db/queries/insert';
import { unhideContentById } from '@/db/queries/delete';
import {
  updateHighlight as updateHighlightReadwise,
  deleteHighlight as deleteHighlightReadwise
} from './lib/readwise';
import OpenAI from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod';
import { z } from 'zod';

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

export const refreshAllContent = async (_: FormData) => {
  console.log('Refreshing all content');
  revalidatePath('/content');
};

const passwordIsCorrect = (formData: FormData) => {
  const password = formData.get('password');
  return password === process.env.EDIT_PASSWORD;
};

const openai = new OpenAI();

export const generateBookSummary = async (formData: FormData) => {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });

  const BookSummaryAndQuiz = z.object({
    summary: z.string(),
    quiz: z.array(
      z.object({
        question: z.string(),
        answer: z.string()
      })
    )
  });

  const bookId = formData.get('bookId') as string;
  const bookTitle = formData.get('bookTitle');
  const bookAuthor = formData.get('bookAuthor');
  const prompt = `Summarize the key actionable insights from the book "${bookTitle}" by "${bookAuthor}" in no more than 10 short bullet points. Use markdown formatting like bullet points, bold, italics, and numbered lists. Ensure the summary focuses on the most practical takeaways that can be applied by the reader. Afterward, generate a short 4-6 question quiz based on these insights. Each question should target a critical concept or actionable step presented in the book. For each question, provide informative answers with context, ensuring the answers focus on how the user can apply the information in real-life situations. The answers should be no longer than 5 sentences.`;

  const completion = await openai.beta.chat.completions.parse({
    model: 'gpt-4o-2024-08-06',
    messages: [
      {
        role: 'system',
        content: prompt
      }
      // { role: 'user', content: 'Quiet by Susan Cain' }
    ],
    response_format: zodResponseFormat(BookSummaryAndQuiz, 'summary')
  });

  const result = completion.choices[0].message.parsed;

  if (!result || !bookId) {
    return null;
  }

  const summary = JSON.stringify(result.summary);
  const quiz = JSON.stringify(result.quiz);

  await addSummary(parseInt(bookId), summary, quiz);

  revalidatePath(`/content/${bookId}`);

  return result;
};
