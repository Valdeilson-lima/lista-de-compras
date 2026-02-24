// Sistema de Autenticação
let currentUser = null;
const isPagesDir = window.location.pathname.includes("/pages/");
let authRedirectInProgress = false;
let authNullGuardTimeout = null;

function getHomePath() {
  return isPagesDir ? "../home.html" : "home.html";
}

function getLoginPath() {
  return isPagesDir ? "login.html" : "pages/login.html";
}

function redirectSafely(path) {
  if (authRedirectInProgress) return;
  const target = new URL(path, window.location.href);
  if (target.pathname === window.location.pathname) return;

  authRedirectInProgress = true;
  window.location.replace(path);
}

// Verificar se já está logado ao carregar a página
auth.onAuthStateChanged((user) => {
  if (authNullGuardTimeout) {
    clearTimeout(authNullGuardTimeout);
    authNullGuardTimeout = null;
  }

  const isLoginPage = window.location.pathname.includes("login.html");
  const isIndexPage =
    window.location.pathname === "/" ||
    window.location.pathname.includes("index.html");

  if (user) {
    // User is signed in.
    currentUser = user;
    atualizarUIUsuario(user);

    // If they are on the login page, they shouldn't be. Redirect them to home.
    if (isLoginPage) {
      redirectSafely(getHomePath());
    }
  } else {
    // User is signed out.
    currentUser = null;

    // If they are on any page that is NOT the login page or the index/root page,
    // they need to be sent to the login page.
    if (!isLoginPage && !isIndexPage) {
      authNullGuardTimeout = setTimeout(() => {
        if (!auth.currentUser) {
          redirectSafely(getLoginPath());
        }
      }, 600);
    }
  }
});

// Função para atualizar UI com informações do usuário
function atualizarUIUsuario(user) {
  const navMenu = document.querySelector(".nav-menu");
  if (!navMenu) return;

  // Verificar se já existe item de usuário
  let userItem = document.querySelector(".nav-user-item");

  if (!userItem) {
    // Criar item de usuário
    userItem = document.createElement("li");
    userItem.className = "nav-item nav-user-item";
    userItem.innerHTML = `
      <div class="nav-user">
        <div class="nav-user-info">
          <i class="fas fa-user-circle"></i>
          <span class="nav-user-name">${sanitizeInput(user.displayName || user.email)}</span>
        </div>
        <button class="nav-logout-btn" id="logoutBtn" title="Sair">
          <i class="fas fa-sign-out-alt"></i>
        </button>
      </div>
    `;
    navMenu.appendChild(userItem);

    // Adicionar event listener para logout
    document.getElementById("logoutBtn").addEventListener("click", fazerLogout);
  }
}

// Login com Email e Senha
async function fazerLogin(email, senha) {
  try {
    const userCredential = await auth.signInWithEmailAndPassword(email, senha);
    mostrarToast("Login realizado com sucesso!", "success");
    setTimeout(() => {
      redirectSafely(getHomePath());
    }, 500);
    return userCredential.user;
  } catch (error) {
    console.error("Erro ao fazer login:", error);
    let mensagem = "Erro ao fazer login";

    switch (error.code) {
      case "auth/user-not-found":
        mensagem = "Usuário não encontrado";
        break;
      case "auth/wrong-password":
        mensagem = "Senha incorreta";
        break;
      case "auth/invalid-email":
        mensagem = "E-mail inválido";
        break;
      case "auth/user-disabled":
        mensagem = "Usuário desabilitado";
        break;
      case "auth/too-many-requests":
        mensagem = "Muitas tentativas. Tente novamente mais tarde";
        break;
      default:
        mensagem = error.message;
    }

    mostrarToast(mensagem, "error");
    throw error;
  }
}

// Cadastro com Email e Senha
async function fazerCadastro(nome, email, senha) {
  try {
    console.log("Tentando cadastrar usuário...", { nome, email });
    console.log("Auth disponível:", !!auth);
    console.log("Auth config:", auth.app.options);

    const userCredential = await auth.createUserWithEmailAndPassword(
      email,
      senha,
    );

    // Atualizar perfil com o nome
    await userCredential.user.updateProfile({
      displayName: nome,
    });

    mostrarToast("Cadastro realizado com sucesso!", "success");
    setTimeout(() => {
      redirectSafely(getHomePath());
    }, 500);
    return userCredential.user;
  } catch (error) {
    console.error("Erro ao fazer cadastro:", error);
    console.error("Error code:", error.code);
    console.error("Error message:", error.message);
    let mensagem = "Erro ao fazer cadastro";

    switch (error.code) {
      case "auth/email-already-in-use":
        mensagem = "Este e-mail já está em uso";
        break;
      case "auth/invalid-email":
        mensagem = "E-mail inválido";
        break;
      case "auth/weak-password":
        mensagem = "Senha muito fraca. Use no mínimo 6 caracteres";
        break;
      default:
        mensagem = error.message;
    }

    mostrarToast(mensagem, "error");
    throw error;
  }
}

// Login com Google
async function fazerLoginGoogle() {
  const provider = new firebase.auth.GoogleAuthProvider();
  provider.setCustomParameters({
    prompt: "select_account",
  });

  try {
    const result = await auth.signInWithPopup(provider);
    mostrarToast("Login com Google realizado!", "success");
    setTimeout(() => {
      redirectSafely(getHomePath());
    }, 500);
    return result.user;
  } catch (error) {
    console.error("Erro ao fazer login com Google:", error);

    let mensagem = "Erro ao fazer login com Google";
    switch (error.code) {
      case "auth/popup-closed-by-user":
        mensagem = "Login cancelado";
        break;
      case "auth/popup-blocked":
        mensagem = "Pop-up bloqueado. Redirecionando para login do Google...";
        mostrarToast(mensagem, "warning");
        await auth.signInWithRedirect(provider);
        return null;
      default:
        mensagem = error.message;
    }

    mostrarToast(mensagem, "error");
    throw error;
  }
}

// Logout
async function fazerLogout() {
  try {
    await auth.signOut();
    mostrarToast("Logout realizado com sucesso!", "success");
    setTimeout(() => {
      redirectSafely(getLoginPath());
    }, 500);
  } catch (error) {
    console.error("Erro ao fazer logout:", error);
    mostrarToast("Erro ao fazer logout", "error");
  }
}

// Resetar senha
async function resetarSenha(email) {
  try {
    await auth.sendPasswordResetEmail(email);
    mostrarToast("E-mail de recuperação enviado!", "success");
    return true;
  } catch (error) {
    console.error("Erro ao resetar senha:", error);
    let mensagem = "Erro ao enviar e-mail de recuperação";

    switch (error.code) {
      case "auth/user-not-found":
        mensagem = "E-mail não cadastrado";
        break;
      case "auth/invalid-email":
        mensagem = "E-mail inválido";
        break;
      default:
        mensagem = error.message;
    }

    mostrarToast(mensagem, "error");
    throw error;
  }
}

// Verificar se usuário está autenticado
function verificarAutenticacao() {
  return new Promise((resolve) => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      unsubscribe();
      resolve(user);
    });
  });
}

// Obter usuário atual
function obterUsuarioAtual() {
  return auth.currentUser;
}

// Exportar funções para uso global
if (typeof window !== "undefined") {
  window.auth = auth;
  window.fazerLogin = fazerLogin;
  window.fazerCadastro = fazerCadastro;
  window.fazerLoginGoogle = fazerLoginGoogle;
  window.fazerLogout = fazerLogout;
  window.resetarSenha = resetarSenha;
  window.verificarAutenticacao = verificarAutenticacao;
  window.obterUsuarioAtual = obterUsuarioAtual;
  window.currentUser = currentUser;
}
