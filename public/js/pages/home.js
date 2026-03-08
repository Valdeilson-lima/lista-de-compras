let dashboardCategorias = [];
let dashboardItens = [];
let userIdAtual = "";
let listasUsuario = [];

onDomReady(() => {
  initPageBase();
  inicializarDashboard();
});

async function inicializarDashboard() {
  if (!db) {
    mostrarToast("Erro ao conectar com o banco de dados", "error");
    return;
  }

  if (typeof verificarAutenticacao !== "function") {
    mostrarToast("Falha ao validar autenticação", "error");
    return;
  }

  const user = await verificarAutenticacao();
  userIdAtual = user?.uid || "";
  if (!userIdAtual) return;

  const contextoListas = await prepararContextoListas(userIdAtual);
  listasUsuario = contextoListas.listas || [];
  atualizarNomeListaAtiva();

  db.collection("categorias")
    .where("userId", "==", userIdAtual)
    .onSnapshot(
      (snapshot) => {
        dashboardCategorias = filtrarRegistrosPorListaAtiva(
          snapshotToArray(snapshot),
          userIdAtual,
        ).sort(
          ordenarPorDataCriacaoDesc,
        );
        renderDashboard();
      },
      (error) => {
        console.error("Erro ao carregar categorias:", error);
        mostrarToast("Falha ao carregar categorias", "error");
      },
    );

  db.collection("itens")
    .where("userId", "==", userIdAtual)
    .onSnapshot(
      (snapshot) => {
        dashboardItens = filtrarRegistrosPorListaAtiva(
          snapshotToArray(snapshot),
          userIdAtual,
        ).sort(ordenarPorDataCriacaoDesc);
        renderDashboard();
      },
      (error) => {
        console.error("Erro ao carregar itens:", error);
        mostrarToast("Falha ao carregar itens", "error");
      },
    );
}

function atualizarNomeListaAtiva() {
  const listaAtivaEl = document.getElementById("activeListName");
  if (!listaAtivaEl || !userIdAtual) return;

  const listaAtivaId = obterListaAtivaIdUsuario(userIdAtual);
  const listaAtiva = listasUsuario.find((lista) => lista.id === listaAtivaId);
  listaAtivaEl.textContent = `Lista ativa: ${listaAtiva?.nome || "Lista Principal"}`;
}

function ordenarPorDataCriacaoDesc(a, b) {
  const dataA = Date.parse(a?.dataCriacao || 0) || 0;
  const dataB = Date.parse(b?.dataCriacao || 0) || 0;
  return dataB - dataA;
}

function renderDashboard() {
  atualizarSaudacao();
  atualizarCardsResumo();
  atualizarProgresso();
  atualizarMensagemContexto();
  renderizarCategoriasRecentes(dashboardCategorias.slice(0, 6));
  renderizarItensRecentes(dashboardItens.slice(0, 5));
}

function atualizarSaudacao() {
  const welcomeText = document.getElementById("welcomeText");
  if (!welcomeText) return;

  const hour = new Date().getHours();
  let periodo = "Bom dia";
  if (hour >= 12 && hour < 18) periodo = "Boa tarde";
  if (hour >= 18 || hour < 5) periodo = "Boa noite";

  const user = typeof obterUsuarioAtual === "function" ? obterUsuarioAtual() : null;
  const firstName = user?.displayName ? user.displayName.split(" ")[0] : "";
  welcomeText.textContent = firstName
    ? `${periodo}, ${sanitizeInput(firstName)}!`
    : `${periodo}!`;
}

function atualizarCardsResumo() {
  const totalCategorias = dashboardCategorias.length;
  const totalItens = dashboardItens.length;
  const totalComprados = dashboardItens.filter((item) => item.comprado).length;

  const totalGeral = dashboardItens.reduce((acc, item) => {
    const quantidade = Number(item.quantidade) || 1;
    const valor = Number(item.valor) || 0;
    return acc + quantidade * valor;
  }, 0);

  atualizarTexto("totalCategorias", String(totalCategorias));
  atualizarTexto("totalItens", String(totalItens));
  atualizarTexto("totalComprados", String(totalComprados));
  atualizarTexto("totalGeral", formatarReal(totalGeral));
}

function atualizarTexto(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function atualizarProgresso() {
  const totalItens = dashboardItens.length;
  const comprados = dashboardItens.filter((item) => item.comprado).length;
  const restantes = Math.max(totalItens - comprados, 0);
  const percent = totalItens > 0 ? Math.round((comprados / totalItens) * 100) : 0;

  const valorRestante = dashboardItens
    .filter((item) => !item.comprado)
    .reduce((acc, item) => {
      const qtd = Number(item.quantidade) || 1;
      const valor = Number(item.valor) || 0;
      return acc + qtd * valor;
    }, 0);

  atualizarTexto("progressPercent", `${percent}%`);
  atualizarTexto("progressDetail", `${comprados} de ${totalItens} itens comprados`);
  atualizarTexto("itensRestantes", `${restantes} ${restantes === 1 ? "item" : "itens"}`);
  atualizarTexto("valorRestante", formatarReal(valorRestante));
  atualizarTexto("statusResumo", statusDaLista(percent, totalItens));

  const progressFill = document.getElementById("progressFill");
  if (progressFill) {
    progressFill.style.width = `${percent}%`;
  }
}

function statusDaLista(percent, totalItens) {
  if (totalItens === 0) return "Começando";
  if (percent === 100) return "Finalizada";
  if (percent >= 70) return "Quase lá";
  if (percent >= 30) return "Em andamento";
  return "Iniciada";
}

function atualizarMensagemContexto() {
  const hint = document.getElementById("dashboardHint");
  if (!hint) return;

  if (dashboardCategorias.length === 0) {
    hint.textContent = "Comece criando uma categoria para organizar suas compras.";
    return;
  }

  if (dashboardItens.length === 0) {
    hint.textContent = "Agora adicione os primeiros itens da sua lista.";
    return;
  }

  const comprados = dashboardItens.filter((item) => item.comprado).length;
  const restantes = dashboardItens.length - comprados;
  if (restantes === 0) {
    hint.textContent = "Lista concluída! Revise estatísticas ou planeje a próxima compra.";
    return;
  }

  hint.textContent = `Você tem ${restantes} ${restantes === 1 ? "item pendente" : "itens pendentes"} hoje.`;
}

function renderizarCategoriasRecentes(categorias) {
  const container = document.getElementById("recentCategories");
  if (!container) return;

  if (categorias.length === 0) {
    container.innerHTML = `
      <div class="empty-state empty-state-compact empty-state-full">
        <i class="fas fa-folder-open fa-2x"></i>
        <p>Nenhuma categoria cadastrada ainda</p>
      </div>
    `;
    return;
  }

  container.innerHTML = categorias
    .map(
      (cat) => `
        <article class="category-preview-card">
          <header class="category-preview-header">
            <i class="fas fa-tag" aria-hidden="true"></i>
            <h3>${sanitizeInput(cat.nome)}</h3>
          </header>
          ${
            cat.orcamento
              ? `<p class="category-preview-budget">Orçamento: ${formatarReal(cat.orcamento)}</p>`
              : `<p class="category-preview-budget category-preview-budget-empty">Sem orçamento definido</p>`
          }
        </article>
      `,
    )
    .join("");
}

function renderizarItensRecentes(itens) {
  const container = document.getElementById("recentItems");
  if (!container) return;

  if (itens.length === 0) {
    container.innerHTML = `
      <div class="empty-state empty-state-compact">
        <i class="fas fa-clipboard-list fa-2x"></i>
        <p>Nenhum item cadastrado ainda</p>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="recent-items-list">
      ${itens
        .map((item) => {
          const quantidade = Number(item.quantidade) || 1;
          const valor = Number(item.valor) || 0;
          const totalItem = valor * quantidade;
          const compradoClass = item.comprado ? "is-comprado" : "";

          return `
            <article class="item-preview ${compradoClass}">
              <div class="item-preview-main">
                <i class="fas fa-${item.comprado ? "check-circle" : "circle"}" aria-hidden="true"></i>
                <div class="item-preview-info">
                  <p class="item-preview-name">${sanitizeInput(item.nome)}</p>
                  <p class="item-preview-meta">Qtd: ${quantidade}</p>
                </div>
              </div>
              <strong class="item-preview-price">${formatarReal(totalItem)}</strong>
            </article>
          `;
        })
        .join("")}
    </div>
  `;
}
