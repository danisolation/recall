import Link from "next/link";
import { BookOpen } from "lucide-react";
import { Panel, panelClassName } from "@/components/ui/panel";
import { TextLink } from "@/components/ui/text-link";
import type { StudySet } from "@/lib/sets";

export function SetList({ sets }: { sets: StudySet[] }) {
  if (sets.length === 0) {
    return (
      <Panel className="flex flex-col items-center gap-2 py-8 text-center">
        <BookOpen aria-hidden className="h-6 w-6 text-ink-soft" />
        <p className="text-ink-soft">
          Create your first study set to start learning.
        </p>
        <TextLink href="/sets/new" className="mt-3 inline-block">
          Create a set
        </TextLink>
      </Panel>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {sets.map((set) => (
        <li key={set.id}>
          <Link
            href={`/sets/${set.id}`}
            // ADR-018: the panel register gives the tile the clay surface, and
            // the soft-press is what makes it read as something you can click
            // rather than a static card. Focus is not repeated here — the
            // single `:focus-visible` rule in globals.css owns it, and the
            // old `outline-ink` utilities here had been dead since the token
            // was retired.
            className={`${panelClassName} block transition-[transform,box-shadow] active:translate-y-0.5 active:shadow-clay-pressed motion-reduce:transition-none`}
          >
            <span className="block font-medium">{set.title}</span>
            {set.description && (
              <span className="mt-1 block text-sm text-ink-soft">
                {set.description}
              </span>
            )}
          </Link>
        </li>
      ))}
    </ul>
  );
}
