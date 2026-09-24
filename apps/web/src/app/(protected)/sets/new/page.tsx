import type { Metadata } from "next";
import { CreateSetForm } from "./create-set-form";

export const metadata: Metadata = {
  title: "New set — DANISOLATION Recall",
};

export default function NewSetPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">New set</h1>
      <CreateSetForm />
    </div>
  );
}
