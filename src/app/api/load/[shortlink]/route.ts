import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateShortlink } from '@/utils/shortlink';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shortlink: string }> }
) {
  try {
    const { shortlink } = await params;

    // Validate shortlink format
    if (!validateShortlink(shortlink)) {
      return NextResponse.json(
        { error: 'Invalid shortlink format' },
        { status: 400 }
      );
    }

    // Find the shared link in database
    const sharedLink = await prisma.sharedLink.findUnique({
      where: { shortlink }
    });

    if (!sharedLink) {
      return NextResponse.json(
        { error: 'Shortlink not found' },
        { status: 404 }
      );
    }

    // Update access tracking
    await prisma.sharedLink.update({
      where: { shortlink },
      data: {
        lastAccessed: new Date(),
        accessCount: {
          increment: 1
        }
      }
    });

    // Return the data
    return NextResponse.json({
      data: sharedLink.data,
      createdAt: sharedLink.createdAt,
      accessCount: sharedLink.accessCount + 1 // Include the current access
    });

  } catch (error) {
    console.error('Error loading shared link:', error);
    
    // Check if it's a database connection error
    if (error instanceof Error && error.message.includes('database')) {
      return NextResponse.json(
        { error: 'Database unavailable' },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}