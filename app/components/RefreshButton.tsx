'use client';

import { useFormStatus } from 'react-dom';
import { FaSync } from 'react-icons/fa';

export const RefreshButton = () => {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      title="Refresh"
      disabled={pending}
      className="disabled:opacity-50 disabled:cursor-not-allowed disabled:animate-spin"
    >
      <FaSync aria-hidden="true" />
      <span className="sr-only">Refresh</span>
    </button>
  );
};
