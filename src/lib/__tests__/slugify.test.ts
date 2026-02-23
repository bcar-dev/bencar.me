import { describe, it, expect } from 'vitest';
import { slugify } from '../slugify';

describe('slugify', () => {
    it('converts text to lowercase', () => {
        expect(slugify('HELLO WORLD')).toBe('hello-world');
    });

    it('removes special characters', () => {
        expect(slugify('Hello, World!')).toBe('hello-world');
    });

    it('replaces multiple spaces with a single hyphen', () => {
        expect(slugify('hello    world')).toBe('hello-world');
    });

    it('trims whitespace', () => {
        expect(slugify('  hello world  ')).toBe('hello-world');
    });
});
