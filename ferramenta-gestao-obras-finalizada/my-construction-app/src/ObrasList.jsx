import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { db, STATUS_OBRA } from './database';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Button } from './components/ui/button';
import { Badge } from './components/ui/badge';
import { Input } from './components/ui/input';
import { 
  Building2, 
  Plus, 
  Search, 
  Calendar, 
  User, 
  MoreVertical,
  Edit,
  Eye,
  AlertTriangle
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const ObrasList = () => {
  const { user } = useAuth();
  const [obras, setObras] = useState([]);
  const [filteredObras, setFilteredObras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');

  useEffect(() => {
    loadObras();
  }, []);

  useEffect(() => {
    filterObras();
  }, [obras, searchTerm, selectedStatus]);

  const loadObras = async () => {
    try {
      setLoading(true);
      const obrasData = await db.obras.orderBy('criadoEm').reverse().toArray();
      setObras(obrasData);
    } catch (error) {
      console.error('Erro ao carregar obras:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterObras = () => {
    let filtered = obras;

    // Filtrar por termo de busca
    if (searchTerm) {
      filtered = filtered.filter(obra => 
        obra.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        obra.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        obra.responsavel.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar por status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(obra => obra.status === selectedStatus);
    }

    setFilteredObras(filtered);
  };

  const getStatusColor = (status) => {
    const colors = {
      planejada: 'bg-blue-100 text-blue-800',
      em_andamento: 'bg-green-100 text-green-800',
      pausada: 'bg-yellow-100 text-yellow-800',
      concluida: 'bg-gray-100 text-gray-800',
      cancelada: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status) => {
    const labels = {
      planejada: 'Planejada',
      em_andamento: 'Em Andamento',
      pausada: 'Pausada',
      concluida: 'Concluída',
      cancelada: 'Cancelada'
    };
    return labels[status] || status;
  };

  const calculateProgress = (dataInicio, dataFim) => {
    const now = new Date();
    const inicio = new Date(dataInicio);
    const fim = new Date(dataFim);
    
    if (now < inicio) return 0;
    if (now > fim) return 100;
    
    const total = fim.getTime() - inicio.getTime();
    const elapsed = now.getTime() - inicio.getTime();
    
    return Math.round((elapsed / total) * 100);
  };

  const isOverdue = (dataFim, status) => {
    return status === 'em_andamento' && new Date() > new Date(dataFim);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Obras</h1>
            <p className="text-gray-600">Gerenciamento de obras e projetos</p>
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
          <h1 className="text-2xl font-bold text-gray-900">Obras</h1>
          <p className="text-gray-600">Gerenciamento de obras e projetos</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nova Obra
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar por nome, código ou responsável..."
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
          <option value="planejada">Planejada</option>
          <option value="em_andamento">Em Andamento</option>
          <option value="pausada">Pausada</option>
          <option value="concluida">Concluída</option>
          <option value="cancelada">Cancelada</option>
        </select>
      </div>

      {/* Lista de Obras */}
      {filteredObras.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredObras.map((obra) => {
            const progress = calculateProgress(obra.dataInicio, obra.dataFim);
            const overdue = isOverdue(obra.dataFim, obra.status);
            
            return (
              <Card key={obra.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <Building2 className="h-5 w-5 text-blue-600" />
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg truncate">{obra.nome}</CardTitle>
                        <CardDescription className="text-sm">
                          Código: {obra.codigo}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {overdue && (
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                      )}
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Status */}
                  <div className="flex items-center justify-between">
                    <Badge className={getStatusColor(obra.status)}>
                      {getStatusLabel(obra.status)}
                    </Badge>
                    {obra.status === 'em_andamento' && (
                      <span className="text-sm text-gray-600">{progress}%</span>
                    )}
                  </div>

                  {/* Progresso */}
                  {obra.status === 'em_andamento' && (
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${overdue ? 'bg-red-500' : 'bg-blue-600'}`}
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      ></div>
                    </div>
                  )}

                  {/* Descrição */}
                  {obra.descricao && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {obra.descricao}
                    </p>
                  )}

                  {/* Datas */}
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>
                        Início: {format(new Date(obra.dataInicio), 'dd/MM/yyyy', { locale: ptBR })}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span className={overdue ? 'text-red-600 font-medium' : ''}>
                        Fim: {format(new Date(obra.dataFim), 'dd/MM/yyyy', { locale: ptBR })}
                      </span>
                    </div>
                  </div>

                  {/* Responsável */}
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <User className="h-4 w-4" />
                    <span>{obra.responsavel}</span>
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
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <Building2 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || selectedStatus !== 'all' ? 'Nenhuma obra encontrada' : 'Nenhuma obra cadastrada'}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || selectedStatus !== 'all' 
                ? 'Tente ajustar os filtros de busca.' 
                : 'Comece criando sua primeira obra.'
              }
            </p>
            {(!searchTerm && selectedStatus === 'all') && (
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nova Obra
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ObrasList;

