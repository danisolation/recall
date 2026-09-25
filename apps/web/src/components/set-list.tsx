import Link from "next/link";
import type { StudySet } from "@/lib/sets";

// Same link register as the dashboard's "New set" link.
const textLink =
  "rounded-sm font-medium underline underline-offset-4 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink";

const card =
  "rounded-card border border-ink/10 bg-card p-4 shadow-[4px_4px_0_0] shadow-ink/15 sm:p-6";

export function SetList({ sets }: { sets: StudySet[] }) {
  if (sets.length === 0) {
    return (
      <section className={card}>
        <p className="text-ink-soft">
          Create your first study set to start learning.
        </p>
        <Link href="/sets/new" className={`${textLink} mt-3 inline-block`}>
          Create a set
        </Link>
      </section>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {sets.map((set) => (
        <li key={set.id}>
          <Link
            href={`/sets/${set.id}`}
            className={`${card} block focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink`}
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
