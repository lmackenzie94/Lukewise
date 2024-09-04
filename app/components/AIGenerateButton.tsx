'use client';

import { useFormStatus } from 'react-dom';
import { MdAutoAwesome } from 'react-icons/md';

export const AIGenerateButton = () => {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      title="Generate summary"
      disabled={pending}
      className="bg-blue-500 text-white px-2 py-1 rounded-lg text-xs font-mono tracking-tight flex items-center gap-2 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <MdAutoAwesome aria-hidden="true" />
      {pending ? 'Generating...' : 'Generate summary'}
    </button>
  );
};
