import React, { Component, ReactNode } from 'react';
import styled from 'styled-components';

const ErrorContainer = styled.div`
  padding: 2rem;
  text-align: center;
  background: linear-gradient(135deg, rgba(211, 47, 47, 0.1) 0%, rgba(211, 47, 47, 0.05) 100%);
  border: 1px solid rgba(211, 47, 47, 0.4);
  border-radius: 0;
  margin: 2rem;
  color: var(--color-text);
`;

const ErrorTitle = styled.h2`
  color: #d32f2f;
  margin-bottom: 1rem;
  font-size: 1.5rem;
`;

const ErrorMessage = styled.p`
  color: var(--color-secondary);
  margin-bottom: 1.5rem;
  font-size: 1rem;
`;

const ReloadButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-hover) 100%);
  color: white;
  border: none;
  border-radius: 0;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(94, 209, 196, 0.3);
  }

  &:active {
    transform: translateY(0);
  }
`;

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReload = () => {
    globalThis.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <ErrorContainer>
          <ErrorTitle>Something went wrong</ErrorTitle>
          <ErrorMessage>
            {this.state.error?.message || 'An unexpected error occurred. Please try reloading the page.'}
          </ErrorMessage>
          <ReloadButton onClick={this.handleReload}>
            Reload Page
          </ReloadButton>
        </ErrorContainer>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
