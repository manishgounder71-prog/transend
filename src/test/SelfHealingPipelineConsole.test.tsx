import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import SelfHealingPipelineConsole from "@/components/pipeline/SelfHealingPipelineConsole";
import type { LogLine } from "@/components/pipeline/pipelineData";

const createLog = (text: string, type: LogLine["type"] = "info"): LogLine => ({
  text,
  type,
  time: "12:00:00",
});

const refStub = { current: null } as React.RefObject<HTMLDivElement | null>;
const noop = () => {};

describe("SelfHealingPipelineConsole", () => {
  it("renders the console title", () => {
    render(
      <SelfHealingPipelineConsole
        logs={[]}
        pipelineState="idle"
        logTerminalRef={refStub}
        onStart={noop}
        onHeal={noop}
        onReset={noop}
      />,
    );
    expect(screen.getByText("Self-Healing Console Output")).toBeTruthy();
  });

  it("shows READY badge when idle", () => {
    render(
      <SelfHealingPipelineConsole
        logs={[]}
        pipelineState="idle"
        logTerminalRef={refStub}
        onStart={noop}
        onHeal={noop}
        onReset={noop}
      />,
    );
    expect(screen.getByText("READY")).toBeTruthy();
  });

  it("shows CRITICAL FAILURE badge when failed", () => {
    render(
      <SelfHealingPipelineConsole
        logs={[]}
        pipelineState="failed"
        logTerminalRef={refStub}
        onStart={noop}
        onHeal={noop}
        onReset={noop}
      />,
    );
    expect(screen.getByText("CRITICAL FAILURE")).toBeTruthy();
  });

  it("shows DEPLOYED NOMINAL badge when healed", () => {
    render(
      <SelfHealingPipelineConsole
        logs={[]}
        pipelineState="healed"
        logTerminalRef={refStub}
        onStart={noop}
        onHeal={noop}
        onReset={noop}
      />,
    );
    expect(screen.getByText("DEPLOYED NOMINAL")).toBeTruthy();
  });

  it("shows empty state when no logs", () => {
    render(
      <SelfHealingPipelineConsole
        logs={[]}
        pipelineState="idle"
        logTerminalRef={refStub}
        onStart={noop}
        onHeal={noop}
        onReset={noop}
      />,
    );
    expect(screen.getByText(/Pipeline idle/)).toBeTruthy();
  });

  it("renders log entries", () => {
    const logs = [createLog("Build started", "info"), createLog("Tests passed", "success")];
    render(
      <SelfHealingPipelineConsole
        logs={logs}
        pipelineState="running_fail"
        logTerminalRef={refStub}
        onStart={noop}
        onHeal={noop}
        onReset={noop}
      />,
    );
    expect(screen.getByText("Build started")).toBeTruthy();
    expect(screen.getByText("Tests passed")).toBeTruthy();
  });

  it("shows Simulate CI/CD Failure button when idle", () => {
    render(
      <SelfHealingPipelineConsole
        logs={[]}
        pipelineState="idle"
        logTerminalRef={refStub}
        onStart={noop}
        onHeal={noop}
        onReset={noop}
      />,
    );
    expect(screen.getByText("Simulate CI/CD Failure")).toBeTruthy();
  });

  it("shows Engage Auto-Healing button when failed", () => {
    render(
      <SelfHealingPipelineConsole
        logs={[]}
        pipelineState="failed"
        logTerminalRef={refStub}
        onStart={noop}
        onHeal={noop}
        onReset={noop}
      />,
    );
    expect(screen.getByText("Engage Auto-Healing Agent")).toBeTruthy();
  });

  it("shows Autonomous Running button during healing", () => {
    render(
      <SelfHealingPipelineConsole
        logs={[]}
        pipelineState="healing"
        logTerminalRef={refStub}
        onStart={noop}
        onHeal={noop}
        onReset={noop}
      />,
    );
    expect(screen.getByText("Autonomous Running...")).toBeTruthy();
  });

  it("shows Reset Console button when healed", () => {
    render(
      <SelfHealingPipelineConsole
        logs={[]}
        pipelineState="healed"
        logTerminalRef={refStub}
        onStart={noop}
        onHeal={noop}
        onReset={noop}
      />,
    );
    expect(screen.getByText("Reset Console")).toBeTruthy();
  });

  it("calls onStart when Simulate button is clicked", () => {
    const onStart = vi.fn();
    render(
      <SelfHealingPipelineConsole
        logs={[]}
        pipelineState="idle"
        logTerminalRef={refStub}
        onStart={onStart}
        onHeal={noop}
        onReset={noop}
      />,
    );
    fireEvent.click(screen.getByText("Simulate CI/CD Failure"));
    expect(onStart).toHaveBeenCalledOnce();
  });

  it("calls onHeal when Engage button is clicked", () => {
    const onHeal = vi.fn();
    render(
      <SelfHealingPipelineConsole
        logs={[]}
        pipelineState="failed"
        logTerminalRef={refStub}
        onStart={noop}
        onHeal={onHeal}
        onReset={noop}
      />,
    );
    fireEvent.click(screen.getByText("Engage Auto-Healing Agent"));
    expect(onHeal).toHaveBeenCalledOnce();
  });

  it("calls onReset when Reset button is clicked", () => {
    const onReset = vi.fn();
    render(
      <SelfHealingPipelineConsole
        logs={[]}
        pipelineState="healed"
        logTerminalRef={refStub}
        onStart={noop}
        onHeal={noop}
        onReset={onReset}
      />,
    );
    fireEvent.click(screen.getByText("Reset Console"));
    expect(onReset).toHaveBeenCalledOnce();
  });
});
