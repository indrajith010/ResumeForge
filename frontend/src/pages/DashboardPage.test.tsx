import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { DashboardPage } from "./DashboardPage";
import { api } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";
import { ThemeProvider } from "../contexts/ThemeContext";
import type { Resume } from "../types/resume";

function renderDashboard() {
  return render(
    <ThemeProvider>
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    </ThemeProvider>
  );
}

vi.mock("../lib/api", () => ({
  api: {
    listResumes: vi.fn(),
    deleteResume: vi.fn(),
    createResume: vi.fn(),
  },
}));

vi.mock("../contexts/AuthContext", () => ({
  useAuth: vi.fn(),
}));

function makeResume(overrides: Partial<Resume> = {}): Resume {
  return {
    id: 1,
    user_id: "u1",
    title: "My Resume",
    full_name: "Jane Doe",
    job_title: "Engineer",
    email: "",
    phone: "",
    location: "",
    website: "",
    linkedin: "",
    summary: "",
    skills: [],
    education: [],
    experience: [],
    projects: [],
    certifications: [],
    languages: [],
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    ...overrides,
  };
}

describe("DashboardPage delete confirmation", () => {
  beforeEach(() => {
    vi.mocked(useAuth).mockReturnValue({
      user: { displayName: "Jane", email: "jane@example.com", photoURL: null } as never,
      loading: false,
      signInWithGoogle: vi.fn(),
      logout: vi.fn(),
    });
  });

  it("does not delete the resume until the confirmation dialog is accepted", async () => {
    const resume = makeResume();
    vi.mocked(api.listResumes).mockResolvedValue([resume]);
    vi.mocked(api.deleteResume).mockResolvedValue(undefined);

    renderDashboard();

    await screen.findByText("My Resume");

    fireEvent.click(screen.getByRole("button", { name: /delete resume/i }));

    // The dialog should appear, and the API must not be called yet.
    expect(await screen.findByRole("alertdialog")).toBeInTheDocument();
    expect(api.deleteResume).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Delete" }));

    await waitFor(() => expect(api.deleteResume).toHaveBeenCalledWith(1));
    await waitFor(() => expect(screen.queryByText("My Resume")).not.toBeInTheDocument());
  });

  it("keeps the resume when the confirmation dialog is cancelled", async () => {
    const resume = makeResume();
    vi.mocked(api.listResumes).mockResolvedValue([resume]);

    renderDashboard();

    await screen.findByText("My Resume");
    fireEvent.click(screen.getByRole("button", { name: /delete resume/i }));
    await screen.findByRole("alertdialog");

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    expect(api.deleteResume).not.toHaveBeenCalled();
    expect(screen.getByText("My Resume")).toBeInTheDocument();
  });
});
