import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ParallelSimulatorInput from "@/components/parallel/ParallelSimulatorInput";
import { templates } from "@/components/parallel/parallelData";

const defaultProps = {
  query: "",
  isLoading: false,
  isLoadingAI: false,
  aiStatus: "idle" as const,
  templates,
  onQueryChange: vi.fn(),
  onEnterPress: vi.fn(),
  onSimulate: vi.fn(),
  onTemplateClick: vi.fn(),
};

describe("ParallelSimulatorInput", () => {
  it("renders the title and description", () => {
    render(<ParallelSimulatorInput {...defaultProps} />);
    expect(screen.getByText("Parallel Universe Simulation Engine")).toBeTruthy();
    expect(screen.getByText(/Forecast the impact/)).toBeTruthy();
  });

  it("renders the search input with placeholder", () => {
    render(<ParallelSimulatorInput {...defaultProps} />);
    const input = screen.getByPlaceholderText(/Enter scenario/);
    expect(input).toBeTruthy();
  });

  it("renders the Simulate Branch button", () => {
    render(<ParallelSimulatorInput {...defaultProps} />);
    expect(screen.getByText("Simulate Branch")).toBeTruthy();
  });

  it("renders all 4 template buttons", () => {
    render(<ParallelSimulatorInput {...defaultProps} />);
    for (const t of templates) {
      expect(screen.getByText(t.text)).toBeTruthy();
    }
  });

  it("calls onQueryChange when typing in the input", () => {
    const onQueryChange = vi.fn();
    render(<ParallelSimulatorInput {...defaultProps} onQueryChange={onQueryChange} />);
    const input = screen.getByPlaceholderText(/Enter scenario/);
    fireEvent.change(input, { target: { value: "test query" } });
    expect(onQueryChange).toHaveBeenCalledWith("test query");
  });

  it("calls onEnterPress when Enter is pressed", () => {
    const onEnterPress = vi.fn();
    render(<ParallelSimulatorInput {...defaultProps} onEnterPress={onEnterPress} />);
    const input = screen.getByPlaceholderText(/Enter scenario/);
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onEnterPress).toHaveBeenCalledOnce();
  });

  it("calls onSimulate when button is clicked", () => {
    const onSimulate = vi.fn();
    render(<ParallelSimulatorInput {...defaultProps} onSimulate={onSimulate} />);
    fireEvent.click(screen.getByText("Simulate Branch"));
    expect(onSimulate).toHaveBeenCalledOnce();
  });

  it("calls onTemplateClick when a template is clicked", () => {
    const onTemplateClick = vi.fn();
    render(<ParallelSimulatorInput {...defaultProps} onTemplateClick={onTemplateClick} />);
    fireEvent.click(screen.getByText(templates[0].text));
    expect(onTemplateClick).toHaveBeenCalledWith(templates[0].text);
  });

  it("shows loading text when isLoading is true", () => {
    render(<ParallelSimulatorInput {...defaultProps} isLoading={true} />);
    expect(screen.getByText("Simulating...")).toBeTruthy();
  });

  it("disables the button when isLoading is true", () => {
    render(<ParallelSimulatorInput {...defaultProps} isLoading={true} />);
    const button = screen.getByText("Simulating...");
    expect((button as HTMLButtonElement).disabled).toBe(true);
  });

  it("shows AI generating indicator when isLoadingAI is true", () => {
    render(<ParallelSimulatorInput {...defaultProps} isLoadingAI={true} aiStatus="generating" />);
    expect(screen.getByText(/AI agents calculating/)).toBeTruthy();
  });

  it("shows fallback indicator when AI is offline", () => {
    render(<ParallelSimulatorInput {...defaultProps} aiStatus="fallback" />);
    expect(screen.getByText(/AI offline/)).toBeTruthy();
  });

  it("shows ready indicator when AI generation is ready", () => {
    render(<ParallelSimulatorInput {...defaultProps} aiStatus="ready" />);
    expect(screen.getByText(/AI-generated simulation ready/)).toBeTruthy();
  });

  it("does not show any AI indicator when idle", () => {
    render(<ParallelSimulatorInput {...defaultProps} aiStatus="idle" />);
    expect(screen.queryByText(/AI agents calculating/)).toBeNull();
    expect(screen.queryByText(/AI offline/)).toBeNull();
    expect(screen.queryByText(/AI-generated simulation ready/)).toBeNull();
  });
});
