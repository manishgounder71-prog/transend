"use client";

import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Dashboard Error:", error, errorInfo);
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div className="h-full flex flex-col items-center justify-center gap-4 p-8 text-center select-none">
        <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
          <AlertTriangle size={24} className="text-red-400" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white tracking-wide uppercase mb-1">
            Component Error
          </h3>
          <p className="text-[11px] text-white/50 max-w-[400px] leading-relaxed">
            An unexpected error occurred while rendering this module. The system has isolated the fault to prevent cascading failures.
          </p>
          {this.state.error && (
            <p className="mt-2 text-[10px] font-mono text-red-400/70 bg-red-500/5 border border-red-500/10 rounded p-2 max-w-[400px] truncate">
              {this.state.error.message}
            </p>
          )}
        </div>
        <button
          onClick={() => this.setState({ hasError: false, error: null })}
          className="font-sans text-[10px] font-bold text-slate-950 bg-[#00f0ff] hover:bg-[#00f0ff]/80 transition rounded px-4 py-2 cursor-pointer flex items-center gap-1.5"
        >
          <RefreshCw size={12} />
          Retry Module
        </button>
      </div>
    );
  }
}
