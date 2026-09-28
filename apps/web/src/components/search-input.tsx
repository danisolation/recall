import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// ADR-011: the dashboard's search is a plain form — submitting is a GET to
// /dashboard, so the query lives in the URL (§23) and the filtering stays
// server-rendered with zero client JavaScript. An active tag filter rides
// along as a hidden field, so both filters keep composing on submit.
export function SearchInput({
  initialQuery = "",
  tagId,
}: {
  initialQuery?: string;
  tagId?: number;
}) {
  return (
    <form action="/dashboard" method="get" className="flex items-end gap-3">
      {tagId !== undefined ? (
        <input type="hidden" name="tag" value={tagId} />
      ) : null}
      <div className="flex flex-col gap-1">
        <label htmlFor="set-search" className="text-sm text-ink-soft">
          Search sets
        </label>
        <Input
          id="set-search"
          name="q"
          type="search"
          defaultValue={initialQuery}
          placeholder="Search your sets"
          className="sm:w-72"
        />
      </div>
      <Button type="submit">
        <Search aria-hidden className="h-4 w-4 shrink-0" />
        Search
      </Button>
    </form>
  );
}
