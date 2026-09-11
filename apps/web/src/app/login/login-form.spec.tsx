import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LoginForm } from "./login-form";
import { ApiError } from "@/lib/api";

const { loginUserMock, replaceMock } = vi.hoisted(() => ({
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
  loginUser: loginUserMock,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: replaceMock }),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("LoginForm", () => {
  it("renders email and password fields with a submit button", () => {
    render(<LoginForm />);

    expect(screen.getByLabelText("Email")).toHaveAttribute("type", "email");
    expect(screen.getByLabelText("Password")).toHaveAttribute(
      "type",
      "password",
    );
    expect(
      screen.getByRole("button", { name: "Log in" }),
    ).toBeInTheDocument();
  });

  it("shows clear errors and does not submit invalid input", async () => {
    render(<LoginForm />);

    await userEvent.click(screen.getByRole("button", { name: "Log in" }));

    const alerts = await screen.findAllByRole("alert");
    expect(alerts.map((alert) => alert.textContent)).toEqual([
      "Enter your email address",
      "Enter your password",
    ]);
    expect(loginUserMock).not.toHaveBeenCalled();
  });

  it("logs in and redirects on success", async () => {
    loginUserMock.mockResolvedValue(undefined);
    render(<LoginForm />);

    await userEvent.type(
      screen.getByLabelText("Email"),
      "User@Example.COM",
    );
    await userEvent.type(
      screen.getByLabelText("Password"),
      "correct horse battery staple",
    );
    await userEvent.click(screen.getByRole("button", { name: "Log in" }));

    await waitFor(() =>
      expect(loginUserMock).toHaveBeenCalledWith({
        email: "user@example.com",
        password: "correct horse battery staple",
      }),
    );
    await waitFor(() => expect(replaceMock).toHaveBeenCalledWith("/"));
    expect(screen.queryAllByRole("alert")).toHaveLength(0);
  });

  it("shows a form error for invalid credentials", async () => {
    loginUserMock.mockRejectedValue(
      new ApiError(
        "INVALID_CREDENTIALS",
        "Email or password is incorrect.",
      ),
    );
    render(<LoginForm />);

    await userEvent.type(
      screen.getByLabelText("Email"),
      "user@example.com",
    );
    await userEvent.type(
      screen.getByLabelText("Password"),
      "wrong password",
    );
    await userEvent.click(screen.getByRole("button", { name: "Log in" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Email or password is incorrect.",
    );
    expect(replaceMock).not.toHaveBeenCalled();
  });

  it("shows a generic error for unexpected failures", async () => {
    loginUserMock.mockRejectedValue(new Error("network down"));
    render(<LoginForm />);

    await userEvent.type(
      screen.getByLabelText("Email"),
      "user@example.com",
    );
    await userEvent.type(
      screen.getByLabelText("Password"),
      "correct horse battery staple",
    );
    await userEvent.click(screen.getByRole("button", { name: "Log in" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Logging in failed. Try again.",
    );
    expect(replaceMock).not.toHaveBeenCalled();
  });
});
