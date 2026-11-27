"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertCircle, RotateCcw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an unhandled client error:", error, errorInfo);
  }

  public resetError = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 my-4 mx-auto max-w-2xl rounded-3xl bg-surface border border-status-danger/30 shadow-card text-center space-y-4 animate-in fade-in">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-status-danger/10 border border-status-danger/30 text-status-danger flex items-center justify-center">
            <AlertCircle className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">
              {this.props.fallbackTitle || "حدث خطأ غير متوقع أثناء عرض هذه الواجهة"}
            </h3>
            <p className="text-xs text-muted mt-1 leading-relaxed max-w-md mx-auto">
              تم حصر الخطأ بواسطة نظام الحماية لمنع توقف المنصة. يمكنك إعادة المحاولة أو تحديث الصفحة.
            </p>
            {this.state.error?.message && (
              <div className="mt-2 p-2.5 rounded-xl bg-surface-secondary text-[11px] font-mono text-status-danger/90 max-w-lg mx-auto truncate" dir="ltr">
                {this.state.error.message}
              </div>
            )}
          </div>
          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={this.resetError}
              className="px-4 py-2 rounded-xl bg-brand-cyan text-background font-bold text-xs flex items-center gap-1.5 shadow-glow hover:brightness-110 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>إعادة المحاولة</span>
            </button>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded-xl bg-surface-secondary hover:bg-surface border border-border text-foreground font-semibold text-xs transition-colors"
            >
              تحديث الصفحة
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
