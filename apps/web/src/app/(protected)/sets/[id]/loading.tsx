import { Panel } from "@/components/ui/panel";
import { Skeleton } from "@/components/ui/skeleton";

// §56: the set page's waiting state — title row with its study control,
// the info panel, then the cards area — mirrors the page's shape.
export default function SetLoading() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true">
      <div className="flex items-center justify-between gap-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-11 w-36" />
      </div>
      <Panel>
        <Skeleton className="h-20 w-full" />
      </Panel>
      <Panel>
        <Skeleton className="h-12 w-full" />
      </Panel>
    </div>
  );
}
