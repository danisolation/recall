import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, SearchX, TrendingUp } from "lucide-react";
import { SearchInput } from "@/components/search-input";
import { SetList } from "@/components/set-list";
import { Panel } from "@/components/ui/panel";
import { TextLink } from "@/components/ui/text-link";
import { getCurrentUser } from "@/lib/session";
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

  // §23: every filter link preserves the other axes and overrides its own —
  // q and tag compose (AND), so one question can have two parts. The clear
  // link unwinds the tag, so no URL state is a dead end.
  const buildHref = (overrides: { tag?: number | null }) => {
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
    return `/dashboard${parts.length > 0 ? `?${parts.join("&")}` : ""}`;
  };
  const clearHref = buildHref({ tag: null });

  // §56: the no-matches hint names the active filters; a truly empty
  // library (no filters) keeps the create offer inside SetList.
  const filterHint = [
    query ? `"${query}"` : null,
    tagId !== undefined ? "the selected tag" : null,
  ]
    .filter(Boolean)
    .join(" with ");

  // ADR-018: the chips were the last control on the page still wearing a
  // 1px hairline border, so they read as flat text rather than as the clay
  // surfaces everything else became. The shared base carries the 3px edge,
  // the double shadow, and the soft-press; the two variants only differ in
  // how the selected state reads. Focus is not repeated here — the single
  // `:focus-visible` rule in globals.css owns it, and the old `outline-ink`
  // utilities had been dead since that token was retired in REDESIGN-003.
  const chipBase =
    "inline-flex min-h-11 items-center rounded-full border-[3px] border-border bg-card px-3 py-1.5 text-sm text-ink-soft shadow-clay transition-[transform,box-shadow,background-color] hover:text-ink active:translate-y-0.5 active:shadow-clay-pressed motion-reduce:transition-none";

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
        <SearchInput initialQuery={query} tagId={tagId} />
        {tags.length > 0 ? (
          <div className="flex flex-wrap items-center gap-2">
            {tags.map((t) => (
              <Link
                key={t.id}
                href={buildHref({ tag: t.id })}
                // `aria-current` is the non-color signal for the selected
                // state (§57); the weight change is the second one, so the
                // selection survives for anyone who cannot separate the hue.
                aria-current={t.id === tagId ? "true" : undefined}
                className={
                  t.id === tagId
                    ? `${chipBase} bg-marker/40 font-semibold text-ink`
                    : chipBase
                }
              >
                {t.name}
              </Link>
            ))}
            {tagId !== undefined ? (
              <TextLink href={clearHref}>Clear filter</TextLink>
            ) : null}
          </div>
        ) : tagId !== undefined ? (
          <div className="flex flex-wrap items-center gap-2">
            <TextLink href={clearHref}>Clear filter</TextLink>
          </div>
        ) : null}
        {(query || tagId !== undefined) && sets.items.length === 0 ? (
          <Panel className="flex flex-col items-center gap-2 py-8 text-center">
            <SearchX aria-hidden className="h-6 w-6 text-ink-soft" />
            <p className="text-ink-soft">
              {`No sets match ${filterHint}.`}
              {tagId !== undefined
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
