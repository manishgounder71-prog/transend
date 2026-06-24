import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act, waitFor } from "@testing-library/react";
import HackerArenaModule from "@/components/HackerArenaModule";

const mockDispatchGameEvent = vi.fn();

// Mock gamification
vi.mock("@/lib/gamification", () => ({
  dispatchGameEvent: (...args: any[]) => mockDispatchGameEvent(...args),
}));

describe("HackerArenaModule", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders the header", () => {
    render(<HackerArenaModule />);
    expect(screen.getByText("AI Hacker Arena")).toBeInTheDocument();
  });

  it("renders initial log message", () => {
    render(<HackerArenaModule />);
    expect(screen.getByText(/Intrusion system active/i)).toBeInTheDocument();
  });

  it("shows an initial security score of 98", () => {
    render(<HackerArenaModule />);
    expect(screen.getByText("SCORE: 98")).toBeInTheDocument();
  });

  describe("difficulty selector", () => {
    it("renders all 4 difficulty options", () => {
      render(<HackerArenaModule />);
      expect(screen.getByText("Easy")).toBeInTheDocument();
      expect(screen.getByText("Medium")).toBeInTheDocument();
      expect(screen.getByText("Hard")).toBeInTheDocument();
      expect(screen.getByText("Nightmare")).toBeInTheDocument();
    });

    it("starts with Medium as default", () => {
      render(<HackerArenaModule />);
      // Medium should be highlighted (white text)
      const mediumBtn = screen.getByText("Medium");
      expect(mediumBtn.className).toContain("bg-white/10");
    });

    it("switches difficulty when clicked", () => {
      render(<HackerArenaModule />);
      fireEvent.click(screen.getByText("Hard"));
      // Hard should now be highlighted, Medium not
      expect(screen.getByText("Hard").className).toContain("bg-white/10");
      expect(screen.getByText("Medium").className).not.toContain("bg-white/10");
    });

    it("changes button text for nightmare mode", () => {
      render(<HackerArenaModule />);
      fireEvent.click(screen.getByText("Nightmare"));
      expect(screen.getByText("Deploy Nightmare")).toBeInTheDocument();
    });
  });

  describe("battle simulation", () => {
    it("starts simulation when Engage Battle is clicked", () => {
      render(<HackerArenaModule />);
      fireEvent.click(screen.getByText("Engage Battle"));
      // Should show progress bar
      expect(screen.getByText(/SIMULATING MEDIUM SCENARIO/i)).toBeInTheDocument();
      // Button should be disabled with "Engaged..." text
      expect(screen.getByText("Engaged...")).toBeInTheDocument();
    });

    it("shows STANDBY status when not simulating", () => {
      render(<HackerArenaModule />);
      expect(screen.getByText("STANDBY")).toBeInTheDocument();
    });

    it("disables button during simulation", () => {
      render(<HackerArenaModule />);
      fireEvent.click(screen.getByText("Engage Battle"));
      const button = screen.getByRole("button", { name: /Engaged/ });
      expect(button).toBeDisabled();
    });

    it("shows shield status during battle", () => {
      render(<HackerArenaModule />);
      fireEvent.click(screen.getByText("Engage Battle"));
      expect(screen.getByText("SHIELD ACTIVE")).toBeInTheDocument();
    });

    it("appends log entries during simulation", () => {
      render(<HackerArenaModule />);
      fireEvent.click(screen.getByText("Engage Battle"));

      // Fast-forward past first battle step
      act(() => {
        vi.advanceTimersByTime(2500);
      });

      // Should show at least the first shield response
      expect(screen.getByText(/SHIELD\]/i)).toBeInTheDocument();
    });

    it("completes simulation and fires game event", () => {
      render(<HackerArenaModule />);
      fireEvent.click(screen.getByText("Engage Battle"));

      // Fast-forward past all battle steps (Medium: 5 rounds x 2500ms = 12500ms, plus buffer)
      act(() => {
        vi.advanceTimersByTime(20000);
      });

      expect(mockDispatchGameEvent).toHaveBeenCalledWith("hacker:battled");
    });

    it("shows threat severity indicator", () => {
      render(<HackerArenaModule />);
      const severityElements = screen.getAllByText("NOMINAL");
      expect(severityElements.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("streak and scoring", () => {
    it("displays combo streak during active simulation", () => {
      render(<HackerArenaModule />);
      fireEvent.click(screen.getByText("Engage Battle"));

      // Medium has 5 rounds, streak x2 after round 2
      act(() => {
        vi.advanceTimersByTime(5500); // 2 rounds
      });

      // Streak should be active when comboMultiplier > 1
      expect(screen.getByText(/x2 Streak/)).toBeInTheDocument();
    });

    it("shows total points during simulation", () => {
      render(<HackerArenaModule />);
      fireEvent.click(screen.getByText("Engage Battle"));

      act(() => {
        vi.advanceTimersByTime(2500);
      });

      expect(screen.getByText(/pts$/)).toBeInTheDocument();
    });
  });

  describe("timer display", () => {
    it("shows countdown timer during active challenge", () => {
      render(<HackerArenaModule />);
      fireEvent.click(screen.getByText("Engage Battle"));

      // Timer should appear with initial value
      // Medium: 5 rounds * 3 + 5 = 20s
      expect(screen.getByText(/20s/)).toBeInTheDocument();
    });

    it("counts down timer during simulation", () => {
      render(<HackerArenaModule />);
      fireEvent.click(screen.getByText("Engage Battle"));

      act(() => {
        vi.advanceTimersByTime(3000);
      });

      // Timer should have decreased
      expect(screen.getByText(/17s/)).toBeInTheDocument();
    });
  });

  describe("high score", () => {
    it("shows high score after simulation completes", () => {
      render(<HackerArenaModule />);
      fireEvent.click(screen.getByText("Engage Battle"));

      act(() => {
        vi.advanceTimersByTime(20000);
      });

      // Wait for state to settle
      waitFor(() => {
        expect(screen.getByText(/High Score/)).toBeInTheDocument();
      });
    });
  });

  describe("red/blue panels", () => {
    it("renders Red Team panel header", () => {
      render(<HackerArenaModule />);
      expect(screen.getByText(/🔴 Red Team/)).toBeInTheDocument();
    });

    it("renders Blue Team panel header", () => {
      render(<HackerArenaModule />);
      expect(screen.getByText(/🔵 Blue Team/)).toBeInTheDocument();
    });
  });
});
