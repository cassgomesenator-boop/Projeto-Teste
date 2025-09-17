import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { db } from './database';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Button } from './components/ui/button';
import { Badge } from './components/ui/badge';
import { Input } from './components/ui/input';
import { Alert, AlertDescription } from './components/ui/alert';
import { 
  ShoppingCart, 
  Plus, 
  Search, 
  Edit, 
  Eye, 
  MoreVertical,
  Building2,
  Calendar,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileText,
  Users
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const CotacoesList = () => {
  const { user } = useAuth();
  const [cotacoes, setCotacoes] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);
  const [filteredCotacoes, setFilteredCotacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPedido, setSelectedPedido] = useState('all');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterCotacoes();
  }, [cotacoes, searchTerm, selectedStatus, selectedPedido]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Carregar cotações com dados relacionados
      const [cotacoesData, pedidosData, fornecedoresData] = await Promise.all([
        db.cotacoes.orderBy('dataDaCotacao').reverse().toArray(),
        db.pedidos.toArray(),
        db.fornecedores.toArray()
      ]);

      setCotacoes(cotacoesData);
      setPedidos(pedidosData);
      setFornecedores(fornecedoresData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterCotacoes = () => {
    let filtered = cotacoes;

    // Filtrar por termo de busca
    if (searchTerm) {
      filtered = filtered.filter(cotacao => {
        const fornecedor = fornecedores.find(f => f.id === cotacao.fornecedorId);
        const pedido = pedidos.find(p => p.id === cotacao.pedidoId);
        
        return (
          fornecedor?.nomeFantasia.toLowerCase().includes(searchTerm.toLowerCase()) ||
          pedido?.nomeDaObra.toLowerCase().includes(searchTerm.toLowerCase()) ||
          cotacao.valorTotal.toString().includes(searchTerm) ||
          cotacao.observacoes?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    }

    // Filtrar por status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(cotacao => cotacao.status === selectedStatus);
    }

    // Filtrar por pedido
    if (selectedPedido !== 'all') {
      filtered = filtered.filter(cotacao => cotacao.pedidoId === parseInt(selectedPedido));
    }

    setFilteredCotacoes(filtered);
  };

  const getStatusColor = (status) => {
    const colors = {
      pendente: 'bg-yellow-100 text-yellow-800',
      aprovada: 'bg-green-100 text-green-800',
      rejeitada: 'bg-red-100 text-red-800',
      vencida: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    const icons = {
      pendente: Clock,
      aprovada: CheckCircle,
      rejeitada: XCircle,
      vencida: AlertTriangle
    };
    const IconComponent = icons[status] || Clock;
    return <IconComponent className="h-4 w-4" />;
  };

  const getStatusLabel = (status) => {
    const labels = {
      pendente: 'Pendente',
      aprovada: 'Aprovada',
      rejeitada: 'Rejeitada',
      vencida: 'Vencida'
    };
    return labels[status] || status;
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getPedidoInfo = (pedidoId) => {
    return pedidos.find(p => p.id === pedidoId);
  };

  const getFornecedorInfo = (fornecedorId) => {
    return fornecedores.find(f => f.id === fornecedorId);
  };

  const getCotacoesPorPedido = (pedidoId) => {
    return cotacoes.filter(c => c.pedidoId === pedidoId);
  };

  const aprovarCotacao = async (cotacaoId, pedidoId) => {
    try {
      // Aprovar a cotação selecionada
      await db.cotacoes.update(cotacaoId, { status: 'aprovada' });
      
      // Rejeitar outras cotações do mesmo pedido
      const outrasCotacoes = cotacoes.filter(c => c.pedidoId === pedidoId && c.id !== cotacaoId);
      for (const cotacao of outrasCotacoes) {
        await db.cotacoes.update(cotacao.id, { status: 'rejeitada' });
      }
      
      // Atualizar status do pedido
      await db.pedidos.update(pedidoId, { status: 'aprovado' });
      
      await loadData();
    } catch (error) {
      console.error('Erro ao aprovar cotação:', error);
    }
  };

  const rejeitarCotacao = async (cotacaoId) => {
    try {
      await db.cotacoes.update(cotacaoId, { status: 'rejeitada' });
      await loadData();
    } catch (error) {
      console.error('Erro ao rejeitar cotação:', error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Cotações</h1>
            <p className="text-gray-600">Gerenciamento de cotações de fornecedores</p>
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
          <h1 className="text-2xl font-bold text-gray-900">Cotações</h1>
          <p className="text-gray-600">Gerenciamento de cotações de fornecedores</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nova Cotação
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar por fornecedor, obra, valor ou observações..."
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
          <option value="pendente">Pendente</option>
          <option value="aprovada">Aprovada</option>
          <option value="rejeitada">Rejeitada</option>
          <option value="vencida">Vencida</option>
        </select>
        <select
          value={selectedPedido}
          onChange={(e) => setSelectedPedido(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Todos os Pedidos</option>
          {pedidos.map((pedido) => (
            <option key={pedido.id} value={pedido.id}>
              {pedido.nomeDaObra} - {pedido.codigoDaObra}
            </option>
          ))}
        </select>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{cotacoes.length}</p>
              </div>
              <ShoppingCart className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pendentes</p>
                <p className="text-2xl font-bold text-yellow-900">
                  {cotacoes.filter(c => c.status === 'pendente').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Aprovadas</p>
                <p className="text-2xl font-bold text-green-900">
                  {cotacoes.filter(c => c.status === 'aprovada').length}
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
                <p className="text-sm font-medium text-gray-600">Valor Total</p>
                <p className="text-lg font-bold text-gray-900">
                  {formatCurrency(cotacoes.filter(c => c.status === 'aprovada').reduce((sum, c) => sum + c.valorTotal, 0))}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alertas para Pedidos com Poucas Cotações */}
      {pedidos.filter(p => getCotacoesPorPedido(p.id).length < 3 && p.status === 'em_cotacao').length > 0 && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription>
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium text-orange-800">Atenção: Pedidos com poucas cotações</p>
                <p className="text-orange-700">
                  {pedidos.filter(p => getCotacoesPorPedido(p.id).length < 3 && p.status === 'em_cotacao').length} pedido(s) 
                  precisam de mais cotações (mínimo 3 por pedido)
                </p>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Lista de Cotações */}
      {filteredCotacoes.length > 0 ? (
        <div className="space-y-4">
          {filteredCotacoes.map((cotacao) => {
            const pedido = getPedidoInfo(cotacao.pedidoId);
            const fornecedor = getFornecedorInfo(cotacao.fornecedorId);
            const cotacoesDoPedido = getCotacoesPorPedido(cotacao.pedidoId);
            
            return (
              <Card key={cotacao.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <ShoppingCart className="h-5 w-5 text-blue-600" />
                      <div>
                        <CardTitle className="text-lg">
                          Cotação #{cotacao.id}
                        </CardTitle>
                        <CardDescription>
                          {pedido?.nomeDaObra} - {fornecedor?.nomeFantasia}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(cotacao.status)}>
                        {getStatusIcon(cotacao.status)}
                        <span className="ml-1">{getStatusLabel(cotacao.status)}</span>
                      </Badge>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Informações Principais */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <DollarSign className="h-4 w-4" />
                      <span className="font-medium">{formatCurrency(cotacao.valorTotal)}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span>Prazo: {cotacao.prazoDeEntrega} dias</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>{format(new Date(cotacao.dataDaCotacao), 'dd/MM/yyyy', { locale: ptBR })}</span>
                    </div>
                  </div>

                  {/* Fornecedor */}
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Building2 className="h-4 w-4" />
                    <span>{fornecedor?.nomeFantasia} - {fornecedor?.contato}</span>
                  </div>

                  {/* Observações */}
                  {cotacao.observacoes && (
                    <div className="flex items-start space-x-2 text-sm text-gray-600">
                      <FileText className="h-4 w-4 mt-0.5" />
                      <span className="line-clamp-2">{cotacao.observacoes}</span>
                    </div>
                  )}

                  {/* Status das Cotações do Pedido */}
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        Cotações deste pedido ({cotacoesDoPedido.length}/3 mínimo)
                      </span>
                      {cotacoesDoPedido.length < 3 && (
                        <Badge className="bg-orange-100 text-orange-800">
                          Precisa mais cotações
                        </Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {cotacoesDoPedido.map((c) => {
                        const f = getFornecedorInfo(c.fornecedorId);
                        return (
                          <Badge 
                            key={c.id} 
                            variant="outline" 
                            className={`text-xs ${c.id === cotacao.id ? 'border-blue-500 bg-blue-50' : ''}`}
                          >
                            {f?.nomeFantasia} - {formatCurrency(c.valorTotal)}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="flex space-x-2 pt-2">
                    <Button variant="outline" size="sm">
                      <Eye className="mr-2 h-4 w-4" />
                      Ver Detalhes
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="mr-2 h-4 w-4" />
                      Editar
                    </Button>
                    
                    {cotacao.status === 'pendente' && user.perfil === 'solicitante' && (
                      <>
                        <Button 
                          size="sm" 
                          onClick={() => aprovarCotacao(cotacao.id, cotacao.pedidoId)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Aprovar
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => rejeitarCotacao(cotacao.id)}
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Rejeitar
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <ShoppingCart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || selectedStatus !== 'all' || selectedPedido !== 'all' 
                ? 'Nenhuma cotação encontrada' 
                : 'Nenhuma cotação cadastrada'
              }
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || selectedStatus !== 'all' || selectedPedido !== 'all'
                ? 'Tente ajustar os filtros de busca.' 
                : 'Comece criando sua primeira cotação.'
              }
            </p>
            {(!searchTerm && selectedStatus === 'all' && selectedPedido === 'all') && (
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nova Cotação
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CotacoesList;

