import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";

// ADR-011: the dashboard's search is a plain form — submitting is a GET to
// /dashboard, so the query lives in the URL (§23) and the filtering stays
// server-rendered with zero client JavaScript. An active tag filter rides
// along as a hidden field, so both filters keep composing on submit.
// ADR-018: the field is a plain `FormField` like every other form in the app,
// so the label sits in the shared register (semibold ink, highlighted on
// focus-within) instead of this file inventing a second, weaker label style.
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
      <FormField
        label="Search sets"
        id="set-search"
        name="q"
        type="search"
        defaultValue={initialQuery}
        placeholder="Search your sets"
        className="sm:w-72"
      />
      <Button type="submit">
        <Search aria-hidden className="h-4 w-4 shrink-0" />
        Search
      </Button>
    </form>
  );
}
