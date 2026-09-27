import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StudyClient } from "./study-client";

export const metadata: Metadata = {
  title: "Study — DANISOLATION Recall",
};

export default async function StudySessionPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  const id = Number(sessionId);

  // Malformed ids fold into the 404, mirroring the API's parseSessionId:
  // never send a non-integer downstream.
  if (!Number.isInteger(id)) {
    notFound();
  }

  return <StudyClient sessionId={id} />;
}
