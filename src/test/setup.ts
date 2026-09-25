import '@testing-library/jest-dom/vitest';

import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

/**
 * Registers jest-dom's matchers on Vitest's `expect` and unmounts the React tree after every test,
 * so no rendered component leaks into the next one.
 */
afterEach(() => {
  cleanup();
});
