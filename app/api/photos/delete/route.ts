import { supabase } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { photoId, storagePath } = await request.json();

    console.log('[v0] Deleting photo:', photoId, 'Path:', storagePath);

    if (!photoId || !storagePath) {
      console.error('[v0] Missing photoId or storagePath');
      return NextResponse.json(
        { error: 'Missing photoId or storagePath' },
        { status: 400 }
      );
    }

    // First, verify the photo exists before deleting
    const { data: existingPhoto, error: fetchError } = await supabase
      .from('photos')
      .select('id')
      .eq('id', photoId)
      .single();

    if (fetchError) {
      console.error('[v0] Error fetching photo:', fetchError);
    } else if (!existingPhoto) {
      console.log('[v0] Photo not found:', photoId);
    } else {
      console.log('[v0] Photo exists, proceeding with delete:', photoId);
    }

    // Delete from database
    const { error: dbError, data: deleteResult } = await supabase
      .from('photos')
      .delete()
      .eq('id', photoId)
      .select();

    if (dbError) {
      console.error('[v0] Database delete error:', dbError);
      console.error('[v0] Error code:', dbError.code);
      console.error('[v0] Error message:', dbError.message);
      return NextResponse.json(
        { error: `Failed to delete photo record: ${dbError.message}` },
        { status: 500 }
      );
    }

    console.log('[v0] Delete result:', deleteResult);
    console.log('[v0] Photo record deleted from database');

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('wedding-photos')
      .remove([storagePath]);

    if (storageError) {
      console.error('[v0] Storage delete error:', storageError);
    } else {
      console.log('[v0] Photo file deleted from storage');
    }

    console.log('[v0] Photo fully deleted:', photoId);
    return NextResponse.json({ success: true, photoId }, { status: 200 });
  } catch (error) {
    console.error('[v0] Delete photo error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to delete photo: ${errorMessage}` },
      { status: 500 }
    );
  }
}
