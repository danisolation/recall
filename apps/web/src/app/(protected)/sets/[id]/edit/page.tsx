import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EditSetForm } from "./edit-set-form";
import { getSet } from "@/lib/sets";

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

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Edit set</h1>
      <section className="rounded-card border border-ink/10 bg-card p-4 shadow-[4px_4px_0_0] shadow-ink/15 sm:p-6">
        <EditSetForm set={set} />
      </section>
    </div>
  );
}
