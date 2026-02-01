// Utilitários e funções auxiliares

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
  return new Intl.DateFormat("pt-BR", {
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
  salvarLocalStorage("darkMode", isDark);
}

// Toggle tema
function toggleTema() {
  const isDark = document.body.classList.contains("dark-mode");
  aplicarTema(!isDark);

  // Atualizar ícone do botão
  const toggleBtn = document.getElementById("toggleThemeBtn");
  if (toggleBtn) {
    toggleBtn.innerHTML = isDark
      ? '<i class="fas fa-moon"></i>'
      : '<i class="fas fa-sun"></i>';
  }
}

// Inicializar tema
function inicializarTema() {
  const temaSalvo = obterLocalStorage("darkMode");
  const isDark = temaSalvo !== null ? temaSalvo : detectarModoEscuroSistema();
  aplicarTema(isDark);
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
  // Adicionar navbar
  const navbarHtml = `
    <nav class="main-nav">
      <div class="nav-container">
        <div class="nav-brand">
          <i class="fas fa-shopping-cart"></i>
          <span>Lista de Compras</span>
        </div>
        <button class="nav-toggle" aria-label="Toggle menu">
          <i class="fas fa-bars"></i>
        </button>
        <ul class="nav-menu">
          <li class="nav-item">
            <a href="/index.html" class="nav-link">
              <i class="fas fa-home"></i>
              <span>Home</span>
            </a>
          </li>
          <li class="nav-item">
            <a href="/pages/categorias.html" class="nav-link">
              <i class="fas fa-tags"></i>
              <span>Categorias</span>
            </a>
          </li>
          <li class="nav-item">
            <a href="/pages/itens.html" class="nav-link">
              <i class="fas fa-list"></i>
              <span>Itens</span>
            </a>
          </li>
          <li class="nav-item">
            <a href="/pages/estatisticas.html" class="nav-link">
              <i class="fas fa-chart-pie"></i>
              <span>Estatísticas</span>
            </a>
          </li>
          <li class="nav-item">
            <a href="/pages/configuracoes.html" class="nav-link">
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
  const links = document.querySelectorAll(".nav-link");
  links.forEach((link) => {
    if (
      link.getAttribute("href") === currentPath ||
      (currentPath === "/" && link.getAttribute("href") === "/index.html")
    ) {
      link.classList.add("active");
    }
  });

  // Toggle menu mobile
  const navToggle = document.querySelector(".nav-toggle");
  const navMenu = document.querySelector(".nav-menu");

  if (navToggle && navMenu) {
    navToggle.addEventListener("click", () => {
      navMenu.classList.toggle("active");
    });

    // Fechar menu ao clicar em link
    links.forEach((link) => {
      link.addEventListener("click", () => {
        navMenu.classList.remove("active");
      });
    });
  }
}

// Export para uso como módulo (se necessário)
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    debounce,
    sanitizeInput,
    validateInput,
    formatarReal,
    formatarData,
    mostrarToast,
    gerarId,
    ordenarArray,
    filtrarArray,
    calcularTotal,
    agruparPorCategoria,
    obterCoresGraficos,
    salvarLocalStorage,
    obterLocalStorage,
    limparLocalStorage,
    copiarParaClipboard,
    isMobile,
    detectarModoEscuroSistema,
    aplicarTema,
    toggleTema,
    inicializarTema,
    confirmarAcao,
    carregarComponente,
    inicializarNavbar,
  };
}
