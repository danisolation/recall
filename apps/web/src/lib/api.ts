import type {
  CreateCardInput,
  CreateSetInput,
  LoginInput,
  RegisterInput,
  UpdateCardInput,
  UpdateSetInput,
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

async function request(
  method: string,
  path: string,
  data?: unknown,
): Promise<Response> {
  return fetch(`${API_BASE}${path}`, {
    method,
    ...(data === undefined
      ? {}
      : {
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }),
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
  const response = await request("POST", "/auth/login", input);

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
  const response = await request("POST", "/auth/register", input);

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

export async function logoutUser(): Promise<void> {
  const response = await request("POST", "/auth/logout");

  if (response.ok) {
    return;
  }

  throw new ApiError("UNKNOWN", "Logging out failed. Try again.");
}

export async function createSet(
  input: CreateSetInput,
): Promise<{ id: number }> {
  const response = await request("POST", "/sets", input);

  if (response.ok) {
    const body: unknown = await response.json();

    if (
      typeof body === "object" &&
      body !== null &&
      "id" in body &&
      typeof body.id === "number"
    ) {
      return { id: body.id };
    }
  }

  throw new ApiError("UNKNOWN", "Creating your set failed. Try again.");
}

export async function createCard(
  setId: number,
  input: CreateCardInput,
): Promise<void> {
  const response = await request("POST", `/sets/${setId}/cards`, input);

  if (response.ok) {
    return;
  }

  if (
    response.status === 404 &&
    (await errorCode(response)) === "SET_NOT_FOUND"
  ) {
    throw new ApiError("SET_NOT_FOUND", "This set no longer exists.");
  }

  throw new ApiError("UNKNOWN", "Adding the card failed. Try again.");
}

export async function updateCard(
  setId: number,
  cardId: number,
  input: UpdateCardInput,
): Promise<void> {
  const response = await request(
    "PATCH",
    `/sets/${setId}/cards/${cardId}`,
    input,
  );

  if (response.ok) {
    return;
  }

  if (
    response.status === 404 &&
    (await errorCode(response)) === "CARD_NOT_FOUND"
  ) {
    throw new ApiError("CARD_NOT_FOUND", "This card no longer exists.");
  }

  throw new ApiError("UNKNOWN", "Saving your changes failed. Try again.");
}

export async function deleteCard(
  setId: number,
  cardId: number,
): Promise<void> {
  const response = await request("DELETE", `/sets/${setId}/cards/${cardId}`);

  if (response.ok) {
    return;
  }

  if (
    response.status === 404 &&
    (await errorCode(response)) === "CARD_NOT_FOUND"
  ) {
    throw new ApiError("CARD_NOT_FOUND", "This card no longer exists.");
  }

  throw new ApiError("UNKNOWN", "Deleting the card failed. Try again.");
}

export async function moveCard(
  setId: number,
  cardId: number,
  position: number,
): Promise<void> {
  const response = await request(
    "PATCH",
    `/sets/${setId}/cards/${cardId}/position`,
    { position },
  );

  if (response.ok) {
    return;
  }

  if (
    response.status === 404 &&
    (await errorCode(response)) === "CARD_NOT_FOUND"
  ) {
    throw new ApiError("CARD_NOT_FOUND", "This card no longer exists.");
  }

  throw new ApiError("UNKNOWN", "Moving the card failed. Try again.");
}

export async function updateSet(
  id: number,
  input: UpdateSetInput,
): Promise<void> {
  const response = await request("PATCH", `/sets/${id}`, input);

  if (response.ok) {
    return;
  }

  if (
    response.status === 404 &&
    (await errorCode(response)) === "SET_NOT_FOUND"
  ) {
    throw new ApiError("SET_NOT_FOUND", "This set no longer exists.");
  }

  throw new ApiError("UNKNOWN", "Saving your changes failed. Try again.");
}

export async function deleteSet(id: number): Promise<void> {
  const response = await request("DELETE", `/sets/${id}`);

  if (response.ok) {
    return;
  }

  if (
    response.status === 404 &&
    (await errorCode(response)) === "SET_NOT_FOUND"
  ) {
    throw new ApiError("SET_NOT_FOUND", "This set no longer exists.");
  }

  throw new ApiError("UNKNOWN", "Deleting your set failed. Try again.");
}
