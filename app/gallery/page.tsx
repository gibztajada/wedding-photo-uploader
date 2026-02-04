import { PhotoGallery } from '@/components/photo-gallery';

export default function GalleryPage() {
  return (
    <main className="min-h-screen w-full p-4 md:p-8 bg-background">
      <div className="max-w-6xl mx-auto py-8">
        <PhotoGallery />
      </div>
    </main>
  );
}
