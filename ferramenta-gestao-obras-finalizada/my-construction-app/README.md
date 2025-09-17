# Ferramenta de Gestão de Obras para Celular com Alertas

## Descrição

Sistema completo de gestão de obras e compras desenvolvido em React, otimizado para uso em dispositivos móveis. A aplicação oferece controle total sobre obras, materiais, fornecedores, cotações e cronogramas, com sistema de alertas integrado.

## Funcionalidades Implementadas

### ✅ Sistema de Autenticação
- Login baseado em email
- Controle de permissões por perfil de usuário
- Persistência de sessão
- Usuários de demonstração pré-configurados

### ✅ Dashboard Interativo
- Visão geral do sistema
- Estatísticas em tempo real
- Acesso rápido às principais funcionalidades
- Alertas e notificações

### ✅ Gestão de Obras
- Cadastro e edição de obras
- Acompanhamento de status
- Filtros e busca avançada
- Informações detalhadas de cada projeto

### ✅ Catálogo de Materiais
- Cadastro completo de materiais
- Organização por categorias
- Controle de fornecedores padrão
- Unidades de medida padronizadas

### ✅ Gestão de Fornecedores
- Cadastro de fornecedores
- Informações de contato completas
- Status ativo/inativo
- Histórico de relacionamento

### ✅ Sistema de Cotações
- Criação e gestão de cotações
- Comparação automática de preços
- Alertas para pedidos com poucas cotações
- Aprovação/rejeição de cotações
- Controle de status e prazos

### ✅ Cronograma de Obras
- Gestão de atividades por obra
- Controle de dependências entre atividades
- Sistema de alertas por prazo
- Acompanhamento de progresso
- Status detalhado (planejado, em andamento, concluído, atrasado)

### ✅ Interface Responsiva
- Otimizada para dispositivos móveis
- Menu lateral adaptativo
- Design limpo e intuitivo
- Navegação simplificada

## Perfis de Usuário

### Solicitante
- Acesso a obras, materiais e cronograma
- Criação de pedidos
- Visualização de cotações

### Comprador
- Todas as funcionalidades do solicitante
- Gestão de fornecedores
- Aprovação de cotações
- Controle de entregas e pagamentos

### Execução
- Foco em cronograma e obras
- Acompanhamento de atividades
- Controle de entregas

### Pagamento
- Gestão financeira
- Controle de pagamentos
- Relatórios financeiros

### Administração
- Acesso total ao sistema
- Gestão de usuários
- Configurações gerais

## Usuários de Demonstração

| Nome | Email | Perfil | Senha |
|------|-------|--------|-------|
| Cassio Silva | cassio@obra.com | Solicitante | 123456 |
| Rafael Compras | rafael@obra.com | Comprador | 123456 |
| João Execução | joao@obra.com | Execução | 123456 |
| Graci Pagamentos | graci@obra.com | Pagamento | 123456 |
| Admin Master | admin@obra.com | Administração | 123456 |

## Instalação e Execução

### Pré-requisitos
- Node.js 16+ 
- npm ou yarn

### Instalação
```bash
# Clonar ou extrair o projeto
cd my-construction-app

# Instalar dependências
npm install

# Executar em modo desenvolvimento
npm start

# Acessar em http://localhost:3000
```

### Build para Produção
```bash
# Criar build otimizado
npm run build

# Servir arquivos estáticos
npm install -g serve
serve -s build
```

## Estrutura do Projeto

```
src/
├── components/
│   └── ui/           # Componentes de interface
├── lib/
│   └── utils.js      # Utilitários
├── App.jsx           # Componente principal
├── AuthContext.jsx   # Contexto de autenticação
├── database.js       # Configuração do banco IndexedDB
├── Dashboard.jsx     # Painel principal
├── Layout.jsx        # Layout da aplicação
├── Login.jsx         # Tela de login
├── ProtectedRoute.jsx # Proteção de rotas
├── ObrasList.jsx     # Gestão de obras
├── MateriaisList.jsx # Catálogo de materiais
├── FornecedoresList.jsx # Gestão de fornecedores
├── CotacoesList.jsx  # Sistema de cotações
├── CronogramaView.jsx # Cronograma de obras
├── UsuariosList.jsx  # Gestão de usuários
├── index.css         # Estilos globais
└── App.css          # Estilos da aplicação
```

## Tecnologias Utilizadas

- **React 18** - Framework principal
- **React Router** - Roteamento
- **IndexedDB + Dexie.js** - Banco de dados local
- **Lucide React** - Ícones
- **CSS3** - Estilização responsiva

## Banco de Dados

A aplicação utiliza IndexedDB para armazenamento local, garantindo:
- Funcionamento offline
- Dados persistentes no navegador
- Performance otimizada
- Sincronização automática

### Tabelas Principais
- usuarios
- obras
- cronogramas
- materiais
- fornecedores
- cotacoes
- pedidos
- entregas
- alertas

## Funcionalidades Avançadas

### Sistema de Alertas
- Alertas de cronograma por prazo
- Notificações de cotações pendentes
- Avisos de pedidos com poucas cotações
- Alertas de atividades atrasadas

### Responsividade Mobile
- Interface adaptada para smartphones
- Menu lateral retrátil
- Navegação otimizada para toque
- Formulários mobile-friendly

### Controle de Permissões
- Acesso baseado em perfil de usuário
- Rotas protegidas
- Funcionalidades condicionais
- Segurança de dados

## Implantação

### Opções de Deploy
1. **Servidor Web Estático** - Hospedar pasta `build/`
2. **Netlify/Vercel** - Deploy automático
3. **GitHub Pages** - Hospedagem gratuita
4. **Servidor próprio** - Apache/Nginx

### Configurações Recomendadas
- HTTPS obrigatório para PWA
- Compressão gzip habilitada
- Cache de arquivos estáticos
- Backup regular dos dados

## Suporte e Manutenção

### Logs e Debugging
- Console do navegador para erros
- DevTools para análise de performance
- IndexedDB inspector para dados

### Atualizações
- Versioning semântico
- Backup antes de atualizações
- Testes em ambiente de desenvolvimento

## Licença

Projeto desenvolvido para uso interno. Todos os direitos reservados.

## Contato

Para suporte técnico ou dúvidas sobre a implementação, entre em contato com a equipe de desenvolvimento.
