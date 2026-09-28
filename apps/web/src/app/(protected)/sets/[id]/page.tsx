import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Pencil } from "lucide-react";
import { CardList } from "@/components/card-list";
import { Panel } from "@/components/ui/panel";
import { TextLink } from "@/components/ui/text-link";
import { CreateCardForm } from "./create-card-form";
import { DeleteSetButton } from "./delete-set-button";
import { EditCardForm } from "./edit-card-form";
import { StartStudyButton } from "./start-study-button";
import { listCards } from "@/lib/cards";
import { getSet, getSetTags } from "@/lib/sets";

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
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ edit?: string }>;
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

  const [cardsPage, setTags] = await Promise.all([
    listCards(setId),
    getSetTags(setId),
  ]);

  // Edit mode is URL state (§23): ?edit=<cardId> swaps the create form for
  // an edit form prefilled with that card. A param matching no card is
  // simply ignored.
  const { edit } = await searchParams;
  const editId = Number(edit);
  const editingCard =
    edit !== undefined && Number.isInteger(editId)
      ? cardsPage.items.find((card) => card.id === editId)
      : undefined;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">{set.title}</h1>
        <div className="flex items-center gap-4">
          <StartStudyButton setId={set.id} />
          <TextLink href={`/sets/${set.id}/edit`} variant="button">
            <Pencil aria-hidden className="h-4 w-4 shrink-0" />
            Edit set
          </TextLink>
        </div>
      </div>
      <Panel>
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
          <div className="flex flex-col gap-1">
            <dt className="text-sm text-ink-soft">Tags</dt>
            <dd className="font-medium">
              {setTags && setTags.length > 0
                ? setTags.map((tag) => tag.name).join(", ")
                : "None yet"}
            </dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="text-sm text-ink-soft">Sharing</dt>
            <dd className="font-medium">
              {set.visibility === "public" ? "Public" : "Private"}
            </dd>
          </div>
        </dl>
      </Panel>
      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold tracking-tight">Cards</h2>
        {editingCard ? (
          <EditCardForm setId={set.id} card={editingCard} />
        ) : (
          <CreateCardForm setId={set.id} />
        )}
        <CardList cards={cardsPage.items} />
      </section>
      <div>
        <DeleteSetButton setId={set.id} />
      </div>
    </div>
  );
}
