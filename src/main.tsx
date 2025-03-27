import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { Toaster } from "@/components/ui/toaster";
import { ErrorBoundary } from './components/ErrorBoundary';
import './index.css';

// Função para inicializar o app de forma segura
const initializeApp = async () => {
  try {
    console.log('Iniciando o aplicativo...');
    
    // Verifica se o elemento root existe
    const rootElement = document.getElementById('root');
    if (!rootElement) {
      throw new Error('Elemento root não encontrado');
    }

    console.log('Elemento root encontrado, renderizando aplicativo...');
    
    // Renderiza o app com tratamento de erros
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <ErrorBoundary>
          <App />
          <Toaster />
        </ErrorBoundary>
      </React.StrictMode>
    );

    console.log('Aplicativo renderizado com sucesso');
  } catch (error) {
    console.error('Erro fatal ao inicializar o app:', error);
    
    // Tenta renderizar a tela de erro
    try {
      const rootElement = document.getElementById('root');
      if (rootElement) {
        const root = ReactDOM.createRoot(rootElement);
        root.render(
          <React.StrictMode>
            <div className="container mx-auto p-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h1 className="text-red-800 text-xl font-bold mb-2">Erro ao Inicializar</h1>
                <p className="text-red-600 mb-4">
                  Não foi possível inicializar o aplicativo. Por favor, tente novamente.
                </p>
                <p className="text-sm text-gray-600">
                  Detalhes do erro: {error instanceof Error ? error.message : 'Erro desconhecido'}
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-4 w-full bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700"
                >
                  Recarregar Aplicativo
                </button>
              </div>
            </div>
          </React.StrictMode>
        );
      }
    } catch (renderError) {
      console.error('Erro ao renderizar tela de erro:', renderError);
    }
  }
};

// Adiciona listener para erros não capturados
window.addEventListener('unhandledrejection', (event) => {
  console.error('Erro não tratado:', event.reason);
});

window.addEventListener('error', (event) => {
  console.error('Erro global:', event.error);
});

// Inicializa o app
console.log('Iniciando processo de inicialização...');
initializeApp();
