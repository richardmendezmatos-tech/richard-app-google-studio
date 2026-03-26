'use client';
/**
 * ChatErrorBoundary
 *
 * A React class-based Error Boundary that silently catches any render error
 * thrown by its children (e.g. AIChatWidget chunk-load failures) and returns
 * an invisible placeholder instead of propagating the error up the React tree.
 *
 * Hooks cannot implement Error Boundaries — only class components can define
 * componentDidCatch / getDerivedStateFromError.
 */
import React from 'react';

interface State {
  hasError: boolean;
}

class ChatErrorBoundary extends React.Component<React.PropsWithChildren, State> {
  constructor(props: React.PropsWithChildren) {
    super(props);
    this.state = { hasError: false };
  }

  /** Called synchronously after an error has been thrown by a descendant. */
  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  /** Log the error without crashing the application. */
  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    console.warn('[ChatErrorBoundary] Widget silenced:', error.message, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      // Return nothing — the widget simply disappears from the UI.
      // The rest of the page (inventory, navigation, etc.) is unaffected.
      return null;
    }
    return this.props.children;
  }
}

export default ChatErrorBoundary;
