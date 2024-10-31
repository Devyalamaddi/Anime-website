// File: /app/api/search/route.ts
import { NextResponse } from 'next/server';
import { type NextRequest } from 'next/server';
import Gogoanime from '@consumet/extensions/dist/providers/anime/gogoanime';

export async function GET(
  request: NextRequest,
  { params }: { params: { genre: string ,page:number} }
) {
  try {
    const genre = params.genre;
    const page = params.page|| 1;

    // Validate query parameter
    if (!genre) {
      return NextResponse.json(
        { error: 'Search genre is required' },
        { status: 400 }
      );
    }
    
    // Validate page parameter
    if (isNaN(page) || page < 1) {
      return NextResponse.json(
        { error: 'Invalid page number' },
        { status: 400 }
      );
    }
    const gogoanime=new Gogoanime();
    const genreSearchResults = await gogoanime.fetchGenreInfo(genre, page);
    
    return NextResponse.json(genreSearchResults);
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Failed to perform search' },
      { status: 500 }
    );
  }
}