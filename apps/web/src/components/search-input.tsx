import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// ADR-011: the dashboard's search is a plain form — submitting is a GET to
// /dashboard, so the query lives in the URL (§23) and the filtering stays
// server-rendered with zero client JavaScript.
export function SearchInput({ initialQuery = "" }: { initialQuery?: string }) {
  return (
    <form action="/dashboard" method="get" className="flex items-end gap-3">
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
      <Button type="submit">Search</Button>
    </form>
  );
}
