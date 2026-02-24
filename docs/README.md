# 🛒 Lista de Compras Inteligente

Uma aplicação web moderna e completa para gerenciar suas compras mensais, com controle de gastos, gráficos e muito mais!

## ✨ Funcionalidades Implementadas

### 📋 Gestão Básica

- ✅ **Criar, editar e excluir categorias**
- ✅ **Adicionar, editar e excluir itens**
- ✅ **Organização por categorias**
- ✅ **Valores e cálculos automáticos**

### 🔍 Busca e Filtros

- ✅ **Busca em tempo real** por nome de item
- ✅ **Ordenação múltipla**: alfabética (A-Z, Z-A), por preço (menor/maior)
- ✅ **Filtros inteligentes** para encontrar itens rapidamente

### ✓ Sistema de Comprados

- ✅ **Marcar itens como comprados** com checkbox
- ✅ **Visual diferenciado** para itens comprados (riscado, opacidade)
- ✅ **Limpar todos comprados** com um clique
- ✅ **Contador de itens comprados** no resumo

### 🔢 Sistema de Quantidade

- ✅ **Campo de quantidade** para cada item
- ✅ **Cálculo automático**: quantidade × valor = subtotal
- ✅ **Edição fácil** de quantidade e valor
- ✅ **Visualização do subtotal** no modal de edição

### 📊 Gráficos e Estatísticas

- ✅ **Gráfico de pizza** mostrando gastos por categoria
- ✅ **Gráfico de barras** comparativo entre categorias
- ✅ **Modal dedicado** para visualização de análises
- ✅ **Cores diferenciadas** por categoria

### 💰 Sistema de Orçamento

- ✅ **Definir orçamento** para cada categoria
- ✅ **Barra de progresso** visual mostrando % usado
- ✅ **Alertas de cores**:
  - Verde: até 79% do orçamento
  - Amarelo: 80-99% do orçamento
  - Vermelho: 100%+ do orçamento
- ✅ **Controle de gastos** em tempo real

### 📄 Exportação

- ✅ **Exportar para PDF** com formatação profissional
- ✅ **Inclui todas categorias e itens**
- ✅ **Totais e subtotais** calculados
- ✅ **Status de comprados** marcado

### ⚡ Sincronização em Tempo Real

- ✅ **Firebase Realtime Updates** com onSnapshot
- ✅ **Múltiplos dispositivos** sincronizados automaticamente
- ✅ **Atualização instantânea** sem refresh
- ✅ **Sem necessidade de recarregar** a página

### 📱 PWA e Modo Offline

- ✅ **Progressive Web App** completo
- ✅ **Instalável** no celular e desktop
- ✅ **Service Worker** para cache
- ✅ **Funciona offline** (dados em cache)
- ✅ **Ícones personalizados** 192px e 512px

### 🎨 Temas

- ✅ **Modo escuro/claro** toggle
- ✅ **Persistência** do tema escolhido
- ✅ **Transições suaves** entre temas
- ✅ **Ícone dinâmico** (sol/lua)
- ✅ **Design adaptado** para cada modo

### 🔔 Notificações

- ✅ **Toast notifications** para feedback
- ✅ **Tipos diferentes**: sucesso, erro, aviso
- ✅ **Animações suaves** de entrada/saída
- ✅ **Auto-dismiss** após 3 segundos

### 📱 Design Responsivo

- ✅ **Mobile-first** approach
- ✅ **Layout adaptativo** (mobile, tablet, desktop)
- ✅ **Touch-friendly** para dispositivos móveis
- ✅ **Breakpoints otimizados**
- ✅ **Grid flexível** que se adapta

### 🎯 UX/UI Melhorada

- ✅ **Animações suaves** e fluidas
- ✅ **Feedback visual** em todas ações
- ✅ **Estados de hover** bem definidos
- ✅ **Gradientes modernos** e sombras
- ✅ **Ícones intuitivos** em todos botões
- ✅ **Scrollbar personalizada**
- ✅ **Empty states** informativos

### ♿ Acessibilidade

- ✅ **Aria labels** em todos elementos interativos
- ✅ **Navegação por teclado** completa
- ✅ **Focus visible** para navegação
- ✅ **Contraste adequado** de cores
- ✅ **Semântica HTML** correta

## 🚀 Tecnologias Utilizadas

- **HTML5** - Estrutura semântica
- **CSS3** - Estilos modernos com gradientes e animações
- **JavaScript ES6+** - Lógica da aplicação
- **Firebase Firestore** - Banco de dados em tempo real
- **Chart.js** - Gráficos interativos
- **jsPDF** - Geração de PDFs
- **Font Awesome** - Ícones
- **Service Workers** - PWA e cache offline

## 📦 Estrutura do Projeto

```
lista-de-compras/
├── index.html          # Página principal
├── style.css           # Estilos completos
├── script.js           # Lógica da aplicação
├── firebase-config.js  # Configuração Firebase
├── sw.js              # Service Worker (PWA)
├── manifest.json      # Manifest PWA
├── icon-192.png       # Ícone PWA 192x192
├── icon-512.png       # Ícone PWA 512x512
└── README.md          # Esta documentação
```

## 🎯 Como Usar

### Instalação Básica

1. Clone ou baixe o repositório
2. Configure o Firebase:
   - Crie um projeto no Firebase Console
   - Ative o Firestore Database
   - Configure as regras de segurança
   - Atualize as credenciais em `firebase-config.js`

### Configurar Regras do Firestore

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /categorias/{categoria} {
      allow read, write: if true; // Para desenvolvimento
    }
    match /itens/{item} {
      allow read, write: if true; // Para desenvolvimento
    }
  }
}
```

### Hospedar

Você pode hospedar gratuitamente em:

- **Firebase Hosting** (recomendado)
- **Netlify**
- **Vercel**
- **GitHub Pages**

### Usar como PWA

1. Abra a aplicação no navegador
2. No menu do navegador, clique em "Instalar"
3. O app será instalado como aplicativo nativo
4. Use offline após o primeiro carregamento

## 💡 Funcionalidades em Destaque

### Editar Categorias

1. Passe o mouse sobre uma categoria
2. Clique no ícone de lápis
3. Edite o nome e defina um orçamento
4. Salve as alterações

### Sistema de Orçamento

- Defina quanto quer gastar em cada categoria
- Veja em tempo real quanto já gastou
- Cores indicam se está perto do limite

### Marcar Comprados

- Clique no checkbox ao lado do item
- Item fica riscado e transparente
- Use "Limpar comprados" para remover todos de uma vez

### Visualizar Gráficos

1. Clique no botão "Gráficos" no resumo
2. Veja gráfico de pizza (distribuição)
3. Veja gráfico de barras (comparação)

### Exportar PDF

1. Organize sua lista
2. Clique no botão "PDF"
3. PDF será baixado automaticamente
4. Inclui todas categorias, itens e totais

### Modo Escuro

- Clique no ícone de lua/sol no resumo
- Tema é salvo automaticamente
- Persiste entre sessões

## 🔧 Customização

### Cores

Edite as variáveis CSS em `style.css`:

```css
:root {
  --primary-color: #10b981;
  --secondary-color: #3b82f6;
  --danger-color: #ef4444;
  /* ... */
}
```

### Firebase

Atualize suas credenciais em `firebase-config.js`:

```javascript
const firebaseConfig = {
  apiKey: "sua-api-key",
  authDomain: "seu-projeto.firebaseapp.com",
  // ...
};
```

## 🚀 Melhorias Adicionais Implementadas

### 🔧 Performance e Otimização
- ✅ **Debouncing** em inputs de busca e valores
- ✅ **Lazy loading** de componentes pesados  
- ✅ **CSS otimizado** com variáveis reutilizáveis
- ✅ **Bundle size reduzido** e carregamento mais rápido

### 🛡️ Segurança e Validação
- ✅ **Sanitização de inputs** contra XSS
- ✅ **Validação robusta** de formulários
- ✅ **Tratamento de erros** específico do Firebase
- ✅ **Verificação de dados** antes de processar

### 📱 Compatibilidade Cross-Browser
- ✅ **Polyfills** para IE11 e navegadores antigos
- ✅ **Fallbacks CSS** para funcionalidades modernas
- ✅ **Suporte Safari** otimizado
- ✅ **Meta tags compatibilidade** para renderização

### ♿ Acessibilidade Aprimorada
- ✅ **Formulários semânticos** com validação HTML5
- ✅ **ARIA labels** em todos elementos interativos
- ✅ **Navegação por teclado** completa
- ✅ **Contraste adequado** e leitores de tela

### 🎨 Design System
- ✅ **Design tokens** centralizados em CSS
- ✅ **Breakpoints** padronizados
- ✅ **Componentes reutilizáveis** e consistentes
- ✅ **Transições suaves** e micro-interações

### 📱 Mobile-First Aprimorado
- ✅ **Touch targets** otimizados (44px mínimo)
- ✅ **Responsive design** aprimorado
- ✅ **Performance mobile** otimizada
- ✅ **Gestos táteis** suportados

### 🔄 Melhorias de Código
- ✅ **Código modular** e manutenível
- ✅ **Documentação** das funções principais
- ✅ **Error boundaries** e tratamento robusto
- ✅ **Code splitting** eficiente

## 📊 Resumo Completo de Funcionalidades

| Categoria                | Funcionalidades                           | Status |
| ------------------------ | ---------------------------------------- | ------ |
| Gestão Básica           | Categorias, Itens, CRUD completo         | ✅     |
| Busca & Filtros         | Busca, Ordenação múltipla                | ✅     |
| Comprados               | Checkbox, Visual, Limpar                 | ✅     |
| Quantidade              | Campo quantidade, Subtotais              | ✅     |
| Gráficos                | Pizza, Barras, Chart.js                  | ✅     |
| Orçamento               | Por categoria, Barras progresso          | ✅     |
| Exportação              | PDF formatado, jsPDF                     | ✅     |
| Tempo Real              | Firebase onSnapshot                      | ✅     |
| PWA                     | Instalável, Offline, SW                  | ✅     |
| Temas                   | Escuro/Claro, Persistência               | ✅     |
| Notificações            | Toast messages avançadas                 | ✅     |
| Responsivo              | Mobile, Tablet, Desktop                  | ✅     |
| UX/UI                   | Animações, Gradientes                    | ✅     |
| Acessibilidade          | ARIA, Keyboard nav, WCAG                 | ✅     |
| Performance             | Otimização, Debouncing, Lazy loading     | ✅     |
| Segurança               | XSS, Validação, Sanitização             | ✅     |
| Compatibilidade         | Cross-browser, Polyfills, Fallbacks      | ✅     |

## 🎉 Total: 25+ Funcionalidades Implementadas!

## 📝 Licença

Livre para uso pessoal e comercial.

## 👨‍💻 Autor

Desenvolvido com ❤️ e muito café ☕

## 🐛 Suporte

Para reportar bugs ou sugerir melhorias, abra uma issue no repositório.

---

**Aproveite sua nova lista de compras inteligente!** 🚀🛒
