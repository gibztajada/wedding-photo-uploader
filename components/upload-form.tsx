'use client';

import React from "react"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { X } from 'lucide-react';

interface PreviewItem {
  file: File;
  preview: string;
}

// Compress image using canvas
const compressImage = async (file: File, quality: number = 0.7, maxWidth: number = 1920, maxHeight: number = 1920): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions while maintaining aspect ratio
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to compress image'));
              return;
            }
            const compressedFile = new File([blob], file.name, { type: 'image/jpeg' });
            resolve(compressedFile);
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = () => reject(new Error('Failed to load image'));
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
  });
};

export function UploadForm() {
  const router = useRouter();
  const [selectedImages, setSelectedImages] = useState<PreviewItem[]>([]);
  const [guestName, setGuestName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [compressionProgress, setCompressionProgress] = useState('');
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setCompressionProgress('Preparing images...');
      const fileArray = Array.from(files);
      const newImages: PreviewItem[] = [];
      let processedCount = 0;

      // Compress images in parallel (max 3 at a time to avoid browser overload)
      const compressionPromises = fileArray.map(async (file) => {
        try {
          const compressedFile = await compressImage(file);
          const originalSize = (file.size / 1024 / 1024).toFixed(2);
          const compressedSize = (compressedFile.size / 1024 / 1024).toFixed(2);
          console.log(`[v0] Compressed: ${originalSize}MB → ${compressedSize}MB`);

          const reader = new FileReader();
          return new Promise<PreviewItem>((resolve, reject) => {
            reader.onload = (event) => {
              resolve({
                file: compressedFile,
                preview: event.target?.result as string,
              });
            };
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsDataURL(compressedFile);
          });
        } catch (err) {
          console.error('[v0] Compression error:', err);
          throw err;
        }
      });

      try {
        const compressedImages = await Promise.all(compressionPromises);
        setSelectedImages((prev) => [...prev, ...compressedImages]);
        setCompressionProgress('');
      } catch (err) {
        console.error('[v0] Compression error:', err);
        setError(err instanceof Error ? `Failed to process images: ${err.message}` : 'Failed to process images');
      }
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (selectedImages.length === 0 || !guestName.trim()) {
      setError('Please select at least one image and enter your name');
      return;
    }

    setIsLoading(true);
    setError('');
    setUploadProgress({});

    try {
      // Upload all images in parallel (max 4 concurrent uploads)
      const maxConcurrent = 4;
      const uploadPromises = selectedImages.map(async (imageItem, index) => {
        try {
          const formData = new FormData();
          formData.append('image', imageItem.file);
          formData.append('guestName', guestName);

          const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Upload failed');
          }

          setUploadProgress((prev) => ({
            ...prev,
            [index]: 100,
          }));
        } catch (err) {
          console.error(`[v0] Upload error for image ${index}:`, err);
          throw err;
        }
      });

      // Execute uploads with concurrency limit
      for (let i = 0; i < uploadPromises.length; i += maxConcurrent) {
        const batch = uploadPromises.slice(i, i + maxConcurrent);
        await Promise.all(batch);
      }

      // Redirect to gallery page
      router.push('/gallery');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto p-6 bg-card border border-border shadow-lg">
      <h1 className="text-3xl font-bold text-center mb-2 text-foreground">
        Share Your Moments
      </h1>
      <p className="text-center text-muted-foreground mb-8">
        Upload your wedding photos to share with other guests
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Image Previews Grid */}
        {selectedImages.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {selectedImages.map((item, index) => (
              <div
                key={index}
                className="relative aspect-square rounded-lg overflow-hidden border-2 border-border bg-muted"
              >
                <img
                  src={item.preview || "/placeholder.svg"}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                {/* Upload Progress Bar */}
                {isLoading && uploadProgress[index] !== undefined && (
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full border-4 border-white/30 border-t-white flex items-center justify-center">
                      <span className="text-white text-xs font-semibold">{uploadProgress[index]}%</span>
                    </div>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  disabled={isLoading}
                  className="absolute top-2 right-2 bg-destructive/90 hover:bg-destructive p-1 rounded-full transition-colors disabled:opacity-50"
                  title="Remove photo"
                >
                  <X className="w-4 h-4 text-destructive-foreground" />
                </button>
                <div className="absolute bottom-1 left-1 bg-primary/80 text-primary-foreground text-xs px-2 py-1 rounded">
                  {index + 1}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Image Input */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground">
            Select Your Photos
          </label>
          <Input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageSelect}
            disabled={isLoading || compressionProgress !== ''}
            className="cursor-pointer"
          />
          <p className="text-xs text-muted-foreground">
            You can select multiple photos at once. Images are automatically compressed to optimize storage.
          </p>
          {compressionProgress && (
            <p className="text-xs text-primary">{compressionProgress}</p>
          )}
        </div>

        {/* Name Input */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground">
            Your Name
          </label>
          <Input
            type="text"
            placeholder="Enter your name"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            disabled={isLoading}
            className="text-foreground placeholder:text-muted-foreground"
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/50 rounded-lg">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {/* Photo Count */}
        {selectedImages.length > 0 && (
          <p className="text-sm text-muted-foreground text-center">
            {selectedImages.length} photo{selectedImages.length !== 1 ? 's' : ''} selected
          </p>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isLoading || selectedImages.length === 0 || !guestName.trim()}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Spinner className="w-4 h-4" />
              Uploading {selectedImages.length} photo{selectedImages.length !== 1 ? 's' : ''}...
            </div>
          ) : (
            `Upload ${selectedImages.length > 0 ? selectedImages.length : ''} Photo${selectedImages.length !== 1 ? 's' : ''}`
          )}
        </Button>
      </form>
    </Card>
  );
}
