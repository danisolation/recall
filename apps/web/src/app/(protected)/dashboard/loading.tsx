import { Panel } from "@/components/ui/panel";
import { Skeleton } from "@/components/ui/skeleton";

// §56: the dashboard's waiting state mirrors the page's shape (title row,
// search, list panels) until the server data arrives.
export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true">
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-11 w-full sm:w-72" />
      <Panel>
        <Skeleton className="h-16 w-full" />
      </Panel>
      <Panel>
        <Skeleton className="h-16 w-full" />
      </Panel>
    </div>
  );
}
