# 🛒 Lista de Compras Inteligente v2.0

Uma aplicação web moderna e completa para gerenciar suas compras mensais, com controle de gastos, gráficos, múltiplas páginas e muito mais!

## 🎯 Novidades da Versão 2.0

### 📄 Arquitetura Multi-Página

- **5 páginas separadas** para melhor organização e navegação
- Sistema de navegação global com menu responsivo
- Estrutura modular de CSS e JavaScript
- Melhor performance com carregamento otimizado

### 🏠 Páginas do Aplicativo

#### 1. **Home (Dashboard)**

- Visão geral com estatísticas resumidas
- Ações rápidas para funcionalidades principais
- Cards informativos sobre categorias e itens recentes
- Acesso direto a todas as seções

#### 2. **Categorias**

- Gerenciamento completo de categorias
- Criação, edição e exclusão
- Definição de orçamento por categoria
- Visualização de gastos e progresso
- Indicadores visuais de status do orçamento

#### 3. **Itens**

- Gerenciamento detalhado de itens
- Busca em tempo real
- Filtros por categoria
- Ordenação múltipla (nome, preço)
- Marcação de itens comprados
- Cálculo automático de subtotais
- Limpeza rápida de itens comprados

#### 4. **Estatísticas**

- Gráficos interativos (pizza e barras)
- Ranking de gastos por categoria
- Status de orçamento detalhado
- Análise visual de gastos
- Comparativos entre categorias

#### 5. **Configurações**

- Alternar tema claro/escuro
- Exportar dados em PDF
- Backup em formato JSON
- Limpar itens comprados
- Gerenciamento completo de dados
- Informações sobre o aplicativo

## ✨ Funcionalidades Completas

### 📋 Gestão de Dados

- ✅ Criar, editar e excluir categorias
- ✅ Adicionar, editar e excluir itens
- ✅ Organização por categorias
- ✅ Sistema de quantidade e valores
- ✅ Cálculos automáticos de subtotais

### 🔍 Busca e Filtros

- ✅ Busca em tempo real por nome
- ✅ Filtro por categoria
- ✅ Ordenação: alfabética (A-Z, Z-A), por preço (menor/maior)
- ✅ Interface responsiva e intuitiva

### ✓ Sistema de Compras

- ✅ Marcar/desmarcar itens como comprados
- ✅ Visual diferenciado para itens comprados
- ✅ Limpar todos os itens comprados
- ✅ Contador de itens comprados

### 📊 Estatísticas e Gráficos

- ✅ Gráfico de pizza (gastos por categoria)
- ✅ Gráfico de barras comparativo
- ✅ Ranking de categorias por gasto
- ✅ Análise de orçamento em tempo real
- ✅ Cores diferenciadas por status

### 💰 Controle de Orçamento

- ✅ Definir orçamento por categoria
- ✅ Barra de progresso visual
- ✅ Alertas coloridos:
  - 🟢 Verde: até 79% do orçamento
  - 🟡 Amarelo: 80-99% do orçamento
  - 🔴 Vermelho: 100%+ do orçamento
- ✅ Cálculo de saldo disponível

### 📥 Exportação

- ✅ Exportar relatório completo em PDF
- ✅ Backup de dados em JSON
- ✅ Relatório detalhado por categoria
- ✅ Informações de data e valores

### 🎨 Tema e Aparência

- ✅ Modo claro e escuro
- ✅ Troca de tema em tempo real
- ✅ Design moderno e responsivo
- ✅ Animações suaves
- ✅ Ícones Font Awesome

### 🔄 Sincronização

- ✅ Sincronização em tempo real com Firebase
- ✅ Dados atualizados instantaneamente
- ✅ Suporte offline com PWA
- ✅ Cache inteligente

## 🏗️ Estrutura do Projeto

```
lista-de-compras/
├── index.html              # Redireciona para home.html
├── home.html               # Página principal (Dashboard)
├── pages/
│   ├── categorias.html     # Gerenciamento de categorias
│   ├── itens.html          # Gerenciamento de itens
│   ├── estatisticas.html   # Gráficos e análises
│   └── configuracoes.html  # Configurações do app
├── css/
│   ├── global.css          # Estilos globais e variáveis
│   ├── navbar.css          # Estilos da navegação
│   └── components.css      # Componentes reutilizáveis
├── js/
│   └── utils.js            # Funções utilitárias
├── components/
│   └── navbar.html         # Componente de navegação
├── style.css               # CSS legado (compatibilidade)
├── script.js               # JS legado (compatibilidade)
├── firebase-config.js      # Configuração do Firebase
├── polyfills.js            # Suporte para navegadores antigos
├── sw.js                   # Service Worker (PWA)
├── manifest.json           # Manifest do PWA
└── README.md               # Documentação
```

## 🚀 Tecnologias Utilizadas

- **HTML5** - Estrutura semântica
- **CSS3** - Estilos modernos com variáveis CSS
- **JavaScript (ES6+)** - Lógica da aplicação
- **Firebase** - Banco de dados em tempo real
- **Chart.js** - Gráficos interativos
- **jsPDF** - Geração de PDFs
- **Font Awesome** - Ícones
- **PWA** - Progressive Web App

## 📱 Recursos PWA

- ✅ Instalável em dispositivos móveis e desktop
- ✅ Funciona offline (cache inteligente)
- ✅ Ícone na tela inicial
- ✅ Experiência de app nativo
- ✅ Atualizações automáticas

## 🎯 Melhorias de Performance

- **Código modularizado** - Melhor manutenção e organização
- **CSS separado** - Carregamento otimizado
- **Lazy loading** - Carregamento sob demanda
- **Cache inteligente** - Service Worker atualizado
- **Debounce em buscas** - Reduz requisições
- **Validação de inputs** - Previne erros

## 🔐 Segurança

- ✅ Sanitização de inputs (previne XSS)
- ✅ Validação de dados
- ✅ Tratamento de erros robusto
- ✅ Confirmações para ações destrutivas

## 📱 Responsividade

- ✅ Layout adaptativo para mobile, tablet e desktop
- ✅ Menu hambúrguer em telas pequenas
- ✅ Grids flexíveis
- ✅ Botões e textos otimizados para touch
- ✅ Imagens e cards responsivos

## 🎨 Design System

### Cores Principais

- **Primary**: `#10b981` (Verde)
- **Secondary**: `#3b82f6` (Azul)
- **Danger**: `#ef4444` (Vermelho)
- **Warning**: `#f59e0b` (Amarelo)
- **Success**: `#22c55e` (Verde claro)

### Componentes

- Cards
- Botões (primary, secondary, danger, warning)
- Modais
- Formulários
- Badges
- Barras de progresso
- Estatísticas
- Gráficos

## 🔄 Como Usar

### 1. Configuração Inicial

1. Clone ou baixe o projeto
2. Configure o Firebase em `firebase-config.js`
3. Abra `home.html` em um navegador

### 2. Navegação

- Use o menu superior para navegar entre páginas
- Em mobile, clique no ícone de menu (☰)

### 3. Criar Categorias

1. Acesse **Categorias**
2. Digite o nome da categoria
3. Opcionalmente, defina um orçamento
4. Clique em **Adicionar**

### 4. Adicionar Itens

1. Acesse **Itens**
2. Preencha nome, categoria, quantidade e valor
3. Clique em **Adicionar**

### 5. Ver Estatísticas

1. Acesse **Estatísticas**
2. Visualize gráficos e ranking
3. Acompanhe o status do orçamento

### 6. Exportar Dados

1. Acesse **Configurações**
2. Escolha **Exportar PDF** ou **Exportar JSON**
3. Baixe o arquivo gerado

## 🆕 Próximas Funcionalidades (Roadmap)

- [ ] Modo de compartilhamento (lista colaborativa)
- [ ] Histórico de compras
- [ ] Sugestões baseadas em IA
- [ ] Comparação de preços
- [ ] Lista de favoritos
- [ ] Notificações personalizadas
- [ ] Integração com supermercados
- [ ] App mobile nativo

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para:

- Reportar bugs
- Sugerir novas funcionalidades
- Melhorar a documentação
- Enviar pull requests

## 📄 Licença

Este projeto está sob licença MIT.

## 👨‍💻 Autor

Desenvolvido com 💚 por [Seu Nome]

## 📞 Suporte

Encontrou algum problema? Abra uma issue ou entre em contato.

---

**Lista de Compras v2.0** - Organize suas compras de forma inteligente! 🛒✨
