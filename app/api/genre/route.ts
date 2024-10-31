// File: /app/api/top-airing/route.ts
import { NextResponse } from 'next/server';
import Gogoanime from '@consumet/extensions/dist/providers/anime/gogoanime';

export async function GET() {
  try {
    const gogoanime=new Gogoanime();
    const genre = await gogoanime.fetchGenreList();
    return NextResponse.json(genre);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch genre list' },
      { status: 500 }
    );
  }
}

