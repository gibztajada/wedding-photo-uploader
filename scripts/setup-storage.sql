-- Create storage bucket for wedding photos
insert into storage.buckets (id, name, public)
values ('wedding-photos', 'wedding-photos', true)
on conflict do nothing;

-- Enable RLS policies for the bucket
create policy "Public Access"
on storage.objects for select
using (bucket_id = 'wedding-photos');

create policy "Allow uploads"
on storage.objects for insert
with check (bucket_id = 'wedding-photos');
