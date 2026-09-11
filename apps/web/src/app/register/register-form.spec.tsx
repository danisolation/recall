import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/lib/api";
import { RegisterForm } from "./register-form";

const { registerUserMock, loginUserMock, replaceMock } = vi.hoisted(() => ({
  registerUserMock: vi.fn(),
  loginUserMock: vi.fn(),
  replaceMock: vi.fn(),
}));

vi.mock("@/lib/api", () => ({
  ApiError: class ApiError extends Error {
    constructor(
      readonly code: string,
      message: string,
    ) {
      super(message);
    }
  },
  registerUser: registerUserMock,
  loginUser: loginUserMock,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: replaceMock }),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("RegisterForm", () => {
  it("renders email and password fields with a submit button", () => {
    render(<RegisterForm />);

    expect(screen.getByLabelText("Email")).toHaveAttribute("type", "email");
    expect(screen.getByLabelText("Password")).toHaveAttribute(
      "type",
      "password",
    );
    expect(
      screen.getByRole("button", { name: "Create account" }),
    ).toBeInTheDocument();
  });

  it("shows clear errors and does not submit a short password", async () => {
    render(<RegisterForm />);

    await userEvent.type(screen.getByLabelText("Email"), "user@example.com");
    await userEvent.type(screen.getByLabelText("Password"), "short");
    await userEvent.click(
      screen.getByRole("button", { name: "Create account" }),
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Use at least 8 characters",
    );
    expect(registerUserMock).not.toHaveBeenCalled();
  });

  it("registers, signs in, and redirects on success", async () => {
    registerUserMock.mockResolvedValue(undefined);
    loginUserMock.mockResolvedValue(undefined);
    render(<RegisterForm />);

    await userEvent.type(screen.getByLabelText("Email"), "New@Example.COM");
    await userEvent.type(
      screen.getByLabelText("Password"),
      "correct horse battery staple",
    );
    await userEvent.click(
      screen.getByRole("button", { name: "Create account" }),
    );

    const expected = {
      email: "new@example.com",
      password: "correct horse battery staple",
    };
    await waitFor(() => expect(registerUserMock).toHaveBeenCalledWith(expected));
    await waitFor(() => expect(loginUserMock).toHaveBeenCalledWith(expected));
    await waitFor(() => expect(replaceMock).toHaveBeenCalledWith("/"));
    expect(screen.queryAllByRole("alert")).toHaveLength(0);
  });

  it("shows a form error when the email is already registered", async () => {
    registerUserMock.mockRejectedValue(
      new ApiError(
        "EMAIL_ALREADY_REGISTERED",
        "An account with this email already exists.",
      ),
    );
    render(<RegisterForm />);

    await userEvent.type(screen.getByLabelText("Email"), "user@example.com");
    await userEvent.type(
      screen.getByLabelText("Password"),
      "correct horse battery staple",
    );
    await userEvent.click(
      screen.getByRole("button", { name: "Create account" }),
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "An account with this email already exists.",
    );
    expect(loginUserMock).not.toHaveBeenCalled();
    expect(replaceMock).not.toHaveBeenCalled();
  });
});
