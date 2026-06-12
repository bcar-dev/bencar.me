import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/vue';
import { afterEach } from 'vitest';

// Automatically unmount and clean up Vue components after each test.
afterEach(() => {
    cleanup();
});
