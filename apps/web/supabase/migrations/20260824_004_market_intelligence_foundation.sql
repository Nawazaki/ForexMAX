begin;

create type public."MarketKind" as enum ('FOREX', 'COMMODITIES', 'INDICES', 'CRYPTO', 'MACRO', 'RATES', 'ECONOMY', 'COMPANIES');
create type public."AssetClass" as enum ('FX_PAIR', 'METAL', 'ENERGY', 'EQUITY_INDEX', 'CRYPTO_ASSET', 'ECONOMIC_SERIES', 'EQUITY', 'OTHER');
create type public."DataQualityStatus" as enum ('VERIFIED', 'DELAYED', 'STALE', 'UNAVAILABLE', 'REQUIRES_REVIEW');
create type public."SourceDocumentStatus" as enum ('INGESTED', 'RETRIEVED', 'VERIFIED', 'REJECTED', 'STALE');
create type public."ResearchEventStatus" as enum ('INGESTED', 'PROCESSING', 'REQUIRES_REVIEW', 'VERIFIED', 'PUBLISHED', 'REJECTED', 'STALE', 'ARCHIVED');
create type public."EvidenceVerificationStatus" as enum ('UNVERIFIED', 'VERIFYING', 'VERIFIED', 'CONFLICTED', 'REJECTED');
create type public."ResearchAssessmentStatus" as enum ('DRAFT', 'REVIEW', 'APPROVED', 'PUBLISHED', 'SUPERSEDED', 'REJECTED');
create type public."DriverDirection" as enum ('UPSIDE', 'DOWNSIDE', 'RISK', 'CATALYST', 'INVALIDATION');
create type public."IngestionJobStatus" as enum ('QUEUED', 'RUNNING', 'SUCCEEDED', 'FAILED', 'SKIPPED');
create type public."EditorialDecision" as enum ('APPROVED', 'REJECTED', 'CHANGES_REQUESTED');

alter table public.sources
  add column organization text,
  add column jurisdiction text,
  add column "isPrimary" boolean not null default false,
  add column "reliabilityTier" integer not null default 0,
  add column "verificationStatus" public."DataQualityStatus" not null default 'REQUIRES_REVIEW',
  add column "lastVerifiedAt" timestamptz,
  add column "accessPolicy" text,
  add column "isActive" boolean not null default true;

create index sources_primary_verification_idx on public.sources ("isPrimary", "verificationStatus", "isActive");

create table public.markets (
  id text primary key,
  slug text not null unique,
  name text not null,
  kind public."MarketKind" not null,
  description text,
  "isPublic" boolean not null default false,
  "availabilityStatus" public."DataQualityStatus" not null default 'UNAVAILABLE',
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create table public.assets (
  id text primary key,
  "marketId" text not null references public.markets(id) on delete restrict,
  slug text not null,
  symbol text,
  "displayName" text not null,
  "assetClass" public."AssetClass" not null,
  "isPublic" boolean not null default false,
  "isActive" boolean not null default true,
  "availabilityStatus" public."DataQualityStatus" not null default 'UNAVAILABLE',
  "dataUpdatedAt" timestamptz,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now(),
  unique ("marketId", slug)
);

create table public.countries (
  id text primary key,
  "isoCode" text not null unique,
  name text not null,
  region text,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create table public.central_banks (
  id text primary key,
  "countryId" text not null unique references public.countries(id) on delete restrict,
  name text not null,
  slug text not null unique,
  "officialUrl" text not null,
  "isPublic" boolean not null default false,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create table public.source_documents (
  id text primary key,
  "sourceId" text not null references public.sources(id) on delete restrict,
  url text not null unique,
  headline text,
  author text,
  "publishedAt" timestamptz,
  "retrievedAt" timestamptz not null default now(),
  "contentHash" text,
  status public."SourceDocumentStatus" not null default 'INGESTED',
  "isPublic" boolean not null default false,
  metadata jsonb,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create table public.research_events (
  id text primary key,
  slug text not null unique,
  title text not null,
  summary text,
  "marketId" text references public.markets(id) on delete set null,
  "countryId" text references public.countries(id) on delete set null,
  importance integer not null default 0,
  status public."ResearchEventStatus" not null default 'INGESTED',
  "isPublic" boolean not null default false,
  "observedAt" timestamptz,
  "verifiedAt" timestamptz,
  "publishedAt" timestamptz,
  "lastReviewedAt" timestamptz,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create table public.research_event_assets (
  "eventId" text not null references public.research_events(id) on delete cascade,
  "assetId" text not null references public.assets(id) on delete cascade,
  primary key ("eventId", "assetId")
);

create table public.research_evidence (
  id text primary key,
  "eventId" text not null references public.research_events(id) on delete cascade,
  "sourceDocumentId" text not null references public.source_documents(id) on delete restrict,
  statement text not null,
  "evidenceType" text not null,
  "verificationStatus" public."EvidenceVerificationStatus" not null default 'UNVERIFIED',
  "verifiedAt" timestamptz,
  "verifierId" uuid references public.profiles(id) on delete set null,
  "isPublic" boolean not null default false,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create table public.research_assessments (
  id text primary key,
  "eventId" text references public.research_events(id) on delete set null,
  "assetId" text references public.assets(id) on delete set null,
  "articleId" text unique references public.articles(id) on delete set null,
  title text not null,
  thesis text not null,
  methodology text,
  status public."ResearchAssessmentStatus" not null default 'DRAFT',
  "authorId" uuid references public.profiles(id) on delete set null,
  "reviewerId" uuid references public.profiles(id) on delete set null,
  "reviewedAt" timestamptz,
  "publishedAt" timestamptz,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create table public.research_drivers (
  id text primary key,
  "assessmentId" text not null references public.research_assessments(id) on delete cascade,
  "evidenceId" text references public.research_evidence(id) on delete set null,
  direction public."DriverDirection" not null,
  detail text not null,
  "isPublic" boolean not null default false,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create table public.economic_indicators (
  id text primary key,
  "countryId" text references public.countries(id) on delete set null,
  slug text not null unique,
  name text not null,
  unit text,
  "methodologySourceUrl" text,
  "isPublic" boolean not null default false,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create table public.economic_releases (
  id text primary key,
  "indicatorId" text not null references public.economic_indicators(id) on delete restrict,
  "eventId" text references public.research_events(id) on delete set null,
  "sourceDocumentId" text references public.source_documents(id) on delete set null,
  "releaseAt" timestamptz not null,
  "previousValue" numeric(24, 8),
  "forecastValue" numeric(24, 8),
  "actualValue" numeric(24, 8),
  "surpriseValue" numeric(24, 8),
  "dataStatus" public."DataQualityStatus" not null default 'UNAVAILABLE',
  "isPublic" boolean not null default false,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create table public.data_quality_checks (
  id text primary key,
  "sourceDocumentId" text references public.source_documents(id) on delete set null,
  "scopeType" text not null,
  "scopeId" text not null,
  "checkType" text not null,
  status public."DataQualityStatus" not null,
  "observedAt" timestamptz not null default now(),
  "resolvedAt" timestamptz,
  resolution text,
  "isPublic" boolean not null default false,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create table public.ingestion_jobs (
  id text primary key,
  "sourceId" text references public.sources(id) on delete set null,
  "sourceDocumentId" text references public.source_documents(id) on delete set null,
  "jobType" text not null,
  status public."IngestionJobStatus" not null default 'QUEUED',
  "dedupeKey" text,
  payload jsonb,
  "errorSummary" text,
  "startedAt" timestamptz,
  "finishedAt" timestamptz,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create table public.editorial_reviews (
  id text primary key,
  "assessmentId" text not null references public.research_assessments(id) on delete cascade,
  "reviewerId" uuid references public.profiles(id) on delete set null,
  decision public."EditorialDecision" not null,
  rationale text,
  "createdAt" timestamptz not null default now()
);

create index markets_kind_public_idx on public.markets (kind, "isPublic");
create index assets_market_public_idx on public.assets ("marketId", "isPublic");
create index source_documents_source_published_idx on public.source_documents ("sourceId", "publishedAt");
create index source_documents_status_retrieved_idx on public.source_documents (status, "retrievedAt");
create index research_events_publication_idx on public.research_events (status, "isPublic", "publishedAt");
create index research_events_market_status_idx on public.research_events ("marketId", status);
create index research_event_assets_asset_idx on public.research_event_assets ("assetId");
create index research_evidence_event_status_idx on public.research_evidence ("eventId", "verificationStatus");
create index research_evidence_document_status_idx on public.research_evidence ("sourceDocumentId", "verificationStatus");
create index research_assessments_publication_idx on public.research_assessments (status, "publishedAt");
create index research_assessments_asset_status_idx on public.research_assessments ("assetId", status);
create index research_drivers_assessment_direction_idx on public.research_drivers ("assessmentId", direction);
create index economic_indicators_country_public_idx on public.economic_indicators ("countryId", "isPublic");
create index economic_releases_indicator_time_idx on public.economic_releases ("indicatorId", "releaseAt");
create index economic_releases_status_public_idx on public.economic_releases ("dataStatus", "isPublic");
create index data_quality_scope_observed_idx on public.data_quality_checks ("scopeType", "scopeId", "observedAt");
create index data_quality_status_observed_idx on public.data_quality_checks (status, "observedAt");
create index ingestion_jobs_status_created_idx on public.ingestion_jobs (status, "createdAt");
create index ingestion_jobs_dedupe_key_idx on public.ingestion_jobs ("dedupeKey");
create index editorial_reviews_assessment_created_idx on public.editorial_reviews ("assessmentId", "createdAt");

create trigger markets_updated_at before update on public.markets for each row execute procedure private.set_updated_at();
create trigger assets_updated_at before update on public.assets for each row execute procedure private.set_updated_at();
create trigger countries_updated_at before update on public.countries for each row execute procedure private.set_updated_at();
create trigger central_banks_updated_at before update on public.central_banks for each row execute procedure private.set_updated_at();
create trigger source_documents_updated_at before update on public.source_documents for each row execute procedure private.set_updated_at();
create trigger research_events_updated_at before update on public.research_events for each row execute procedure private.set_updated_at();
create trigger research_evidence_updated_at before update on public.research_evidence for each row execute procedure private.set_updated_at();
create trigger research_assessments_updated_at before update on public.research_assessments for each row execute procedure private.set_updated_at();
create trigger research_drivers_updated_at before update on public.research_drivers for each row execute procedure private.set_updated_at();
create trigger economic_indicators_updated_at before update on public.economic_indicators for each row execute procedure private.set_updated_at();
create trigger economic_releases_updated_at before update on public.economic_releases for each row execute procedure private.set_updated_at();
create trigger data_quality_checks_updated_at before update on public.data_quality_checks for each row execute procedure private.set_updated_at();
create trigger ingestion_jobs_updated_at before update on public.ingestion_jobs for each row execute procedure private.set_updated_at();

alter table public.markets enable row level security;
alter table public.assets enable row level security;
alter table public.countries enable row level security;
alter table public.central_banks enable row level security;
alter table public.source_documents enable row level security;
alter table public.research_events enable row level security;
alter table public.research_event_assets enable row level security;
alter table public.research_evidence enable row level security;
alter table public.research_assessments enable row level security;
alter table public.research_drivers enable row level security;
alter table public.economic_indicators enable row level security;
alter table public.economic_releases enable row level security;
alter table public.data_quality_checks enable row level security;
alter table public.ingestion_jobs enable row level security;
alter table public.editorial_reviews enable row level security;

create policy "markets_public_read" on public.markets for select using ("isPublic" = true);
create policy "assets_public_read" on public.assets for select using ("isPublic" = true);
create policy "countries_public_read" on public.countries for select using (true);
create policy "central_banks_public_read" on public.central_banks for select using ("isPublic" = true);
create policy "source_documents_public_read" on public.source_documents for select using ("isPublic" = true);
create policy "research_events_public_read" on public.research_events for select using ("isPublic" = true and status in ('PUBLISHED', 'STALE'));
create policy "research_event_assets_public_read" on public.research_event_assets for select using (true);
create policy "research_evidence_public_read" on public.research_evidence for select using ("isPublic" = true and "verificationStatus" = 'VERIFIED');
create policy "research_assessments_public_read" on public.research_assessments for select using (status = 'PUBLISHED');
create policy "research_drivers_public_read" on public.research_drivers for select using ("isPublic" = true);
create policy "economic_indicators_public_read" on public.economic_indicators for select using ("isPublic" = true);
create policy "economic_releases_public_read" on public.economic_releases for select using ("isPublic" = true);
create policy "data_quality_checks_public_read" on public.data_quality_checks for select using ("isPublic" = true);

create policy "markets_editor_manage" on public.markets for all to authenticated using (private.is_editor()) with check (private.is_editor());
create policy "assets_editor_manage" on public.assets for all to authenticated using (private.is_editor()) with check (private.is_editor());
create policy "countries_editor_manage" on public.countries for all to authenticated using (private.is_editor()) with check (private.is_editor());
create policy "central_banks_editor_manage" on public.central_banks for all to authenticated using (private.is_editor()) with check (private.is_editor());
create policy "source_documents_editor_manage" on public.source_documents for all to authenticated using (private.is_editor()) with check (private.is_editor());
create policy "research_events_editor_manage" on public.research_events for all to authenticated using (private.is_editor()) with check (private.is_editor());
create policy "research_event_assets_editor_manage" on public.research_event_assets for all to authenticated using (private.is_editor()) with check (private.is_editor());
create policy "research_evidence_editor_manage" on public.research_evidence for all to authenticated using (private.is_editor()) with check (private.is_editor());
create policy "research_assessments_editor_manage" on public.research_assessments for all to authenticated using (private.is_editor()) with check (private.is_editor());
create policy "research_drivers_editor_manage" on public.research_drivers for all to authenticated using (private.is_editor()) with check (private.is_editor());
create policy "economic_indicators_editor_manage" on public.economic_indicators for all to authenticated using (private.is_editor()) with check (private.is_editor());
create policy "economic_releases_editor_manage" on public.economic_releases for all to authenticated using (private.is_editor()) with check (private.is_editor());
create policy "data_quality_checks_editor_manage" on public.data_quality_checks for all to authenticated using (private.is_editor()) with check (private.is_editor());
create policy "ingestion_jobs_editor_manage" on public.ingestion_jobs for all to authenticated using (private.is_editor()) with check (private.is_editor());
create policy "editorial_reviews_editor_manage" on public.editorial_reviews for all to authenticated using (private.is_editor()) with check (private.is_editor());

commit;
