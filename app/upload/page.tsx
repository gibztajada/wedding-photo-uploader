'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { NewspaperLayout, NewspaperCard, NewspaperButton, NewspaperInput } from '@/components/newspaper-layout';
import { Camera, X, Upload, ImagePlus } from 'lucide-react';

interface PreviewItem {
  file: File;
  preview: string;
}

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
      setCompressionProgress('Preparing your photographs...');
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
      setError('Please select at least one photograph and enter your name');
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
    <NewspaperLayout
      title="SUBMIT YOUR PHOTOGRAPHS"
      subtitle="Share your captured moments with the wedding collection"
      pageNumber={2}
      showBack={true}
    >
      <NewspaperCard>
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          {/* Section Header */}
          <div className="border-b border-[#2c2c2c]/20 pb-2">
            <h2
              className="text-xs font-bold uppercase tracking-wider text-[#2c2c2c] sm:text-sm"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              Photo Submission Form
            </h2>
          </div>

          {/* Image Previews Grid */}
          {selectedImages.length > 0 && (
            <div
              className={`grid grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-3 transition-all duration-500 ${
                isVisible ? 'opacity-100' : 'opacity-0'
              }`}
            >
              {selectedImages.map((item, index) => (
                <div
                  key={index}
                  className="group relative aspect-square overflow-hidden border border-[#2c2c2c]/30 bg-[#2c2c2c]"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <img
                    src={item.preview || '/placeholder.svg'}
                    alt={`Preview ${index + 1}`}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    style={{
                      filter: 'grayscale(30%) contrast(1.05)',
                    }}
                  />
                  {/* Upload Progress */}
                  {isLoading && uploadProgress[index] !== undefined && (
                    <div className="absolute inset-0 flex items-center justify-center bg-[#2c2c2c]/70">
                      <span
                        className="text-xs font-bold text-[#f8f4ec] sm:text-sm"
                        style={{ fontFamily: 'Georgia, serif' }}
                      >
                        {uploadProgress[index]}%
                      </span>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    disabled={isLoading}
                    className="absolute right-1 top-1 bg-[#f8f4ec] p-1 text-[#2c2c2c] shadow-sm transition-all duration-200 hover:bg-[#2c2c2c] hover:text-[#f8f4ec] disabled:opacity-50"
                    title="Remove photo"
                  >
                    <X className="h-3 w-3" />
                  </button>
                  <div
                    className="absolute bottom-1 left-1 bg-[#f8f4ec] px-1.5 py-0.5 text-[8px] font-bold text-[#2c2c2c] sm:text-[10px]"
                    style={{ fontFamily: 'Georgia, serif' }}
                  >
                    No. {index + 1}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Image Input Area */}
          <div className="space-y-2">
            <label
              className="block text-[10px] font-medium uppercase tracking-wider text-[#2c2c2c]/80 sm:text-xs"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              Select Photographs
            </label>
            <label
              className={`flex cursor-pointer flex-col items-center justify-center border-2 border-dashed border-[#2c2c2c]/30 bg-[#faf6ee] p-4 transition-all duration-300 hover:border-[#2c2c2c]/60 hover:bg-[#f5f0e6] sm:p-6 ${
                isLoading || compressionProgress ? 'pointer-events-none opacity-50' : ''
              }`}
            >
              <div className="mb-2 border border-[#2c2c2c]/20 p-2">
                <ImagePlus className="h-5 w-5 text-[#2c2c2c]/60 sm:h-6 sm:w-6" />
              </div>
              <p
                className="text-xs font-medium text-[#2c2c2c]/80 sm:text-sm"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                Click to select photographs
              </p>
              <p
                className="mt-1 text-[9px] text-[#2c2c2c]/50 sm:text-[10px]"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                Multiple images may be selected
              </p>
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
              <p
                className="text-center text-[10px] italic text-[#2c2c2c]/60 sm:text-xs"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                {compressionProgress}
              </p>
            )}
          </div>

          {/* Name Input */}
          <NewspaperInput
            label="Your Name"
            placeholder="Enter your name for the photo credit"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            disabled={isLoading}
          />

          {/* Error Message */}
          {error && (
            <div className="border border-[#2c2c2c]/30 bg-[#f5f0e6] p-3">
              <p
                className="text-xs text-[#8b0000]"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                {error}
              </p>
            </div>
          )}

          {/* Photo Count */}
          {selectedImages.length > 0 && (
            <p
              className="text-center text-[10px] text-[#2c2c2c]/60 sm:text-xs"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              {selectedImages.length} photograph{selectedImages.length !== 1 ? 's' : ''} ready for submission
            </p>
          )}

          {/* Submit Button */}
          <NewspaperButton
            type="submit"
            disabled={isLoading || selectedImages.length === 0 || !guestName.trim()}
            className="w-full"
          >
            {isLoading ? (
              <>
                <svg
                  className="h-3.5 w-3.5 animate-spin sm:h-4 sm:w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" strokeOpacity="0.3" />
                  <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
                </svg>
                Submitting {selectedImages.length} photograph{selectedImages.length !== 1 ? 's' : ''}...
              </>
            ) : (
              <>
                <Upload className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Submit {selectedImages.length > 0 ? selectedImages.length : ''} Photograph
                {selectedImages.length !== 1 ? 's' : ''}
              </>
            )}
          </NewspaperButton>
        </form>
      </NewspaperCard>

      {/* View Gallery Link */}
      <div className="mt-4 text-center sm:mt-5">
        <Link
          href="/gallery"
          className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-[#2c2c2c]/60 transition-colors hover:text-[#2c2c2c] sm:text-xs"
          style={{ fontFamily: 'Georgia, serif' }}
        >
          <Camera className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          View the Photo Gallery
        </Link>
      </div>
    </NewspaperLayout>
  );
}
