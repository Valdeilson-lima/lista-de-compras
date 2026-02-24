document.addEventListener("DOMContentLoaded", () => {
  if (!document.body.classList.contains("login-page")) return;

  if (typeof inicializarTema === "function") {
    inicializarTema();
  }

  const AUTH_TAB_KEY = "authActiveTab";
  const authStatus = document.getElementById("authStatus");
  const tabBtns = document.querySelectorAll(".tab-btn");
  const tabContents = document.querySelectorAll(".tab-content");

  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");
  const loginSubmitBtn = document.getElementById("loginSubmitBtn");
  const registerSubmitBtn = document.getElementById("registerSubmitBtn");
  const googleLoginBtn = document.getElementById("googleLoginBtn");

  const loginEmail = document.getElementById("loginEmail");
  const loginPassword = document.getElementById("loginPassword");
  const registerName = document.getElementById("registerName");
  const registerEmail = document.getElementById("registerEmail");
  const registerPassword = document.getElementById("registerPassword");
  const registerPasswordConfirm = document.getElementById("registerPasswordConfirm");
  const loginEmailHint = document.getElementById("loginEmailHint");

  function setStatus(message = "", type = "info") {
    if (!authStatus) return;
    authStatus.textContent = message;
    authStatus.setAttribute("data-type", message ? type : "");
  }

  function setHint(el, message = "", isError = false) {
    if (!el) return;
    el.textContent = message;
    el.classList.toggle("is-error", Boolean(isError && message));
  }

  function setButtonLoading(button, loading, text, iconClasses) {
    if (!button) return;

    if (loading) {
      button.classList.add("is-loading");
      button.disabled = true;
      button.innerHTML = `<i class="fas fa-spinner fa-spin" aria-hidden="true"></i> ${text}`;
      return;
    }

    button.classList.remove("is-loading");
    button.disabled = false;
    button.innerHTML = `<i class="${iconClasses}" aria-hidden="true"></i> ${text}`;
  }

  function setInputState(input, isValid) {
    if (!input) return;
    input.classList.remove("input-valid", "input-error");
    if (isValid === null) return;
    input.classList.add(isValid ? "input-valid" : "input-error");
  }

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function passwordStrength(password) {
    let score = 0;
    if (password.length >= 6) score += 25;
    if (password.length >= 10) score += 25;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 20;
    if (/\d/.test(password)) score += 15;
    if (/[^A-Za-z0-9]/.test(password)) score += 15;
    return Math.min(score, 100);
  }

  function updatePasswordStrength(password) {
    const fill = document.getElementById("passwordStrengthFill");
    const text = document.getElementById("passwordStrengthText");
    if (!fill || !text) return;

    const score = passwordStrength(password);
    fill.style.width = `${score}%`;

    if (score < 40) {
      fill.style.background = "var(--danger-color)";
      text.textContent = "Força da senha: fraca";
      return;
    }

    if (score < 70) {
      fill.style.background = "var(--warning-color)";
      text.textContent = "Força da senha: média";
      return;
    }

    fill.style.background = "var(--success-color)";
    text.textContent = "Força da senha: forte";
  }

  function setActiveTab(tabName, persist = true) {
    tabBtns.forEach((btn) => {
      const selected = btn.getAttribute("data-tab") === tabName;
      btn.classList.toggle("active", selected);
      btn.setAttribute("aria-selected", selected ? "true" : "false");
    });

    tabContents.forEach((tab) => {
      tab.classList.toggle("active", tab.id === `${tabName}-tab`);
    });

    if (persist) {
      salvarLocalStorage(AUTH_TAB_KEY, tabName);
    }

    setStatus("");

    const firstInput = document.querySelector(`#${tabName}-tab input`);
    if (firstInput) firstInput.focus();
  }

  function wireTabActions() {
    tabBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const tabName = btn.getAttribute("data-tab") || "login";
        setActiveTab(tabName, true);
      });
    });

    const savedTab = obterLocalStorage(AUTH_TAB_KEY, "login");
    setActiveTab(savedTab === "register" ? "register" : "login", false);
  }

  function wirePasswordToggle() {
    const togglePasswordBtns = document.querySelectorAll(".toggle-password");

    togglePasswordBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const targetId = btn.getAttribute("data-target");
        const input = document.getElementById(targetId);
        const icon = btn.querySelector("i");
        if (!input || !icon) return;

        const show = input.type === "password";
        input.type = show ? "text" : "password";
        icon.classList.toggle("fa-eye", !show);
        icon.classList.toggle("fa-eye-slash", show);
      });
    });
  }

  function wireLiveValidation() {
    loginEmail?.addEventListener("input", () => {
      const email = loginEmail.value.trim().toLowerCase();
      if (!email) {
        setInputState(loginEmail, null);
        setHint(loginEmailHint, "");
        return;
      }

      const valid = validateEmail(email);
      setInputState(loginEmail, valid);
      setHint(loginEmailHint, valid ? "" : "Digite um e-mail válido.", !valid);
    });

    registerName?.addEventListener("input", () => {
      const valid = registerName.value.trim().length >= 3;
      setInputState(registerName, valid);
    });

    registerEmail?.addEventListener("input", () => {
      const email = registerEmail.value.trim().toLowerCase();
      if (!email) {
        setInputState(registerEmail, null);
        return;
      }
      setInputState(registerEmail, validateEmail(email));
    });

    registerPassword?.addEventListener("input", () => {
      updatePasswordStrength(registerPassword.value || "");
      const valid = (registerPassword.value || "").length >= 6;
      setInputState(registerPassword, valid);

      if (registerPasswordConfirm.value) {
        setInputState(
          registerPasswordConfirm,
          registerPasswordConfirm.value === registerPassword.value,
        );
      }
    });

    registerPasswordConfirm?.addEventListener("input", () => {
      if (!registerPasswordConfirm.value) {
        setInputState(registerPasswordConfirm, null);
        return;
      }

      const valid = registerPasswordConfirm.value === registerPassword.value;
      setInputState(registerPasswordConfirm, valid);
    });
  }

  async function handleLoginSubmit(e) {
    e.preventDefault();

    const email = (loginEmail.value || "").trim().toLowerCase();
    const senha = loginPassword.value || "";

    if (!validateEmail(email)) {
      setInputState(loginEmail, false);
      setHint(loginEmailHint, "Digite um e-mail válido para continuar.", true);
      setStatus("Revise o e-mail informado.", "error");
      return;
    }

    if (!senha) {
      setInputState(loginPassword, false);
      setStatus("Informe sua senha para entrar.", "error");
      return;
    }

    setInputState(loginEmail, true);
    setInputState(loginPassword, true);

    setButtonLoading(loginSubmitBtn, true, "Entrando...", "fas fa-sign-in-alt");
    setStatus("Validando suas credenciais...", "info");

    try {
      await fazerLogin(email, senha);
      setStatus("Login realizado. Redirecionando...", "success");
    } catch {
      setStatus("Não foi possível entrar. Verifique os dados e tente novamente.", "error");
    } finally {
      setButtonLoading(loginSubmitBtn, false, "Entrar", "fas fa-sign-in-alt");
    }
  }

  async function handleRegisterSubmit(e) {
    e.preventDefault();

    const nome = (registerName.value || "").trim();
    const email = (registerEmail.value || "").trim().toLowerCase();
    const senha = registerPassword.value || "";
    const senhaConfirm = registerPasswordConfirm.value || "";

    if (nome.length < 3) {
      setInputState(registerName, false);
      setStatus("Informe um nome com pelo menos 3 caracteres.", "error");
      return;
    }

    if (!validateEmail(email)) {
      setInputState(registerEmail, false);
      setStatus("Informe um e-mail válido.", "error");
      return;
    }

    if (senha.length < 6) {
      setInputState(registerPassword, false);
      setStatus("A senha precisa ter no mínimo 6 caracteres.", "error");
      return;
    }

    if (senha !== senhaConfirm) {
      setInputState(registerPasswordConfirm, false);
      setStatus("As senhas não conferem.", "error");
      return;
    }

    setInputState(registerName, true);
    setInputState(registerEmail, true);
    setInputState(registerPassword, true);
    setInputState(registerPasswordConfirm, true);

    setButtonLoading(
      registerSubmitBtn,
      true,
      "Criando conta...",
      "fas fa-user-plus",
    );
    setStatus("Criando sua conta...", "info");

    try {
      await fazerCadastro(nome, email, senha);
      setStatus("Conta criada com sucesso. Redirecionando...", "success");
    } catch {
      setStatus("Não foi possível criar sua conta. Tente novamente.", "error");
    } finally {
      setButtonLoading(registerSubmitBtn, false, "Criar Conta", "fas fa-user-plus");
    }
  }

  async function handleGoogleLogin() {
    setButtonLoading(
      googleLoginBtn,
      true,
      "Conectando com Google...",
      "fab fa-google",
    );
    setStatus("Abrindo login do Google...", "info");

    try {
      await fazerLoginGoogle();
    } catch {
      setStatus("Falha no login com Google. Tente novamente.", "error");
    } finally {
      setButtonLoading(
        googleLoginBtn,
        false,
        "Continuar com Google",
        "fab fa-google",
      );
    }
  }

  async function handleForgotPassword(e) {
    e.preventDefault();

    const email = (loginEmail.value || "").trim().toLowerCase();
    if (!validateEmail(email)) {
      setStatus("Digite um e-mail válido para recuperar a senha.", "error");
      setInputState(loginEmail, false);
      loginEmail.focus();
      return;
    }

    const confirmar = confirm(`Enviar e-mail de recuperação para ${email}?`);
    if (!confirmar) return;

    try {
      await resetarSenha(email);
      setStatus("E-mail de recuperação enviado com sucesso.", "success");
    } catch {
      setStatus("Não foi possível enviar o e-mail de recuperação.", "error");
    }
  }

  wireTabActions();
  wirePasswordToggle();
  wireLiveValidation();

  loginForm?.addEventListener("submit", handleLoginSubmit);
  registerForm?.addEventListener("submit", handleRegisterSubmit);
  googleLoginBtn?.addEventListener("click", handleGoogleLogin);
  document.querySelector(".forgot-password")?.addEventListener("click", handleForgotPassword);

  const toggleThemeBtn = document.getElementById("toggleThemeBtn");
  if (toggleThemeBtn && typeof toggleTema === "function") {
    toggleThemeBtn.addEventListener("click", toggleTema);
  }
});
