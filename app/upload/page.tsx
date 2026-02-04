'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { RomanticLayout, RomanticCard } from '@/components/romantic-layout';
import { Camera, X, Upload, Heart, ImagePlus } from 'lucide-react';

interface PreviewItem {
  file: File;
  preview: string;
}

// Compress image using canvas
const compressImage = async (
  file: File,
  quality: number = 0.7,
  maxWidth: number = 1920,
  maxHeight: number = 1920
): Promise<File> => {
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

export default function UploadPage() {
  const router = useRouter();
  const [selectedImages, setSelectedImages] = useState<PreviewItem[]>([]);
  const [guestName, setGuestName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [compressionProgress, setCompressionProgress] = useState('');
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setCompressionProgress('Preparing your beautiful memories...');
      const fileArray = Array.from(files);

      const compressionPromises = fileArray.map(async (file) => {
        try {
          const compressedFile = await compressImage(file);
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
          console.error('Compression error:', err);
          throw err;
        }
      });

      try {
        const compressedImages = await Promise.all(compressionPromises);
        setSelectedImages((prev) => [...prev, ...compressedImages]);
        setCompressionProgress('');
      } catch (err) {
        setError(
          err instanceof Error ? `Failed to process images: ${err.message}` : 'Failed to process images'
        );
        setCompressionProgress('');
      }
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (selectedImages.length === 0 || !guestName.trim()) {
      setError('Please select at least one photo and enter your name');
      return;
    }

    setIsLoading(true);
    setError('');
    setUploadProgress({});

    try {
      const maxConcurrent = 4;
      const uploadPromises = selectedImages.map(async (imageItem, index) => {
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
      });

      for (let i = 0; i < uploadPromises.length; i += maxConcurrent) {
        const batch = uploadPromises.slice(i, i + maxConcurrent);
        await Promise.all(batch);
      }

      router.push('/gallery');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <RomanticLayout
      title="Share Your Moments"
      subtitle="Upload your cherished photos to share with everyone"
      showBack={true}
    >
      <div className="relative mx-auto max-w-2xl">
        <RomanticCard>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Image Previews Grid */}
            {selectedImages.length > 0 && (
              <div
                className={`grid grid-cols-2 gap-3 md:grid-cols-3 transition-all duration-500 ${
                  isVisible ? 'opacity-100' : 'opacity-0'
                }`}
              >
                {selectedImages.map((item, index) => (
                  <div
                    key={index}
                    className="group relative aspect-square overflow-hidden rounded-xl border-2 border-pink-100 bg-pink-50 shadow-sm transition-all duration-300 hover:shadow-md"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <img
                      src={item.preview || '/placeholder.svg'}
                      alt={`Preview ${index + 1}`}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    {/* Upload Progress */}
                    {isLoading && uploadProgress[index] !== undefined && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full border-4 border-white/30 border-t-white">
                          <span className="text-xs font-semibold text-white">
                            {uploadProgress[index]}%
                          </span>
                        </div>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      disabled={isLoading}
                      className="absolute right-2 top-2 rounded-full bg-white/90 p-1.5 shadow-md transition-all duration-200 hover:bg-[#e91e8c] hover:text-white disabled:opacity-50"
                      title="Remove photo"
                    >
                      <X className="h-3 w-3" />
                    </button>
                    <div className="absolute bottom-1.5 left-1.5 rounded-full bg-[#e91e8c]/90 px-2 py-0.5 text-xs font-medium text-white shadow-sm">
                      {index + 1}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Image Input Area */}
            <div className="space-y-3">
              <label
                className="block text-sm font-medium text-gray-700"
                style={{ fontFamily: "var(--font-crimson), Georgia, serif" }}
              >
                Select Your Photos
              </label>
              <label
                className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-pink-200 bg-gradient-to-b from-pink-50/50 to-white p-8 transition-all duration-300 hover:border-[#e91e8c]/50 hover:bg-pink-50 ${
                  isLoading || compressionProgress ? 'pointer-events-none opacity-50' : ''
                }`}
              >
                <div className="mb-3 rounded-full bg-pink-100 p-3">
                  <ImagePlus className="h-6 w-6 text-[#e91e8c]" />
                </div>
                <p
                  className="mb-1 text-sm font-medium text-gray-600"
                  style={{ fontFamily: "var(--font-crimson), Georgia, serif" }}
                >
                  Click to select photos
                </p>
                <p className="text-xs text-gray-400">or drag and drop</p>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageSelect}
                  disabled={isLoading || compressionProgress !== ''}
                  className="hidden"
                />
              </label>
              {compressionProgress && (
                <div className="flex items-center justify-center gap-2 text-sm text-[#e91e8c]">
                  <Heart className="h-4 w-4 animate-pulse fill-current" />
                  {compressionProgress}
                </div>
              )}
            </div>

            {/* Name Input */}
            <div className="space-y-3">
              <label
                className="block text-sm font-medium text-gray-700"
                style={{ fontFamily: "var(--font-crimson), Georgia, serif" }}
              >
                Your Name
              </label>
              <input
                type="text"
                placeholder="Enter your name"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                disabled={isLoading}
                className="w-full rounded-xl border border-pink-200/50 bg-white/70 px-4 py-3 text-gray-800 placeholder-gray-400 shadow-sm transition-all duration-200 focus:border-[#e91e8c]/50 focus:outline-none focus:ring-2 focus:ring-[#e91e8c]/20 disabled:opacity-50"
                style={{ fontFamily: "var(--font-crimson), Georgia, serif" }}
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Photo Count */}
            {selectedImages.length > 0 && (
              <p
                className="text-center text-sm text-gray-500"
                style={{ fontFamily: "var(--font-crimson), Georgia, serif" }}
              >
                {selectedImages.length} photo{selectedImages.length !== 1 ? 's' : ''} ready to share
              </p>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || selectedImages.length === 0 || !guestName.trim()}
              className="group relative w-full overflow-hidden rounded-full bg-gradient-to-r from-[#e91e8c] to-[#d42a78] px-6 py-3.5 text-sm font-medium text-white shadow-[0_4px_20px_rgba(233,30,140,0.3)] transition-all duration-300 hover:shadow-[0_6px_30px_rgba(233,30,140,0.4)] hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
            >
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              <span className="relative flex items-center justify-center gap-2">
                {isLoading ? (
                  <>
                    <svg
                      className="h-4 w-4 animate-spin"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="12" cy="12" r="10" strokeOpacity="0.3" />
                      <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
                    </svg>
                    Uploading {selectedImages.length} photo{selectedImages.length !== 1 ? 's' : ''}...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Upload {selectedImages.length > 0 ? selectedImages.length : ''} Photo
                    {selectedImages.length !== 1 ? 's' : ''}
                  </>
                )}
              </span>
            </button>
          </form>
        </RomanticCard>

        {/* View Gallery Link */}
        <div className="mt-6 text-center">
          <Link
            href="/gallery"
            className="inline-flex items-center gap-2 text-sm text-gray-500 transition-colors hover:text-[#e91e8c]"
            style={{ fontFamily: "var(--font-crimson), Georgia, serif" }}
          >
            <Camera className="h-4 w-4" />
            View shared photos in the gallery
          </Link>
        </div>
      </div>
    </RomanticLayout>
  );
}
