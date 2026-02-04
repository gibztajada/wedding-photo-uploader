import { UploadForm } from '@/components/upload-form';
import Link from 'next/link';

export default function UploadPage() {
  return (
    <main className="min-h-screen w-full bg-background p-4 flex items-center justify-center">
      <div className="w-full max-w-2xl">
        <div className="mb-8">
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground underline transition-colors"
          >
            Back
          </Link>
        </div>
        <UploadForm />
      </div>
    </main>
  );
}
