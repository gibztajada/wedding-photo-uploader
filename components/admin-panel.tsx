'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';

interface CouplePhoto {
  id: string;
  image_url: string;
  created_at: string;
}

export function AdminPanel() {
  const [couplePhoto, setCouplePhoto] = useState<CouplePhoto | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchCouplePhoto();
  }, []);

  const fetchCouplePhoto = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/couple-photo');
      if (!response.ok) throw new Error('Failed to fetch couple photo');
      const data = await response.json();
      setCouplePhoto(data);
      if (data.image_url) {
        setPreview(data.image_url);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load couple photo');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setError('');

      // Create preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!selectedImage) {
      setError('Please select an image to upload');
      return;
    }

    setIsUploading(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      formData.append('image', selectedImage);

      const response = await fetch('/api/couple-photo', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const data = await response.json();
      setCouplePhoto(data);
      setSelectedImage(null);
      setSuccess('Couple photo updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-2xl mx-auto p-6 bg-card border border-border shadow-lg">
        <div className="flex items-center justify-center h-64">
          <Spinner className="w-6 h-6" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto p-6 bg-card border border-border shadow-lg">
      <h1 className="text-3xl font-bold text-center mb-2 text-foreground">
        Manage Couple Photo
      </h1>
      <p className="text-center text-muted-foreground mb-8">
        Upload the main wedding photo of the couple to display on the home page
      </p>

      <div className="space-y-6">
        {/* Current Photo */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground">
            Current Photo
          </label>
          {preview ? (
            <div className="relative w-full aspect-video rounded-lg overflow-hidden border-2 border-border bg-muted">
              <img
                src={preview || "/placeholder.svg"}
                alt="Couple photo"
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-full aspect-video rounded-lg border-2 border-dashed border-border bg-muted flex items-center justify-center">
              <p className="text-muted-foreground">No photo set yet</p>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Input */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              Select New Photo
            </label>
            <Input
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              disabled={isUploading}
              className="cursor-pointer"
            />
            <p className="text-xs text-muted-foreground">
              JPG, PNG or GIF (max file size: 10MB)
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/50 rounded-lg">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="p-3 bg-primary/10 border border-primary/50 rounded-lg">
              <p className="text-sm text-primary">{success}</p>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isUploading || !selectedImage}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {isUploading ? (
              <div className="flex items-center gap-2">
                <Spinner className="w-4 h-4" />
                Uploading...
              </div>
            ) : (
              'Update Couple Photo'
            )}
          </Button>
        </form>

        {/* Photo Info */}
        {couplePhoto && (
          <div className="p-3 bg-muted rounded-lg border border-border">
            <p className="text-xs text-muted-foreground">
              Last updated: {new Date(couplePhoto.created_at).toLocaleString()}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
