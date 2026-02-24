# 🔐 Sistema de Autenticação - Guia Completo

## 📋 Visão Geral

O sistema de autenticação foi implementado usando **Firebase Authentication**, oferecendo login seguro com e-mail/senha e Google. Todas as páginas do aplicativo são protegidas e requerem autenticação.

---

## 🎯 Funcionalidades Implementadas

### ✅ Login e Cadastro

- Login com e-mail e senha
- Cadastro de novos usuários
- Login com Google (OAuth)
- Validação de formulários
- Mensagens de erro amigáveis
- Toggle para mostrar/ocultar senha

### ✅ Segurança

- Proteção de rotas (todas as páginas requerem login)
- Redirecionamento automático para login se não autenticado
- Sessão persistente (usuário permanece logado)
- Logout seguro com limpeza de sessão

### ✅ Interface de Usuário

- Página de login moderna com abas (Login/Cadastro)
- Menu de usuário na navbar
- Botão de logout visível
- Design responsivo
- Suporte a tema claro/escuro

---

## 📁 Arquivos Criados/Modificados

### Novos Arquivos

1. **pages/login.html** - Página de login e cadastro
   - Formulário de login
   - Formulário de cadastro
   - Botão de login com Google
   - Toggle de tema
   - Validação de campos

2. **js/auth.js** - Módulo de autenticação
   - `fazerLogin(email, senha)` - Login com e-mail
   - `fazerCadastro(nome, email, senha)` - Criar conta
   - `fazerLoginGoogle()` - Login com Google
   - `fazerLogout()` - Sair da conta
   - `resetarSenha(email)` - Recuperar senha
   - `verificarAutenticacao()` - Verificar se está logado
   - `obterUsuarioAtual()` - Obter dados do usuário
   - `atualizarUIUsuario(user)` - Atualizar UI com info do usuário

### Arquivos Modificados

1. **firebase-config.js**

   ```javascript
   // Adicionado:
   const auth = firebase.auth();
   ```

2. **home.html, pages/\*.html**
   - Adicionado Firebase Auth SDK
   - Adicionado script auth.js
   - Proteção automática de rotas

3. **css/navbar.css**
   - Adicionados estilos para menu de usuário
   - Estilos para botão de logout
   - Responsividade para menu de usuário

---

## 🚀 Como Usar

### 1. Primeiro Acesso

1. Abra a aplicação
2. Você será redirecionado para `/pages/login.html`
3. Escolha entre:
   - **Criar nova conta**: Clique na aba "Cadastrar"
   - **Fazer login**: Use a aba "Entrar" (se já tem conta)
   - **Login com Google**: Clique no botão "Continuar com Google"

### 2. Criar Nova Conta

```
1. Clique na aba "Cadastrar"
2. Preencha:
   - Nome completo
   - E-mail
   - Senha (mínimo 6 caracteres)
   - Confirmação de senha
3. Clique em "Criar Conta"
4. Você será redirecionado automaticamente para home.html
```

### 3. Fazer Login

```
1. Na aba "Entrar"
2. Digite seu e-mail e senha
3. Clique em "Entrar"
4. Você será redirecionado para home.html
```

### 4. Login com Google

```
1. Clique em "Continuar com Google"
2. Selecione sua conta Google
3. Autorize o aplicativo
4. Você será redirecionado para home.html
```

### 5. Recuperar Senha

```
1. Na página de login, digite seu e-mail
2. Clique em "Esqueceu a senha?"
3. Confirme o envio do e-mail
4. Verifique sua caixa de entrada
5. Siga as instruções do e-mail
```

### 6. Logout

```
1. Na navbar, clique no ícone de logout (seta saindo)
2. Você será redirecionado para a página de login
```

---

## 🔧 Configuração Firebase

### Pré-requisitos

O Firebase já está configurado no projeto, mas certifique-se de que:

1. **Firebase Authentication está habilitado** no console
2. **Métodos de login configurados**:
   - E-mail/Senha ✅
   - Google ✅

### Verificar Configuração

Acesse: https://console.firebase.google.com/

1. Selecione o projeto "listadecompras-7cea6"
2. Vá em **Authentication** > **Sign-in method**
3. Verifique se estão habilitados:
   - E-mail/Senha
   - Google

---

## 🎨 Interface

### Página de Login

**Elementos:**

- Logo animado no topo
- Título e subtítulo
- Abas para alternar entre Login e Cadastro
- Formulários com validação
- Toggle para mostrar/ocultar senha
- Link "Esqueceu a senha?"
- Botão de login com Google
- Toggle de tema (claro/escuro)
- Footer com copyright

**Design:**

- Gradiente de fundo (roxo para rosa)
- Card centralizado com backdrop blur
- Animações suaves
- Responsivo para mobile

### Navbar com Usuário

**Quando logado:**

- Ícone de usuário
- Nome do usuário (ou e-mail)
- Botão de logout vermelho
- Responsive (empilha no mobile)

---

## 🔐 Segurança

### Proteção de Rotas

O arquivo `auth.js` implementa proteção automática:

```javascript
auth.onAuthStateChanged((user) => {
  // Se não logado e não está na página de login
  if (!user && !window.location.pathname.includes("login.html")) {
    // Redireciona para login
    window.location.href = "/pages/login.html";
  }

  // Se logado e está na página de login
  if (user && window.location.pathname.includes("login.html")) {
    // Redireciona para home
    window.location.href = "/home.html";
  }
});
```

### Validações

**Lado do Cliente:**

- E-mail válido (formato)
- Senha mínima de 6 caracteres
- Senhas devem ser iguais no cadastro
- Campos obrigatórios

**Lado do Firebase:**

- E-mail único (não permite duplicatas)
- Senha forte (regras do Firebase)
- Rate limiting (proteção contra ataques)

---

## 🐛 Tratamento de Erros

### Erros Comuns

| Erro                        | Mensagem                     | Solução                                     |
| --------------------------- | ---------------------------- | ------------------------------------------- |
| `auth/user-not-found`       | "Usuário não encontrado"     | Verificar e-mail ou criar conta             |
| `auth/wrong-password`       | "Senha incorreta"            | Verificar senha ou usar "Esqueceu a senha?" |
| `auth/email-already-in-use` | "Este e-mail já está em uso" | Fazer login ou usar outro e-mail            |
| `auth/weak-password`        | "Senha muito fraca"          | Usar no mínimo 6 caracteres                 |
| `auth/invalid-email`        | "E-mail inválido"            | Verificar formato do e-mail                 |
| `auth/too-many-requests`    | "Muitas tentativas"          | Aguardar alguns minutos                     |

### Mensagens Toast

Todas as ações mostram feedback visual:

- ✅ Sucesso: Toast verde
- ❌ Erro: Toast vermelho
- ⚠️ Aviso: Toast amarelo

---

## 📱 Responsividade

### Mobile (< 768px)

- Menu de usuário empilhado
- Formulários com largura total
- Botões maiores para toque
- Logo menor

### Desktop

- Layout horizontal
- Menu de usuário inline
- Formulários centralizados
- Animações mais suaves

---

## 🔄 Fluxo de Autenticação

```
┌─────────────┐
│   Usuário   │
│ Não Logado  │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│  login.html     │
│  (Obrigatório)  │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐     ┌──────────────┐
│  Fazer Login    │────►│   Firebase   │
│  ou Cadastrar   │     │ Authentication│
└──────┬──────────┘     └──────┬───────┘
       │                       │
       │        ✅ Sucesso     │
       └───────────────────────┘
       │
       ▼
┌─────────────────┐
│   home.html     │
│  (Autenticado)  │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│  Navega entre   │
│  páginas        │
│  (Protegidas)   │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│  Fazer Logout   │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│  Volta para     │
│  login.html     │
└─────────────────┘
```

---

## 💡 Dicas de Uso

### Para Usuários

1. **Use uma senha forte**: Combine letras, números e símbolos
2. **Guarde suas credenciais**: Anote em local seguro
3. **Login com Google**: Mais rápido e seguro (OAuth)
4. **Não compartilhe**: Cada usuário deve ter sua conta

### Para Desenvolvedores

1. **Nunca exponha credenciais**: Mantenha firebase-config.js privado
2. **Use variáveis de ambiente**: Em produção, use env vars
3. **Teste todos os fluxos**: Login, cadastro, erro, logout
4. **Monitore o console**: Firebase Console > Authentication

---

## 🎯 Próximos Passos (Melhorias Futuras)

- [ ] Login com Facebook/Twitter
- [ ] Autenticação de dois fatores (2FA)
- [ ] Verificação de e-mail obrigatória
- [ ] Perfil de usuário editável
- [ ] Upload de foto de perfil
- [ ] Histórico de logins
- [ ] Notificações de login suspeito
- [ ] Gerenciamento de sessões ativas

---

## 🆘 Suporte

### Problemas Comuns

**1. "Não consigo fazer login"**

- Verifique se o e-mail está correto
- Verifique se a senha tem no mínimo 6 caracteres
- Tente resetar a senha

**2. "Pop-up do Google bloqueado"**

- Permita pop-ups para este site
- Ou use login com e-mail/senha

**3. "Página em branco após login"**

- Limpe o cache do navegador
- Verifique o console (F12) por erros
- Verifique se o Firebase está configurado

**4. "Sempre volta para login"**

- Verifique conexão com internet
- Verifique se cookies estão habilitados
- Limpe dados do site e tente novamente

---

## 📞 Contato

Caso encontre bugs ou tenha sugestões:

- Abra uma issue no repositório
- Envie um e-mail para suporte
- Consulte a documentação do Firebase

---

## ✅ Checklist de Implementação

- [x] Firebase Authentication configurado
- [x] Página de login criada
- [x] Formulário de cadastro
- [x] Login com e-mail/senha
- [x] Login com Google
- [x] Recuperação de senha
- [x] Proteção de rotas
- [x] Menu de usuário na navbar
- [x] Botão de logout
- [x] Tratamento de erros
- [x] Validação de formulários
- [x] Design responsivo
- [x] Tema claro/escuro
- [x] Animações
- [x] Documentação

---

**Versão:** 2.1  
**Data:** Janeiro 2026  
**Status:** ✅ Implementado e Funcional
