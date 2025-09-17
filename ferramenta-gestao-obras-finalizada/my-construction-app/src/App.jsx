import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import { initializeDatabase } from './database';
import Layout from './Layout';
import Login from './Login';
import Dashboard from './Dashboard';
import ProtectedRoute from './ProtectedRoute';
import ObrasList from './ObrasList';
import CronogramaView from './CronogramaView';
import MateriaisList from './MateriaisList';
import FornecedoresList from './FornecedoresList';
import CotacoesList from './CotacoesList';
import UsuariosList from './UsuariosList';
import './App.css';

// Componente para inicializar o banco de dados
function DatabaseInitializer({ children }) {
  useEffect(() => {
    initializeDatabase();
  }, []);

  return children;
}

// Componente principal da aplicação
function AppContent() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando aplicação...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <Layout>
      <Routes>
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* Placeholder para outras rotas */}
        <Route 
          path="/obras" 
          element={
            <ProtectedRoute>
              <ObrasList />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/cronograma" 
          element={
            <ProtectedRoute>
              <CronogramaView />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/pedidos" 
          element={
            <ProtectedRoute>
              <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Pedidos</h2>
                <p className="text-gray-600">Módulo em desenvolvimento</p>
              </div>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/materiais" 
          element={
            <ProtectedRoute requiredPermissions={['solicitante', 'comprador']}>
              <MateriaisList />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/fornecedores" 
          element={
            <ProtectedRoute requiredPermissions={['comprador']}>
              <FornecedoresList />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/cotacoes" 
          element={
            <ProtectedRoute requiredPermissions={['solicitante', 'comprador']}>
              <CotacoesList />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/entregas" 
          element={
            <ProtectedRoute requiredPermissions={['comprador', 'execucao']}>
              <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Entregas</h2>
                <p className="text-gray-600">Módulo em desenvolvimento</p>
              </div>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/pagamentos" 
          element={
            <ProtectedRoute requiredPermissions={['comprador', 'pagamento']}>
              <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Pagamentos</h2>
                <p className="text-gray-600">Módulo em desenvolvimento</p>
              </div>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/usuarios" 
          element={
            <ProtectedRoute requiredPermissions={["administracao"]}>
              <UsuariosList />
            </ProtectedRoute>
          } 
        />
        
        {/* Rota padrão - redireciona para dashboard */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

function App() {
  return (
    <DatabaseInitializer>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </DatabaseInitializer>
  );
}

export default App;

