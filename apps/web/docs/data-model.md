# ForexMax CMS data model

The application stores **metadata and relationships** in PostgreSQL. File bytes are never stored in the database. The `Media` record keeps only the Vercel Blob path, URL, MIME type, size, dimensions and meaningful alternative text.

| Area | Core records | Important controls |
|---|---|---|
| Editorial identity | `User`, `Author`, `Category`, `Tag` | Users have only `ADMIN` or `EDITOR` roles. Server checks are required for every mutation. |
| Published research | `Article`, `Audit`, `ResearchSource` | Publication states are `DRAFT`, `REVIEW`, `PUBLISHED`, and `UNPUBLISHED`. New published CMS content must include a source and last-reviewed date. |
| Provider research | `PropFirm`, `PropFirmSource` | Current evidence, rather than a fabricated score, is retained. `EVIDENCE_PENDING` is an explicit state. |
| Media | `Media` | Uploads permit only JPEG, PNG, WebP and AVIF up to 5 MB after authorisation. |

The initial seed deliberately imports **16 public article files and 2 public audit files**. The earlier 17-article inventory count includes `articles/template.html`, which is a non-public template and is excluded from public routing and database content.
