create type public."UserRole" as enum ('VIEWER', 'ADMIN', 'EDITOR');
create type public."PublicationStatus" as enum ('DRAFT', 'REVIEW', 'PUBLISHED', 'UNPUBLISHED');
create type public."AuditType" as enum ('TECHNICAL', 'RESEARCH', 'RISK');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  name text,
  role public."UserRole" not null default 'VIEWER',
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);
create table public.media (
  id text primary key,
  key text not null unique,
  url text not null,
  filename text not null,
  "mimeType" text not null,
  "sizeBytes" integer not null check ("sizeBytes" > 0),
  width integer,
  height integer,
  "altText" text not null,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);
create table public.authors (
  id text primary key,
  name text not null,
  slug text not null unique,
  bio text,
  role text,
  "avatarId" text references public.media(id) on delete set null,
  "socialLinks" jsonb,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);
create table public.categories (
  id text primary key,
  name text not null,
  slug text not null unique,
  description text,
  "seoTitle" text,
  "seoDescription" text,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);
create table public.tags (id text primary key, name text not null, slug text not null unique);
create table public.sources (
  id text primary key,
  name text not null,
  url text not null unique,
  "sourceType" text not null,
  "accessedAt" timestamptz,
  note text,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);
create table public.articles (
  id text primary key,
  title text not null,
  slug text not null unique,
  excerpt text,
  "contentMarkdown" text not null,
  "contentHtml" text,
  status public."PublicationStatus" not null default 'DRAFT',
  "publishedAt" timestamptz,
  "lastReviewedAt" timestamptz,
  "authorId" text references public.authors(id) on delete set null,
  "categoryId" text references public.categories(id) on delete set null,
  "featuredMediaId" text references public.media(id) on delete set null,
  "seoTitle" text,
  "seoDescription" text,
  canonical text,
  "ogImage" text,
  "readingMinutes" integer,
  "legacyUrl" text unique,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now(),
  "editorId" uuid references public.profiles(id) on delete set null
);
create index articles_status_published_at_idx on public.articles(status, "publishedAt");
create index articles_category_status_idx on public.articles("categoryId", status);
create table public.audits (
  id text primary key,
  title text not null,
  slug text not null unique,
  entity text not null,
  "auditType" public."AuditType" not null,
  "riskLevel" text,
  status public."PublicationStatus" not null default 'DRAFT',
  summary text,
  evidence text,
  "contentMarkdown" text not null,
  "contentHtml" text,
  "publishedAt" timestamptz,
  "lastReviewedAt" timestamptz,
  "authorId" text references public.authors(id) on delete set null,
  "featuredMediaId" text references public.media(id) on delete set null,
  "seoTitle" text,
  "seoDescription" text,
  canonical text,
  "ogImage" text,
  "legacyUrl" text unique,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now(),
  "editorId" uuid references public.profiles(id) on delete set null
);
create index audits_status_published_at_idx on public.audits(status, "publishedAt");
create table public.prop_firms (
  id text primary key,
  name text not null,
  slug text not null unique,
  country text,
  "challengeFee" text,
  "profitTarget" text,
  "profitSplit" text,
  "dailyDrawdown" text,
  "maximumDrawdown" text,
  payout text,
  "newsTrading" text,
  "weekendHolding" text,
  "expertAdvisor" text,
  consistency text,
  scaling text,
  platform text,
  "evaluationType" text,
  assessment text,
  "lastReviewedAt" timestamptz,
  status text default 'EVIDENCE_PENDING',
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);
create table public.article_sources ("articleId" text not null references public.articles(id) on delete cascade, "sourceId" text not null references public.sources(id) on delete cascade, primary key ("articleId", "sourceId"));
create table public.audit_sources ("auditId" text not null references public.audits(id) on delete cascade, "sourceId" text not null references public.sources(id) on delete cascade, primary key ("auditId", "sourceId"));
create table public.prop_firm_sources ("propFirmId" text not null references public.prop_firms(id) on delete cascade, "sourceId" text not null references public.sources(id) on delete cascade, primary key ("propFirmId", "sourceId"));
create table public."_ArticleTags" ("A" text not null references public.articles(id) on delete cascade, "B" text not null references public.tags(id) on delete cascade);
create unique index "_ArticleTags_AB_unique" on public."_ArticleTags"("A", "B");
create index "_ArticleTags_B_index" on public."_ArticleTags"("B");

create schema if not exists private;
create or replace function private.set_updated_at() returns trigger language plpgsql set search_path = public, private as $$ begin new."updatedAt" = now(); return new; end; $$;
create or replace function private.handle_new_user() returns trigger language plpgsql security definer set search_path = public, private as $$ begin insert into public.profiles (id, email, name) values (new.id, new.email, coalesce(new.raw_user_meta_data ->> 'full_name', new.email)) on conflict (id) do nothing; return new; end; $$;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure private.handle_new_user();
create trigger profiles_updated_at before update on public.profiles for each row execute procedure private.set_updated_at();
create trigger media_updated_at before update on public.media for each row execute procedure private.set_updated_at();
create trigger authors_updated_at before update on public.authors for each row execute procedure private.set_updated_at();
create trigger categories_updated_at before update on public.categories for each row execute procedure private.set_updated_at();
create trigger sources_updated_at before update on public.sources for each row execute procedure private.set_updated_at();
create trigger articles_updated_at before update on public.articles for each row execute procedure private.set_updated_at();
create trigger audits_updated_at before update on public.audits for each row execute procedure private.set_updated_at();
create trigger prop_firms_updated_at before update on public.prop_firms for each row execute procedure private.set_updated_at();

create or replace function private.is_editor() returns boolean language sql stable security definer set search_path = public, private as $$ select exists (select 1 from public.profiles where id = auth.uid() and role in ('ADMIN', 'EDITOR')); $$;
create or replace function private.is_admin() returns boolean language sql stable security definer set search_path = public, private as $$ select exists (select 1 from public.profiles where id = auth.uid() and role = 'ADMIN'); $$;
alter table public.profiles enable row level security;
alter table public.media enable row level security;
alter table public.authors enable row level security;
alter table public.categories enable row level security;
alter table public.tags enable row level security;
alter table public.sources enable row level security;
alter table public.articles enable row level security;
alter table public.audits enable row level security;
alter table public.prop_firms enable row level security;
alter table public.article_sources enable row level security;
alter table public.audit_sources enable row level security;
alter table public.prop_firm_sources enable row level security;
alter table public."_ArticleTags" enable row level security;

create policy "profiles_own_read" on public.profiles for select to authenticated using (id = auth.uid() or private.is_editor());
create policy "profiles_admin_manage" on public.profiles for all to authenticated using (private.is_admin()) with check (private.is_admin());
create policy "media_public_read" on public.media for select using (true);
create policy "media_editor_manage" on public.media for all to authenticated using (private.is_editor()) with check (private.is_editor());
create policy "authors_public_read" on public.authors for select using (true);
create policy "authors_editor_manage" on public.authors for all to authenticated using (private.is_editor()) with check (private.is_editor());
create policy "categories_public_read" on public.categories for select using (true);
create policy "categories_editor_manage" on public.categories for all to authenticated using (private.is_editor()) with check (private.is_editor());
create policy "tags_public_read" on public.tags for select using (true);
create policy "tags_editor_manage" on public.tags for all to authenticated using (private.is_editor()) with check (private.is_editor());
create policy "sources_public_read" on public.sources for select using (true);
create policy "sources_editor_manage" on public.sources for all to authenticated using (private.is_editor()) with check (private.is_editor());
create policy "articles_public_read" on public.articles for select using (status = 'PUBLISHED');
create policy "articles_editor_manage" on public.articles for all to authenticated using (private.is_editor()) with check (private.is_editor());
create policy "audits_public_read" on public.audits for select using (status = 'PUBLISHED');
create policy "audits_editor_manage" on public.audits for all to authenticated using (private.is_editor()) with check (private.is_editor());
create policy "prop_firms_public_read" on public.prop_firms for select using (true);
create policy "prop_firms_editor_manage" on public.prop_firms for all to authenticated using (private.is_editor()) with check (private.is_editor());
create policy "article_sources_public_read" on public.article_sources for select using (true);
create policy "article_sources_editor_manage" on public.article_sources for all to authenticated using (private.is_editor()) with check (private.is_editor());
create policy "audit_sources_public_read" on public.audit_sources for select using (true);
create policy "audit_sources_editor_manage" on public.audit_sources for all to authenticated using (private.is_editor()) with check (private.is_editor());
create policy "prop_firm_sources_public_read" on public.prop_firm_sources for select using (true);
create policy "prop_firm_sources_editor_manage" on public.prop_firm_sources for all to authenticated using (private.is_editor()) with check (private.is_editor());
create policy "article_tags_public_read" on public."_ArticleTags" for select using (true);
create policy "article_tags_editor_manage" on public."_ArticleTags" for all to authenticated using (private.is_editor()) with check (private.is_editor());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values ('media', 'media', true, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'image/avif']) on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;
create policy "media_bucket_public_read" on storage.objects for select using (bucket_id = 'media');
create policy "media_bucket_editor_insert" on storage.objects for insert to authenticated with check (bucket_id = 'media' and private.is_editor());
create policy "media_bucket_editor_update" on storage.objects for update to authenticated using (bucket_id = 'media' and private.is_editor()) with check (bucket_id = 'media' and private.is_editor());
create policy "media_bucket_editor_delete" on storage.objects for delete to authenticated using (bucket_id = 'media' and private.is_editor());
