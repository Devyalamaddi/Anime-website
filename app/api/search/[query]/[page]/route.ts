// app/api/search/[query]/[page]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Gogoanime from '@consumet/extensions/dist/providers/anime/gogoanime';

export async function GET(
  request: NextRequest,
  { params }: { params: { query: string; page: string } }
) {
  try {
    const gogoanime = new Gogoanime();
    const query = params.query;
    const page = parseInt(params.page) || 1;

    const searchResults = await gogoanime.search(query, page);
    return NextResponse.json(searchResults);
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Failed to perform search' },
      { status: 500 }
    );
  }
}