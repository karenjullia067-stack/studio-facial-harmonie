import * as React from 'react';
import { ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
    // @ts-ignore
    this.state = {
      hasError: false,
      error: null
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    // @ts-ignore
    if (this.state.hasError) {
      let errorMessage = "Ocorreu um erro inesperado.";
      try {
        // @ts-ignore
        if (this.state.error?.message) {
          // @ts-ignore
          const parsed = JSON.parse(this.state.error.message);
          if (parsed.error) {
            errorMessage = `Erro no banco de dados: ${parsed.error}`;
          }
        }
      } catch (e) {
        // Not a JSON error
        // @ts-ignore
        errorMessage = this.state.error?.message || errorMessage;
      }

      return (
        <div className="min-h-[400px] flex items-center justify-center p-6 bg-neutral-50 rounded-2xl border border-neutral-200">
          <div className="text-center space-y-6 max-w-md">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-serif font-bold text-neutral-900">Ops! Algo deu errado.</h2>
              <p className="text-neutral-600 text-sm">
                {errorMessage}
              </p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 bg-neutral-900 text-white px-8 py-3 rounded-xl font-medium hover:bg-neutral-800 transition-all mx-auto"
            >
              <RefreshCw className="w-4 h-4" />
              Recarregar Página
            </button>
          </div>
        </div>
      );
    }

    // @ts-ignore
    return this.props.children;
  }
}
