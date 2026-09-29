import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ResumeUploadButton } from "./ResumeUploadButton";
import { api } from "../lib/api";

vi.mock("../lib/api", () => ({
  api: {
    importResume: vi.fn(),
  },
}));

function getFileInput(): HTMLInputElement {
  return document.querySelector("input[type=file]") as HTMLInputElement;
}

function selectFile(file: File) {
  const input = getFileInput();
  Object.defineProperty(input, "files", { value: [file], configurable: true });
  fireEvent.change(input);
}

describe("ResumeUploadButton", () => {
  it("rejects unsupported file extensions without calling the API", async () => {
    const onImported = vi.fn();
    render(<ResumeUploadButton onImported={onImported} />);

    const file = new File(["hello"], "resume.txt", { type: "text/plain" });
    selectFile(file);

    expect(await screen.findByRole("alert")).toHaveTextContent(/PDF.*DOCX|unsupported/i);
    expect(api.importResume).not.toHaveBeenCalled();
    expect(onImported).not.toHaveBeenCalled();
  });

  it("rejects empty files without calling the API", async () => {
    const onImported = vi.fn();
    render(<ResumeUploadButton onImported={onImported} />);

    const file = new File([], "resume.pdf", { type: "application/pdf" });
    selectFile(file);

    expect(await screen.findByRole("alert")).toHaveTextContent(/empty/i);
    expect(api.importResume).not.toHaveBeenCalled();
  });

  it("rejects files over the 10MB limit without calling the API", async () => {
    const onImported = vi.fn();
    render(<ResumeUploadButton onImported={onImported} />);

    const bigContent = new Uint8Array(11 * 1024 * 1024);
    const file = new File([bigContent], "resume.pdf", { type: "application/pdf" });
    selectFile(file);

    expect(await screen.findByRole("alert")).toHaveTextContent(/too large/i);
    expect(api.importResume).not.toHaveBeenCalled();
  });

  it("accepts a valid PDF, calls the API, and invokes onImported with the parsed result", async () => {
    const parsed = { title: "Imported Resume", full_name: "Jordan Lee" };
    vi.mocked(api.importResume).mockResolvedValue(parsed as never);
    const onImported = vi.fn().mockResolvedValue(undefined);

    render(<ResumeUploadButton onImported={onImported} />);

    const file = new File(["%PDF-1.4 fake content"], "resume.pdf", { type: "application/pdf" });
    selectFile(file);

    await waitFor(() => expect(onImported).toHaveBeenCalledWith(parsed));
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("shows the server's error message when the import API call fails", async () => {
    vi.mocked(api.importResume).mockRejectedValue(new Error("Could not read this PDF file."));
    const onImported = vi.fn();

    render(<ResumeUploadButton onImported={onImported} />);

    const file = new File(["%PDF-1.4 fake content"], "resume.pdf", { type: "application/pdf" });
    selectFile(file);

    expect(await screen.findByRole("alert")).toHaveTextContent("Could not read this PDF file.");
    expect(onImported).not.toHaveBeenCalled();
  });
});
