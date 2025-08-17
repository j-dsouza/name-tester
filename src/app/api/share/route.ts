import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateShortlink } from '@/utils/shortlink';
import { AppState } from '@/consts/app';

export async function POST(request: NextRequest) {
  try {
    const data: AppState = await request.json();
    
    // Validate that we have the required data
    if (!data || typeof data !== 'object') {
      return NextResponse.json(
        { error: 'Invalid data provided' },
        { status: 400 }
      );
    }

    // Generate a unique shortlink
    let shortlink: string;
    let attempts = 0;
    const maxAttempts = 5;

    do {
      shortlink = generateShortlink(data);
      attempts++;
      
      // Check if this shortlink already exists
      const existing = await prisma.sharedLink.findUnique({
        where: { shortlink }
      });
      
      if (!existing) break;
      
      if (attempts >= maxAttempts) {
        return NextResponse.json(
          { error: 'Failed to generate unique shortlink' },
          { status: 500 }
        );
      }
    } while (true);

    // Save to database
    const sharedLink = await prisma.sharedLink.create({
      data: {
        shortlink,
        data: data as any, // Prisma will handle the JSON serialization
      }
    });

    // Infer the base URL from the request
    const protocol = request.headers.get('x-forwarded-proto') || 'https';
    const host = request.headers.get('host') || request.headers.get('x-forwarded-host');
    const baseUrl = host ? `${protocol}://${host}` : 'https://name-tester-app.fly.dev';

    // Return the shortlink
    return NextResponse.json({
      shortlink: sharedLink.shortlink,
      url: `${baseUrl}/load/${sharedLink.shortlink}`
    });

  } catch (error) {
    console.error('Error creating shared link:', error);
    
    // Check for various database connection/timeout errors
    if (error instanceof Error) {
      const errorMessage = error.message.toLowerCase();
      
      // Database connection errors, timeout errors, or engine startup issues
      if (errorMessage.includes('database') || 
          errorMessage.includes('timeout') || 
          errorMessage.includes('connect') ||
          errorMessage.includes('engine') ||
          errorMessage.includes('prisma')) {
        return NextResponse.json(
          { error: 'Database unavailable' },
          { status: 503 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}