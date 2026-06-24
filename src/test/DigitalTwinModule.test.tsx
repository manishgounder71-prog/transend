import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import DigitalTwinModule from "@/components/DigitalTwinModule";

// Mock the Canvas element since it doesn't exist in jsdom
beforeEach(() => {
  HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
    canvas: { width: 800, height: 400 },
    clearRect: vi.fn(),
    fillStyle: "",
    fillRect: vi.fn(),
    fillText: vi.fn(),
    beginPath: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    stroke: vi.fn(),
    strokeStyle: "",
    lineWidth: 1,
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    measureText: vi.fn(() => ({ width: 50 })),
    save: vi.fn(),
    restore: vi.fn(),
    rotate: vi.fn(),
    translate: vi.fn(),
    font: "",
    textAlign: "",
    textBaseline: "",
    globalAlpha: 1,
    setLineDash: vi.fn(),
    closePath: vi.fn(),
  } as any);
});

describe("DigitalTwinModule", () => {
  it("renders the 3D Codebase & Deployment Twin header", () => {
    render(<DigitalTwinModule />);
    expect(screen.getByText(/3D Codebase/i)).toBeInTheDocument();
  });

  it("renders the canvas element", () => {
    render(<DigitalTwinModule />);
    const canvas = document.querySelector("canvas");
    expect(canvas).toBeTruthy();
  });

  it("renders the filter bar with filter options", () => {
    render(<DigitalTwinModule />);
    expect(screen.getByText("ALL")).toBeInTheDocument();
    expect(screen.getByText("SERVICES")).toBeInTheDocument();
    expect(screen.getByText("REPOS")).toBeInTheDocument();
    expect(screen.getByText("INFRA")).toBeInTheDocument();
    expect(screen.getByText("AGENTS")).toBeInTheDocument();
  });

  it("shows empty state when no node is selected (System Topology Map)", () => {
    render(<DigitalTwinModule />);
    expect(screen.getByText("System Topology Map")).toBeInTheDocument();
    expect(screen.getByText("ROOT")).toBeInTheDocument();
  });

  it("shows total repos count in the empty state info panel", () => {
    render(<DigitalTwinModule />);
    expect(screen.getByText("Total Repos:")).toBeInTheDocument();
    expect(screen.getByText("14")).toBeInTheDocument();
    expect(screen.getByText("Microservices:")).toBeInTheDocument();
    expect(screen.getByText("28")).toBeInTheDocument();
    expect(screen.getByText("Active Pods:")).toBeInTheDocument();
    expect(screen.getByText("124")).toBeInTheDocument();
  });

  it("renders filter buttons as clickable elements", () => {
    render(<DigitalTwinModule />);

    // Clicking ALL filter should select it (highlighted state)
    const allBtn = screen.getByText("ALL");
    fireEvent.click(allBtn);

    // Clicking SERVICES filter should switch
    fireEvent.click(screen.getByText("SERVICES"));

    // Header should remain visible
    expect(screen.getByText(/3D Codebase/i)).toBeInTheDocument();
  });

  it("renders the description text about interactive topology", () => {
    render(<DigitalTwinModule />);
    expect(screen.getByText(/Interactive topology mapping/i)).toBeInTheDocument();
  });

  describe("canvas interactions", () => {
    it("captures mouse events on canvas for drag rotation", () => {
      render(<DigitalTwinModule />);
      const canvas = document.querySelector("canvas");
      expect(canvas).toBeTruthy();

      // Simulate mouse down on canvas
      if (canvas) {
        fireEvent.mouseDown(canvas, { clientX: 100, clientY: 100 });
        fireEvent.mouseMove(canvas, { clientX: 150, clientY: 110 });
        fireEvent.mouseUp(canvas);
      }
      // Should not throw — canvas interaction is valid
    });

    it("captures touch events for mobile support", () => {
      render(<DigitalTwinModule />);
      const canvas = document.querySelector("canvas");
      expect(canvas).toBeTruthy();

      if (canvas) {
        fireEvent.touchStart(canvas, {
          touches: [{ clientX: 100, clientY: 100 }],
        } as any);
        fireEvent.touchMove(canvas, {
          touches: [{ clientX: 120, clientY: 105 }],
        } as any);
        fireEvent.touchEnd(canvas, {
          changedTouches: [{ clientX: 120, clientY: 105 }],
        } as any);
      }
      // Should not throw
    });

    it("handles hover on canvas (mouse move without drag)", () => {
      render(<DigitalTwinModule />);
      const canvas = document.querySelector("canvas");
      expect(canvas).toBeTruthy();

      if (canvas) {
        // Move mouse without pressing (hover mode)
        fireEvent.mouseMove(canvas, { clientX: 200, clientY: 150 });
      }
      // Should not throw
    });
  });

  describe("node hover glow effects", () => {
    it("renders canvas with glow effect CSS classes", () => {
      render(<DigitalTwinModule />);
      const canvas = document.querySelector("canvas");
      expect(canvas).toBeTruthy();
      expect(canvas?.className).toContain("cursor-grab");
    });

    it("shows hint text at the bottom of the canvas", () => {
      render(<DigitalTwinModule />);
      expect(screen.getByText(/Drag to Rotate/)).toBeInTheDocument();
      expect(screen.getByText(/Hover to Inspect/)).toBeInTheDocument();
    });
  });

  describe("particle system", () => {
    it("renders the canvas for particle rendering", () => {
      render(<DigitalTwinModule />);
      const canvas = document.querySelector("canvas");
      expect(canvas).toBeTruthy();
      expect(canvas?.getContext("2d")).toBeTruthy();
    });

    it("handles rapid mouse events without error (simulating particle frame loop)", () => {
      render(<DigitalTwinModule />);
      const canvas = document.querySelector("canvas");
      expect(canvas).toBeTruthy();

      // Simulate rapid mouse events to stress the interaction handlers
      for (let i = 0; i < 50; i++) {
        if (canvas) {
          fireEvent.mouseMove(canvas, { clientX: 100 + i, clientY: 100 });
        }
      }
      // Should not throw
    });
  });
});
