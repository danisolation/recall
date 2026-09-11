import { LogoutButton } from "./logout-button";

export function UserMenu({ email }: { email: string }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <p className="text-sm text-ink-soft">
        Signed in as <span className="font-medium text-ink">{email}</span>
      </p>
      <LogoutButton />
    </div>
  );
}
