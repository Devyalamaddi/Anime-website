// app/api/blur-placeholder/route.ts
import sharp from 'sharp';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Get the src parameter from the URL
  const { searchParams } = new URL(request.url);
  const src = searchParams.get('src');

  if (!src) {
    return NextResponse.json(
      { error: 'Source URL is required' },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(src);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const blurredBuffer = await sharp(buffer)
      .resize(10, 10, { fit: 'inside' })
      .blur(5)
      .jpeg({ quality: 50 }) // Added quality option for smaller size
      .toBuffer();

    // Properly formatted template literal
    const blurDataUrl = `data:image/jpeg;base64,${blurredBuffer.toString('base64')}`;

    return NextResponse.json({ blurDataUrl });

  } catch (error) {
    console.error('Error generating blur placeholder:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate blur placeholder',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Add OPTIONS method to handle CORS preflight requests
export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    }
  );
}
