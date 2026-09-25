import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSet } from "@/lib/sets";

export const metadata: Metadata = {
  title: "Set — DANISOLATION Recall",
};

// Fixed locale and zone keep the rendered dates identical on the server and
// during hydration, so the markup cannot mismatch.
const longDate = new Intl.DateTimeFormat("en-US", {
  dateStyle: "long",
  timeZone: "UTC",
});

export default async function SetDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const setId = Number(id);

  // Malformed ids fold into the 404, mirroring the API's SET-006 decision:
  // never send a non-integer downstream.
  if (!Number.isInteger(setId)) {
    notFound();
  }

  const set = await getSet(setId);

  if (!set) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">{set.title}</h1>
      <section className="rounded-card border border-ink/10 bg-card p-4 shadow-[4px_4px_0_0] shadow-ink/15 sm:p-6">
        {set.description && <p className="text-ink-soft">{set.description}</p>}
        <dl className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <dt className="text-sm text-ink-soft">Created</dt>
            <dd className="font-medium">
              <time dateTime={set.createdAt}>
                {longDate.format(new Date(set.createdAt))}
              </time>
            </dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="text-sm text-ink-soft">Last updated</dt>
            <dd className="font-medium">
              <time dateTime={set.updatedAt}>
                {longDate.format(new Date(set.updatedAt))}
              </time>
            </dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
