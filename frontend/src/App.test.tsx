import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import App from "./App";

// Avoid touching real Firebase (network calls, auth listeners) in a routing smoke test.
vi.mock("./contexts/AuthContext", () => ({
  AuthProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
  useAuth: () => ({ user: null, loading: false, signInWithGoogle: vi.fn(), logout: vi.fn() }),
}));

function renderAt(path: string) {
  window.history.pushState({}, "", path);
  return render(<App />);
}

describe("App routing", () => {
  it("renders the public home page at /", () => {
    renderAt("/");
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/actually gets/i);
  });

  it("renders the features page", () => {
    renderAt("/features");
    expect(screen.getByRole("heading", { name: /everything resumeforge does/i })).toBeInTheDocument();
  });

  it("renders the templates page", () => {
    renderAt("/templates");
    expect(screen.getByRole("heading", { name: /resume templates/i })).toBeInTheDocument();
  });

  it("renders the about page", () => {
    renderAt("/about");
    expect(screen.getByRole("heading", { name: /about resumeforge/i })).toBeInTheDocument();
  });

  it("renders the blog list page", () => {
    renderAt("/blog");
    expect(screen.getByRole("heading", { name: /the resumeforge blog/i })).toBeInTheDocument();
  });

  it("renders a blog post detail page", () => {
    renderAt("/blog/what-is-an-ats-and-why-it-matters");
    expect(
      screen.getByRole("heading", { level: 1, name: /what is an ats/i })
    ).toBeInTheDocument();
  });

  it("redirects an unknown blog slug back to the blog list", () => {
    renderAt("/blog/does-not-exist");
    expect(screen.getByRole("heading", { name: /the resumeforge blog/i })).toBeInTheDocument();
  });

  it("renders a 404 page for an unknown route", () => {
    renderAt("/this-route-does-not-exist");
    expect(screen.getByText("404")).toBeInTheDocument();
  });

  it("redirects unauthenticated visitors away from the dashboard", () => {
    renderAt("/dashboard");
    // ProtectedRoute sends signed-out users to /login.
    expect(screen.getByRole("heading", { name: /welcome to resumeforge/i })).toBeInTheDocument();
  });
});
