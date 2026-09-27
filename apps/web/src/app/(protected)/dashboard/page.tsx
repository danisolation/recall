import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Folder, Plus, SearchX, TrendingUp } from "lucide-react";
import { SearchInput } from "@/components/search-input";
import { SetList } from "@/components/set-list";
import { Panel } from "@/components/ui/panel";
import { TextLink } from "@/components/ui/text-link";
import { getCurrentUser } from "@/lib/session";
import { listFolders } from "@/lib/folders";
import { listSets } from "@/lib/sets";
import { listTags } from "@/lib/tags";

export const metadata: Metadata = {
  title: "Dashboard — DANISOLATION Recall",
};

// Fixed locale and zone keep the rendered date identical on the server and
// during hydration, so the markup cannot mismatch.
const memberSince = new Intl.DateTimeFormat("en-US", {
  dateStyle: "long",
  timeZone: "UTC",
});

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; tag?: string; folder?: string }>;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const { q, tag, folder } = await searchParams;
  const query = q || undefined;
  // A malformed or foreign tag/folder param is filter state, not a resource
  // id — it folds into "the filter matches nothing" exactly like an empty
  // `q` folds into "no filter" (§23, §41). The clear link is still rendered
  // so the user can always escape the URL state.
  const parsedTag = Number(tag);
  const tagId =
    tag !== undefined && Number.isInteger(parsedTag) ? parsedTag : undefined;
  const parsedFolder = Number(folder);
  const folderId =
    folder !== undefined && Number.isInteger(parsedFolder)
      ? parsedFolder
      : undefined;
  const [folders, tags, sets] = await Promise.all([
    listFolders(),
    listTags(),
    listSets(query, tagId, folderId),
  ]);

  // §23: every filter link preserves the other axes and overrides its own —
  // q, tag, and folder compose (all AND), so one question can have three
  // parts. An active folder chip toggles itself off; the clear link unwinds
  // the tag first, then the folder, so no URL state is a dead end.
  const buildHref = (overrides: {
    tag?: number | null;
    folder?: number | null;
  }) => {
    const parts: string[] = [];
    if (query) {
      parts.push(`q=${encodeURIComponent(query)}`);
    }
    // undefined = "keep the current axis" and null = "drop it"; a filter is
    // only emitted when a number survives both overrides.
    const tag = overrides.tag !== undefined ? overrides.tag : tagId;
    if (tag !== undefined && tag !== null) {
      parts.push(`tag=${tag}`);
    }
    const folder = overrides.folder !== undefined ? overrides.folder : folderId;
    if (folder !== undefined && folder !== null) {
      parts.push(`folder=${folder}`);
    }
    return `/dashboard${parts.length > 0 ? `?${parts.join("&")}` : ""}`;
  };
  const clearHref =
    tagId !== undefined ? buildHref({ tag: null }) : buildHref({ folder: null });

  // §56: the no-matches hint names the active filters; a truly empty
  // library (no filters) keeps the create offer inside SetList.
  const filterHint = [
    query ? `"${query}"` : null,
    tagId !== undefined ? "the selected tag" : null,
    folderId !== undefined ? "the selected folder" : null,
  ]
    .filter(Boolean)
    .join(" with ");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <div className="flex flex-wrap items-center gap-4">
          <TextLink href="/progress" variant="button">
            <TrendingUp aria-hidden className="h-4 w-4 shrink-0" />
            View progress
          </TextLink>
          <TextLink href="/sets/new" variant="button">
            <Plus aria-hidden className="h-4 w-4 shrink-0" />
            New set
          </TextLink>
        </div>
      </div>
      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Your sets</h2>
        <SearchInput initialQuery={query} tagId={tagId} folderId={folderId} />
        {folders.length > 0 ? (
          <div className="flex flex-wrap items-center gap-2">
            {folders.map((f) => (
              <Link
                key={f.id}
                href={buildHref({ folder: f.id === folderId ? null : f.id })}
                aria-current={f.id === folderId ? "true" : undefined}
                className={
                  f.id === folderId
                    ? "inline-flex min-h-11 items-center gap-1.5 rounded-full border border-ink/25 bg-marker/40 px-3 py-1.5 text-sm font-semibold text-ink"
                    : "inline-flex min-h-11 items-center gap-1.5 rounded-full border border-ink/25 bg-card px-3 py-1.5 text-sm text-ink-soft transition-colors hover:border-ink/50 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink motion-reduce:transition-none"
                }
              >
                <Folder aria-hidden className="h-4 w-4 shrink-0" />
                {`${f.name} · ${f.setCount}`}
              </Link>
            ))}
          </div>
        ) : null}
        {tags.length > 0 ? (
          <div className="flex flex-wrap items-center gap-2">
            {tags.map((t) => (
              <Link
                key={t.id}
                href={buildHref({ tag: t.id })}
                aria-current={t.id === tagId ? "true" : undefined}
                className={
                  t.id === tagId
                    ? "inline-flex min-h-11 items-center rounded-full border border-ink/25 bg-marker/40 px-3 py-1.5 text-sm font-semibold text-ink"
                    : "inline-flex min-h-11 items-center rounded-full border border-ink/25 bg-card px-3 py-1.5 text-sm text-ink-soft transition-colors hover:border-ink/50 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink motion-reduce:transition-none"
                }
              >
                {t.name}
              </Link>
            ))}
            {tagId !== undefined || folderId !== undefined ? (
              <TextLink href={clearHref}>Clear filter</TextLink>
            ) : null}
          </div>
        ) : tagId !== undefined || folderId !== undefined ? (
          <div className="flex flex-wrap items-center gap-2">
            <TextLink href={clearHref}>Clear filter</TextLink>
          </div>
        ) : null}
        {(query || tagId !== undefined || folderId !== undefined) &&
        sets.items.length === 0 ? (
          <Panel className="flex flex-col items-center gap-2 py-8 text-center">
            <SearchX aria-hidden className="h-6 w-6 text-ink-soft" />
            <p className="text-ink-soft">
              {`No sets match ${filterHint}.`}
              {tagId !== undefined || folderId !== undefined
                ? " Clear the filter to see all of your sets."
                : " Try a different search."}
            </p>
          </Panel>
        ) : (
          <SetList sets={sets.items} />
        )}
      </section>
      <Panel>
        <h2 className="text-lg font-semibold">Your account</h2>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <dt className="text-sm text-ink-soft">Email</dt>
            <dd className="font-medium">{user.email}</dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="text-sm text-ink-soft">Member since</dt>
            <dd className="font-medium">
              <time dateTime={user.createdAt}>
                {memberSince.format(new Date(user.createdAt))}
              </time>
            </dd>
          </div>
        </dl>
      </Panel>
    </div>
  );
}
