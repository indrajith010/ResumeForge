import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { TemplatesPage } from "./TemplatesPage";

vi.mock("../../contexts/AuthContext", () => ({
  useAuth: () => ({ user: null, loading: false, signInWithGoogle: vi.fn(), logout: vi.fn() }),
}));

describe("TemplatesPage", () => {
  it("renders all 3 templates with a visual preview and a clear CTA each", () => {
    render(
      <MemoryRouter>
        <TemplatesPage />
      </MemoryRouter>
    );

    expect(screen.getByText("Classic ATS")).toBeInTheDocument();
    expect(screen.getByText("Modern Professional")).toBeInTheDocument();
    expect(screen.getByText("Minimal Clean")).toBeInTheDocument();

    const ctas = screen.getAllByRole("button", { name: /use this template/i });
    expect(ctas).toHaveLength(3);
  });
});
