import React from 'react';
import { useAuth } from './AuthContext';
import { Alert, AlertDescription } from './components/ui/alert';
import { Shield } from 'lucide-react';

const ProtectedRoute = ({ children, requiredPermissions = [] }) => {
  const { isAuthenticated, hasPermission, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // O AuthProvider já vai redirecionar para login
  }

  if (requiredPermissions.length > 0 && !hasPermission(requiredPermissions)) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Alert className="max-w-md">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Você não tem permissão para acessar esta página.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;

