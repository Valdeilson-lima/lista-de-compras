let categorias = [];
let itens = [];
let categoriaEditando = null;
let userIdAtual = "";
let mobileStateInitialized = false;

onDomReady(() => {
  initPageBase();

  bindEventById("categoriaForm", "submit", adicionarCategoria);
  bindEventById("saveBtn", "click", salvarEdicao);
  bindEventById("deleteBtn", "click", excluirCategoria);
  bindEventById("toggleCategoriaFormBtn", "click", () => toggleNovaCategoriaCard());
  bindEventById("mobileOpenCategoriaFormBtn", "click", abrirFormularioCategoria);
  setupModalBehavior("editModal", fecharModal);

  inicializarDadosCategorias();
});

async function inicializarDadosCategorias() {
  if (typeof verificarAutenticacao !== "function") {
    mostrarToast("Falha ao validar autenticação", "error");
    return;
  }

  const user = await verificarAutenticacao();
  if (!user) return;

  userIdAtual = user.uid;
  await prepararContextoListas(userIdAtual);
  carregarCategorias(user.uid);
  carregarItens(user.uid);
}

function carregarCategorias(userId) {
  if (!db) {
    mostrarToast("Erro ao conectar com o banco de dados", "error");
    return;
  }

  if (!userId) return;

  db.collection("categorias")
    .where("userId", "==", userId)
    .onSnapshot(
      (snapshot) => {
        categorias = filtrarRegistrosPorListaAtiva(snapshotToArray(snapshot), userIdAtual).sort((a, b) =>
          String(a.nome || "").localeCompare(String(b.nome || ""), "pt-BR"),
        );
        ajustarEstadoInicialMobile();
        renderizarCategorias();
      },
      (error) => {
        console.error("Erro ao carregar categorias:", error);
        mostrarToast(
          "Erro ao carregar categorias. Verifique índice/regra do Firestore.",
          "error",
        );
      },
    );
}

function carregarItens(userId) {
  if (!db || !userId) return;

  db.collection("itens")
    .where("userId", "==", userId)
    .onSnapshot(
      (snapshot) => {
        itens = filtrarRegistrosPorListaAtiva(snapshotToArray(snapshot), userIdAtual);
        renderizarCategorias();
      },
      (error) => {
        console.error("Erro ao carregar itens de categorias:", error);
        mostrarToast("Erro ao carregar itens das categorias", "error");
      },
    );
}

function obterResumoPorCategoria() {
  return itens.reduce((acc, item) => {
    const categoriaId = item.categoriaId || "sem-categoria";
    const quantidade = parsePositiveInt(item.quantidade, 1);
    const valor = parseNonNegativeNumber(item.valor, 0);

    if (!acc[categoriaId]) {
      acc[categoriaId] = { totalItens: 0, totalGasto: 0 };
    }

    acc[categoriaId].totalItens += 1;
    acc[categoriaId].totalGasto += quantidade * valor;
    return acc;
  }, {});
}

function renderizarCategorias() {
  const container = document.getElementById("categoriasList");
  if (!container) return;

  const resumoPorCategoria = obterResumoPorCategoria();
  atualizarResumoGeral(resumoPorCategoria);

  if (categorias.length === 0) {
    container.innerHTML = `
      <div class="empty-state empty-state-full">
        <i class="fas fa-folder-open fa-3x"></i>
        <p>Nenhuma categoria cadastrada ainda</p>
      </div>
    `;
    return;
  }

  container.innerHTML = categorias
    .map((categoria) => {
      const resumo = resumoPorCategoria[categoria.id] || { totalItens: 0, totalGasto: 0 };
      const totalItens = resumo.totalItens;
      const totalGasto = resumo.totalGasto;
      const orcamento = parseNonNegativeNumber(categoria.orcamento, 0);
      const percentual = orcamento > 0 ? (totalGasto / orcamento) * 100 : 0;

      let barClass = "";
      let statusTexto = "Sob controle";
      if (orcamento === 0) {
        statusTexto = "Sem orçamento";
      } else if (percentual >= 100) {
        barClass = "danger";
        statusTexto = "Orçamento estourado";
      } else if (percentual >= 80) {
        barClass = "warning";
        statusTexto = "Próximo do limite";
      }

      return `
        <div class="categoria-card" data-id="${categoria.id}">
          <div class="categoria-header">
            <i class="fas fa-tag"></i>
            <h3>${sanitizeInput(categoria.nome)}</h3>
          </div>
          <div class="categoria-info">
            <div class="info-item">
              <span class="info-label">Itens:</span>
              <span class="info-value">${totalItens}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Gasto:</span>
              <span class="info-value">${formatarReal(totalGasto)}</span>
            </div>
            ${
              orcamento > 0
                ? `
              <div class="info-item">
                <span class="info-label">Orçamento:</span>
                <span class="info-value">${formatarReal(orcamento)}</span>
              </div>
              <div class="progress-bar-container">
                <div class="progress-bar ${barClass}" style="width: ${Math.min(percentual, 100)}%"></div>
              </div>
              <div class="percentual-text">${percentual.toFixed(0)}% utilizado</div>
            `
                : ""
            }
            <span class="categoria-status ${barClass}">${statusTexto}</span>
          </div>
          <div class="categoria-actions">
            <button class="btn btn-secondary btn-icon" onclick="editarCategoria('${categoria.id}')" title="Editar">
              <i class="fas fa-edit"></i>
            </button>
          </div>
        </div>
      `;
    })
    .join("");
}

function atualizarResumoGeral(resumoPorCategoria) {
  const totalCategorias = categorias.length;
  const totalItens = Object.values(resumoPorCategoria).reduce(
    (acc, categoria) => acc + categoria.totalItens,
    0,
  );
  const totalGasto = Object.values(resumoPorCategoria).reduce(
    (acc, categoria) => acc + categoria.totalGasto,
    0,
  );

  const statsCategorias = document.getElementById("statsCategorias");
  const statsItens = document.getElementById("statsItens");
  const statsGasto = document.getElementById("statsGasto");

  if (statsCategorias) statsCategorias.textContent = String(totalCategorias);
  if (statsItens) statsItens.textContent = String(totalItens);
  if (statsGasto) statsGasto.textContent = formatarReal(totalGasto);
}

async function adicionarCategoria(event) {
  event.preventDefault();

  const nome = (document.getElementById("categoriaNome")?.value || "").trim();
  const orcamento = parseNonNegativeNumber(
    document.getElementById("categoriaOrcamento")?.value,
    0,
  );

  if (!validateInput(nome, "categoria")) {
    mostrarToast("Digite um nome válido (máx. 50 caracteres)", "warning");
    return;
  }

  const userId = obterUserId();
  if (!userId) return;

  try {
    await db.collection("categorias").add(
      anexarListaAtivaEmDados(
        {
          nome,
          orcamento,
          userId,
          dataCriacao: new Date().toISOString(),
        },
        userId,
      ),
    );

    document.getElementById("categoriaForm")?.reset();
    expandirNovaCategoriaCard();
    mostrarToast("Categoria adicionada com sucesso!", "success");
  } catch (error) {
    console.error("Erro ao adicionar categoria:", error);
    mostrarToast("Erro ao adicionar categoria", "error");
  }
}

function editarCategoria(categoriaId) {
  categoriaEditando = categorias.find((categoria) => categoria.id === categoriaId);
  if (!categoriaEditando) return;

  document.getElementById("editCategoriaNome").value = categoriaEditando.nome || "";
  document.getElementById("editCategoriaOrcamento").value = String(
    parseNonNegativeNumber(categoriaEditando.orcamento, 0),
  );
  document.getElementById("editModal").classList.add("active");
}

async function salvarEdicao() {
  if (!categoriaEditando) return;

  const nome = (document.getElementById("editCategoriaNome")?.value || "").trim();
  const orcamento = parseNonNegativeNumber(
    document.getElementById("editCategoriaOrcamento")?.value,
    0,
  );

  if (!validateInput(nome, "categoria")) {
    mostrarToast("Digite um nome válido (máx. 50 caracteres)", "warning");
    return;
  }

  try {
    await db.collection("categorias").doc(categoriaEditando.id).update({
      nome,
      orcamento,
    });

    mostrarToast("Categoria atualizada!", "success");
    fecharModal();
  } catch (error) {
    console.error("Erro ao atualizar categoria:", error);
    mostrarToast("Erro ao atualizar categoria", "error");
  }
}

async function excluirCategoria() {
  if (!categoriaEditando) return;

  if (
    !confirmarAcao(
      "Tem certeza que deseja excluir esta categoria? Todos os itens vinculados também serão excluídos.",
    )
  ) {
    return;
  }

  try {
    const itensDaCategoria = await db
      .collection("itens")
      .where("userId", "==", userIdAtual)
      .where("categoriaId", "==", categoriaEditando.id)
      .get();

    const categoriaSnapshot = { ...categoriaEditando };
    const itensSnapshot = [];
    itensDaCategoria.forEach((doc) => {
      itensSnapshot.push({ id: doc.id, ...doc.data() });
    });

    const batch = db.batch();
    itensDaCategoria.forEach((doc) => batch.delete(doc.ref));
    batch.delete(db.collection("categorias").doc(categoriaEditando.id));

    await batch.commit();

    mostrarToast("Categoria excluída.", "success", {
      duration: 7000,
      actionLabel: "Desfazer",
      onAction: async () => {
        const restoreBatch = db.batch();
        const { id, ...categoriaData } = categoriaSnapshot;
        restoreBatch.set(db.collection("categorias").doc(id), categoriaData);
        itensSnapshot.forEach((item) => {
          const { id: itemId, ...itemData } = item;
          restoreBatch.set(db.collection("itens").doc(itemId), itemData);
        });
        await restoreBatch.commit();
        mostrarToast("Categoria restaurada.", "success");
      },
    });
    fecharModal();
  } catch (error) {
    console.error("Erro ao excluir categoria:", error);
    mostrarToast("Erro ao excluir categoria", "error");
  }
}

function fecharModal() {
  document.getElementById("editModal").classList.remove("active");
  categoriaEditando = null;
}

function isMobileViewport() {
  return window.matchMedia("(max-width: 768px)").matches;
}

function ajustarEstadoInicialMobile() {
  if (mobileStateInitialized || !isMobileViewport()) return;
  if (categorias.length > 0) {
    toggleNovaCategoriaCard(true);
  }
  mobileStateInitialized = true;
}

function toggleNovaCategoriaCard(forceCollapsed = null) {
  const card = document.getElementById("novaCategoriaCard");
  const toggleBtn = document.getElementById("toggleCategoriaFormBtn");
  if (!card || !toggleBtn) return;

  const collapsedAtual = card.classList.contains("is-collapsed");
  const novoEstado = forceCollapsed === null ? !collapsedAtual : Boolean(forceCollapsed);

  card.classList.toggle("is-collapsed", novoEstado);
  toggleBtn.setAttribute("aria-expanded", String(!novoEstado));
  toggleBtn.innerHTML = novoEstado
    ? '<i class="fas fa-chevron-down" aria-hidden="true"></i> Mostrar'
    : '<i class="fas fa-chevron-up" aria-hidden="true"></i> Ocultar';
}

function expandirNovaCategoriaCard() {
  toggleNovaCategoriaCard(false);
}

function abrirFormularioCategoria() {
  expandirNovaCategoriaCard();
  const card = document.getElementById("novaCategoriaCard");
  if (card) {
    card.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  const nomeInput = document.getElementById("categoriaNome");
  if (nomeInput) {
    setTimeout(() => nomeInput.focus(), 180);
  }
}
