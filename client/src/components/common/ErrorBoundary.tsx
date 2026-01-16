"use client";

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null
        };
    }

    static getDerivedStateFromError(error: Error): State {
        return {
            hasError: true,
            error,
            errorInfo: null
        };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("🔴 Error Boundary Caught:", error, errorInfo);
        this.setState({
            error,
            errorInfo
        });
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '400px',
                    padding: '2rem',
                    textAlign: 'center'
                }}>
                    <AlertTriangle size={48} color="#e53e3e" style={{ marginBottom: '1rem' }} />
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>
                        Algo deu errado
                    </h2>
                    <p style={{ color: '#666', marginBottom: '1rem', maxWidth: '600px' }}>
                        {this.state.error?.message || 'Ocorreu um erro inesperado.'}
                    </p>
                    {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
                        <details style={{ marginTop: '1rem', textAlign: 'left', maxWidth: '800px', width: '100%' }}>
                            <summary style={{ cursor: 'pointer', fontWeight: 600, marginBottom: '0.5rem' }}>
                                Detalhes do Erro (Dev Only)
                            </summary>
                            <pre style={{
                                background: '#f5f5f5',
                                padding: '1rem',
                                borderRadius: '8px',
                                overflow: 'auto',
                                fontSize: '0.75rem',
                                border: '1px solid #ddd'
                            }}>
                                {this.state.error?.stack}
                                {'\n\n'}
                                {this.state.errorInfo.componentStack}
                            </pre>
                        </details>
                    )}
                    <button
                        onClick={() => window.location.reload()}
                        style={{
                            marginTop: '1.5rem',
                            padding: '0.75rem 1.5rem',
                            background: '#000',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: 600,
                            cursor: 'pointer'
                        }}
                    >
                        Recarregar Página
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
