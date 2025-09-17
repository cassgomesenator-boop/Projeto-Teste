import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { db } from './database';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Badge } from './components/ui/badge';
import { Button } from './components/ui/button';
import { 
  Building2, 
  ClipboardList, 
  Package, 
  Users, 
  ShoppingCart, 
  Truck, 
  CreditCard,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    obras: 0,
    pedidos: 0,
    pedidosPendentes: 0,
    cotacoes: 0,
    entregas: 0,
    alertas: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Carregar estatísticas básicas
      const [
        obrasCount,
        pedidosCount,
        pedidosPendentesCount,
        cotacoesCount,
        entregasCount,
        alertasCount
      ] = await Promise.all([
        db.obras.count(),
        db.pedidos.count(),
        db.pedidos.where('status').anyOf(['pendente', 'em_cotacao']).count(),
        db.cotacoes.count(),
        db.entregas.count(),
        db.alertas.where('visualizado').equals(false).count()
      ]);

      setStats({
        obras: obrasCount,
        pedidos: pedidosCount,
        pedidosPendentes: pedidosPendentesCount,
        cotacoes: cotacoesCount,
        entregas: entregasCount,
        alertas: alertasCount
      });

      // Carregar atividades recentes baseadas no perfil do usuário
      await loadRecentActivity();
      
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRecentActivity = async () => {
    try {
      let activities = [];

      if (user.perfil === 'solicitante') {
        // Pedidos do solicitante
        const pedidos = await db.pedidos
          .where('solicitanteId')
          .equals(user.id)
          .reverse()
          .limit(5)
          .toArray();
        
        activities = pedidos.map(pedido => ({
          id: pedido.id,
          type: 'pedido',
          title: `Pedido #${pedido.id}`,
          description: `${pedido.nomeDaObra} - ${pedido.status}`,
          date: pedido.dataDeCriacao,
          status: pedido.status
        }));
      } else if (user.perfil === 'comprador') {
        // Todos os pedidos para o comprador
        const pedidos = await db.pedidos
          .orderBy('dataDeCriacao')
          .reverse()
          .limit(5)
          .toArray();
        
        activities = pedidos.map(pedido => ({
          id: pedido.id,
          type: 'pedido',
          title: `Pedido #${pedido.id}`,
          description: `${pedido.nomeDaObra} - ${pedido.status}`,
          date: pedido.dataDeCriacao,
          status: pedido.status
        }));
      } else if (user.perfil === 'execucao') {
        // Entregas para execução
        const entregas = await db.entregas
          .orderBy('dataPrevista')
          .reverse()
          .limit(5)
          .toArray();
        
        activities = entregas.map(entrega => ({
          id: entrega.id,
          type: 'entrega',
          title: `Entrega #${entrega.id}`,
          description: `Prevista para ${new Date(entrega.dataPrevista).toLocaleDateString()}`,
          date: entrega.dataPrevista,
          status: entrega.statusEntrega
        }));
      } else if (user.perfil === 'pagamento') {
        // Notas fiscais para pagamento
        const notasFiscais = await db.notas_fiscais
          .orderBy('dataDeEmissao')
          .reverse()
          .limit(5)
          .toArray();
        
        activities = notasFiscais.map(nf => ({
          id: nf.id,
          type: 'nota_fiscal',
          title: `NF #${nf.numero}`,
          description: `R$ ${nf.valor?.toFixed(2)} - ${nf.statusPagamento}`,
          date: nf.dataDeEmissao,
          status: nf.statusPagamento
        }));
      }

      setRecentActivity(activities);
    } catch (error) {
      console.error('Erro ao carregar atividades recentes:', error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pendente: 'bg-yellow-100 text-yellow-800',
      em_cotacao: 'bg-blue-100 text-blue-800',
      aprovado: 'bg-green-100 text-green-800',
      rejeitado: 'bg-red-100 text-red-800',
      comprado: 'bg-purple-100 text-purple-800',
      entregue: 'bg-green-100 text-green-800',
      agendada: 'bg-blue-100 text-blue-800',
      recebida_ok: 'bg-green-100 text-green-800',
      pago: 'bg-green-100 text-green-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    const icons = {
      pendente: Clock,
      em_cotacao: ShoppingCart,
      aprovado: CheckCircle,
      rejeitado: AlertTriangle,
      comprado: Package,
      entregue: Truck,
      agendada: Clock,
      recebida_ok: CheckCircle,
      pago: CreditCard
    };
    const IconComponent = icons[status] || Clock;
    return <IconComponent className="h-4 w-4" />;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">
          Visão geral do sistema de gestão de obras
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Obras Ativas</p>
                <p className="text-2xl font-bold text-gray-900">{stats.obras}</p>
              </div>
              <Building2 className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Pedidos</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pedidos}</p>
              </div>
              <ClipboardList className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pedidos Pendentes</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pedidosPendentes}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Alertas</p>
                <p className="text-2xl font-bold text-gray-900">{stats.alertas}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Atividades Recentes</CardTitle>
            <CardDescription>
              Últimas movimentações do sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentActivity.length > 0 ? (
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 rounded-lg border">
                    <div className="flex-shrink-0">
                      {getStatusIcon(activity.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.title}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {activity.description}
                      </p>
                    </div>
                    <Badge className={getStatusColor(activity.status)}>
                      {activity.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">
                Nenhuma atividade recente
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
            <CardDescription>
              Acesso rápido às principais funcionalidades
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3">
              {user.perfil === 'solicitante' && (
                <>
                  <Button className="justify-start" variant="outline">
                    <ClipboardList className="mr-2 h-4 w-4" />
                    Novo Pedido
                  </Button>
                  <Button className="justify-start" variant="outline">
                    <Building2 className="mr-2 h-4 w-4" />
                    Minhas Obras
                  </Button>
                </>
              )}
              
              {user.perfil === 'comprador' && (
                <>
                  <Button className="justify-start" variant="outline">
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Gerenciar Cotações
                  </Button>
                  <Button className="justify-start" variant="outline">
                    <Users className="mr-2 h-4 w-4" />
                    Fornecedores
                  </Button>
                </>
              )}
              
              {user.perfil === 'execucao' && (
                <>
                  <Button className="justify-start" variant="outline">
                    <Truck className="mr-2 h-4 w-4" />
                    Entregas Pendentes
                  </Button>
                  <Button className="justify-start" variant="outline">
                    <Package className="mr-2 h-4 w-4" />
                    Confirmar Recebimento
                  </Button>
                </>
              )}
              
              {user.perfil === 'pagamento' && (
                <>
                  <Button className="justify-start" variant="outline">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Notas Fiscais
                  </Button>
                  <Button className="justify-start" variant="outline">
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Relatórios
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;

