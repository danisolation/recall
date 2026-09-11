import {
  type LoginInput,
  type RegisterInput,
} from "@danisolation-recall/contracts";

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

async function post(path: string, data: unknown): Promise<Response> {
  return fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    credentials: "include",
  });
}

async function errorCode(response: Response): Promise<string | null> {
  const body: unknown = await response.json().catch(() => null);

  if (
    typeof body === "object" &&
    body !== null &&
    "code" in body &&
    typeof body.code === "string"
  ) {
    return body.code;
  }

  return null;
}

export async function loginUser(input: LoginInput): Promise<void> {
  const response = await post("/auth/login", input);

  if (response.ok) {
    return;
  }

  if (
    response.status === 401 &&
    (await errorCode(response)) === "INVALID_CREDENTIALS"
  ) {
    throw new ApiError(
      "INVALID_CREDENTIALS",
      "Email or password is incorrect.",
    );
  }

  throw new ApiError("UNKNOWN", "Logging in failed. Try again.");
}

export async function registerUser(input: RegisterInput): Promise<void> {
  const response = await post("/auth/register", input);

  if (response.ok) {
    return;
  }

  if (
    response.status === 409 &&
    (await errorCode(response)) === "EMAIL_ALREADY_REGISTERED"
  ) {
    throw new ApiError(
      "EMAIL_ALREADY_REGISTERED",
      "An account with this email already exists.",
    );
  }

  throw new ApiError("UNKNOWN", "Creating your account failed. Try again.");
}
