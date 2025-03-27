import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Erro capturado:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="container mx-auto p-4">
          <Card>
            <CardHeader>
              <CardTitle>Ops! Algo deu errado</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-500 mb-4">
                {this.state.error?.message || 'Ocorreu um erro inesperado'}
              </p>
              <Button
                onClick={() => window.location.reload()}
                className="w-full"
              >
                Recarregar Aplicativo
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
} 