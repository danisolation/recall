import type {
  CreateCardInput,
  CreateFolderInput,
  CreateSetInput,
  LoginInput,
  RegisterInput,
  ReviewInput,
  SetTagsInput,
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

export async function startSession(input: {
  setId: number;
}): Promise<{ id: number }> {
  const response = await request("POST", "/study-sessions", input);

  if (response.ok) {
    const body: unknown = await response.json();

    if (
      typeof body === "object" &&
      body !== null &&
      "session" in body &&
      typeof body.session === "object" &&
      body.session !== null &&
      "id" in body.session &&
      typeof body.session.id === "number"
    ) {
      return { id: body.session.id };
    }
  }

  if (
    response.status === 404 &&
    (await errorCode(response)) === "SET_NOT_FOUND"
  ) {
    throw new ApiError("SET_NOT_FOUND", "This set no longer exists.");
  }

  throw new ApiError("UNKNOWN", "Starting the study session failed. Try again.");
}

// The projection of ADR-009's session payload the study screen consumes.
export type StudySessionView = {
  session: {
    id: number;
    setId: number;
    status: string;
  };
  reviews: {
    id: number;
    cardId: number;
    correct: boolean;
  }[];
  cards: {
    id: number;
    front: string;
    back: string;
  }[];
};

export type RecordedReview = {
  id: number;
  cardId: number;
  correct: boolean;
};

export async function getSession(sessionId: number): Promise<StudySessionView> {
  const response = await request("GET", `/study-sessions/${sessionId}`);

  if (response.ok) {
    return (await response.json()) as StudySessionView;
  }

  if (
    response.status === 404 &&
    (await errorCode(response)) === "SESSION_NOT_FOUND"
  ) {
    throw new ApiError("SESSION_NOT_FOUND", "This session no longer exists.");
  }

  throw new ApiError("UNKNOWN", "Loading the study session failed. Try again.");
}

export async function recordReview(
  sessionId: number,
  input: ReviewInput,
): Promise<RecordedReview> {
  const response = await request(
    "POST",
    `/study-sessions/${sessionId}/reviews`,
    input,
  );

  if (response.ok) {
    return (await response.json()) as RecordedReview;
  }

  const code = await errorCode(response);

  if (response.status === 409 && code === "REVIEW_ALREADY_RECORDED") {
    throw new ApiError(
      "REVIEW_ALREADY_RECORDED",
      "This card was already answered in this session.",
    );
  }

  if (response.status === 404 && code === "CARD_NOT_FOUND") {
    throw new ApiError("CARD_NOT_FOUND", "This card no longer exists.");
  }

  if (response.status === 404 && code === "SESSION_NOT_FOUND") {
    throw new ApiError("SESSION_NOT_FOUND", "This session no longer exists.");
  }

  throw new ApiError("UNKNOWN", "Recording your answer failed. Try again.");
}

export async function finishSession(sessionId: number): Promise<void> {
  const response = await request(
    "POST",
    `/study-sessions/${sessionId}/finish`,
  );

  if (response.ok) {
    return;
  }

  throw new ApiError("UNKNOWN", "Finishing the session failed. Try again.");
}

// ADR-012's replace contract: the given names become exactly the set's tags.
export async function replaceTags(
  setId: number,
  input: SetTagsInput,
): Promise<void> {
  const response = await request("PUT", `/sets/${setId}/tags`, input);

  if (response.ok) {
    return;
  }

  if (
    response.status === 404 &&
    (await errorCode(response)) === "SET_NOT_FOUND"
  ) {
    throw new ApiError("SET_NOT_FOUND", "This set no longer exists.");
  }

  throw new ApiError("UNKNOWN", "Saving the tags failed. Try again.");
}

// ADR-014: folder management for the /folders page.
export async function createFolder(
  input: CreateFolderInput,
): Promise<{ id: number; name: string }> {
  const response = await request("POST", "/folders", input);

  if (response.ok) {
    return (await response.json()) as { id: number; name: string };
  }

  if (
    response.status === 409 &&
    (await errorCode(response)) === "FOLDER_NAME_TAKEN"
  ) {
    throw new ApiError(
      "FOLDER_NAME_TAKEN",
      "A folder with this name already exists.",
    );
  }

  throw new ApiError("UNKNOWN", "Creating the folder failed. Try again.");
}

export async function renameFolder(
  folderId: number,
  input: CreateFolderInput,
): Promise<void> {
  const response = await request("PATCH", `/folders/${folderId}`, input);

  if (response.ok) {
    return;
  }

  if (
    response.status === 404 &&
    (await errorCode(response)) === "FOLDER_NOT_FOUND"
  ) {
    throw new ApiError("FOLDER_NOT_FOUND", "This folder no longer exists.");
  }

  if (
    response.status === 409 &&
    (await errorCode(response)) === "FOLDER_NAME_TAKEN"
  ) {
    throw new ApiError(
      "FOLDER_NAME_TAKEN",
      "A folder with this name already exists.",
    );
  }

  throw new ApiError("UNKNOWN", "Renaming the folder failed. Try again.");
}

export async function deleteFolder(folderId: number): Promise<void> {
  const response = await request("DELETE", `/folders/${folderId}`);

  if (response.ok) {
    return;
  }

  if (
    response.status === 404 &&
    (await errorCode(response)) === "FOLDER_NOT_FOUND"
  ) {
    throw new ApiError("FOLDER_NOT_FOUND", "This folder no longer exists.");
  }

  throw new ApiError("UNKNOWN", "Deleting the folder failed. Try again.");
}
