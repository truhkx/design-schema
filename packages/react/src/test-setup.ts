// Loaded by vitest.config.ts before every test file: jest-dom matchers (toBeChecked,
// toHaveFocus, toHaveAccessibleName…) on Vitest's expect, and DOM cleanup between tests.
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(() => cleanup());
