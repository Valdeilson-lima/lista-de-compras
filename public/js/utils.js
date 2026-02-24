// Utilitários e funções auxiliares
const IS_PAGES_DIR = window.location.pathname.includes("/pages/");

function pathToHome() {
  return IS_PAGES_DIR ? "../home.html" : "home.html";
}

function pathToLogin() {
  return IS_PAGES_DIR ? "login.html" : "pages/login.html";
}

// Função para obter ID do usuário atual
function obterUserId() {
  const user = firebase.auth().currentUser;
  if (!user) {
    console.error("Nenhum usuário logado");
    return null;
  }
  return user.uid;
}

// Debounce para otimizar performance
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Sanitizar input para evitar XSS
function sanitizeInput(input) {
  const div = document.createElement("div");
  div.textContent = input;
  return div.innerHTML;
}

// Validar input
function validateInput(input, type = "text") {
  if (!input || typeof input !== "string") return false;

  input = input.trim();
  if (input.length === 0) return false;

  switch (type) {
    case "number":
      return !isNaN(input) && parseFloat(input) >= 0;
    case "text":
      return input.length > 0 && input.length <= 100;
    case "categoria":
      return input.length > 0 && input.length <= 50;
    default:
      return input.length > 0;
  }
}

// Formatar valor em reais
function formatarReal(valor) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor);
}

// Formatar data
function formatarData(data) {
  if (!data) return "";
  const date = new Date(data);
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

// Mostrar toast notification
function mostrarToast(mensagem, tipo = "info") {
  const toast = document.createElement("div");
  toast.className = `toast ${tipo}`;
  toast.innerHTML = `
    <div style="display: flex; align-items: center; gap: 12px;">
      <i class="fas fa-${getIconeToast(tipo)}"></i>
      <span>${sanitizeInput(mensagem)}</span>
    </div>
  `;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = "slideDown 0.3s ease-out reverse";
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 300);
  }, 3000);
}

function getIconeToast(tipo) {
  const icones = {
    success: "check-circle",
    error: "exclamation-circle",
    warning: "exclamation-triangle",
    info: "info-circle",
  };
  return icones[tipo] || "info-circle";
}

// Gerar ID único
function gerarId() {
  return "_" + Math.random().toString(36).substr(2, 9);
}

// Ordenar array
function ordenarArray(array, campo, ordem = "asc") {
  return [...array].sort((a, b) => {
    let valA = a[campo];
    let valB = b[campo];

    // Se for string, converter para lowercase
    if (typeof valA === "string") valA = valA.toLowerCase();
    if (typeof valB === "string") valB = valB.toLowerCase();

    if (ordem === "asc") {
      return valA > valB ? 1 : valA < valB ? -1 : 0;
    } else {
      return valA < valB ? 1 : valA > valB ? -1 : 0;
    }
  });
}

// Filtrar array
function filtrarArray(array, busca, campos = ["nome"]) {
  if (!busca) return array;

  busca = busca.toLowerCase();
  return array.filter((item) => {
    return campos.some((campo) => {
      const valor = item[campo];
      if (typeof valor === "string") {
        return valor.toLowerCase().includes(busca);
      }
      return false;
    });
  });
}

// Calcular total
function calcularTotal(array, campo = "valor") {
  return array.reduce((total, item) => {
    const quantidade = item.quantidade || 1;
    const valor = parseFloat(item[campo]) || 0;
    return total + valor * quantidade;
  }, 0);
}

// Agrupar por categoria
function agruparPorCategoria(itens) {
  return itens.reduce((grupos, item) => {
    const categoria = item.categoriaId || "sem-categoria";
    if (!grupos[categoria]) {
      grupos[categoria] = [];
    }
    grupos[categoria].push(item);
    return grupos;
  }, {});
}

// Obter cores para gráficos
function obterCoresGraficos(quantidade) {
  const cores = [
    "#10b981",
    "#3b82f6",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#ec4899",
    "#14b8a6",
    "#f97316",
    "#06b6d4",
    "#84cc16",
  ];

  const resultado = [];
  for (let i = 0; i < quantidade; i++) {
    resultado.push(cores[i % cores.length]);
  }
  return resultado;
}

// Salvar no localStorage
function salvarLocalStorage(chave, valor) {
  try {
    localStorage.setItem(chave, JSON.stringify(valor));
    return true;
  } catch (e) {
    console.error("Erro ao salvar no localStorage:", e);
    return false;
  }
}

// Obter do localStorage
function obterLocalStorage(chave, padrao = null) {
  try {
    const valor = localStorage.getItem(chave);
    return valor ? JSON.parse(valor) : padrao;
  } catch (e) {
    console.error("Erro ao obter do localStorage:", e);
    return padrao;
  }
}

// Limpar localStorage
function limparLocalStorage() {
  try {
    localStorage.clear();
    return true;
  } catch (e) {
    console.error("Erro ao limpar localStorage:", e);
    return false;
  }
}

// Copiar para clipboard
async function copiarParaClipboard(texto) {
  try {
    await navigator.clipboard.writeText(texto);
    mostrarToast("Copiado para a área de transferência!", "success");
    return true;
  } catch (e) {
    console.error("Erro ao copiar:", e);
    mostrarToast("Erro ao copiar", "error");
    return false;
  }
}

// Detectar dispositivo móvel
function isMobile() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent,
  );
}

// Detectar modo escuro do sistema
function detectarModoEscuroSistema() {
  return (
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );
}

// Aplicar tema
function aplicarTema(isDark) {
  if (isDark) {
    document.body.classList.add("dark-mode");
  } else {
    document.body.classList.remove("dark-mode");
  }
  atualizarIconeTema(isDark);
  salvarLocalStorage("darkMode", isDark);
}

// Toggle tema
function toggleTema() {
  const isDark = document.body.classList.contains("dark-mode");
  aplicarTema(!isDark);
}

// Inicializar tema
function inicializarTema() {
  const temaSalvo = obterLocalStorage("darkMode");
  const isDark = temaSalvo !== null ? temaSalvo : detectarModoEscuroSistema();
  aplicarTema(isDark);
}

function atualizarIconeTema(isDark) {
  const toggleBtn = document.getElementById("toggleThemeBtn");
  if (!toggleBtn) return;

  toggleBtn.innerHTML = isDark
    ? '<i class="fas fa-sun" aria-hidden="true"></i>'
    : '<i class="fas fa-moon" aria-hidden="true"></i>';
  toggleBtn.setAttribute(
    "aria-label",
    isDark ? "Alternar para tema claro" : "Alternar para tema escuro",
  );
}

// Confirmar ação
function confirmarAcao(mensagem) {
  return confirm(mensagem);
}

// Carregar componente HTML
async function carregarComponente(url, elementoId) {
  try {
    const response = await fetch(url);
    const html = await response.text();
    const elemento = document.getElementById(elementoId);
    if (elemento) {
      elemento.innerHTML = html;
    }
  } catch (e) {
    console.error("Erro ao carregar componente:", e);
  }
}

// Inicializar navbar
function inicializarNavbar() {
  const homeHref = pathToHome();
  const categoriasHref = IS_PAGES_DIR
    ? "categorias.html"
    : "pages/categorias.html";
  const itensHref = IS_PAGES_DIR ? "itens.html" : "pages/itens.html";
  const estatisticasHref = IS_PAGES_DIR
    ? "estatisticas.html"
    : "pages/estatisticas.html";
  const configuracoesHref = IS_PAGES_DIR
    ? "configuracoes.html"
    : "pages/configuracoes.html";

  // Adicionar navbar
  const navbarHtml = `
    <nav class="main-nav">
      <div class="nav-container">
        <a href="${homeHref}" class="nav-brand" aria-label="Ir para a página inicial">
          <i class="fas fa-shopping-cart"></i>
          <span>Lista de Compras</span>
        </a>
        <button class="nav-toggle" aria-label="Abrir menu" aria-expanded="false">
          <i class="fas fa-bars"></i>
        </button>
        <ul class="nav-menu">
          <li class="nav-item">
            <a href="${homeHref}" class="nav-link">
              <i class="fas fa-home"></i>
              <span>Home</span>
            </a>
          </li>
          <li class="nav-item">
            <a href="${categoriasHref}" class="nav-link">
              <i class="fas fa-tags"></i>
              <span>Categorias</span>
            </a>
          </li>
          <li class="nav-item">
            <a href="${itensHref}" class="nav-link">
              <i class="fas fa-list"></i>
              <span>Itens</span>
            </a>
          </li>
          <li class="nav-item">
            <a href="${estatisticasHref}" class="nav-link">
              <i class="fas fa-chart-pie"></i>
              <span>Estatísticas</span>
            </a>
          </li>
          <li class="nav-item">
            <a href="${configuracoesHref}" class="nav-link">
              <i class="fas fa-cog"></i>
              <span>Configurações</span>
            </a>
          </li>
        </ul>
      </div>
    </nav>
  `;

  document.body.insertAdjacentHTML("afterbegin", navbarHtml);

  // Ativar link atual
  const currentPath = window.location.pathname;
  const currentPage = currentPath.split("/").pop();
  const links = document.querySelectorAll(".nav-link");
  links.forEach((link) => {
    const href = link.getAttribute("href");
    if (
      href === currentPath ||
      href === currentPage ||
      (currentPath === "/" &&
        (href === "index.html" || href === "home.html" || href === "/"))
    ) {
      link.classList.add("active");
    }
  });

  // Toggle menu mobile
  const navToggle = document.querySelector(".nav-toggle");
  const navMenu = document.querySelector(".nav-menu");

  if (navToggle && navMenu) {
    navToggle.addEventListener("click", () => {
      const isOpen = navMenu.classList.toggle("active");
      navToggle.setAttribute("aria-expanded", String(isOpen));
      navToggle.setAttribute("aria-label", isOpen ? "Fechar menu" : "Abrir menu");
    });

    links.forEach((link) => {
      link.addEventListener("click", (event) => {
        const href = link.getAttribute("href");
        if (!href) return;

        const target = new URL(href, window.location.href);
        const samePage = target.pathname === window.location.pathname;
        if (samePage) {
          event.preventDefault();
          navMenu.classList.remove("active");
          navToggle.setAttribute("aria-expanded", "false");
          navToggle.setAttribute("aria-label", "Abrir menu");
          return;
        }

        event.preventDefault();
        document.body.classList.add("page-transitioning");
        link.classList.add("is-loading");
        setTimeout(() => {
          window.location.href = href;
        }, 140);
      });
    });

    document.addEventListener("click", (event) => {
      const clickedInsideMenu = navMenu.contains(event.target);
      const clickedToggle = navToggle.contains(event.target);
      if (!clickedInsideMenu && !clickedToggle && navMenu.classList.contains("active")) {
        navMenu.classList.remove("active");
        navToggle.setAttribute("aria-expanded", "false");
        navToggle.setAttribute("aria-label", "Abrir menu");
      }
    });
  }
}

// Executar callback quando o DOM estiver pronto
function onDomReady(callback) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", callback, { once: true });
    return;
  }
  callback();
}

// Inicialização padrão para páginas internas
function initPageBase(options = {}) {
  const {
    withNavbar = true,
    withTheme = true,
    bindThemeToggle = true,
    themeToggleId = "toggleThemeBtn",
    onThemeToggled = null,
  } = options;

  if (withNavbar) {
    inicializarNavbar();
  }
  if (withTheme) {
    inicializarTema();
  }

  if (!bindThemeToggle) return;

  const toggleBtn = document.getElementById(themeToggleId);
  if (!toggleBtn) return;

  toggleBtn.addEventListener("click", () => {
    toggleTema();
    if (typeof onThemeToggled === "function") {
      onThemeToggled(document.body.classList.contains("dark-mode"));
    }
  });
}

// Helper para bind por id sem quebrar quando elemento não existe
function bindEventById(id, eventName, handler, options) {
  const element = document.getElementById(id);
  if (!element) return null;
  element.addEventListener(eventName, handler, options);
  return element;
}

// Setup padrão de modal (botão fechar + clique no backdrop)
function setupModalBehavior(modalId, onClose, closeSelector = ".close") {
  const modal = document.getElementById(modalId);
  if (!modal) return;

  const closeButton = modal.querySelector(closeSelector);
  if (closeButton) {
    closeButton.addEventListener("click", onClose);
  }

  window.addEventListener("click", (event) => {
    if (event.target === modal) {
      onClose();
    }
  });
}

// Converter snapshot do Firestore para lista de objetos
function snapshotToArray(snapshot) {
  const records = [];
  snapshot.forEach((doc) => {
    records.push({ id: doc.id, ...doc.data() });
  });
  return records;
}

// ... Bloco de exportação removido para uso no navegador ...
