# 📁 Estrutura do Projeto - Lista de Compras v2.0

```
lista-de-compras/
│
├── 📄 index.html                    # Página de redirecionamento
├── 🏠 home.html                     # Dashboard principal
│
├── 📂 pages/                        # Páginas da aplicação
│   ├── 🏷️  categorias.html         # Gerenciar categorias
│   ├── 📝 itens.html                # Gerenciar itens
│   ├── 📊 estatisticas.html         # Gráficos e análises
│   └── ⚙️  configuracoes.html       # Configurações
│
├── 📂 css/                          # Estilos modulares
│   ├── 🌐 global.css                # Variáveis, reset, tema, utilitários
│   ├── 🧭 navbar.css                # Estilos da navegação
│   └── 🧩 components.css            # Componentes reutilizáveis
│
├── 📂 js/                           # Scripts modulares
│   └── 🛠️  utils.js                 # Funções utilitárias
│
├── 📂 components/                   # Componentes HTML
│   └── 🧭 navbar.html               # Estrutura da navbar
│
├── 🔧 firebase-config.js            # Configuração Firebase
├── 👷 sw.js                         # Service Worker (PWA)
├── 📱 manifest.json                 # Manifest PWA
├── 🔄 polyfills.js                  # Compatibilidade
│
├── 📄 style.css                     # CSS legado (compatibilidade)
├── 📄 script.js                     # JS legado (compatibilidade)
│
├── 📚 README.md                     # Documentação original
├── 📚 README-v2.md                  # Documentação atualizada
├── 📋 MELHORIAS-V2.md               # Detalhamento das melhorias
├── 🚀 GUIA-INICIO-V2.md             # Guia rápido de início
├── 📁 ESTRUTURA-V2.md               # Este arquivo
│
└── 🖼️  icon-*.png                   # Ícones PWA (se existirem)
```

---

## 🗺️ Mapa de Navegação

```
┌─────────────────────────────────────────┐
│          🧭 NAVBAR GLOBAL               │
│  Home | Categorias | Itens | Stats | ⚙️  │
└─────────────────────────────────────────┘
             ↓           ↓           ↓
    ┌────────┴───────────┴───────────┴────────┐
    │                                          │
    ↓                ↓                         ↓
┌─────────┐    ┌──────────┐           ┌─────────┐
│  HOME   │    │CATEGORIAS│           │  ITENS  │
│         │    │          │           │         │
│ Stats   │    │ Criar    │           │ Buscar  │
│ Rápidos │    │ Editar   │           │ Filtrar │
│ Ações   │    │ Orçamento│           │ Marcar  │
│ Recentes│    │          │           │         │
└─────────┘    └──────────┘           └─────────┘
    │                │                      │
    └────────────────┼──────────────────────┘
                     ↓
         ┌───────────────────────┐
         │    ESTATÍSTICAS       │
         │                       │
         │  📊 Gráfico Pizza     │
         │  📊 Gráfico Barras    │
         │  🏆 Ranking           │
         │  💰 Orçamentos        │
         └───────────────────────┘
                     ↓
         ┌───────────────────────┐
         │   CONFIGURAÇÕES       │
         │                       │
         │  🎨 Tema              │
         │  📥 Exportar          │
         │  🗑️  Limpar           │
         │  ℹ️  Sobre            │
         └───────────────────────┘
```

---

## 🎨 Hierarquia de CSS

```
css/
├── global.css          ← Carregado em TODAS as páginas
│   ├── :root (variáveis CSS)
│   ├── Reset CSS
│   ├── Body & Container
│   ├── Animações
│   ├── Tema Escuro
│   ├── Utilitários
│   └── Toast/Loading
│
├── navbar.css          ← Carregado em TODAS as páginas
│   ├── .main-nav
│   ├── .nav-container
│   ├── .nav-brand
│   ├── .nav-menu
│   ├── .nav-link
│   └── @media queries
│
└── components.css      ← Carregado em TODAS as páginas
    ├── Cards
    ├── Botões
    ├── Inputs/Forms
    ├── Modais
    ├── Grid System
    ├── Stats Cards
    ├── Badges
    ├── Progress Bars
    └── @media queries
```

### Ordem de Carregamento

```html
<link rel="stylesheet" href="css/global.css" />
<!-- 1º -->
<link rel="stylesheet" href="css/navbar.css" />
<!-- 2º -->
<link rel="stylesheet" href="css/components.css" />
<!-- 3º -->
```

---

## 🧩 Componentes Reutilizáveis

### Cards

```css
.card                    /* Container padrão */
.card-header            /* Cabeçalho com título */
.card-body              /* Corpo do conteúdo */
```

### Botões

```css
.btn                    /* Base */
.btn-primary            /* Ação principal (verde) */
.btn-secondary          /* Ação secundária (azul) */
.btn-danger             /* Ação destrutiva (vermelho) */
.btn-warning            /* Atenção (amarelo) */
.btn-outline            /* Contorno apenas */
.btn-icon               /* Botão circular */
```

### Grid

```css
.grid                   /* Container grid */
.grid-2                 /* 2 colunas responsivas */
.grid-3                 /* 3 colunas responsivas */
.grid-4                 /* 4 colunas responsivas */
```

### Stats

```css
.stats-grid             /* Grid de estatísticas */
.stat-card              /* Card estatístico */
.stat-card-icon         /* Ícone do stat */
.stat-card-label        /* Label do stat */
.stat-card-value        /* Valor do stat */
```

### Modais

```css
.modal                  /* Overlay */
.modal-content          /* Conteúdo */
.modal-large            /* Versão maior */
.modal-actions          /* Botões de ação */
```

---

## 🛠️ Funções JavaScript Globais

### Formatação

```javascript
formatarReal(valor); // R$ 123,45
formatarData(data); // 01/02/2026 15:30
```

### Validação

```javascript
validateInput(input, tipo); // true/false
sanitizeInput(input); // String limpa
```

### UI

```javascript
mostrarToast(msg, tipo); // Notificação
confirmarAcao(msg); // Confirmação
```

### Tema

```javascript
inicializarTema(); // Aplica tema salvo
toggleTema(); // Alterna tema
aplicarTema(isDark); // Aplica tema específico
```

### Dados

```javascript
ordenarArray(arr, campo); // Array ordenado
filtrarArray(arr, busca); // Array filtrado
calcularTotal(arr, campo); // Soma total
agruparPorCategoria(itens); // Agrupamento
```

### Navegação

```javascript
inicializarNavbar(); // Cria navbar dinâmica
```

### Storage

```javascript
salvarLocalStorage(k, v); // Salva
obterLocalStorage(k, pad); // Busca
limparLocalStorage(); // Limpa
```

---

## 🔄 Fluxo de Dados

```
┌──────────────┐
│   FIREBASE   │  ← Banco de dados em tempo real
│  (Firestore) │
└──────┬───────┘
       │
       │ onSnapshot() / realtime listeners
       │
       ↓
┌──────────────────────────────────────┐
│      APLICAÇÃO (JavaScript)          │
│                                      │
│  ┌────────────┐    ┌──────────────┐ │
│  │ categorias │    │    itens     │ │
│  │   array    │    │    array     │ │
│  └────────────┘    └──────────────┘ │
│         │                  │         │
│         └──────────┬───────┘         │
│                    │                 │
│                    ↓                 │
│         ┌──────────────────┐        │
│         │   renderizar()   │        │
│         └──────────────────┘        │
└──────────────────┬───────────────────┘
                   │
                   ↓
┌──────────────────────────────────────┐
│              DOM (HTML)              │
│                                      │
│  • Cards de categorias               │
│  • Lista de itens                    │
│  • Gráficos (Chart.js)               │
│  • Estatísticas                      │
└──────────────────────────────────────┘
```

---

## 📦 Dependências Externas

```javascript
// CDN Libraries
Font Awesome 6.4.0    // Ícones
Chart.js 4.4.0        // Gráficos
jsPDF 2.5.1           // Geração de PDF
Firebase 9.22.0       // Backend

// Firebase Modules
firebase-app-compat.js
firebase-firestore-compat.js
```

---

## 🎯 Arquivos por Página

### home.html

```
Carrega:
  ├── css/global.css
  ├── css/navbar.css
  ├── css/components.css
  ├── js/utils.js
  ├── firebase-config.js
  └── Font Awesome
```

### pages/categorias.html

```
Carrega:
  ├── ../css/global.css
  ├── ../css/navbar.css
  ├── ../css/components.css
  ├── ../js/utils.js
  ├── ../firebase-config.js
  └── Font Awesome
```

### pages/itens.html

```
Carrega:
  ├── ../css/global.css
  ├── ../css/navbar.css
  ├── ../css/components.css
  ├── ../js/utils.js
  ├── ../firebase-config.js
  └── Font Awesome
```

### pages/estatisticas.html

```
Carrega:
  ├── ../css/global.css
  ├── ../css/navbar.css
  ├── ../css/components.css
  ├── ../js/utils.js
  ├── ../firebase-config.js
  ├── Font Awesome
  └── Chart.js
```

### pages/configuracoes.html

```
Carrega:
  ├── ../css/global.css
  ├── ../css/navbar.css
  ├── ../css/components.css
  ├── ../js/utils.js
  ├── ../firebase-config.js
  ├── Font Awesome
  └── jsPDF
```

---

## 🔐 Coleções Firebase

```
firestore/
├── categorias/
│   └── {documentId}
│       ├── nome: string
│       ├── orcamento: number
│       └── dataCriacao: string (ISO)
│
└── itens/
    └── {documentId}
        ├── nome: string
        ├── categoriaId: string (ref)
        ├── valor: number
        ├── quantidade: number
        ├── comprado: boolean
        └── dataCriacao: string (ISO)
```

---

## 📱 PWA Assets

```
Service Worker (sw.js):
  Cache Name: "lista-compras-v2"

  URLs em Cache:
    • Todas as páginas HTML
    • Todos os CSS
    • Todos os JS
    • Bibliotecas CDN

Manifest (manifest.json):
  • Nome do app
  • Ícones (192x192, 512x512)
  • Cor do tema
  • Display mode
  • Orientação
```

---

## 🎨 Paleta de Cores

```css
:root {
  /* Cores Primárias */
  --primary-color: #10b981 🟢 --primary-hover: #059669 --primary-light: #d1fae5
    --secondary-color: #3b82f6 🔵 --secondary-hover: #2563eb
    --danger-color: #ef4444 🔴 --danger-hover: #dc2626 --warning-color: #f59e0b
    🟡 --warning-hover: #f97316 --success-color: #22c55e 🟢 /* Neutras */
    --light-color: #f9fafb --dark-color: #1f2937 --gray-color: #e5e7eb
    --gray-dark: #9ca3af --gray-darker: #6b7280;
}
```

---

## ✨ Resumo Visual

```
┌─────────────────────────────────────────────────┐
│              🛒 LISTA DE COMPRAS                │
│                  Versão 2.0                     │
└─────────────────────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
    ┌───▼───┐      ┌───▼───┐      ┌───▼────┐
    │  CSS  │      │  HTML │      │   JS   │
    │       │      │       │      │        │
    │ Global│      │  5x   │      │ Utils  │
    │Navbar │      │Páginas│      │Firebase│
    │Comps  │      │       │      │        │
    └───────┘      └───────┘      └────────┘
        │               │               │
        └───────────────┼───────────────┘
                        │
        ┌───────────────┴───────────────┐
        │                               │
    ┌───▼────┐                     ┌───▼────┐
    │Firebase│                     │  PWA   │
    │        │                     │        │
    │Realtime│                     │ Offline│
    │  Sync  │                     │ Support│
    └────────┘                     └────────┘
```

---

## 🎓 Convenções de Código

### Nomenclatura CSS

```css
.nome-composto          /* kebab-case */
.componenteDescricao    /* camelCase raro */
```

### Nomenclatura JS

```javascript
nomeVariavel; // camelCase
NomeClasse; // PascalCase
NOME_CONSTANTE; // UPPER_CASE
nome_funcao(); // snake_case raro
```

### IDs HTML

```html
<div id="nomeDoElemento"><!-- camelCase --></div>
```

---

Esta estrutura garante:
✅ Organização clara
✅ Fácil manutenção
✅ Escalabilidade
✅ Performance otimizada
✅ Código limpo e profissional
