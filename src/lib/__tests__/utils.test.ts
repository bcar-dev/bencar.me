import { describe, it, expect } from 'vitest';
import { formatDate } from '../utils';

describe('formatDate', () => {
    it('formats a date string correctly', () => {
        expect(formatDate('2026-02-23')).toBe('Feb 23, 2026');
    });

    it('handles single digit days correctly', () => {
        expect(formatDate('2026-02-05')).toBe('Feb 5, 2026');
    });

    it('formats year correctly', () => {
        expect(formatDate('2025-12-31')).toBe('Dec 31, 2025');
    });
});
