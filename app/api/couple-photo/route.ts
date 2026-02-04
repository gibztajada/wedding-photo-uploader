import { supabase } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

// GET - Fetch the current couple photo
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('couple_photo')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // If no data exists, return null image_url
    if (!data) {
      return NextResponse.json({ image_url: null }, { status: 200 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to fetch couple photo: ${errorMessage}` },
      { status: 500 }
    );
  }
}

// POST - Upload and update couple photo
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get('image') as File | null;

    if (!imageFile) {
      return NextResponse.json(
        { error: 'Missing image file' },
        { status: 400 }
      );
    }

    // Create a Blob from the File
    const blob = new Blob([await imageFile.arrayBuffer()], {
      type: imageFile.type,
    });

    const fileExtension = imageFile.name.split('.').pop() || 'jpg';
    const fileName = `couple-${Date.now()}.${fileExtension}`;

    // Delete previous couple photos from storage
    const { data: files } = await supabase.storage
      .from('wedding-photos')
      .list('', { search: 'couple-' });

    if (files && files.length > 0) {
      const filesToDelete = files.map((f) => f.name);
      await supabase.storage
        .from('wedding-photos')
        .remove(filesToDelete);
    }

    // Upload new photo
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

    // Delete old couple photo records (keep only the latest one)
    const { data: allRecords } = await supabase
      .from('couple_photo')
      .select('id')
      .order('created_at', { ascending: false });

    if (allRecords && allRecords.length > 0) {
      const oldIds = allRecords.slice(0).map((r: any) => r.id);
      if (oldIds.length > 0) {
        await supabase.from('couple_photo').delete().in('id', oldIds);
      }
    }

    // Insert new couple photo record
    const { data: photoData, error: dbError } = await supabase
      .from('couple_photo')
      .insert({
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
