import { Panel } from "@/components/ui/panel";
import { Skeleton } from "@/components/ui/skeleton";

// §56: the progress page's waiting state mirrors the three-stat summary
// row until the server data arrives.
export default function ProgressLoading() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true">
      <Skeleton className="h-8 w-40" />
      <div className="grid gap-3 sm:grid-cols-3">
        <Panel>
          <Skeleton className="h-20 w-full" />
        </Panel>
        <Panel>
          <Skeleton className="h-20 w-full" />
        </Panel>
        <Panel>
          <Skeleton className="h-20 w-full" />
        </Panel>
      </div>
    </div>
  );
}
