import { NextRequest, NextResponse } from 'next/server';
import { uploadToYouTube } from '@/lib/youtube';
import * as db from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const videoFile = formData.get('video') as File;
    const metadataJson = formData.get('metadata') as string;

    if (!videoFile || !metadataJson) {
      return NextResponse.json(
        { error: 'Video file and metadata are required' },
        { status: 400 }
      );
    }

    const metadata = JSON.parse(metadataJson);
    const { title, description, tags, privacy, channelId } = metadata;

    if (!title || !channelId) {
      return NextResponse.json(
        { error: 'Title and channelId are required' },
        { status: 400 }
      );
    }

    // Create upload record
    const upload = await db.createUpload({
      channelId,
      title,
      description: description || '',
      tags: tags || [],
      privacy: privacy || 'private',
      status: 'uploading',
      youtubeVideoId: '',
      youtubeUrl: '',
      errorMessage: '',
    });

    try {
      const result = await uploadToYouTube({
        videoBlob: videoFile,
        videoFilename: videoFile.name || 'recording.webm',
        title,
        description: description || '',
        tags: tags || [],
        channelId,
        privacyStatus: privacy || 'private',
      });

      // Update upload record with success
      await db.updateUpload(upload.id, {
        status: 'completed',
        youtubeVideoId: result.youtubeVideoId,
        youtubeUrl: result.youtubeUrl,
      });

      return NextResponse.json({
        success: true,
        youtubeUrl: result.youtubeUrl,
        youtubeVideoId: result.youtubeVideoId,
        uploadId: upload.id,
      });
    } catch (uploadError) {
      // Update upload record with failure
      await db.updateUpload(upload.id, {
        status: 'failed',
        errorMessage: (uploadError as Error).message,
      });

      throw uploadError;
    }
  } catch (error) {
    console.error('Upload failed:', error);
    return NextResponse.json(
      { error: (error as Error).message || 'Upload failed' },
      { status: 500 }
    );
  }
}
