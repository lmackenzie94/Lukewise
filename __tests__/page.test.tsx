import { expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import Page from '../app/page';
import { SITE_TITLE } from '../app/constants';

// REMEMBER: Vitest doesn't support async Server Components functions
test('Home page has the correct title', () => {
  render(<Page />);
  expect(
    screen.getByRole('heading', { level: 1, name: SITE_TITLE })
  ).toBeDefined();
});
