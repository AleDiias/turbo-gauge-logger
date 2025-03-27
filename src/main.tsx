import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { Toaster } from "@/components/ui/toaster";
import { ErrorBoundary } from './components/ErrorBoundary';
import './index.css';

// Função para inicializar o app de forma segura
const initializeApp = async () => {
  try {
    // Aqui você pode adicionar qualquer inicialização necessária
    // Por exemplo, verificar permissões, inicializar plugins, etc.
    
    ReactDOM.createRoot(document.getElementById('root')!).render(
      <React.StrictMode>
        <ErrorBoundary>
          <App />
          <Toaster />
        </ErrorBoundary>
      </React.StrictMode>
    );
  } catch (error) {
    console.error('Erro ao inicializar o app:', error);
    // Renderiza uma tela de erro se a inicialização falhar
    ReactDOM.createRoot(document.getElementById('root')!).render(
      <React.StrictMode>
        <div className="container mx-auto p-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h1 className="text-red-800 text-xl font-bold mb-2">Erro ao Inicializar</h1>
            <p className="text-red-600">
              Não foi possível inicializar o aplicativo. Por favor, tente novamente.
            </p>
          </div>
        </div>
      </React.StrictMode>
    );
  }
};

// Inicializa o app
initializeApp();
