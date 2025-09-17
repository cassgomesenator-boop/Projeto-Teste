import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { db } from './database';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Button } from './components/ui/button';
import { Badge } from './components/ui/badge';
import { Input } from './components/ui/input';
import { Alert, AlertDescription } from './components/ui/alert';
import { 
  Users, 
  Plus, 
  Search, 
  Edit, 
  Eye, 
  MoreVertical,
  UserPlus,
  Shield,
  Mail,
  Phone,
  Calendar,
  CheckCircle,
  XCircle,
  Settings
} from 'lucide-react';

const UsuariosList = () => {
  const { user } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [filteredUsuarios, setFilteredUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPerfil, setSelectedPerfil] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newUser, setNewUser] = useState({
    nome: '',
    email: '',
    telefone: '',
    perfil: 'execucao',
    ativo: true
  });

  const perfis = [
    { value: 'administracao', label: 'Administração', color: 'bg-purple-100 text-purple-800' },
    { value: 'compras', label: 'Compras', color: 'bg-green-100 text-green-800' },
    { value: 'financeiro', label: 'Financeiro', color: 'bg-blue-100 text-blue-800' },
    { value: 'execucao', label: 'Execução', color: 'bg-orange-100 text-orange-800' }
  ];

  const permissoesPorPerfil = {
    administracao: [
      'Inserir novas obras',
      'Upload de cronograma de obras',
      'Upload de planilha de materiais',
      'Cadastro de fornecedores',
      'Gerenciar usuários',
      'Todas as permissões do sistema'
    ],
    compras: [
      'Cadastrar fornecedores',
      'Fazer cotações',
      'Aprovar pedido de compra',
      'Gerenciar processo de compras'
    ],
    financeiro: [
      'Cadastrar fornecedores',
      'Liberar pagamento mediante nota fiscal',
      'Controlar fluxo financeiro',
      'Relatórios financeiros'
    ],
    execucao: [
      'Inserir pedidos',
      'Registrar recebimento em obra',
      'Atualizar status de atividades',
      'Controlar cronograma'
    ]
  };

  useEffect(() => {
    loadUsuarios();
  }, []);

  useEffect(() => {
    filterUsuarios();
  }, [usuarios, searchTerm, selectedPerfil, selectedStatus]);

  const loadUsuarios = async () => {
    try {
      setLoading(true);
      const usuariosData = await db.usuarios.orderBy('nome').toArray();
      setUsuarios(usuariosData);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterUsuarios = () => {
    let filtered = usuarios;

    // Filtrar por termo de busca
    if (searchTerm) {
      filtered = filtered.filter(usuario => 
        usuario.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        usuario.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        usuario.telefone.includes(searchTerm)
      );
    }

    // Filtrar por perfil
    if (selectedPerfil !== 'all') {
      filtered = filtered.filter(usuario => usuario.perfil === selectedPerfil);
    }

    // Filtrar por status
    if (selectedStatus !== 'all') {
      const isActive = selectedStatus === 'ativo';
      filtered = filtered.filter(usuario => usuario.ativo === isActive);
    }

    setFilteredUsuarios(filtered);
  };

  const getPerfilInfo = (perfil) => {
    return perfis.find(p => p.value === perfil) || perfis[3];
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    
    if (!newUser.nome || !newUser.email) {
      alert('Nome e email são obrigatórios');
      return;
    }

    try {
      const novoUsuario = {
        ...newUser,
        id: Date.now(),
        criadoEm: new Date().toISOString(),
        ultimoLogin: null
      };

      await db.usuarios.add(novoUsuario);
      await loadUsuarios();
      
      setShowCreateForm(false);
      setNewUser({
        nome: '',
        email: '',
        telefone: '',
        perfil: 'execucao',
        ativo: true
      });
      
      alert('Usuário criado com sucesso!');
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      alert('Erro ao criar usuário');
    }
  };

  const toggleUserStatus = async (usuarioId, currentStatus) => {
    try {
      await db.usuarios.update(usuarioId, { ativo: !currentStatus });
      await loadUsuarios();
    } catch (error) {
      console.error('Erro ao atualizar status do usuário:', error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Usuários</h1>
            <p className="text-gray-600">Gerenciamento de usuários e permissões</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="h-2 bg-gray-200 rounded w-full"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Usuários</h1>
          <p className="text-gray-600">Gerenciamento de usuários e permissões</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Novo Usuário
        </Button>
      </div>

      {/* Alerta de Permissão */}
      {user.perfil !== 'administracao' && (
        <Alert className="border-orange-200 bg-orange-50">
          <Shield className="h-4 w-4 text-orange-600" />
          <AlertDescription>
            <p className="font-medium text-orange-800">Acesso Restrito</p>
            <p className="text-orange-700">
              Apenas usuários com perfil de Administração podem gerenciar usuários.
            </p>
          </AlertDescription>
        </Alert>
      )}

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar por nome, email ou telefone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={selectedPerfil}
          onChange={(e) => setSelectedPerfil(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Todos os Perfis</option>
          {perfis.map((perfil) => (
            <option key={perfil.value} value={perfil.value}>
              {perfil.label}
            </option>
          ))}
        </select>
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Todos os Status</option>
          <option value="ativo">Ativos</option>
          <option value="inativo">Inativos</option>
        </select>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{usuarios.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ativos</p>
                <p className="text-2xl font-bold text-green-900">
                  {usuarios.filter(u => u.ativo).length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Inativos</p>
                <p className="text-2xl font-bold text-red-900">
                  {usuarios.filter(u => !u.ativo).length}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Administradores</p>
                <p className="text-2xl font-bold text-purple-900">
                  {usuarios.filter(u => u.perfil === 'administracao').length}
                </p>
              </div>
              <Settings className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Formulário de Criação */}
      {showCreateForm && user.perfil === 'administracao' && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-900">Criar Novo Usuário</CardTitle>
            <CardDescription className="text-blue-700">
              Preencha os dados do novo usuário e selecione o perfil apropriado
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome Completo *
                  </label>
                  <Input
                    value={newUser.nome}
                    onChange={(e) => setNewUser({...newUser, nome: e.target.value})}
                    placeholder="Digite o nome completo"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <Input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                    placeholder="usuario@empresa.com"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telefone
                  </label>
                  <Input
                    value={newUser.telefone}
                    onChange={(e) => setNewUser({...newUser, telefone: e.target.value})}
                    placeholder="(11) 99999-9999"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Perfil de Acesso *
                  </label>
                  <select
                    value={newUser.perfil}
                    onChange={(e) => setNewUser({...newUser, perfil: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    {perfis.map((perfil) => (
                      <option key={perfil.value} value={perfil.value}>
                        {perfil.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              {/* Permissões do Perfil Selecionado */}
              <div className="bg-white p-4 rounded-lg border">
                <h4 className="font-medium text-gray-900 mb-2">
                  Permissões do perfil "{getPerfilInfo(newUser.perfil).label}":
                </h4>
                <ul className="space-y-1">
                  {permissoesPorPerfil[newUser.perfil].map((permissao, index) => (
                    <li key={index} className="flex items-center text-sm text-gray-600">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      {permissao}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex space-x-2 pt-4">
                <Button type="submit" className="flex-1">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Criar Usuário
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Lista de Usuários */}
      {filteredUsuarios.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsuarios.map((usuario) => {
            const perfilInfo = getPerfilInfo(usuario.perfil);
            
            return (
              <Card key={usuario.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <Users className="h-5 w-5 text-blue-600" />
                      <div>
                        <CardTitle className="text-lg">{usuario.nome}</CardTitle>
                        <CardDescription>{usuario.email}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={perfilInfo.color}>
                        {perfilInfo.label}
                      </Badge>
                      <Badge 
                        className={usuario.ativo 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                        }
                      >
                        {usuario.ativo ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  {/* Telefone */}
                  {usuario.telefone && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Phone className="h-4 w-4" />
                      <span>{usuario.telefone}</span>
                    </div>
                  )}

                  {/* Email */}
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Mail className="h-4 w-4" />
                    <span className="truncate">{usuario.email}</span>
                  </div>

                  {/* Data de Criação */}
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Criado em: {new Date(usuario.criadoEm).toLocaleDateString('pt-BR')}
                    </span>
                  </div>

                  {/* Último Login */}
                  {usuario.ultimoLogin && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <CheckCircle className="h-4 w-4" />
                      <span>
                        Último login: {new Date(usuario.ultimoLogin).toLocaleDateString('pt-BR')} {new Date(usuario.ultimoLogin).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  )}

                  {/* Permissões */}
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm font-medium text-gray-700 mb-2">Permissões:</p>
                    <div className="space-y-1">
                      {permissoesPorPerfil[usuario.perfil].slice(0, 3).map((permissao, index) => (
                        <p key={index} className="text-xs text-gray-600">• {permissao}</p>
                      ))}
                      {permissoesPorPerfil[usuario.perfil].length > 3 && (
                        <p className="text-xs text-gray-500">
                          +{permissoesPorPerfil[usuario.perfil].length - 3} mais...
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Ações */}
                  {user.perfil === 'administracao' && (
                    <div className="flex space-x-2 pt-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </Button>
                      <Button 
                        variant={usuario.ativo ? "destructive" : "default"}
                        size="sm" 
                        className="flex-1"
                        onClick={() => toggleUserStatus(usuario.id, usuario.ativo)}
                      >
                        {usuario.ativo ? (
                          <>
                            <XCircle className="mr-2 h-4 w-4" />
                            Desativar
                          </>
                        ) : (
                          <>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Ativar
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || selectedPerfil !== 'all' || selectedStatus !== 'all' 
                ? 'Nenhum usuário encontrado' 
                : 'Nenhum usuário cadastrado'
              }
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || selectedPerfil !== 'all' || selectedStatus !== 'all'
                ? 'Tente ajustar os filtros de busca.' 
                : 'Comece criando seu primeiro usuário.'
              }
            </p>
            {(!searchTerm && selectedPerfil === 'all' && selectedStatus === 'all' && user.perfil === 'administracao') && (
              <Button onClick={() => setShowCreateForm(true)}>
                <UserPlus className="mr-2 h-4 w-4" />
                Novo Usuário
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UsuariosList;

