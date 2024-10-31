// File: /app/api/top-airing/[page]/[type]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Gogoanime from '@consumet/extensions/dist/providers/anime/gogoanime';

export async function GET(request: NextRequest, { params }: { params: { page: number, type: number } }) {
  try {
    const gogoanime = new Gogoanime();

    // Convert page param to a number
    const page = params.page||1;
    const typeofep = params.type;

    if (isNaN(page) ||page<1) {
      return NextResponse.json({ error: 'Invalid page number' }, { status: 400 });
    }

    // Fetch recent episodes using Gogoanime API
    const recents = await gogoanime.fetchRecentEpisodes(page, typeofep);
    
    return NextResponse.json(recents);
  } catch (error) {
    console.error('Error fetching recent episodes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch episodes' },
      { status: 500 }
    );
  }
}
