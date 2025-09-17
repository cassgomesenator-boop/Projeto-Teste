import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { db, STATUS_CRONOGRAMA } from './database';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Button } from './components/ui/button';
import { Badge } from './components/ui/badge';
import { Input } from './components/ui/input';
import { Alert, AlertDescription } from './components/ui/alert';
import { 
  Calendar, 
  Plus, 
  Search, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Play, 
  Pause,
  Building2,
  Bell,
  Filter
} from 'lucide-react';
import { format, differenceInDays, isAfter, isBefore, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const CronogramaView = () => {
  const { user } = useAuth();
  const [obras, setObras] = useState([]);
  const [selectedObra, setSelectedObra] = useState(null);
  const [cronogramas, setCronogramas] = useState([]);
  const [filteredCronogramas, setFilteredCronogramas] = useState([]);
  const [alertas, setAlertas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedObra) {
      loadCronograma(selectedObra.id);
    }
  }, [selectedObra]);

  useEffect(() => {
    filterCronogramas();
  }, [cronogramas, searchTerm, selectedStatus]);

  const loadData = async () => {
    try {
      setLoading(true);
      const obrasData = await db.obras.where('status').anyOf(['planejada', 'em_andamento', 'pausada']).toArray();
      setObras(obrasData);
      
      if (obrasData.length > 0) {
        setSelectedObra(obrasData[0]);
      }

      // Carregar alertas ativos
      await loadAlertas();
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCronograma = async (obraId) => {
    try {
      const cronogramaData = await db.cronogramas
        .where('obraId')
        .equals(obraId)
        .sortBy('dataInicio');
      
      setCronogramas(cronogramaData);
      
      // Verificar e criar alertas automáticos
      await checkAndCreateAlerts(cronogramaData);
    } catch (error) {
      console.error('Erro ao carregar cronograma:', error);
    }
  };

  const loadAlertas = async () => {
    try {
      const alertasData = await db.alertas
        .where('visualizado')
        .equals(false)
        .and(alerta => alerta.dataAlerta <= new Date())
        .toArray();
      
      setAlertas(alertasData);
    } catch (error) {
      console.error('Erro ao carregar alertas:', error);
    }
  };

  const checkAndCreateAlerts = async (cronogramaData) => {
    const today = new Date();
    
    for (const atividade of cronogramaData) {
      if (atividade.status === 'planejado' || atividade.status === 'em_andamento') {
        const dataInicio = new Date(atividade.dataInicio);
        const dataFim = new Date(atividade.dataFim);
        const diasParaInicio = differenceInDays(dataInicio, today);
        const diasParaFim = differenceInDays(dataFim, today);

        // Alerta para início da atividade
        if (diasParaInicio <= atividade.alertaDias && diasParaInicio >= 0) {
          const alertaExistente = await db.alertas
            .where(['tipo', 'obraId', 'pedidoId'])
            .equals(['cronograma_inicio', selectedObra.id, atividade.id])
            .first();

          if (!alertaExistente) {
            await db.alertas.add({
              tipo: 'cronograma_inicio',
              titulo: `Atividade iniciando em ${diasParaInicio} dias`,
              descricao: `A atividade "${atividade.atividade}" está programada para iniciar em ${diasParaInicio} dias.`,
              obraId: selectedObra.id,
              pedidoId: atividade.id,
              dataAlerta: today,
              visualizado: false
            });
          }
        }

        // Alerta para fim da atividade
        if (atividade.status === 'em_andamento' && diasParaFim <= 3 && diasParaFim >= 0) {
          const alertaExistente = await db.alertas
            .where(['tipo', 'obraId', 'pedidoId'])
            .equals(['cronograma_fim', selectedObra.id, atividade.id])
            .first();

          if (!alertaExistente) {
            await db.alertas.add({
              tipo: 'cronograma_fim',
              titulo: `Atividade finalizando em ${diasParaFim} dias`,
              descricao: `A atividade "${atividade.atividade}" deve ser finalizada em ${diasParaFim} dias.`,
              obraId: selectedObra.id,
              pedidoId: atividade.id,
              dataAlerta: today,
              visualizado: false
            });
          }
        }

        // Alerta para atividade atrasada
        if (atividade.status === 'em_andamento' && isAfter(today, dataFim)) {
          const alertaExistente = await db.alertas
            .where(['tipo', 'obraId', 'pedidoId'])
            .equals(['cronograma_atraso', selectedObra.id, atividade.id])
            .first();

          if (!alertaExistente) {
            await db.alertas.add({
              tipo: 'cronograma_atraso',
              titulo: `Atividade em atraso`,
              descricao: `A atividade "${atividade.atividade}" está ${Math.abs(diasParaFim)} dias em atraso.`,
              obraId: selectedObra.id,
              pedidoId: atividade.id,
              dataAlerta: today,
              visualizado: false
            });
          }
        }
      }
    }

    // Recarregar alertas após criação
    await loadAlertas();
  };

  const filterCronogramas = () => {
    let filtered = cronogramas;

    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.atividade.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(item => item.status === selectedStatus);
    }

    setFilteredCronogramas(filtered);
  };

  const getStatusColor = (status) => {
    const colors = {
      planejado: 'bg-blue-100 text-blue-800',
      em_andamento: 'bg-green-100 text-green-800',
      concluido: 'bg-gray-100 text-gray-800',
      atrasado: 'bg-red-100 text-red-800',
      cancelado: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    const icons = {
      planejado: Clock,
      em_andamento: Play,
      concluido: CheckCircle,
      atrasado: AlertTriangle,
      cancelado: Pause
    };
    const IconComponent = icons[status] || Clock;
    return <IconComponent className="h-4 w-4" />;
  };

  const getStatusLabel = (status) => {
    const labels = {
      planejado: 'Planejado',
      em_andamento: 'Em Andamento',
      concluido: 'Concluído',
      atrasado: 'Atrasado',
      cancelado: 'Cancelado'
    };
    return labels[status] || status;
  };

  const calculateProgress = (dataInicio, dataFim, status) => {
    if (status === 'concluido') return 100;
    if (status === 'planejado') return 0;

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
    return status === 'em_andamento' && isAfter(new Date(), new Date(dataFim));
  };

  const marcarAlertaComoVisto = async (alertaId) => {
    try {
      await db.alertas.update(alertaId, { visualizado: true });
      await loadAlertas();
    } catch (error) {
      console.error('Erro ao marcar alerta como visto:', error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Cronograma</h1>
            <p className="text-gray-600">Acompanhamento de atividades e prazos</p>
          </div>
        </div>
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 rounded"></div>
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
          <h1 className="text-2xl font-bold text-gray-900">Cronograma</h1>
          <p className="text-gray-600">Acompanhamento de atividades e prazos</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nova Atividade
        </Button>
      </div>

      {/* Alertas Ativos */}
      {alertas.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Bell className="mr-2 h-5 w-5 text-orange-500" />
            Alertas Ativos ({alertas.length})
          </h2>
          {alertas.map((alerta) => (
            <Alert key={alerta.id} className="border-orange-200 bg-orange-50">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <div className="flex-1">
                <AlertDescription>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-orange-800">{alerta.titulo}</p>
                      <p className="text-orange-700">{alerta.descricao}</p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => marcarAlertaComoVisto(alerta.id)}
                      className="text-orange-600 hover:text-orange-700"
                    >
                      Marcar como visto
                    </Button>
                  </div>
                </AlertDescription>
              </div>
            </Alert>
          ))}
        </div>
      )}

      {/* Seletor de Obra */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building2 className="mr-2 h-5 w-5" />
            Selecionar Obra
          </CardTitle>
        </CardHeader>
        <CardContent>
          <select
            value={selectedObra?.id || ''}
            onChange={(e) => {
              const obra = obras.find(o => o.id === parseInt(e.target.value));
              setSelectedObra(obra);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Selecione uma obra</option>
            {obras.map((obra) => (
              <option key={obra.id} value={obra.id}>
                {obra.nome} ({obra.codigo})
              </option>
            ))}
          </select>
        </CardContent>
      </Card>

      {selectedObra && (
        <>
          {/* Filtros */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar atividades..."
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
              <option value="planejado">Planejado</option>
              <option value="em_andamento">Em Andamento</option>
              <option value="concluido">Concluído</option>
              <option value="atrasado">Atrasado</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>

          {/* Lista de Atividades */}
          {filteredCronogramas.length > 0 ? (
            <div className="space-y-4">
              {filteredCronogramas.map((atividade) => {
                const progress = calculateProgress(atividade.dataInicio, atividade.dataFim, atividade.status);
                const overdue = isOverdue(atividade.dataFim, atividade.status);
                const status = overdue ? 'atrasado' : atividade.status;
                
                return (
                  <Card key={atividade.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {atividade.atividade}
                          </h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4" />
                              <span>
                                {format(new Date(atividade.dataInicio), 'dd/MM/yyyy', { locale: ptBR })} - {format(new Date(atividade.dataFim), 'dd/MM/yyyy', { locale: ptBR })}
                              </span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Bell className="h-4 w-4" />
                              <span>Alerta: {atividade.alertaDias} dias</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getStatusColor(status)}>
                            {getStatusIcon(status)}
                            <span className="ml-1">{getStatusLabel(status)}</span>
                          </Badge>
                          {atividade.status === 'em_andamento' && (
                            <span className="text-sm font-medium text-gray-600">
                              {progress}%
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Barra de Progresso */}
                      {atividade.status === 'em_andamento' && (
                        <div className="mb-4">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${overdue ? 'bg-red-500' : 'bg-blue-600'}`}
                              style={{ width: `${Math.min(progress, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      )}

                      {/* Dependências */}
                      {atividade.dependencias && atividade.dependencias.length > 0 && (
                        <div className="mb-4">
                          <p className="text-sm text-gray-600 mb-2">Dependências:</p>
                          <div className="flex flex-wrap gap-2">
                            {atividade.dependencias.map((dep, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {dep}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Ações */}
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          Editar
                        </Button>
                        {atividade.status === 'planejado' && (
                          <Button size="sm">
                            <Play className="mr-2 h-4 w-4" />
                            Iniciar
                          </Button>
                        )}
                        {atividade.status === 'em_andamento' && (
                          <Button size="sm">
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Concluir
                          </Button>
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
                <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm || selectedStatus !== 'all' ? 'Nenhuma atividade encontrada' : 'Nenhuma atividade cadastrada'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || selectedStatus !== 'all' 
                    ? 'Tente ajustar os filtros de busca.' 
                    : 'Comece criando atividades para esta obra.'
                  }
                </p>
                {(!searchTerm && selectedStatus === 'all') && (
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Nova Atividade
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}

      {!selectedObra && obras.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Building2 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhuma obra ativa encontrada
            </h3>
            <p className="text-gray-600">
              Crie uma obra primeiro para gerenciar seu cronograma.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CronogramaView;

