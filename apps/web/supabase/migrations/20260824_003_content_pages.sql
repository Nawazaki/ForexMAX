create table public.content_pages (
  id text primary key,
  title text not null,
  slug text not null unique,
  excerpt text,
  "contentHtml" text,
  status public."PublicationStatus" not null default 'DRAFT',
  "publishedAt" timestamptz,
  "lastReviewedAt" timestamptz,
  "seoTitle" text,
  "seoDescription" text,
  canonical text,
  "ogImage" text,
  "legacyUrl" text unique,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now(),
  "editorId" uuid references public.profiles(id) on delete set null
);
create index content_pages_status_published_at_idx on public.content_pages(status, "publishedAt");
create trigger content_pages_updated_at before update on public.content_pages for each row execute procedure private.set_updated_at();
alter table public.content_pages enable row level security;
create policy "content_pages_public_read" on public.content_pages for select using (status = 'PUBLISHED');
create policy "content_pages_editor_manage" on public.content_pages for all to authenticated using (private.is_editor()) with check (private.is_editor());
