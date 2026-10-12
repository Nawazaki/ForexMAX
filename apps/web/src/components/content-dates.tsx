type ContentDatesProps = {
  publishedAt?: Date | null;
  lastReviewedAt?: Date | null;
  updatedAt?: Date | null;
};

const formatDate = (value: Date) => new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
}).format(value);
const isoDate = (value: Date) => value.toISOString().slice(0, 10);

export function ContentDates({ publishedAt, lastReviewedAt, updatedAt }: ContentDatesProps) {
  const currentUpdate = lastReviewedAt ?? (publishedAt ? updatedAt : null);
  if (!publishedAt && !currentUpdate) return null;
  return <p className="article-dates">
    {publishedAt
      ? <span>First published: <time dateTime={isoDate(publishedAt)}>{formatDate(publishedAt)}</time>. </span>
      : lastReviewedAt ? <span>Original publication date is not recorded in the migrated source. </span> : null}
    {currentUpdate
      ? <span>{lastReviewedAt ? "Last reviewed: " : "Last updated: "}<time dateTime={isoDate(currentUpdate)}>{formatDate(currentUpdate)}</time>.</span>
      : null}
  </p>;
}
