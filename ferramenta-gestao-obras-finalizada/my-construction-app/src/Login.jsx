import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Label } from './components/ui/label';
import { Alert, AlertDescription } from './components/ui/alert';
import { Loader2, Building2, Users, ShoppingCart, Truck, CreditCard } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const { login, loading, error } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(email, senha);
  };

  const usuariosDemo = [
    { nome: 'Cassio Silva', email: 'cassio@obra.com', perfil: 'Solicitante', icon: Users, color: 'text-blue-600' },
    { nome: 'Rafael Compras', email: 'rafael@obra.com', perfil: 'Comprador', icon: ShoppingCart, color: 'text-green-600' },
    { nome: 'João Execução', email: 'joao@obra.com', perfil: 'Execução', icon: Truck, color: 'text-orange-600' },
    { nome: 'Graci Pagamentos', email: 'graci@obra.com', perfil: 'Pagamento', icon: CreditCard, color: 'text-purple-600' }
  ];

  const handleDemoLogin = (demoEmail) => {
    setEmail(demoEmail);
    setSenha('123456');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo e Título */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="bg-blue-600 p-3 rounded-full">
              <Building2 className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Gestão de Obras</h1>
          <p className="text-gray-600">Sistema de gestão de compras e materiais</p>
        </div>

        {/* Formulário de Login */}
        <Card>
          <CardHeader>
            <CardTitle>Entrar no Sistema</CardTitle>
            <CardDescription>
              Digite suas credenciais para acessar o sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="senha">Senha</Label>
                <Input
                  id="senha"
                  type="password"
                  placeholder="Sua senha"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  required
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  'Entrar'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Usuários Demo */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Usuários de Demonstração</CardTitle>
            <CardDescription className="text-xs">
              Clique em um usuário para fazer login automaticamente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-2">
              {usuariosDemo.map((usuario, index) => {
                const IconComponent = usuario.icon;
                return (
                  <button
                    key={index}
                    onClick={() => handleDemoLogin(usuario.email)}
                    className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors text-left"
                  >
                    <IconComponent className={`h-5 w-5 ${usuario.color}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {usuario.nome}
                      </p>
                      <p className="text-xs text-gray-500">
                        {usuario.perfil} • {usuario.email}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-gray-500 mt-3 text-center">
              Senha padrão: <code className="bg-gray-100 px-1 rounded">123456</code>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;

