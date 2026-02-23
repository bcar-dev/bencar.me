import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import PostMeta from '../PostMeta';

describe('PostMeta', () => {
    const pubDatetime = '2026-02-23';
    const readingTime = '5 min read';

    it('renders the formatted date', () => {
        render(<PostMeta pubDatetime={pubDatetime} readingTime={readingTime} />);
        expect(screen.getByText('Feb 23, 2026')).toBeInTheDocument();
    });

    it('renders the reading time', () => {
        render(<PostMeta pubDatetime={pubDatetime} readingTime={readingTime} />);
        expect(screen.getByText('5 min read')).toBeInTheDocument();
    });

    it('has the correct datetime attribute on time element', () => {
        render(<PostMeta pubDatetime={pubDatetime} readingTime={readingTime} />);
        const timeElement = screen.getByText('Feb 23, 2026');
        expect(timeElement.closest('time')).toHaveAttribute('datetime', pubDatetime);
    });
});
