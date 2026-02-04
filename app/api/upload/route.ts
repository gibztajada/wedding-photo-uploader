import { supabase } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // Get fields individually
    const imageFile = formData.get('image') as File | null;
    const guestName = formData.get('guestName') as string | null;

    if (!imageFile || !guestName) {
      return NextResponse.json(
        { error: 'Missing image or guest name' },
        { status: 400 }
      );
    }

    if (typeof guestName !== 'string' || !guestName.trim()) {
      return NextResponse.json(
        { error: 'Guest name cannot be empty' },
        { status: 400 }
      );
    }

    // Create a Blob from the File
    const blob = new Blob([await imageFile.arrayBuffer()], {
      type: imageFile.type,
    });

    const fileExtension = imageFile.name.split('.').pop() || 'jpg';
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExtension}`;

    // Upload to Supabase Storage using Blob
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('wedding-photos')
      .upload(fileName, blob, {
        contentType: imageFile.type,
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json(
        { error: `Failed to upload image: ${uploadError.message}` },
        { status: 500 }
      );
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from('wedding-photos').getPublicUrl(fileName);

    // Save metadata to database
    const { data: photoData, error: dbError } = await supabase
      .from('photos')
      .insert({
        guest_name: guestName.trim(),
        image_url: publicUrl,
        storage_path: uploadData?.path || fileName,
      })
      .select()
      .single();

    if (dbError) {
      return NextResponse.json(
        { error: `Failed to save photo: ${dbError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json(photoData, { status: 201 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Internal server error: ${errorMessage}` },
      { status: 500 }
    );
  }
}
