# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Wedding photo sharing web application built with Next.js 16 (App Router), React 19, TypeScript, and Supabase. Guests can upload photos which are displayed in a shared gallery. Uses a newspaper-themed design ("The Wedding Times").

## Commands

```bash
pnpm dev      # Start development server
pnpm build    # Build for production
pnpm start    # Start production server
pnpm lint     # Run ESLint
```

Package manager is **pnpm** (not npm or yarn).

## Environment Variables

Required in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=<supabase-project-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<supabase-anon-key>
```

## Architecture

### Pages (App Router)
- `/` - Home page with couple photo display (newspaper-style)
- `/upload` - Multi-image upload form with client-side compression
- `/gallery` - Infinite-scroll photo gallery with lightbox
- `/admin` - Couple photo management

### API Routes (`app/api/`)
- `POST /api/upload` - Upload guest photos to Supabase storage
- `GET /api/photos` - Fetch photos with pagination (limit/offset params)
- `POST /api/photos/delete` - Delete photo from DB and storage
- `GET|POST /api/couple-photo` - Fetch or update the couple photo

### Database (Supabase)
Two tables:
- **photos** - Guest uploaded photos (`id`, `guest_name`, `image_url`, `storage_path`, `created_at`)
- **couple_photo** - Single couple photo for homepage (`id`, `image_url`, `storage_path`, `created_at`)

Storage bucket: `wedding-photos`

### Key Components
- `components/upload-form.tsx` - Image upload with canvas-based compression (max 1920x1920, 70% quality, 4 concurrent uploads)
- `components/photo-gallery.tsx` - Grid display with lightbox, touch swipe, keyboard navigation
- `components/admin-panel.tsx` - Couple photo management
- `components/ui/` - shadcn/ui components (new-york style)

### Data Flow
1. Client compresses images before upload using canvas API
2. API routes handle Supabase storage operations
3. Photos stored with timestamp-random filename pattern
4. Gallery fetches with pagination (20 per page)

## Tech Stack Notes

- **UI Library**: shadcn/ui with Radix UI primitives
- **Styling**: Tailwind CSS 4 with oklch color variables, custom serif fonts (Playfair Display, Crimson Text)
- **Forms**: react-hook-form + zod validation
- **Path alias**: `@/*` maps to project root
