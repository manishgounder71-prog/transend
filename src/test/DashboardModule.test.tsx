import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import DashboardModule from "@/components/DashboardModule";

describe("DashboardModule", () => {
  const setActiveTab = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the engineering health section", () => {
    render(<DashboardModule setActiveTab={setActiveTab} />);
    expect(screen.getByText("Engineering Health")).toBeInTheDocument();
  });

  it("renders the release confidence section", () => {
    render(<DashboardModule setActiveTab={setActiveTab} />);
    expect(screen.getByText("Release Confidence")).toBeInTheDocument();
  });

  it("renders the Active AI Boardroom Agents section", () => {
    render(<DashboardModule setActiveTab={setActiveTab} />);
    expect(screen.getByText("Active AI Boardroom Agents")).toBeInTheDocument();
  });

  it("renders the Business Impact Engine section", () => {
    render(<DashboardModule setActiveTab={setActiveTab} />);
    expect(screen.getByText("Business Impact Engine")).toBeInTheDocument();
  });

  it("renders the Incident Radar section", () => {
    render(<DashboardModule setActiveTab={setActiveTab} />);
    expect(screen.getByText("Incident Radar")).toBeInTheDocument();
  });

  it("renders pipeline crash alert with navigation", () => {
    render(<DashboardModule setActiveTab={setActiveTab} />);
    expect(screen.getByText(/PIPELINE CRASHED/i)).toBeInTheDocument();
    expect(screen.getByText(/Auto-Healing Agent active/i)).toBeInTheDocument();

    // Clicking navigates to pipeline tab
    fireEvent.click(screen.getByText(/PIPELINE CRASHED/i));
    expect(setActiveTab).toHaveBeenCalledWith("pipeline");
  });

  it("renders active debt alert with navigation", () => {
    render(<DashboardModule setActiveTab={setActiveTab} />);
    expect(screen.getByText(/ACTIVE DEBT ALERT/i)).toBeInTheDocument();

    // Clicking navigates to incidents tab
    fireEvent.click(screen.getByText(/ACTIVE DEBT ALERT/i));
    expect(setActiveTab).toHaveBeenCalledWith("incidents");
  });

  it("renders CEO, CTO, and CISO agent cards", () => {
    render(<DashboardModule setActiveTab={setActiveTab} />);
    expect(screen.getByText("CEO Agent")).toBeInTheDocument();
    expect(screen.getByText("CTO Agent")).toBeInTheDocument();
    expect(screen.getByText("CISO Agent")).toBeInTheDocument();
  });

  it("renders business impact metrics", () => {
    render(<DashboardModule setActiveTab={setActiveTab} />);
    expect(screen.getByText("$42.8k")).toBeInTheDocument();
    expect(screen.getByText("928 hrs")).toBeInTheDocument();
    expect(screen.getByText("+340%")).toBeInTheDocument();
  });

  it("navigates to boardroom when agents section is clicked", () => {
    render(<DashboardModule setActiveTab={setActiveTab} />);
    fireEvent.click(screen.getByText(/CONVENE BOARDROOM DEBATES/i));
    expect(setActiveTab).toHaveBeenCalledWith("boardroom");
  });

  it("navigates to predictor when release confidence is clicked", () => {
    render(<DashboardModule setActiveTab={setActiveTab} />);
    fireEvent.click(screen.getByText("Release Confidence"));
    expect(setActiveTab).toHaveBeenCalledWith("predictor");
  });

  it("navigates to timemachine when engineering health is clicked", () => {
    render(<DashboardModule setActiveTab={setActiveTab} />);
    fireEvent.click(screen.getByText("Engineering Health"));
    expect(setActiveTab).toHaveBeenCalledWith("timemachine");
  });

  it("navigates to parallel when business impact engine is clicked", () => {
    render(<DashboardModule setActiveTab={setActiveTab} />);
    fireEvent.click(screen.getByText("Business Impact Engine"));
    expect(setActiveTab).toHaveBeenCalledWith("parallel");
  });

  it("navigates to incidents when incident radar is clicked", () => {
    render(<DashboardModule setActiveTab={setActiveTab} />);
    fireEvent.click(screen.getByText("Incident Radar"));
    expect(setActiveTab).toHaveBeenCalledWith("incidents");
  });

  it("renders health score value", () => {
    render(<DashboardModule setActiveTab={setActiveTab} />);
    expect(screen.getByText("92")).toBeInTheDocument();
  });

  it("renders SAFE TO SHIP label", () => {
    render(<DashboardModule setActiveTab={setActiveTab} />);
    expect(screen.getByText("SAFE TO SHIP")).toBeInTheDocument();
  });
});
