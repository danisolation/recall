import type { Metadata } from "next";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Log in — DANISOLATION Recall",
};

export default function LoginPage() {
  return (
    <main>
      <h1>Log in</h1>
      <LoginForm />
    </main>
  );
}
