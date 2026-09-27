import type { Metadata } from "next";
import { listFolders } from "@/lib/folders";
import { FoldersManager } from "./folders-manager";

export const metadata: Metadata = {
  title: "Folders — DANISOLATION Recall",
};

// ADR-014: folder management — create, rename, delete. Deleting a folder
// never touches sets: they fall back to the library root, unfiled.
export default async function FoldersPage() {
  const folders = await listFolders();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Folders</h1>
      <FoldersManager folders={folders} />
    </div>
  );
}
