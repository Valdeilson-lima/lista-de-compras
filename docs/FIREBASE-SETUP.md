# 🔥 Configuração do Firebase

## Passo a Passo Completo

### 1️⃣ Criar Projeto Firebase

1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Clique em "Adicionar projeto"
3. Digite um nome (ex: "lista-de-compras")
4. Desabilite Google Analytics (opcional para este projeto)
5. Clique em "Criar projeto"

### 2️⃣ Configurar Firestore Database

1. No menu lateral, clique em "Firestore Database"
2. Clique em "Criar banco de dados"
3. Escolha a localização (recomendado: south-america-east1)
4. Inicie em **modo de produção** (vamos configurar as regras depois)
5. Aguarde a criação (pode levar alguns minutos)

### 3️⃣ Obter Credenciais

1. Clique no ícone de engrenagem ⚙️ → "Configurações do projeto"
2. Role até "Seus aplicativos"
3. Clique no ícone Web (</>) para adicionar app web
4. Digite um apelido (ex: "web-app")
5. **Não marque** Firebase Hosting por enquanto
6. Clique em "Registrar app"
7. **Copie** o código de configuração que aparece:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "seu-projeto.firebaseapp.com",
  projectId: "seu-projeto",
  storageBucket: "seu-projeto.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123",
};
```

### 4️⃣ Atualizar Arquivo firebase-config.js

Substitua o conteúdo do arquivo `firebase-config.js` com suas credenciais:

```javascript
// Suas configurações do Firebase
const firebaseConfig = {
  apiKey: "SUA_API_KEY_AQUI",
  authDomain: "seu-projeto.firebaseapp.com",
  projectId: "seu-projeto-id",
  storageBucket: "seu-projeto.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123def456",
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
```

### 5️⃣ Configurar Regras de Segurança

#### Para Desenvolvimento/Testes (Acesso Público)

No Firestore Database, vá em **Regras** e use:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Permite leitura e escrita para todos
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

⚠️ **ATENÇÃO**: Esta configuração permite acesso total. Use apenas para desenvolvimento!

#### Para Produção (Recomendado)

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Categorias
    match /categorias/{categoria} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    // Itens
    match /itens/{item} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

Esta configuração:

- ✅ Permite leitura pública
- ✅ Exige autenticação para criar/editar/excluir

#### Para Múltiplos Usuários (Avançado)

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Categorias por usuário
    match /usuarios/{userId}/categorias/{categoria} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Itens por usuário
    match /usuarios/{userId}/itens/{item} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

Esta configuração:

- ✅ Cada usuário vê apenas seus dados
- ✅ Requer autenticação
- ✅ Isolamento completo entre usuários

### 6️⃣ Publicar Regras

1. Após editar as regras
2. Clique em **"Publicar"**
3. Aguarde confirmação

## ✅ Verificar Instalação

### Teste Rápido

1. Abra `index.html` no navegador
2. Abra o Console (F12)
3. Não deve ter erros relacionados ao Firebase
4. Tente criar uma categoria
5. Verifique no Firestore Console se foi criada

### Console do Firestore

1. Vá em "Firestore Database"
2. Você verá as collections:
   - `categorias`
   - `itens`
3. Clique para ver os documentos dentro

## 🚀 Deploy no Firebase Hosting (Opcional)

### Instalar Firebase CLI

```bash
npm install -g firebase-tools
```

### Login

```bash
firebase login
```

### Inicializar Projeto

```bash
cd /caminho/para/lista-de-compras
firebase init hosting
```

Escolha:

- Projeto existente
- Diretório público: `.` (raiz)
- SPA: Não
- Sobrescrever index.html: Não

### Deploy

```bash
firebase deploy --only hosting
```

Seu site estará em: `https://seu-projeto.web.app`

## 🔒 Segurança - Boas Práticas

### 1. Nunca Commite Credenciais Privadas

Se usar autenticação, não commite:

- Service Account Keys
- Chaves privadas
- Secrets

### 2. Use Variáveis de Ambiente (Produção)

```javascript
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  // ...
};
```

### 3. Configure CORS

No Firebase Console:

- Hosting → Configurações
- Adicione domínios permitidos

### 4. Limite de Taxa (Rate Limiting)

No Firestore, configure:

- Quotas por dia
- Máximo de leituras/escritas

## 📊 Monitoramento

### Firebase Console

Monitore:

- **Usage**: Leituras, escritas, deletes
- **Analytics**: Usuários ativos (se ativado)
- **Performance**: Tempo de resposta

### Logs

No console do navegador (F12):

- Erros do Firebase aparecem em vermelho
- Avisos em amarelo

## 🆘 Problemas Comuns

### Erro: "Missing or insufficient permissions"

**Solução**: Verifique as regras de segurança do Firestore

### Erro: "Firebase: Firebase App named '[DEFAULT]' already exists"

**Solução**: Não inicialize o Firebase duas vezes. Verifique se não está importando firebase-config.js múltiplas vezes.

### Erro: "Failed to get document because the client is offline"

**Solução**:

- Verifique sua conexão com internet
- Habilite persistência offline:

```javascript
firebase
  .firestore()
  .enablePersistence()
  .catch((err) => {
    console.error(err);
  });
```

### Dados não aparecem

**Solução**:

1. Verifique o Console do navegador (F12)
2. Vá no Firestore Database para ver se os dados estão lá
3. Verifique as regras de segurança
4. Limpe o cache do navegador

## 💰 Plano Gratuito (Spark)

### Limites Gratuitos

- ✅ 50.000 leituras/dia
- ✅ 20.000 escritas/dia
- ✅ 20.000 deletes/dia
- ✅ 1 GB armazenamento
- ✅ 10 GB tráfego/mês

### Quando Atualizar

Considere o plano Blaze (pague conforme usar) se:

- Mais de 100 usuários ativos/dia
- Aplicação comercial
- Precisa de mais recursos

## 📚 Recursos Adicionais

- [Documentação Firebase](https://firebase.google.com/docs)
- [Firestore Quickstart](https://firebase.google.com/docs/firestore/quickstart)
- [Regras de Segurança](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Hosting](https://firebase.google.com/docs/hosting)

## ✨ Pronto!

Sua aplicação agora está conectada ao Firebase! 🎉

Para qualquer dúvida, consulte a documentação oficial ou abra uma issue no repositório.
