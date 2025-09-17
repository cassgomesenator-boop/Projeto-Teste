import Dexie from 'dexie';

export class GestaoObrasDB extends Dexie {
  constructor() {
    super('GestaoObrasDB');
    
    this.version(1).stores({
      usuarios: '++id, nome, email, telefone, perfil, ativo, criadoEm, ultimoLogin',
      obras: '++id, nome, codigo, descricao, dataInicio, dataFim, status, responsavel, criadoEm',
      cronogramas: '++id, obraId, atividade, dataInicio, dataFim, status, dependencias, alertaDias, criadoEm',
      pedidos: '++id, solicitanteId, obraId, nomeDaObra, codigoDaObra, dataDeCriacao, dataDesejada, status, observacoes',
      itens_material: '++id, pedidoId, descricao, quantidade, unidadeDeMedida, especificacoes',
      materiais: '++id, nome, descricao, unidadePadrao, categoria, fornecedorPadrao, criadoEm',
      fornecedores: '++id, nomeFantasia, razaoSocial, cnpj, contato, telefone, email, endereco, ativo, criadoEm',
      cotacoes: '++id, pedidoId, fornecedorId, valorTotal, prazoDeEntrega, observacoes, arquivoAnexo, dataDaCotacao, status',
      entregas: '++id, pedidoId, fornecedorId, dataPrevista, dataDeRecebimento, statusEntrega, observacao, responsavelRecebimento',
      notas_fiscais: '++id, entregaId, numero, dataDeEmissao, valor, urlFotoNF, statusPagamento, dataVencimento, dataPagamento',
      alertas: '++id, tipo, titulo, descricao, obraId, pedidoId, dataAlerta, visualizado, criadoEm'
    });

    // Hooks para adicionar timestamps automaticamente
    this.usuarios.hook('creating', function (primKey, obj, trans) {
      obj.criadoEm = new Date();
    });

    this.obras.hook('creating', function (primKey, obj, trans) {
      obj.criadoEm = new Date();
    });

    this.cronogramas.hook('creating', function (primKey, obj, trans) {
      obj.criadoEm = new Date();
    });

    this.materiais.hook('creating', function (primKey, obj, trans) {
      obj.criadoEm = new Date();
    });

    this.fornecedores.hook('creating', function (primKey, obj, trans) {
      obj.criadoEm = new Date();
    });

    this.alertas.hook('creating', function (primKey, obj, trans) {
      obj.criadoEm = new Date();
    });
  }
}

// Instância única do banco
export const db = new GestaoObrasDB();

// Função para inicializar dados de exemplo
export async function initializeDatabase() {
  try {
    // Verificar se já existem usuários
    const userCount = await db.usuarios.count();
    
    if (userCount === 0) {
      // Criar usuários padrão
      await db.usuarios.bulkAdd([
        {
          nome: 'Cassio Silva',
          email: 'cassio@obra.com',
          telefone: '(11) 98765-4321',
          perfil: 'solicitante',
          ativo: true,
          criadoEm: new Date().toISOString(),
          ultimoLogin: new Date().toISOString()
        },
        {
          nome: 'Rafael Compras',
          email: 'rafael@obra.com',
          telefone: '(11) 99876-5432',
          perfil: 'comprador',
          ativo: true,
          criadoEm: new Date().toISOString(),
          ultimoLogin: new Date().toISOString()
        },
        {
          nome: 'João Execução',
          email: 'joao@obra.com',
          telefone: '(11) 97654-3210',
          perfil: 'execucao',
          ativo: true,
          criadoEm: new Date().toISOString(),
          ultimoLogin: new Date().toISOString()
        },
        {
          nome: 'Graci Pagamentos',
          email: 'graci@obra.com',
          telefone: '(11) 96543-2109',
          perfil: 'financeiro',
          ativo: true,
          criadoEm: new Date().toISOString(),
          ultimoLogin: new Date().toISOString()
        },
        {
          nome: 'Admin Master',
          email: 'admin@obra.com',
          telefone: '(11) 91234-5678',
          perfil: 'administracao',
          ativo: true,
          criadoEm: new Date().toISOString(),
          ultimoLogin: new Date().toISOString()
        }
      ]);

      // Criar obra de exemplo
      const obraId = await db.obras.add({
        nome: 'Edifício Residencial Sunset',
        codigo: 'ED-SUNSET-001',
        descricao: 'Construção de edifício residencial com 15 andares',
        dataInicio: new Date('2024-01-15'),
        dataFim: new Date('2025-12-31'),
        status: 'em_andamento',
        responsavel: 'Cassio Silva'
      });

      // Criar cronograma de exemplo
      await db.cronogramas.bulkAdd([
        {
          obraId: obraId,
          atividade: 'Fundação',
          dataInicio: new Date('2024-01-15'),
          dataFim: new Date('2024-03-30'),
          status: 'concluido',
          dependencias: [],
          alertaDias: 7
        },
        {
          obraId: obraId,
          atividade: 'Estrutura - 1º ao 5º andar',
          dataInicio: new Date('2024-04-01'),
          dataFim: new Date('2024-08-31'),
          status: 'concluido',
          dependencias: ['Fundação'],
          alertaDias: 10
        },
        {
          obraId: obraId,
          atividade: 'Estrutura - 6º ao 10º andar',
          dataInicio: new Date('2024-09-01'),
          dataFim: new Date('2025-01-31'),
          status: 'em_andamento',
          dependencias: ['Estrutura - 1º ao 5º andar'],
          alertaDias: 10
        },
        {
          obraId: obraId,
          atividade: 'Alvenaria - 1º ao 5º andar',
          dataInicio: new Date('2024-10-01'),
          dataFim: new Date('2025-03-31'),
          status: 'planejado',
          dependencias: ['Estrutura - 1º ao 5º andar'],
          alertaDias: 15
        },
        {
          obraId: obraId,
          atividade: 'Instalações Elétricas',
          dataInicio: new Date('2025-02-01'),
          dataFim: new Date('2025-06-30'),
          status: 'planejado',
          dependencias: ['Alvenaria - 1º ao 5º andar'],
          alertaDias: 20
        },
        {
          obraId: obraId,
          atividade: 'Acabamentos',
          dataInicio: new Date('2025-07-01'),
          dataFim: new Date('2025-11-30'),
          status: 'planejado',
          dependencias: ['Instalações Elétricas'],
          alertaDias: 30
        }
      ]);

      // Criar fornecedores de exemplo
      await db.fornecedores.bulkAdd([
        {
          nomeFantasia: 'Cimento Forte Ltda',
          razaoSocial: 'Cimento Forte Materiais de Construção Ltda',
          cnpj: '12.345.678/0001-90',
          contato: 'João Silva',
          telefone: '(11) 99999-1111',
          email: 'vendas@cimentoforte.com.br',
          endereco: 'Rua das Obras, 123 - São Paulo/SP',
          ativo: true
        },
        {
          nomeFantasia: 'Ferro & Aço Distribuidora',
          razaoSocial: 'Ferro & Aço Distribuidora de Materiais Ltda',
          cnpj: '98.765.432/0001-10',
          contato: 'Maria Santos',
          telefone: '(11) 88888-2222',
          email: 'comercial@ferroaco.com.br',
          endereco: 'Av. Industrial, 456 - São Paulo/SP',
          ativo: true
        },
        {
          nomeFantasia: 'Elétrica Total',
          razaoSocial: 'Elétrica Total Materiais Elétricos Ltda',
          cnpj: '11.222.333/0001-44',
          contato: 'Carlos Oliveira',
          telefone: '(11) 77777-3333',
          email: 'vendas@eletricatotal.com.br',
          endereco: 'Rua dos Eletricistas, 789 - São Paulo/SP',
          ativo: true
        }
      ]);

      // Criar materiais de exemplo
      await db.materiais.bulkAdd([
        {
          nome: 'Cimento CP II-E-32',
          descricao: 'Cimento Portland composto com escória',
          unidadePadrao: 'saco 50kg',
          categoria: 'Cimento',
          fornecedorPadrao: 'Cimento Forte Ltda'
        },
        {
          nome: 'Vergalhão CA-50 12mm',
          descricao: 'Barra de aço nervurada para concreto armado',
          unidadePadrao: 'barra 12m',
          categoria: 'Ferro',
          fornecedorPadrao: 'Ferro & Aço Distribuidora'
        },
        {
          nome: 'Cabo Flexível 2,5mm²',
          descricao: 'Cabo elétrico flexível para instalações residenciais',
          unidadePadrao: 'metro',
          categoria: 'Elétrico',
          fornecedorPadrao: 'Elétrica Total'
        },
        {
          nome: 'Tijolo Cerâmico 6 furos',
          descricao: 'Tijolo cerâmico para alvenaria de vedação',
          unidadePadrao: 'milheiro',
          categoria: 'Alvenaria',
          fornecedorPadrao: 'Cimento Forte Ltda'
        }
      ]);

      // Criar pedidos de exemplo
      await db.pedidos.bulkAdd([
        {
          id: 1,
          nomeDaObra: 'Edifício Residencial Sunset',
          codigoDaObra: 'ED-SUNSET-001',
          solicitante: 'Cassio Silva',
          dataDosPedidos: '2025-09-08',
          status: 'em_cotacao',
          prioridade: 'alta',
          observacoes: 'Pedido urgente para início da fundação',
          criadoEm: new Date().toISOString()
        },
        {
          id: 2,
          nomeDaObra: 'Edifício Residencial Sunset',
          codigoDaObra: 'ED-SUNSET-001',
          solicitante: 'Cassio Silva',
          dataDosPedidos: '2025-09-10',
          status: 'aprovado',
          prioridade: 'media',
          observacoes: 'Materiais elétricos para 1º ao 5º andar',
          criadoEm: new Date().toISOString()
        },
        {
          id: 3,
          nomeDaObra: 'Edifício Residencial Sunset',
          codigoDaObra: 'ED-SUNSET-001',
          solicitante: 'Cassio Silva',
          dataDosPedidos: '2025-09-14',
          status: 'em_cotacao',
          prioridade: 'baixa',
          observacoes: 'Materiais para acabamento - não urgente',
          criadoEm: new Date().toISOString()
        }
      ]);

      // Criar cotações de exemplo
      await db.cotacoes.bulkAdd([
        {
          id: 1,
          pedidoId: 1,
          fornecedorId: 1,
          valorTotal: 15000.00,
          prazoDeEntrega: 15,
          dataDaCotacao: '2025-09-10',
          status: 'pendente',
          observacoes: 'Cotação para cimento e materiais básicos. Preço competitivo com desconto para pagamento à vista.',
          criadoEm: new Date().toISOString()
        },
        {
          id: 2,
          pedidoId: 1,
          fornecedorId: 2,
          valorTotal: 14500.00,
          prazoDeEntrega: 12,
          dataDaCotacao: '2025-09-11',
          status: 'pendente',
          observacoes: 'Melhor preço do mercado. Entrega expressa disponível.',
          criadoEm: new Date().toISOString()
        },
        {
          id: 3,
          pedidoId: 1,
          fornecedorId: 3,
          valorTotal: 16200.00,
          prazoDeEntrega: 20,
          dataDaCotacao: '2025-09-12',
          status: 'pendente',
          observacoes: 'Materiais de alta qualidade. Garantia estendida incluída.',
          criadoEm: new Date().toISOString()
        },
        {
          id: 4,
          pedidoId: 2,
          fornecedorId: 2,
          valorTotal: 8500.00,
          prazoDeEntrega: 10,
          dataDaCotacao: '2025-09-13',
          status: 'aprovada',
          observacoes: 'Cotação aprovada para materiais elétricos.',
          criadoEm: new Date().toISOString()
        },
        {
          id: 5,
          pedidoId: 2,
          fornecedorId: 3,
          valorTotal: 9200.00,
          prazoDeEntrega: 14,
          dataDaCotacao: '2025-09-13',
          status: 'rejeitada',
          observacoes: 'Preço acima do orçamento.',
          criadoEm: new Date().toISOString()
        }
      ]);

      console.log('Banco de dados inicializado com dados de exemplo');
    }
  } catch (error) {
    console.error('Erro ao inicializar banco de dados:', error);
  }
}

// Status possíveis
export const STATUS_OBRA = {
  PLANEJADA: 'planejada',
  EM_ANDAMENTO: 'em_andamento',
  PAUSADA: 'pausada',
  CONCLUIDA: 'concluida',
  CANCELADA: 'cancelada'
};

export const STATUS_CRONOGRAMA = {
  PLANEJADO: 'planejado',
  EM_ANDAMENTO: 'em_andamento',
  CONCLUIDO: 'concluido',
  ATRASADO: 'atrasado',
  CANCELADO: 'cancelado'
};

export const STATUS_PEDIDO = {
  PENDENTE: 'pendente',
  EM_COTACAO: 'em_cotacao',
  AGUARDANDO_APROVACAO: 'aguardando_aprovacao',
  APROVADO: 'aprovado',
  REJEITADO: 'rejeitado',
  COMPRADO: 'comprado',
  ENTREGUE: 'entregue',
  CONCLUIDO: 'concluido'
};

export const STATUS_ENTREGA = {
  AGENDADA: 'agendada',
  RECEBIDA_OK: 'recebida_ok',
  RECEBIDA_DIVERGENCIA: 'recebida_divergencia',
  CANCELADA: 'cancelada'
};

export const STATUS_PAGAMENTO = {
  PENDENTE: 'pendente',
  PAGO: 'pago',
  VENCIDO: 'vencido'
};

export const PERFIS_USUARIO = {
  SOLICITANTE: 'solicitante',
  COMPRADOR: 'comprador',
  EXECUCAO: 'execucao',
  PAGAMENTO: 'pagamento'
};

