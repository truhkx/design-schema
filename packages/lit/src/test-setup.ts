// Loaded by vitest.config.ts before every test file: jest-dom matchers on Vitest's expect
// (they work on real DOM in the browser runner), the token stylesheet so :host rules resolve,
// and a clean document between tests.
import '@testing-library/jest-dom/vitest';
import tokensCss from '@design-schema/tokens/calm-precise/css?raw';
import { beforeEach } from 'vitest';

const style = document.createElement('style');
style.textContent = tokensCss;
document.head.append(style);

beforeEach(() => {
  document.body.replaceChildren();
});
