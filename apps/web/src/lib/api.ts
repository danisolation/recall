import { type LoginInput } from "@danisolation-recall/contracts";

const API_BASE = "/api";

export class ApiError extends Error {
  constructor(
    readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function loginUser(input: LoginInput): Promise<void> {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
    credentials: "include",
  });

  if (response.ok) {
    return;
  }

  const body: unknown = await response.json().catch(() => null);

  if (
    response.status === 401 &&
    typeof body === "object" &&
    body !== null &&
    "code" in body &&
    body.code === "INVALID_CREDENTIALS"
  ) {
    throw new ApiError(
      "INVALID_CREDENTIALS",
      "Email or password is incorrect.",
    );
  }

  throw new ApiError("UNKNOWN", "Logging in failed. Try again.");
}
