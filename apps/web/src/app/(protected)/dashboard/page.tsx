import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";

export const metadata: Metadata = {
  title: "Dashboard — DANISOLATION Recall",
};

// Same link register as the home page navigation.
const newSetLink =
  "rounded-sm font-medium underline underline-offset-4 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink";

// Fixed locale and zone keep the rendered date identical on the server and
// during hydration, so the markup cannot mismatch.
const memberSince = new Intl.DateTimeFormat("en-US", {
  dateStyle: "long",
  timeZone: "UTC",
});

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <Link href="/sets/new" className={newSetLink}>
          New set
        </Link>
      </div>
      <section className="rounded-card border border-ink/10 bg-card p-4 shadow-[4px_4px_0_0] shadow-ink/15 sm:p-6">
        <h2 className="text-lg font-semibold">Your account</h2>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <dt className="text-sm text-ink-soft">Email</dt>
            <dd className="font-medium">{user.email}</dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="text-sm text-ink-soft">Member since</dt>
            <dd className="font-medium">
              <time dateTime={user.createdAt}>
                {memberSince.format(new Date(user.createdAt))}
              </time>
            </dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
