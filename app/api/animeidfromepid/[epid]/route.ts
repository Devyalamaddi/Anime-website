// File: /app/api/top-airing/[page]/[type]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Gogoanime from '@consumet/extensions/dist/providers/anime/gogoanime';

export async function GET(request: NextRequest, { params }: { params: {epid:string} }) {
  try {
    const gogoanime = new Gogoanime();

    // Convert page param to a number
    const epid=params.epid
    // Fetch recent episodes using Gogoanime API
    const recents = await gogoanime.fetchAnimeIdFromEpisodeId(epid);
    
    return NextResponse.json(recents);
  } catch (error) {
    console.error('Error fetching recent episodes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch animeid fro epid' },
      { status: 500 }
    );
  }
}
