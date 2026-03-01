import { NextRequest, NextResponse } from 'next/server';
import { searchPosts } from '@/lib/posts';
import { siteConfig } from '@/config/site';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const q = searchParams.get('q') ?? '';
    const occurrenceLimit = parseInt(
        searchParams.get('occurrenceLimit') ?? String(siteConfig.search.occurrenceLimit),
        10
    );
    const offset = parseInt(searchParams.get('offset') ?? '0', 10);

    // minimum of 2 characters to avoid too many results
    if (q.length < 2) {
        return NextResponse.json({ results: [], count: 0, totalArticles: 0, nextOffset: -1 });
    }

    const { results, totalOccurrences, totalArticles, nextOffset } = searchPosts(
        q,
        occurrenceLimit,
        offset
    );

    return NextResponse.json({
        results,
        count: totalOccurrences,
        totalArticles,
        nextOffset,
    });
}
