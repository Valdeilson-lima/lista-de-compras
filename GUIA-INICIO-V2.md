# 🚀 Guia Rápido - Lista de Compras v2.0

## 📦 Instalação e Configuração

### 1. Arquivos Necessários

Certifique-se de ter todos estes arquivos na estrutura correta:

```
lista-de-compras/
├── home.html
├── index.html
├── pages/
│   ├── categorias.html
│   ├── itens.html
│   ├── estatisticas.html
│   └── configuracoes.html
├── css/
│   ├── global.css
│   ├── navbar.css
│   └── components.css
├── js/
│   └── utils.js
├── firebase-config.js
├── sw.js
└── manifest.json
```

### 2. Configurar Firebase

Edite o arquivo `firebase-config.js` com suas credenciais:

```javascript
const firebaseConfig = {
  apiKey: "SUA_API_KEY",
  authDomain: "SEU_PROJECT_ID.firebaseapp.com",
  projectId: "SEU_PROJECT_ID",
  storageBucket: "SEU_PROJECT_ID.appspot.com",
  messagingSenderId: "SEU_SENDER_ID",
  appId: "SEU_APP_ID",
};
```

### 3. Executar o Projeto

**Opção 1: Servidor Local**

```bash
# Com Python
python -m http.server 8000

# Ou com Node.js (http-server)
npx http-server
```

**Opção 2: VS Code Live Server**

- Instale a extensão "Live Server"
- Clique com botão direito em `home.html`
- Selecione "Open with Live Server"

**Opção 3: Hospedagem**

- Firebase Hosting
- Netlify
- Vercel
- GitHub Pages

---

## 🎯 Como Usar - Passo a Passo

### Primeira Vez

#### 1. Criar Categorias

1. Acesse **Categorias** no menu superior
2. Digite um nome (ex: "Frutas", "Laticínios", "Limpeza")
3. Opcionalmente, defina um orçamento mensal (ex: R$ 200,00)
4. Clique em **Adicionar**

💡 **Dica:** Crie pelo menos 3-4 categorias para organizar melhor suas compras.

#### 2. Adicionar Itens

1. Acesse **Itens** no menu
2. Preencha:
   - Nome do item (ex: "Arroz")
   - Selecione a categoria
   - Quantidade (padrão: 1)
   - Valor unitário (ex: R$ 5,50)
3. Clique em **Adicionar**

💡 **Dica:** O subtotal é calculado automaticamente (quantidade × valor).

#### 3. Marcar Como Comprado

1. Na página de **Itens**
2. Marque o checkbox ao lado do item
3. O item fica riscado e semi-transparente

#### 4. Ver Estatísticas

1. Acesse **Estatísticas**
2. Visualize:
   - Gráficos de pizza e barras
   - Ranking de gastos
   - Status de orçamento por categoria

#### 5. Exportar Dados

1. Acesse **Configurações**
2. Escolha:
   - **PDF**: relatório completo formatado
   - **JSON**: backup de todos os dados

---

## 🎨 Personalização

### Alternar Tema

1. Clique no botão 🌙/☀️ (disponível em várias páginas)
2. Ou acesse **Configurações** → Toggle "Tema Escuro"

### Limpar Dados

**Limpar Comprados:**

- **Itens** → Botão "Limpar Comprados"
- Ou **Configurações** → "Limpar Itens Comprados"

**Apagar Tudo:**

- **Configurações** → "Limpar Todos os Dados"
- ⚠️ Digite "CONFIRMAR" para prosseguir

---

## 📱 Usar Como App

### Android/iOS

1. Abra o site no navegador
2. Toque no menu (⋮ ou compartilhar)
3. Selecione "Adicionar à tela inicial"
4. O app será instalado como nativo

### Desktop (Chrome/Edge)

1. Clique no ícone ➕ na barra de endereço
2. Ou vá em Menu → "Instalar Lista de Compras"

---

## 🔍 Recursos Avançados

### Busca Inteligente

- Digite qualquer palavra na busca
- Resultados aparecem em tempo real
- Funciona em nome dos itens

### Filtros

- **Por Categoria**: mostre apenas itens de uma categoria
- **Ordenação**:
  - Nome A-Z / Z-A
  - Menor / Maior preço

### Orçamento

1. Edite uma categoria
2. Defina um valor de orçamento
3. Acompanhe o progresso:
   - 🟢 Verde: até 79%
   - 🟡 Amarelo: 80-99%
   - 🔴 Vermelho: 100%+

### Edição Rápida

- Clique no botão ✏️ de qualquer item ou categoria
- Edite os dados no modal
- Salve ou exclua

---

## ⌨️ Atalhos e Dicas

### Navegação

- **Home**: visão geral e ações rápidas
- **Categorias**: gerencie grupos
- **Itens**: adicione produtos
- **Estatísticas**: analise gastos
- **Configurações**: ajustes e exportações

### Produtividade

1. Use **Ações Rápidas** na Home para ir direto ao ponto
2. Defina orçamentos para controlar gastos
3. Marque itens como comprados durante a compra
4. Limpe comprados após cada ida ao mercado
5. Exporte PDF antes de fazer compras grandes

### Mobile

- Menu hambúrguer (☰) para navegação
- Toque longo em itens para editar (futuramente)
- Deslize para ações rápidas (futuramente)

---

## 🐛 Solução de Problemas

### Firebase não conecta

- Verifique `firebase-config.js`
- Certifique-se de que o Firestore está habilitado
- Verifique as regras de segurança do Firebase

### Dados não aparecem

- Limpe o cache do navegador
- Recarregue a página (Ctrl+F5)
- Verifique o console do navegador (F12)

### PWA não instala

- Use HTTPS (obrigatório para PWA)
- Verifique se `manifest.json` está correto
- Limpe o cache do Service Worker

### Tema não muda

- Limpe o localStorage: `localStorage.clear()`
- Recarregue a página

---

## 📊 Exemplo de Uso

### Cenário: Compras do Mês

#### Semana 1: Configuração

```
1. Criar categorias:
   - Frutas e Verduras (orçamento: R$ 150)
   - Laticínios (orçamento: R$ 80)
   - Limpeza (orçamento: R$ 60)
   - Outros (orçamento: R$ 100)

2. Adicionar itens:
   - 2x Banana (R$ 3,50) → Frutas
   - 1x Leite (R$ 5,00) → Laticínios
   - 1x Detergente (R$ 2,50) → Limpeza
   (e assim por diante...)
```

#### Durante as Compras

```
1. Abrir app no celular
2. Ir para página de Itens
3. Marcar cada item conforme coloca no carrinho
4. Conferir total em tempo real
```

#### Após as Compras

```
1. Limpar itens comprados
2. Ver Estatísticas:
   - Quanto gastou por categoria
   - Se estourou algum orçamento
3. Exportar PDF para controle pessoal
```

#### Fim do Mês

```
1. Analisar estatísticas completas
2. Ajustar orçamentos se necessário
3. Exportar JSON como backup
4. Recomeçar o ciclo
```

---

## 🎓 Melhores Práticas

### ✅ Faça

- Crie categorias específicas
- Defina orçamentos realistas
- Atualize valores regularmente
- Marque itens durante as compras
- Faça backup mensal (JSON)

### ❌ Evite

- Categorias muito genéricas
- Deixar muitos itens comprados
- Não revisar orçamentos
- Ignorar as estatísticas

---

## 💡 Casos de Uso

### 1. Compras Familiares

- Categorias por tipo de alimento
- Orçamento total da família
- Lista compartilhada (futuramente)

### 2. Controle Pessoal

- Categorias específicas para sua dieta
- Acompanhamento mensal de gastos
- Análise de onde economizar

### 3. Pequeno Negócio

- Categorias por departamento
- Orçamento por área
- Relatórios mensais em PDF

### 4. Eventos

- Categorias por tipo de item
- Controle de lista de compras para festa
- Orçamento total do evento

---

## 🆘 Suporte

### Encontrou um bug?

1. Verifique o console do navegador (F12)
2. Anote os passos para reproduzir
3. Abra uma issue no repositório

### Precisa de ajuda?

- Consulte o `README-v2.md` completo
- Veja o `MELHORIAS-V2.md` para detalhes técnicos
- Acesse a documentação do Firebase

---

## 🎉 Pronto para Começar!

1. ✅ Configure o Firebase
2. ✅ Abra `home.html` no navegador
3. ✅ Crie suas primeiras categorias
4. ✅ Adicione alguns itens
5. ✅ Explore as funcionalidades!

**Divirta-se organizando suas compras! 🛒✨**
