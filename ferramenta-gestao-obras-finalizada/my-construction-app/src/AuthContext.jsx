import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { db } from './database';

const AuthContext = createContext();

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: true,
  error: null
};

function authReducer(state, action) {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        loading: true,
        error: null
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        loading: false,
        error: null
      };
    case 'LOGIN_ERROR':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      };
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    // Verificar se há usuário logado no localStorage
    const checkAuthStatus = async () => {
      try {
        const savedUser = localStorage.getItem('gestao_obras_user');
        if (savedUser) {
          const user = JSON.parse(savedUser);
          // Verificar se o usuário ainda existe no banco
          const dbUser = await db.usuarios.get(user.id);
          if (dbUser && dbUser.ativo) {
            dispatch({ type: 'LOGIN_SUCCESS', payload: dbUser });
          } else {
            localStorage.removeItem('gestao_obras_user');
            dispatch({ type: 'SET_LOADING', payload: false });
          }
        } else {
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (email, senha) => {
    dispatch({ type: 'LOGIN_START' });
    
    try {
      // Buscar usuário no banco
      const user = await db.usuarios
        .where('email')
        .equals(email)
        .and(user => user.ativo)
        .first();

      if (user) {
        // Atualizar ultimoLogin no banco de dados
        await db.usuarios.update(user.id, { ultimoLogin: new Date().toISOString() });
        // Obter o usuário atualizado para o payload
        const updatedUser = await db.usuarios.get(user.id);

        // Salvar no localStorage
        localStorage.setItem('gestao_obras_user', JSON.stringify(updatedUser));
        dispatch({ type: 'LOGIN_SUCCESS', payload: updatedUser });
        return { success: true };
      } else {
        const error = 'Email não encontrado ou usuário inativo';
        dispatch({ type: 'LOGIN_ERROR', payload: error });
        return { success: false, error };
      }
    } catch (error) {
      console.error('Erro no login:', error);
      const errorMessage = 'Erro interno. Tente novamente.';
      dispatch({ type: 'LOGIN_ERROR', payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    localStorage.removeItem('gestao_obras_user');
    dispatch({ type: 'LOGOUT' });
  };

  const updateUser = async (userData) => {
    try {
      await db.usuarios.update(state.user.id, userData);
      const updatedUser = { ...state.user, ...userData };
      localStorage.setItem('gestao_obras_user', JSON.stringify(updatedUser));
      dispatch({ type: 'LOGIN_SUCCESS', payload: updatedUser });
      return { success: true };
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      return { success: false, error: 'Erro ao atualizar dados' };
    }
  };

  const hasPermission = (requiredPermissions) => {
    if (!state.user) return false;
    
    const userProfile = state.user.perfil;
    
    // Se não há permissões específicas requeridas, qualquer usuário logado pode acessar
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }
    
    // Verificar se o perfil do usuário está na lista de permissões
    return requiredPermissions.includes(userProfile);
  };

  const value = {
    ...state,
    login,
    logout,
    updateUser,
    hasPermission
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}

// Hook para verificar permissões específicas
export function usePermissions(requiredPermissions) {
  const { hasPermission } = useAuth();
  return hasPermission(requiredPermissions);
}

// Constantes de permissões
export const PERMISSIONS = {
  SOLICITANTE: ['solicitante'],
  COMPRADOR: ['comprador'],
  EXECUCAO: ['execucao'],
  PAGAMENTO: ['pagamento'],
  ADMIN: ['comprador'], // Comprador tem acesso administrativo
  ALL: ['solicitante', 'comprador', 'execucao', 'pagamento']
};

