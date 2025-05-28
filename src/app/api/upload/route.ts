import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(request: Request) {
  console.log('API: Upload endpoint called');
  
  try {
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('filename');
    
    if (!filename) {
      console.error('API: Filename is required');
      return NextResponse.json(
        { error: 'Filename is required as a query parameter' },
        { status: 400 }
      );
    }
    
    console.log('API: Using filename from query params:', filename);
    
    // Make sure request body is not null
    if (!request.body) {
      console.error('API: Request body is null or empty');
      return NextResponse.json(
        { error: 'No file content found in request body' },
        { status: 400 }
      );
    }
    
    // Upload directly to Vercel Blob with allowOverwrite option
    console.log('API: Starting upload to Vercel Blob...');
    const blob = await put(filename, request.body, {
      access: 'public',
      allowOverwrite: true, // Allow overwriting existing files with the same name
    });
    
    console.log('API: Upload successful, URL:', blob.url);
    return NextResponse.json(blob);
  } catch (error) {
    console.error('API: Error uploading file:', error);
    return NextResponse.json(
      { error: 'Failed to upload file: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
} 