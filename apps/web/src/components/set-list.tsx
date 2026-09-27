import Link from "next/link";
import { Panel, panelClassName } from "@/components/ui/panel";
import { TextLink } from "@/components/ui/text-link";
import type { StudySet } from "@/lib/sets";

export function SetList({ sets }: { sets: StudySet[] }) {
  if (sets.length === 0) {
    return (
      <Panel>
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
            className={`${panelClassName} block focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink`}
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
