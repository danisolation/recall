import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Panel } from "@/components/ui/panel";
import { EditSetForm } from "./edit-set-form";
import { getSet, getSetTags } from "@/lib/sets";

export const metadata: Metadata = {
  title: "Edit set — DANISOLATION Recall",
};

export default async function EditSetPage({
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

  const tags = await getSetTags(setId);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Edit set</h1>
      <Panel>
        <EditSetForm
          set={set}
          initialTags={(tags ?? []).map((tag) => tag.name)}
        />
      </Panel>
    </div>
  );
}
