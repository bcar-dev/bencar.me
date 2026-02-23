import { NextRequest, NextResponse } from 'next/server';
import { searchPosts } from '@/lib/posts';

export async function GET(request: NextRequest) {
    const q = request.nextUrl.searchParams.get('q') ?? '';

    // minimum of 2 characters to avoid too many results
    if (q.length < 2) {
        return NextResponse.json({ results: [], count: 0 });
    }

    const results = searchPosts(q);

    return NextResponse.json({ results, count: results.length });
}
