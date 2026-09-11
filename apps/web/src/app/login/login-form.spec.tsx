import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LoginForm } from "./login-form";

afterEach(cleanup);

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
    const onValid = vi.fn();
    render(<LoginForm onValid={onValid} />);

    await userEvent.click(screen.getByRole("button", { name: "Log in" }));

    const alerts = await screen.findAllByRole("alert");
    expect(alerts.map((alert) => alert.textContent)).toEqual([
      "Enter your email address",
      "Enter your password",
    ]);
    expect(onValid).not.toHaveBeenCalled();
  });

  it("submits normalized valid input without errors", async () => {
    const onValid = vi.fn();
    render(<LoginForm onValid={onValid} />);

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
      expect(onValid).toHaveBeenCalledWith({
        email: "user@example.com",
        password: "correct horse battery staple",
      }),
    );
    expect(screen.queryAllByRole("alert")).toHaveLength(0);
  });
});
