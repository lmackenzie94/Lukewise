'use client';

import { ListHighlight } from '../types';
import { useState } from 'react';
import { deleteHighlight, updateHighlight } from '../actions';
import {
  FaCheckCircle,
  FaEdit,
  FaSave,
  FaTimes,
  FaTrashAlt
} from 'react-icons/fa';
import DOMPurify from 'isomorphic-dompurify';
import { useFormStatus } from 'react-dom';

function SaveButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      className="bg-blue-500 text-white p-2 rounded-md flex items-center gap-2 flex-1 justify-center hover:bg-blue-600 disabled:bg-blue-300"
      title="Save highlight"
      aria-label="Save highlight"
      disabled={pending}
    >
      <FaSave aria-hidden="true" />
      <span className="sr-only">Save highlight</span>
    </button>
  );
}

function ConfirmDeleteButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      className="text-red-400 hover:text-red-500 disabled:text-red-300"
      title="Delete highlight"
      aria-label="Delete highlight"
      disabled={pending}
    >
      <FaCheckCircle aria-hidden="true" className="text-xl" />
      <span className="sr-only">Delete highlight</span>
    </button>
  );
}

export const HighlightCard = ({ highlight }: { highlight: ListHighlight }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
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

  const handleDelete = async (formData: FormData) => {
    const response = await deleteHighlight(formData);
    if (!response.ok) {
      setError(response.message);
      return;
    }

    setIsDeleting(false);
    setError(null);
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
            <textarea
              name="note"
              defaultValue={highlight.note}
              rows={4}
              placeholder="Add a note..."
            />

            {/* TODO: proper auth */}
            <input
              type="password"
              name="password"
              required
              placeholder="Password"
            />
            <div className="flex gap-2 text-lg">
              <SaveButton />
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
          <p
            className="text-sm sm:text-base whitespace-pre-line"
            dangerouslySetInnerHTML={{ __html: sanitizedText }}
          />

          {highlight.note && (
            <details className="mt-4 text-sm bg-blue-50 rounded-md px-2 py-1">
              <summary className="text-sm font-bold">Luke&apos;s Note</summary>
              <p className="mt-2 p-2">{highlight.note}</p>
            </details>
          )}

          {!isDeleting && (
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
                onClick={() => setIsDeleting(true)}
                className="text-red-400 hover:text-red-500"
                title="Delete highlight"
                aria-label="Delete highlight"
              >
                <FaTrashAlt aria-hidden="true" />
                <span className="sr-only">Delete highlight</span>
              </button>
            </div>
          )}

          {isDeleting && (
            <form
              action={handleDelete}
              className="flex gap-2 justify-end mt-4 text-sm"
            >
              <input type="hidden" name="highlight_id" value={highlight.id} />
              <input type="hidden" name="book_id" value={highlight.book_id} />
              <input
                type="password"
                name="password"
                required
                placeholder="Password"
              />
              <ConfirmDeleteButton />
              <button
                type="button"
                onClick={() => {
                  setIsDeleting(false);
                  setError(null);
                }}
                className="text-blue-400 hover:text-blue-500 text-lg"
                title="Cancel"
                aria-label="Cancel"
              >
                <FaTimes aria-hidden="true" />
                <span className="sr-only">Cancel</span>
              </button>
            </form>
          )}
        </>
      )}

      {error && <p className="text-red-500 mt-4 text-center">{error}</p>}
    </div>
  );
};
