import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import SelfHealingPipelineFlow from "@/components/pipeline/SelfHealingPipelineFlow";

describe("SelfHealingPipelineFlow", () => {
  it("renders the title", () => {
    render(<SelfHealingPipelineFlow pipelineState="idle" visibleDiff={false} />);
    expect(screen.getByText("Pipeline Flow Topology")).toBeTruthy();
  });

  it("does not show code diff when visibleDiff is false", () => {
    render(<SelfHealingPipelineFlow pipelineState="healing" visibleDiff={false} />);
    expect(screen.queryByText("AUTO FIX")).toBeNull();
  });

  it("shows code diff when visibleDiff is true", () => {
    render(<SelfHealingPipelineFlow pipelineState="healing" visibleDiff={true} />);
    expect(screen.getByText(/AUTO FIX/)).toBeTruthy();
  });

  it("shows the old and new database url lines in the diff", () => {
    render(<SelfHealingPipelineFlow pipelineState="healing" visibleDiff={true} />);
    expect(screen.getByText(/connection_limit=10/)).toBeTruthy();
    expect(screen.getByText(/connection_limit=50/)).toBeTruthy();
  });

  it("renders the DAG visualization SVG element", () => {
    const { container } = render(<SelfHealingPipelineFlow pipelineState="idle" visibleDiff={false} />);
    // The DAG renders an <svg> element
    const svgs = container.querySelectorAll("svg");
    expect(svgs.length).toBeGreaterThanOrEqual(1);
  });
});
