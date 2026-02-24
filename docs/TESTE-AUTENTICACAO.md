# ✅ Checklist de Teste - Sistema de Autenticação

## 🧪 Testes de Proteção de Rotas

### Teste 1: Acesso Inicial

- [ ] Abra `http://localhost:5500/` ou `http://localhost:5500/index.html`
- [ ] **Resultado Esperado**: Deve redirecionar automaticamente para `/pages/login.html`
- [ ] Se já estiver logado, deve ir para `/home.html`

### Teste 2: Acesso Direto às Páginas (Sem Login)

Tente acessar diretamente cada página SEM estar logado:

- [ ] `http://localhost:5500/home.html`
  - **Esperado**: Redireciona para `/pages/login.html`

- [ ] `http://localhost:5500/pages/categorias.html`
  - **Esperado**: Redireciona para `/pages/login.html`

- [ ] `http://localhost:5500/pages/itens.html`
  - **Esperado**: Redireciona para `/pages/login.html`

- [ ] `http://localhost:5500/pages/estatisticas.html`
  - **Esperado**: Redireciona para `/pages/login.html`

- [ ] `http://localhost:5500/pages/configuracoes.html`
  - **Esperado**: Redireciona para `/pages/login.html`

### Teste 3: Fluxo de Cadastro

- [ ] Acesse `/pages/login.html`
- [ ] Clique na aba "Cadastrar"
- [ ] Preencha:
  - Nome: `Teste Usuario`
  - E-mail: `teste@example.com`
  - Senha: `senha123`
  - Confirmar Senha: `senha123`
- [ ] Clique em "Criar Conta"
- [ ] **Resultado Esperado**:
  - Toast verde "Cadastro realizado com sucesso!"
  - Redireciona para `/home.html`
  - Navbar mostra nome do usuário e botão de logout

### Teste 4: Fluxo de Login

- [ ] Faça logout (clique no botão na navbar)
- [ ] Deve voltar para `/pages/login.html`
- [ ] Na aba "Entrar", preencha:
  - E-mail: `teste@example.com`
  - Senha: `senha123`
- [ ] Clique em "Entrar"
- [ ] **Resultado Esperado**:
  - Toast verde "Login realizado com sucesso!"
  - Redireciona para `/home.html`
  - Navbar mostra dados do usuário

### Teste 5: Login com Google

- [ ] Na página de login, clique em "Continuar com Google"
- [ ] Selecione uma conta Google
- [ ] Autorize o aplicativo
- [ ] **Resultado Esperado**:
  - Toast verde "Login com Google realizado!"
  - Redireciona para `/home.html`
  - Navbar mostra e-mail da conta Google

### Teste 6: Navegação Entre Páginas (Logado)

Com usuário logado, tente navegar:

- [ ] Home → Categorias (navbar)
- [ ] Categorias → Itens (navbar)
- [ ] Itens → Estatísticas (navbar)
- [ ] Estatísticas → Configurações (navbar)
- [ ] **Resultado Esperado**: Todas as páginas devem carregar normalmente

### Teste 7: Persistência de Sessão

- [ ] Faça login
- [ ] Feche a aba/navegador
- [ ] Abra novamente `http://localhost:5500/`
- [ ] **Resultado Esperado**: Deve ir direto para `/home.html` (sessão mantida)

### Teste 8: Logout

- [ ] Estando logado, clique no botão de logout na navbar
- [ ] **Resultado Esperado**:
  - Toast verde "Logout realizado com sucesso!"
  - Redireciona para `/pages/login.html`

### Teste 9: Recuperação de Senha

- [ ] Na página de login, digite um e-mail no campo
- [ ] Clique em "Esqueceu a senha?"
- [ ] Confirme o envio
- [ ] **Resultado Esperado**:
  - Toast verde "E-mail de recuperação enviado!"
  - Verifique a caixa de entrada do e-mail

### Teste 10: Validações de Formulário

Na página de cadastro:

- [ ] Tente cadastrar com senha < 6 caracteres
  - **Esperado**: Toast "A senha deve ter no mínimo 6 caracteres"

- [ ] Tente cadastrar com senhas diferentes
  - **Esperado**: Toast "As senhas não conferem"

- [ ] Tente cadastrar com e-mail inválido
  - **Esperado**: Toast "E-mail inválido"

- [ ] Tente cadastrar com e-mail já usado
  - **Esperado**: Toast "Este e-mail já está em uso"

### Teste 11: Proteção no Console (Avançado)

- [ ] Abra DevTools (F12)
- [ ] No Console, digite: `firebase.auth().currentUser`
- [ ] **Se logado**: Deve mostrar objeto do usuário
- [ ] **Se não logado**: Deve mostrar `null`

---

## 🐛 Problemas Comuns e Soluções

### Problema: Redirect Loop (Fica voltando para mesma página)

**Solução**:

- Limpe o cache do navegador (Ctrl+Shift+Delete)
- Verifique se o Firebase Auth está habilitado no console
- Abra DevTools e veja erros no console

### Problema: "Firebase is not defined"

**Solução**:

- Verifique se está usando Live Server ou servidor HTTP
- Não abra os arquivos diretamente (file://)
- Verifique conexão com internet

### Problema: Login não funciona

**Solução**:

- Verifique no Firebase Console:
  - Authentication > Sign-in method
  - E-mail/Senha deve estar ENABLED
  - Google deve estar ENABLED (se usar)

### Problema: Pop-up do Google bloqueado

**Solução**:

- Permita pop-ups para localhost
- Ou use login com e-mail/senha

---

## 📊 Status dos Testes

**Data**: ****\_****  
**Testado por**: ****\_****  
**Navegador**: ****\_****

### Resumo

- Total de testes: 11
- Passaram: \_\_\_
- Falharam: \_\_\_
- Status: ☐ Aprovado ☐ Reprovado

---

## 🚀 Como Rodar os Testes

### Opção 1: Live Server (Recomendado)

1. Instale a extensão "Live Server" no VS Code
2. Clique com botão direito em `index.html`
3. Selecione "Open with Live Server"
4. Navegador abrirá automaticamente

### Opção 2: Python HTTP Server

```bash
cd /home/valdeilson/Documentos/lista-de-compras
python3 -m http.server 8000
# Abra: http://localhost:8000
```

### Opção 3: Node.js HTTP Server

```bash
cd /home/valdeilson/Documentos/lista-de-compras
npx http-server -p 8000
# Abra: http://localhost:8000
```

---

## ✅ Confirmação Final

Após todos os testes passarem:

- [ ] Todas as páginas redirecionam para login quando não autenticado
- [ ] Login funciona corretamente
- [ ] Cadastro funciona corretamente
- [ ] Login com Google funciona
- [ ] Logout funciona e redireciona para login
- [ ] Sessão persiste após fechar navegador
- [ ] Navbar mostra informações do usuário
- [ ] Validações de formulário funcionam
- [ ] Não há erros no console do navegador

**Sistema de autenticação:** ☐ FUNCIONAL ☐ PRECISA AJUSTES

---

## 📝 Notas Adicionais

_Espaço para anotações durante os testes:_
