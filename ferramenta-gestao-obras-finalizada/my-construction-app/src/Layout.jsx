import React, { useState } from 'react';
import { useAuth, PERMISSIONS } from './AuthContext';
import { Button } from './components/ui/button';
import { Badge } from './components/ui/badge';
import { 
  Building2, 
  Menu, 
  X, 
  Home, 
  ClipboardList, 
  Package, 
  Users, 
  ShoppingCart, 
  Truck, 
  CreditCard, 
  Calendar,
  Bell,
  LogOut,
  User
} from 'lucide-react';

const Layout = ({ children }) => {
  const { user, logout, hasPermission } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    {
      title: 'Dashboard',
      icon: Home,
      path: '/',
      permissions: PERMISSIONS.ALL
    },
    {
      title: 'Obras',
      icon: Building2,
      path: '/obras',
      permissions: PERMISSIONS.ALL
    },
    {
      title: 'Pedidos',
      icon: ClipboardList,
      path: '/pedidos',
      permissions: PERMISSIONS.ALL
    },
    {
      title: 'Materiais',
      icon: Package,
      path: '/materiais',
      permissions: [PERMISSIONS.COMPRADOR[0], PERMISSIONS.SOLICITANTE[0]]
    },
    {
      title: 'Fornecedores',
      icon: Users,
      path: '/fornecedores',
      permissions: PERMISSIONS.COMPRADOR
    },
    {
      title: 'Cotações',
      icon: ShoppingCart,
      path: '/cotacoes',
      permissions: [PERMISSIONS.COMPRADOR[0], PERMISSIONS.SOLICITANTE[0]]
    },
    {
      title: 'Entregas',
      icon: Truck,
      path: '/entregas',
      permissions: [PERMISSIONS.COMPRADOR[0], PERMISSIONS.EXECUCAO[0]]
    },
    {
      title: 'Pagamentos',
      icon: CreditCard,
      path: '/pagamentos',
      permissions: [PERMISSIONS.COMPRADOR[0], PERMISSIONS.PAGAMENTO[0]]
    },
    {
      title: 'Cronograma',
      icon: Calendar,
      path: '/cronograma',
      permissions: PERMISSIONS.ALL
    },
    {
      title: 'Usuários',
      icon: Users,
      path: '/usuarios',
      permissions: PERMISSIONS.ADMIN
    }
  ];

  const getPerfilColor = (perfil) => {
    const colors = {
      solicitante: 'bg-blue-100 text-blue-800',
      comprador: 'bg-green-100 text-green-800',
      execucao: 'bg-orange-100 text-orange-800',
      pagamento: 'bg-purple-100 text-purple-800'
    };
    return colors[perfil] || 'bg-gray-100 text-gray-800';
  };

  const getPerfilLabel = (perfil) => {
    const labels = {
      solicitante: 'Solicitante',
      comprador: 'Comprador',
      execucao: 'Execução',
      pagamento: 'Pagamento'
    };
    return labels[perfil] || perfil;
  };

  const filteredMenuItems = menuItems.filter(item => 
    hasPermission(item.permissions)
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Mobile */}
      <header className="bg-white shadow-sm border-b lg:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex items-center space-x-2">
              <Building2 className="h-6 w-6 text-blue-600" />
              <span className="font-semibold text-gray-900">Gestão de Obras</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm">
              <Bell className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Sidebar Overlay Mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-50 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:shadow-none lg:border-r
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-2">
            <Building2 className="h-6 w-6 text-blue-600" />
            <span className="font-semibold text-gray-900">Gestão de Obras</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* User Info */}
        <div className="p-4 border-b bg-gray-50">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2 rounded-full">
              <User className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.nome}
              </p>
              <Badge 
                variant="secondary" 
                className={`text-xs ${getPerfilColor(user?.perfil)}`}
              >
                {getPerfilLabel(user?.perfil)}
              </Badge>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {filteredMenuItems.map((item, index) => {
              const IconComponent = item.icon;
              const isActive = window.location.pathname === item.path;
              
              return (
                <li key={index}>
                  <a
                    href={item.path}
                    className={`
                      flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                      ${isActive 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'text-gray-700 hover:bg-gray-100'
                      }
                    `}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <IconComponent className="h-5 w-5" />
                    <span>{item.title}</span>
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t">
          <Button
            variant="ghost"
            onClick={logout}
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <LogOut className="h-5 w-5 mr-3" />
            Sair
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64">
        {/* Header Desktop */}
        <header className="hidden lg:block bg-white shadow-sm border-b">
          <div className="flex items-center justify-between px-6 py-4">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                Sistema de Gestão de Obras
              </h1>
              <p className="text-sm text-gray-600">
                Bem-vindo, {user?.nome}
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <Bell className="h-5 w-5" />
              </Button>
              <div className="flex items-center space-x-2">
                <div className="bg-blue-600 p-2 rounded-full">
                  <User className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {user?.nome}
                  </p>
                  <Badge 
                    variant="secondary" 
                    className={`text-xs ${getPerfilColor(user?.perfil)}`}
                  >
                    {getPerfilLabel(user?.perfil)}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 lg:p-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;

