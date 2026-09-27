import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { SearchInput } from "@/components/search-input";
import { SetList } from "@/components/set-list";
import { getCurrentUser } from "@/lib/session";
import { listSets } from "@/lib/sets";
import { listTags } from "@/lib/tags";

export const metadata: Metadata = {
  title: "Dashboard — DANISOLATION Recall",
};

// Same link register as the home page navigation.
const newSetLink =
  "rounded-sm font-medium underline underline-offset-4 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink";

// Same panel register as the account section and the list items (ADR-008).
const panel =
  "rounded-card border border-ink/10 bg-card p-4 shadow-[4px_4px_0_0] shadow-ink/15 sm:p-6";

// Fixed locale and zone keep the rendered date identical on the server and
// during hydration, so the markup cannot mismatch.
const memberSince = new Intl.DateTimeFormat("en-US", {
  dateStyle: "long",
  timeZone: "UTC",
});

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; tag?: string }>;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const { q, tag } = await searchParams;
  const query = q || undefined;
  // A malformed or foreign tag param is filter state, not a resource id —
  // it folds into "the filter matches nothing" exactly like an empty `q`
  // folds into "no filter" (§23, §41). The clear link is still rendered so
  // the user can always escape the URL state.
  const parsedTag = Number(tag);
  const tagId =
    tag !== undefined && Number.isInteger(parsedTag) ? parsedTag : undefined;
  const [tags, sets] = await Promise.all([listTags(), listSets(query, tagId)]);

  const tagHref = (id: number) =>
    `/dashboard?${[
      query ? `q=${encodeURIComponent(query)}` : null,
      `tag=${id}`,
    ]
      .filter(Boolean)
      .join("&")}`;
  const clearHref = query
    ? `/dashboard?q=${encodeURIComponent(query)}`
    : "/dashboard";

  // §56: the no-matches hint names the active filters; a truly empty
  // library (no filters) keeps the create offer inside SetList.
  const filterHint = [
    query ? `"${query}"` : null,
    tagId !== undefined ? "the selected tag" : null,
  ]
    .filter(Boolean)
    .join(" with ");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <div className="flex flex-wrap items-center gap-4">
          <Link href="/progress" className={newSetLink}>
            View progress
          </Link>
          <Link href="/sets/new" className={newSetLink}>
            New set
          </Link>
        </div>
      </div>
      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Your sets</h2>
        <SearchInput initialQuery={query} tagId={tagId} />
        {tags.length > 0 ? (
          <div className="flex flex-wrap items-center gap-3">
            {tags.map((t) => (
              <Link
                key={t.id}
                href={tagHref(t.id)}
                aria-current={t.id === tagId ? "true" : undefined}
                className={
                  t.id === tagId
                    ? "rounded-sm font-semibold underline underline-offset-4"
                    : "rounded-sm font-medium text-ink-soft underline underline-offset-4 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
                }
              >
                {t.name}
              </Link>
            ))}
            {tagId !== undefined ? (
              <Link href={clearHref} className={newSetLink}>
                Clear filter
              </Link>
            ) : null}
          </div>
        ) : null}
        {(query || tagId !== undefined) && sets.items.length === 0 ? (
          <section className={panel}>
            <p className="text-ink-soft">
              {`No sets match ${filterHint}.`}
              {tagId !== undefined
                ? " Clear the filter to see all of your sets."
                : " Try a different search."}
            </p>
          </section>
        ) : (
          <SetList sets={sets.items} />
        )}
      </section>
      <section className="rounded-card border border-ink/10 bg-card p-4 shadow-[4px_4px_0_0] shadow-ink/15 sm:p-6">
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
      </section>
    </div>
  );
}
