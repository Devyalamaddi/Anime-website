// File: /app/api/top-airing/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Gogoanime from '@consumet/extensions/dist/providers/anime/gogoanime';

export async function GET(request:NextRequest,{params}:{params:{epid:string}}) {
  try {
    const gogoanime=new Gogoanime();

    // const searchParams = request.nextUrl.searchParams;
    // const epid = searchParams.get('epid');
    const epid=params.epid;
    console.log('server')
    const epsource = await gogoanime.fetchEpisodeSources(epid);
    console.log(epsource)
    return NextResponse.json(epsource);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch ep source' },
      { status: 500 }
    );
  }
}

