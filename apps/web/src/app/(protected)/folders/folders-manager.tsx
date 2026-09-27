"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { FolderPlus, Pencil, Trash2 } from "lucide-react";
import { folderNameSchema } from "@danisolation-recall/contracts";
import { ApiError, createFolder, deleteFolder, renameFolder } from "@/lib/api";
import { Panel, panelClassName } from "@/components/ui/panel";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field-error";
import { FormField } from "@/components/ui/form-field";
import { linkClassName } from "@/components/ui/text-link";

export type FolderRow = {
  id: number;
  name: string;
  setCount: number;
};

// ADR-014: folder management. Rename is an inline swap; delete is the
// inline two-step confirm with copy naming the outcome — filed sets stay,
// unfiled. The visible list change is the success feedback; errors are
// inline FieldErrors (ADR-013 rejected toasts).
export function FoldersManager({ folders }: { folders: FolderRow[] }) {
  const router = useRouter();
  const [newName, setNewName] = useState("");
  const [createError, setCreateError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [renamingId, setRenamingId] = useState<number | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [confirmingId, setConfirmingId] = useState<number | null>(null);
  const [rowError, setRowError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCreateError(null);

    const parsed = folderNameSchema.safeParse(newName);
    if (!parsed.success) {
      setCreateError(parsed.error.issues[0]?.message ?? "Enter a folder name");
      return;
    }

    setIsCreating(true);
    try {
      await createFolder({ name: parsed.data });
      setNewName("");
      router.refresh();
    } catch (error) {
      setCreateError(
        error instanceof ApiError
          ? error.message
          : "Creating the folder failed. Try again.",
      );
    } finally {
      setIsCreating(false);
    }
  }

  function startRename(folder: FolderRow) {
    setConfirmingId(null);
    setRowError(null);
    setRenamingId(folder.id);
    setRenameValue(folder.name);
  }

  async function handleRename(folderId: number) {
    setRowError(null);

    const parsed = folderNameSchema.safeParse(renameValue);
    if (!parsed.success) {
      setRowError(parsed.error.issues[0]?.message ?? "Enter a folder name");
      return;
    }

    setIsSaving(true);
    try {
      await renameFolder(folderId, { name: parsed.data });
      setRenamingId(null);
      router.refresh();
    } catch (error) {
      setRowError(
        error instanceof ApiError
          ? error.message
          : "Renaming the folder failed. Try again.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(folderId: number) {
    setRowError(null);
    setIsSaving(true);
    try {
      await deleteFolder(folderId);
      // A 404 for an already-deleted folder achieves the goal either way —
      // the refresh shows the list without it (mirroring SET-013).
      setConfirmingId(null);
      router.refresh();
    } catch (error) {
      setIsSaving(false);
      if (error instanceof ApiError && error.code === "FOLDER_NOT_FOUND") {
        setConfirmingId(null);
        router.refresh();
      } else {
        setRowError(
          error instanceof ApiError
            ? error.message
            : "Deleting the folder failed. Try again.",
        );
      }
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <Panel>
        <form
          className="flex flex-col gap-3 sm:flex-row sm:items-end"
          noValidate
          onSubmit={(event) => void handleCreate(event)}
        >
          <FormField
            label="New folder"
            id="new-folder"
            autoComplete="off"
            value={newName}
            onChange={(event) => setNewName(event.target.value)}
            error={createError ?? undefined}
          />
          <Button type="submit" disabled={isCreating}>
            <FolderPlus aria-hidden className="h-4 w-4 shrink-0" />
            Create folder
          </Button>
        </form>
      </Panel>
      {folders.length === 0 ? (
        <p className="text-ink-soft">
          No folders yet. Create one to group your sets.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {folders.map((folder) => (
            <li key={folder.id} className={panelClassName}>
              {renamingId === folder.id ? (
                <form
                  className="flex flex-col gap-3"
                  noValidate
                  onSubmit={(event) => {
                    event.preventDefault();
                    void handleRename(folder.id);
                  }}
                >
                  <FormField
                    label="Folder name"
                    id={`rename-${folder.id}`}
                    autoComplete="off"
                    value={renameValue}
                    onChange={(event) => setRenameValue(event.target.value)}
                    error={rowError ?? undefined}
                  />
                  <div className="flex gap-3">
                    <Button type="submit" disabled={isSaving}>
                      Save
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setRenamingId(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              ) : confirmingId === folder.id ? (
                <div className="flex flex-col gap-3">
                  <p className="text-sm text-ink-soft">
                    Delete this folder? Its sets stay in your library, unfiled.
                  </p>
                  {rowError ? <FieldError>{rowError}</FieldError> : null}
                  <div className="flex gap-3">
                    <Button
                      variant="secondary"
                      onClick={() => void handleDelete(folder.id)}
                      disabled={isSaving}
                    >
                      Confirm delete
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => setConfirmingId(null)}
                      disabled={isSaving}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="font-medium">
                    {folder.name}
                    <span className="ml-2 text-sm font-normal text-ink-soft">
                      {folder.setCount === 1
                        ? "1 set"
                        : `${folder.setCount} sets`}
                    </span>
                  </span>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      className={linkClassName}
                      onClick={() => startRename(folder)}
                    >
                      <Pencil aria-hidden className="h-4 w-4 shrink-0" />
                      Rename
                    </button>
                    <button
                      type="button"
                      className={linkClassName}
                      onClick={() => {
                        setRenamingId(null);
                        setRowError(null);
                        setConfirmingId(folder.id);
                      }}
                    >
                      <Trash2 aria-hidden className="h-4 w-4 shrink-0" />
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
