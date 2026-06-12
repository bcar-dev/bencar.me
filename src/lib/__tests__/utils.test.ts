import { describe, it, expect } from 'vitest';
import { formatDate, escapeRegex } from '../utils';

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

describe('escapeRegex', () => {
    it('escapes regex metacharacters', () => {
        expect(escapeRegex('a.b*c')).toBe('a\\.b\\*c');
        expect(escapeRegex('(x)[y]{z}')).toBe('\\(x\\)\\[y\\]\\{z\\}');
    });

    it('leaves plain text untouched', () => {
        expect(escapeRegex('hello world')).toBe('hello world');
    });

    it('produces a source usable in a RegExp', () => {
        const q = 'a+b';
        const re = new RegExp(escapeRegex(q));
        expect(re.test('xa+by')).toBe(true);
        expect(re.test('aXb')).toBe(false);
    });
});
