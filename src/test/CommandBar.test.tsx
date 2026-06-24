import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import CommandBar from "@/components/CommandBar";

describe("CommandBar", () => {
  const defaultProps = {
    searchQuery: "",
    onSearchChange: vi.fn(),
    onNavigate: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the ORBIT CTO X brand", () => {
    render(<CommandBar {...defaultProps} />);
    expect(screen.getByText("ORBIT CTO X")).toBeInTheDocument();
  });

  it("renders global search input", () => {
    render(<CommandBar {...defaultProps} />);
    const input = screen.getByPlaceholderText(/Search modules/i);
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue("");
  });

  it("calls onSearchChange when search input changes", () => {
    render(<CommandBar {...defaultProps} />);
    const input = screen.getByPlaceholderText(/Search modules/i);
    fireEvent.change(input, { target: { value: "pipeline" } });
    expect(defaultProps.onSearchChange).toHaveBeenCalledWith("pipeline");
  });

  it("renders system health and gitlab sync indicators", () => {
    render(<CommandBar {...defaultProps} />);
    expect(screen.getByText("SYSTEM HEALTH")).toBeInTheDocument();
    expect(screen.getByText("GITLAB SYNC")).toBeInTheDocument();
    expect(screen.getByText("98.4% NOMINAL")).toBeInTheDocument();
    expect(screen.getByText("CONNECTED")).toBeInTheDocument();
  });

  describe("Quick-jump button", () => {
    it("renders the Quick Jump button with ⌘K hint", () => {
      render(<CommandBar {...defaultProps} />);
      expect(screen.getByText("Quick Jump")).toBeInTheDocument();
      expect(screen.getByText("⌘K")).toBeInTheDocument();
    });
  });

  describe("command palette", () => {
    it("opens command palette when Quick Jump button is clicked", () => {
      render(<CommandBar {...defaultProps} />);
      fireEvent.click(screen.getByText("Quick Jump"));
      expect(screen.getByPlaceholderText(/Type a module name/i)).toBeInTheDocument();
    });

    it("opens command palette on ⌘K keypress", () => {
      render(<CommandBar {...defaultProps} />);
      act(() => {
        window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }));
      });
      expect(screen.getByPlaceholderText(/Type a module name/i)).toBeInTheDocument();
    });

    it("closes command palette on Escape keypress", () => {
      render(<CommandBar {...defaultProps} />);
      fireEvent.click(screen.getByText("Quick Jump"));
      expect(screen.getByPlaceholderText(/Type a module name/i)).toBeInTheDocument();

      // Close with Escape - dispatch on document to match the event listener
      act(() => {
        document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
      });
      expect(screen.queryByPlaceholderText(/Type a module name/i)).not.toBeInTheDocument();
    });

    it("renders all navigation items in palette", () => {
      render(<CommandBar {...defaultProps} />);
      fireEvent.click(screen.getByText("Quick Jump"));

      const expectedModules = [
        "Dashboard", "Boardroom", "Pipeline", "Incidents",
        "Hacker Arena", "Release Predictor", "Parallel Simulator",
        "Digital Twin", "Knowledge Base", "Achievements",
      ];
      for (const name of expectedModules) {
        expect(screen.getByText(name)).toBeInTheDocument();
      }
    });

    it("shows keyboard shortcuts for each navigation item", () => {
      render(<CommandBar {...defaultProps} />);
      fireEvent.click(screen.getByText("Quick Jump"));

      const expectedShortcuts = ["⌘1", "⌘2", "⌘3", "⌘4", "⌘5", "⌘6", "⌘7", "⌘8", "⌘9", "⌘0"];
      for (const shortcut of expectedShortcuts) {
        expect(screen.getByText(shortcut)).toBeInTheDocument();
      }
    });

    it("calls onNavigate when a palette item is clicked", () => {
      const onNavigate = vi.fn();
      render(<CommandBar {...defaultProps} onNavigate={onNavigate} />);
      fireEvent.click(screen.getByText("Quick Jump"));
      fireEvent.click(screen.getByText("Pipeline"));

      expect(onNavigate).toHaveBeenCalledWith("pipeline");
    });

    it("filters navigation items by search text", () => {
      render(<CommandBar {...defaultProps} />);
      fireEvent.click(screen.getByText("Quick Jump"));

      const searchInput = screen.getByPlaceholderText(/Type a module name/i);
      fireEvent.change(searchInput, { target: { value: "hacker" } });

      // Should show Hacker Arena, hide others
      expect(screen.getByText("Hacker Arena")).toBeInTheDocument();
      expect(screen.queryByText("Dashboard")).not.toBeInTheDocument();
      expect(screen.queryByText("Boardroom")).not.toBeInTheDocument();
    });

    it("shows empty state when search matches no items", () => {
      render(<CommandBar {...defaultProps} />);
      fireEvent.click(screen.getByText("Quick Jump"));

      const searchInput = screen.getByPlaceholderText(/Type a module name/i);
      fireEvent.change(searchInput, { target: { value: "xyzzy_nonexistent" } });

      expect(screen.getByText(/No modules match/i)).toBeInTheDocument();
    });

    it("closes palette and clears search on item selection", () => {
      render(<CommandBar {...defaultProps} />);
      fireEvent.click(screen.getByText("Quick Jump"));

      const searchInput = screen.getByPlaceholderText(/Type a module name/i);
      fireEvent.change(searchInput, { target: { value: "boardroom" } });

      fireEvent.click(screen.getByText("Boardroom"));

      // Palette should be closed
      expect(screen.queryByPlaceholderText(/Type a module name/i)).not.toBeInTheDocument();
    });
  });

  describe("keyboard navigation", () => {
    it("calls onNavigate when ⌘1 is pressed (Dashboard)", () => {
      const onNavigate = vi.fn();
      render(<CommandBar {...defaultProps} onNavigate={onNavigate} />);

      act(() => {
        window.dispatchEvent(new KeyboardEvent("keydown", { key: "1", metaKey: true }));
      });

      expect(onNavigate).toHaveBeenCalledWith("dashboard");
    });

    it("calls onNavigate when ⌘3 is pressed (Pipeline)", () => {
      const onNavigate = vi.fn();
      render(<CommandBar {...defaultProps} onNavigate={onNavigate} />);

      act(() => {
        window.dispatchEvent(new KeyboardEvent("keydown", { key: "3", metaKey: true }));
      });

      expect(onNavigate).toHaveBeenCalledWith("pipeline");
    });

    it("maps ⌘0 to Achievements (index 9)", () => {
      const onNavigate = vi.fn();
      render(<CommandBar {...defaultProps} onNavigate={onNavigate} />);

      act(() => {
        window.dispatchEvent(new KeyboardEvent("keydown", { key: "0", metaKey: true }));
      });

      expect(onNavigate).toHaveBeenCalledWith("achievements");
    });

    it("does not navigate when no onNavigate callback provided", () => {
      render(<CommandBar {...defaultProps} onNavigate={undefined} />);

      act(() => {
        window.dispatchEvent(new KeyboardEvent("keydown", { key: "1", metaKey: true }));
      });

      // Should not throw — no op
    });
  });

  describe("global search", () => {
    it("shows Esc button when search has text", () => {
      render(<CommandBar {...defaultProps} searchQuery="test" />);
      expect(screen.getByText("Esc")).toBeInTheDocument();
    });

    it("clears search when Esc button clicked", () => {
      const onSearchChange = vi.fn();
      render(<CommandBar {...defaultProps} searchQuery="test" onSearchChange={onSearchChange} />);
      fireEvent.click(screen.getByText("Esc"));
      expect(onSearchChange).toHaveBeenCalledWith("");
    });

    it("does not show Esc button when search is empty", () => {
      render(<CommandBar {...defaultProps} searchQuery="" />);
      expect(screen.queryByText("Esc")).not.toBeInTheDocument();
    });
  });

  describe("keyboard hint section", () => {
    it("renders keyboard shortcut hints", () => {
      render(<CommandBar {...defaultProps} />);
      expect(screen.getByText("⌘K palette")).toBeInTheDocument();
      expect(screen.getByText("⌘1-9 nav")).toBeInTheDocument();
    });
  });
});
