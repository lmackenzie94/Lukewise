'use client';

import { ListHighlight } from '../types';
import { useState } from 'react';
import { updateHighlight } from '../actions';

export const HighlightCard = ({ highlight }: { highlight: ListHighlight }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleEditing = () => {
    setIsEditing(prev => !prev);
    setError(null);
  };

  const handleSubmit = async (formData: FormData) => {
    const response = await updateHighlight(formData);
    if (!response.ok) {
      setError(response.message);
      return;
    }

    setIsEditing(false);
    setError(null);
  };

  console.log(error);

  return (
    <div key={highlight.id} className="bg-white p-6 rounded-md shadow-md">
      {isEditing && (
        <>
          <form action={handleSubmit} className="flex flex-col gap-2">
            {/* TODO: pass the highlight id without a hidden input */}
            <input type="hidden" name="id" value={highlight.id} />
            <input type="text" name="text" defaultValue={highlight.text} />
            <textarea name="note" defaultValue={highlight.note} />

            {/* TODO: proper auth */}
            <input
              type="password"
              name="password"
              required
              placeholder="Password"
            />
            <button
              type="submit"
              className="bg-blue-500 text-white p-2 rounded-md mb-2"
            >
              Save
            </button>
          </form>
          <button
            type="button"
            onClick={toggleEditing}
            className="bg-red-500 text-white p-2 rounded-md block w-full"
          >
            Cancel
          </button>
        </>
      )}

      {!isEditing && (
        <>
          <p>{highlight.text}</p>

          {highlight.note && (
            <details className="mt-4 text-sm bg-blue-50 rounded-md px-2 py-1">
              <summary className="text-sm font-bold">Luke&apos;s Note</summary>
              <p className="mt-2 p-2">{highlight.note}</p>
            </details>
          )}

          {!isEditing && (
            <button
              onClick={toggleEditing}
              className="bg-blue-500 text-white py-1 px-4 rounded-md mt-4 text-sm"
            >
              Edit
            </button>
          )}
        </>
      )}

      {error && <p className="text-red-500 mt-4">{error}</p>}
    </div>
  );
};
