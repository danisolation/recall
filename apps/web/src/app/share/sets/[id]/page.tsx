import { notFound } from "next/navigation";
import { Panel, panelClassName } from "@/components/ui/panel";
import { fetchPublicSet } from "@/lib/public";

// ADR-015: an unauthenticated, read-only view of a public set. The route
// lives outside the (protected) group, so it works signed out and signed
// in alike. Private and missing sets fold into the same 404.
export default async function PublicSetPage({
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

  const set = await fetchPublicSet(setId);

  if (!set) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">{set.title}</h1>
      <Panel>
        {set.description && <p className="text-ink-soft">{set.description}</p>}
        <dl className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <dt className="text-sm text-ink-soft">Tags</dt>
            <dd className="font-medium">
              {set.tags.length > 0
                ? set.tags.map((tag) => tag.name).join(", ")
                : "None yet"}
            </dd>
          </div>
        </dl>
      </Panel>
      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold tracking-tight">Cards</h2>
        {set.cards.length === 0 ? (
          <Panel className="flex flex-col items-center gap-2 py-8 text-center">
            <p className="text-ink-soft">This set has no cards yet.</p>
          </Panel>
        ) : (
          <ul className="flex flex-col gap-3">
            {set.cards.map((card) => (
              <li key={card.id} className={panelClassName}>
                <span className="block font-medium">{card.front}</span>
                <span className="mt-1 block text-sm text-ink-soft">
                  {card.back}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
