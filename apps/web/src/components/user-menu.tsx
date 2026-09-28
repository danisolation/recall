import { UserRound } from "lucide-react";
import { LogoutButton } from "./logout-button";

/*
 * ADR-018: the account line was bare text floating between the wordmark and
 * the logout button, so it had no visual weight of its own. Seating it on a
 * pill-shaped clay chip gives the header a third object to look at without
 * touching the copy. The `UserRound` icon is decorative (`aria-hidden`) and
 * never replaces the label — ADR-013's icon rule, retained.
 */
export function UserMenu({ email }: { email: string }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <p className="flex items-center gap-2 rounded-full border-[3px] border-border bg-card px-4 py-2 text-sm text-ink-soft shadow-clay">
        <UserRound aria-hidden className="h-4 w-4 shrink-0" />
        Signed in as{" "}
        <span className="font-medium text-ink">{email}</span>
      </p>
      <LogoutButton />
    </div>
  );
}
