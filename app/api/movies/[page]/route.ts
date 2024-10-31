// File: /app/api/movies/[page]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Gogoanime from '@consumet/extensions/dist/providers/anime/gogoanime';

export async function GET(
  request: NextRequest,
  { params }: { params: { page: string } }
) {
  try {
    const gogoanime = new Gogoanime();
    const pageNumber = parseInt(params.page);

    // Validate page parameter
    if (isNaN(pageNumber) || pageNumber < 1) {
      return NextResponse.json(
        { error: 'Invalid page number' },
        { status: 400 }
      );
    }

    const movies = await gogoanime.fetchRecentMovies(pageNumber);
    
    // Structure the response to include pagination info
    return NextResponse.json({
      currentPage: pageNumber,
      hasNextPage: movies.hasNextPage,
      totalPages: movies.totalPages, // GogoAnime usually has a max of ~100 pages
      results: movies.results || []
    });

  } catch (error) {
    console.error('Error fetching anime movies:', error);
    return NextResponse.json(
      { error: 'Failed to fetch anime movies' },
      { status: 500 }
    );
  }
}