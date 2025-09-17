import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { db } from './database';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Button } from './components/ui/button';
import { Badge } from './components/ui/badge';
import { Input } from './components/ui/input';
import { 
  Users, 
  Plus, 
  Search, 
  Edit, 
  Eye, 
  MoreVertical,
  Building2,
  Phone,
  Mail,
  MapPin,
  FileText,
  CheckCircle,
  XCircle
} from 'lucide-react';

const FornecedoresList = () => {
  const { user } = useAuth();
  const [fornecedores, setFornecedores] = useState([]);
  const [filteredFornecedores, setFilteredFornecedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');

  useEffect(() => {
    loadFornecedores();
  }, []);

  useEffect(() => {
    filterFornecedores();
  }, [fornecedores, searchTerm, selectedStatus]);

  const loadFornecedores = async () => {
    try {
      setLoading(true);
      const fornecedoresData = await db.fornecedores.orderBy('nomeFantasia').toArray();
      setFornecedores(fornecedoresData);
    } catch (error) {
      console.error('Erro ao carregar fornecedores:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterFornecedores = () => {
    let filtered = fornecedores;

    // Filtrar por termo de busca
    if (searchTerm) {
      filtered = filtered.filter(fornecedor => 
        fornecedor.nomeFantasia.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fornecedor.razaoSocial.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fornecedor.cnpj.includes(searchTerm) ||
        fornecedor.contato.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fornecedor.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar por status
    if (selectedStatus !== 'all') {
      const isActive = selectedStatus === 'ativo';
      filtered = filtered.filter(fornecedor => fornecedor.ativo === isActive);
    }

    setFilteredFornecedores(filtered);
  };

  const formatCNPJ = (cnpj) => {
    return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  };

  const formatPhone = (phone) => {
    return phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  };

  const toggleFornecedorStatus = async (fornecedorId, currentStatus) => {
    try {
      await db.fornecedores.update(fornecedorId, { ativo: !currentStatus });
      await loadFornecedores();
    } catch (error) {
      console.error('Erro ao atualizar status do fornecedor:', error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Fornecedores</h1>
            <p className="text-gray-600">Cadastro de fornecedores para cotações</p>
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
          <h1 className="text-2xl font-bold text-gray-900">Fornecedores</h1>
          <p className="text-gray-600">Cadastro de fornecedores para cotações</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Novo Fornecedor
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar por nome, CNPJ, contato ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
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
                <p className="text-2xl font-bold text-gray-900">{fornecedores.length}</p>
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
                  {fornecedores.filter(f => f.ativo).length}
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
                  {fornecedores.filter(f => !f.ativo).length}
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
                <p className="text-sm font-medium text-gray-600">Resultados</p>
                <p className="text-2xl font-bold text-gray-900">{filteredFornecedores.length}</p>
              </div>
              <Search className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Fornecedores */}
      {filteredFornecedores.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFornecedores.map((fornecedor) => (
            <Card key={fornecedor.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <Building2 className="h-5 w-5 text-blue-600" />
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate">{fornecedor.nomeFantasia}</CardTitle>
                      <CardDescription className="text-sm truncate">
                        {fornecedor.razaoSocial}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge 
                      className={fornecedor.ativo 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                      }
                    >
                      {fornecedor.ativo ? 'Ativo' : 'Inativo'}
                    </Badge>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                {/* CNPJ */}
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <FileText className="h-4 w-4" />
                  <span>CNPJ: {formatCNPJ(fornecedor.cnpj)}</span>
                </div>

                {/* Contato */}
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Users className="h-4 w-4" />
                  <span>Contato: {fornecedor.contato}</span>
                </div>

                {/* Telefone */}
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Phone className="h-4 w-4" />
                  <span>{formatPhone(fornecedor.telefone)}</span>
                </div>

                {/* Email */}
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Mail className="h-4 w-4" />
                  <span className="truncate">{fornecedor.email}</span>
                </div>

                {/* Endereço */}
                <div className="flex items-start space-x-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4 mt-0.5" />
                  <span className="line-clamp-2">{fornecedor.endereco}</span>
                </div>

                {/* Data de Criação */}
                <div className="text-xs text-gray-500">
                  Cadastrado em: {new Date(fornecedor.criadoEm).toLocaleDateString('pt-BR')}
                </div>

                {/* Ações */}
                <div className="flex space-x-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Eye className="mr-2 h-4 w-4" />
                    Ver
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Edit className="mr-2 h-4 w-4" />
                    Editar
                  </Button>
                </div>

                {/* Toggle Status */}
                <Button 
                  variant={fornecedor.ativo ? "destructive" : "default"}
                  size="sm" 
                  className="w-full"
                  onClick={() => toggleFornecedorStatus(fornecedor.id, fornecedor.ativo)}
                >
                  {fornecedor.ativo ? (
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
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || selectedStatus !== 'all' ? 'Nenhum fornecedor encontrado' : 'Nenhum fornecedor cadastrado'}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || selectedStatus !== 'all' 
                ? 'Tente ajustar os filtros de busca.' 
                : 'Comece criando seu primeiro fornecedor.'
              }
            </p>
            {(!searchTerm && selectedStatus === 'all') && (
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Novo Fornecedor
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Busca Rápida para Cotações */}
      {searchTerm && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-900">Busca Rápida para Cotações</CardTitle>
            <CardDescription className="text-green-700">
              {filteredFornecedores.filter(f => f.ativo).length} fornecedor(es) ativo(s) encontrado(s) para "{searchTerm}"
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {filteredFornecedores.filter(f => f.ativo).slice(0, 3).map((fornecedor) => (
                <div key={fornecedor.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-green-200">
                  <div className="flex items-center space-x-3">
                    <Building2 className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium text-green-900">{fornecedor.nomeFantasia}</p>
                      <p className="text-sm text-green-700">{fornecedor.contato} • {formatPhone(fornecedor.telefone)}</p>
                    </div>
                  </div>
                  <Button size="sm" className="bg-green-600 hover:bg-green-700">
                    Solicitar Cotação
                  </Button>
                </div>
              ))}
              {filteredFornecedores.filter(f => f.ativo).length > 3 && (
                <p className="text-sm text-green-700 text-center">
                  +{filteredFornecedores.filter(f => f.ativo).length - 3} fornecedor(es) adicional(is)
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FornecedoresList;

