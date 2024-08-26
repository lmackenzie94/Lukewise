'use client';

import { ListHighlight } from '../types';
import { useState } from 'react';
import { deleteHighlight, updateHighlight } from '../actions';
import { FaEdit, FaSave, FaTimes, FaTrash, FaTrashAlt } from 'react-icons/fa';
import DOMPurify from 'dompurify';

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

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this highlight?')) {
      return;
    }

    await deleteHighlight(highlight.id, highlight.book_id);
  };

  const sanitizedText = DOMPurify.sanitize(highlight.text);

  return (
    <div key={highlight.id} className="bg-white p-6 rounded-md shadow-md">
      {isEditing && (
        <>
          <form action={handleSubmit} className="flex flex-col gap-2 text-sm">
            {/* TODO: pass the highlight id without a hidden input */}
            <input type="hidden" name="id" value={highlight.id} />
            <textarea name="text" defaultValue={highlight.text} rows={10} />
            <textarea name="note" defaultValue={highlight.note} rows={4} />

            {/* TODO: proper auth */}
            <input
              type="password"
              name="password"
              required
              placeholder="Password"
            />
            <div className="flex gap-2 text-lg">
              <button
                type="submit"
                className="bg-blue-500 text-white p-2 rounded-md flex items-center gap-2 flex-1 justify-center hover:bg-blue-600"
                title="Save highlight"
                aria-label="Save highlight"
              >
                <FaSave aria-hidden="true" />
                <span className="sr-only">Save highlight</span>
              </button>
              <button
                type="button"
                onClick={toggleEditing}
                className="bg-red-500 text-white p-2 rounded-md flex items-center gap-2 flex-1 justify-center hover:bg-red-600"
                title="Cancel"
                aria-label="Cancel"
              >
                <FaTimes aria-hidden="true" />
                <span className="sr-only">Cancel</span>
              </button>
            </div>
          </form>
        </>
      )}

      {!isEditing && (
        <>
          <p dangerouslySetInnerHTML={{ __html: sanitizedText }} />

          {highlight.note && (
            <details className="mt-4 text-sm bg-blue-50 rounded-md px-2 py-1">
              <summary className="text-sm font-bold">Luke&apos;s Note</summary>
              <p className="mt-2 p-2">{highlight.note}</p>
            </details>
          )}

          {!isEditing && (
            <div className="flex justify-end mt-4 gap-2">
              <button
                onClick={toggleEditing}
                className="text-blue-400 hover:text-blue-500 text-lg"
                title="Edit highlight"
                aria-label="Edit highlight"
              >
                <FaEdit aria-hidden="true" />
                <span className="sr-only">Edit highlight</span>
              </button>
              <button
                onClick={handleDelete}
                className="text-red-400 hover:text-red-500"
                title="Delete highlight"
                aria-label="Delete highlight"
              >
                <FaTrashAlt aria-hidden="true" />
                <span className="sr-only">Delete highlight</span>
              </button>
            </div>
          )}
        </>
      )}

      {error && <p className="text-red-500 mt-4">{error}</p>}
    </div>
  );
};
