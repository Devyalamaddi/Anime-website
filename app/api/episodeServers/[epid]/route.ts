// File: /app/api/top-airing/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Gogoanime from '@consumet/extensions/dist/providers/anime/gogoanime';

export async function GET(request:NextRequest,{params}:{params:{epid:string}}) {
  try {
    const gogoanime=new Gogoanime();

    // const searchParams = request.nextUrl.searchParams;
    // const epid = searchParams.get('epid');
    const epid=params.epid;

    const epserver = await gogoanime.fetchEpisodeServers(epid);
    return NextResponse.json(epserver);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch ep server' },
      { status: 500 }
    );
  }
}

