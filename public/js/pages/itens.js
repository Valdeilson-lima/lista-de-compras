let categorias = [];
let itens = [];
let itemEditando = null;
let carregamentoInicial = true;
let salvandoNovoItem = false;
let mobileStateInitialized = false;
let userIdAtual = "";

const filtros = {
  searchTerm: "",
  categoriaId: "",
  status: "",
  sortBy: "nome",
};

onDomReady(() => {
  initPageBase();

  bindEventById("itemForm", "submit", adicionarItem);
  bindEventById("searchInput", "input", debounce(aplicarFiltros, 250));
  bindEventById("categoriaFiltro", "change", aplicarFiltros);
  bindEventById("statusFiltro", "change", aplicarFiltros);
  bindEventById("sortSelect", "change", aplicarFiltros);
  bindEventById("clearCompradosBtn", "click", limparComprados);
  bindEventById("saveBtn", "click", salvarEdicao);
  bindEventById("deleteBtn", "click", excluirItem);
  bindEventById("itemQuantidade", "input", atualizarSubtotalNovoItem);
  bindEventById("itemValor", "input", atualizarSubtotalNovoItem);
  bindEventById("editItemQuantidade", "input", atualizarSubtotal);
  bindEventById("editItemValor", "input", atualizarSubtotal);
  bindEventById("toggleItemFormBtn", "click", () => toggleNovoItemCard());
  bindEventById("mobileOpenFormBtn", "click", abrirFormularioNovoItem);
  bindEventById("mobileOpenFiltersBtn", "click", () =>
    scrollParaElemento("filtrosCard"),
  );

  setupModalBehavior("editModal", fecharModal);
  renderizarLoadingItens();
  atualizarSubtotalNovoItem();
  inicializarDadosItens();
});

async function inicializarDadosItens() {
  if (typeof verificarAutenticacao !== "function") {
    mostrarToast("Falha ao validar autenticação", "error");
    return;
  }

  const user = await verificarAutenticacao();
  if (!user) return;

  userIdAtual = user.uid;
  await prepararContextoListas(userIdAtual);
  carregarCategorias(userIdAtual);
  carregarItens(userIdAtual);
}

function carregarCategorias(userId) {
  if (!db || !userId) return;

  db.collection("categorias")
    .where("userId", "==", userId)
    .onSnapshot(
      (snapshot) => {
        categorias = filtrarRegistrosPorListaAtiva(snapshotToArray(snapshot), userIdAtual).sort((a, b) =>
          String(a.nome || "").localeCompare(String(b.nome || ""), "pt-BR"),
        );
        atualizarSelectCategorias();
        aplicarFiltros();
      },
      (error) => {
        console.error("Erro ao carregar categorias:", error);
        mostrarToast("Erro ao carregar categorias", "error");
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
        carregamentoInicial = false;
        ajustarEstadoInicialMobile();
        aplicarFiltros();
        atualizarEstatisticas();
      },
      (error) => {
        console.error("Erro ao carregar itens:", error);
        mostrarToast("Erro ao carregar itens", "error");
      },
    );
}

function atualizarSelectCategorias() {
  const itemCategoria = document.getElementById("itemCategoria");
  const editItemCategoria = document.getElementById("editItemCategoria");
  const categoriaFiltro = document.getElementById("categoriaFiltro");

  atualizarSelect(itemCategoria, "Selecione a categoria");
  atualizarSelect(editItemCategoria, "Selecione a categoria");
  atualizarSelect(categoriaFiltro, "Todas as categorias");
}

function atualizarSelect(select, labelPadrao) {
  if (!select) return;

  const valorAtual = select.value;
  const opcoes = categorias
    .map(
      (categoria) =>
        `<option value="${categoria.id}">${sanitizeInput(categoria.nome)}</option>`,
    )
    .join("");

  select.innerHTML = `<option value="">${labelPadrao}</option>${opcoes}`;

  if (valorAtual && [...select.options].some((option) => option.value === valorAtual)) {
    select.value = valorAtual;
  }
}

function aplicarFiltros() {
  const searchInput = document.getElementById("searchInput");
  const categoriaFiltro = document.getElementById("categoriaFiltro");
  const statusFiltro = document.getElementById("statusFiltro");
  const sortSelect = document.getElementById("sortSelect");

  filtros.searchTerm = (searchInput?.value || "").trim().toLowerCase();
  filtros.categoriaId = categoriaFiltro?.value || "";
  filtros.status = statusFiltro?.value || "";
  filtros.sortBy = sortSelect?.value || "nome";

  let itensFiltrados = [...itens];

  if (filtros.searchTerm) {
    itensFiltrados = itensFiltrados.filter((item) =>
      String(item.nome || "").toLowerCase().includes(filtros.searchTerm),
    );
  }

  if (filtros.categoriaId) {
    itensFiltrados = itensFiltrados.filter(
      (item) => item.categoriaId === filtros.categoriaId,
    );
  }

  if (filtros.status === "comprado") {
    itensFiltrados = itensFiltrados.filter((item) => Boolean(item.comprado));
  } else if (filtros.status === "pendente") {
    itensFiltrados = itensFiltrados.filter((item) => !item.comprado);
  }

  ordenarItens(itensFiltrados, filtros.sortBy);
  renderizarItens(itensFiltrados);
}

function ordenarItens(lista, sortBy) {
  switch (sortBy) {
    case "nome-desc":
      lista.sort((a, b) => String(b.nome || "").localeCompare(String(a.nome || ""), "pt-BR"));
      break;
    case "subtotal":
      lista.sort((a, b) => calcularSubtotalItem(a) - calcularSubtotalItem(b));
      break;
    case "subtotal-desc":
      lista.sort((a, b) => calcularSubtotalItem(b) - calcularSubtotalItem(a));
      break;
    case "antigos":
      lista.sort((a, b) => obterTimestampCriacao(a) - obterTimestampCriacao(b));
      break;
    case "recentes":
      lista.sort((a, b) => obterTimestampCriacao(b) - obterTimestampCriacao(a));
      break;
    case "nome":
    default:
      lista.sort((a, b) => String(a.nome || "").localeCompare(String(b.nome || ""), "pt-BR"));
      break;
  }
}

function renderizarLoadingItens() {
  const container = document.getElementById("itensList");
  if (!container) return;

  container.innerHTML = `
    <div class="items-loading" aria-hidden="true">
      <div class="loading-line"></div>
      <div class="loading-line"></div>
      <div class="loading-line"></div>
    </div>
  `;
}

function renderizarItens(itensParaRenderizar) {
  const container = document.getElementById("itensList");
  if (!container) return;

  if (carregamentoInicial) {
    renderizarLoadingItens();
    return;
  }

  if (itensParaRenderizar.length === 0) {
    const haFiltroAtivo = filtros.searchTerm || filtros.categoriaId || filtros.status;
    const mensagem = haFiltroAtivo
      ? "Nenhum item encontrado com os filtros atuais"
      : "Nenhum item cadastrado ainda";

    container.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-clipboard-list fa-3x"></i>
        <p>${mensagem}</p>
      </div>
    `;
    return;
  }

  container.innerHTML = itensParaRenderizar
    .map((item) => {
      const categoria = categorias.find((cat) => cat.id === item.categoriaId);
      const quantidade = parsePositiveInt(item.quantidade, 1);
      const valor = parseNonNegativeNumber(item.valor, 0);
      const subtotal = quantidade * valor;
      const statusClass = item.comprado ? "status-comprado" : "status-pendente";
      const statusTexto = item.comprado ? "Comprado" : "Pendente";

      return `
        <div class="item-card ${item.comprado ? "comprado" : ""}" data-id="${item.id}">
          <div class="item-checkbox">
            <input
              type="checkbox"
              ${item.comprado ? "checked" : ""}
              onchange="toggleComprado('${item.id}', this.checked)"
              aria-label="Marcar item ${sanitizeInput(item.nome)} como comprado"
            >
          </div>
          <div class="item-content">
            <div class="item-nome">${sanitizeInput(item.nome)}</div>
            <div class="item-meta">
              <span class="badge badge-primary">
                <i class="fas fa-tag"></i> ${categoria ? sanitizeInput(categoria.nome) : "Sem categoria"}
              </span>
              <span class="item-quantidade">Qtd: ${quantidade}</span>
              <span class="item-status ${statusClass}">${statusTexto}</span>
            </div>
          </div>
          <div class="item-valor">
            ${formatarReal(subtotal)}
            ${quantidade > 1 ? `<small>(${formatarReal(valor)}/un)</small>` : ""}
          </div>
          <div class="item-actions">
            <button class="btn btn-secondary btn-icon" onclick="editarItem('${item.id}')" title="Editar">
              <i class="fas fa-edit"></i>
            </button>
          </div>
        </div>
      `;
    })
    .join("");
}

function atualizarEstatisticas() {
  const totalItens = itens.length;
  const totalComprados = itens.filter((item) => item.comprado).length;
  const totalValor = itens.reduce((total, item) => total + calcularSubtotalItem(item), 0);

  document.getElementById("totalItens").textContent = String(totalItens);
  document.getElementById("totalComprados").textContent = String(totalComprados);
  document.getElementById("totalValor").textContent = formatarReal(totalValor);
}

function atualizarSubtotalNovoItem() {
  const quantidade = parsePositiveInt(document.getElementById("itemQuantidade")?.value, 1);
  const valor = parseNonNegativeNumber(document.getElementById("itemValor")?.value, 0);
  const subtotal = quantidade * valor;

  const subtotalLabel = document.getElementById("novoItemSubtotal");
  if (subtotalLabel) {
    subtotalLabel.textContent = `Subtotal estimado: ${formatarReal(subtotal)}`;
  }
}

async function adicionarItem(event) {
  event.preventDefault();

  if (salvandoNovoItem) return;

  const submitBtn = document.querySelector("#itemForm button[type='submit']");
  const nome = (document.getElementById("itemNome")?.value || "").trim();
  const categoriaId = document.getElementById("itemCategoria")?.value || "";
  const quantidade = parsePositiveInt(document.getElementById("itemQuantidade")?.value, 1);
  const valor = parseNonNegativeNumber(document.getElementById("itemValor")?.value, 0);

  if (!validateInput(nome, "text")) {
    mostrarToast("Digite um nome válido (máx. 100 caracteres)", "warning");
    return;
  }

  if (!categoriaId) {
    mostrarToast("Selecione uma categoria", "warning");
    return;
  }

  const userId = userIdAtual || obterUserId();
  if (!userId) return;

  salvandoNovoItem = true;
  setBotaoCarregando(submitBtn, true, "Salvando...");

  try {
    await db.collection("itens").add(
      anexarListaAtivaEmDados(
        {
          nome,
          categoriaId,
          userId,
          quantidade,
          valor,
          comprado: false,
          dataCriacao: new Date().toISOString(),
        },
        userId,
      ),
    );

    document.getElementById("itemForm")?.reset();
    document.getElementById("itemQuantidade").value = "1";
    document.getElementById("itemValor").value = "0";
    expandirNovoItemCard();
    atualizarSubtotalNovoItem();
    mostrarToast("Item adicionado com sucesso!", "success");
  } catch (error) {
    console.error("Erro ao adicionar item:", error);
    mostrarToast("Erro ao adicionar item", "error");
  } finally {
    salvandoNovoItem = false;
    setBotaoCarregando(submitBtn, false, "Adicionar", "fas fa-plus");
  }
}

function editarItem(itemId) {
  itemEditando = itens.find((item) => item.id === itemId);
  if (!itemEditando) return;

  document.getElementById("editItemNome").value = itemEditando.nome || "";
  document.getElementById("editItemCategoria").value = itemEditando.categoriaId || "";
  document.getElementById("editItemQuantidade").value = String(
    parsePositiveInt(itemEditando.quantidade, 1),
  );
  document.getElementById("editItemValor").value = String(
    parseNonNegativeNumber(itemEditando.valor, 0),
  );
  atualizarSubtotal();
  document.getElementById("editModal").classList.add("active");
}

function atualizarSubtotal() {
  const quantidade = parsePositiveInt(document.getElementById("editItemQuantidade")?.value, 1);
  const valor = parseNonNegativeNumber(document.getElementById("editItemValor")?.value, 0);
  document.getElementById("editSubtotal").textContent = formatarReal(quantidade * valor);
}

async function salvarEdicao() {
  if (!itemEditando) return;

  const nome = (document.getElementById("editItemNome")?.value || "").trim();
  const categoriaId = document.getElementById("editItemCategoria")?.value || "";
  const quantidade = parsePositiveInt(document.getElementById("editItemQuantidade")?.value, 1);
  const valor = parseNonNegativeNumber(document.getElementById("editItemValor")?.value, 0);

  if (!validateInput(nome, "text")) {
    mostrarToast("Digite um nome válido (máx. 100 caracteres)", "warning");
    return;
  }

  if (!categoriaId) {
    mostrarToast("Selecione uma categoria", "warning");
    return;
  }

  try {
    await db.collection("itens").doc(itemEditando.id).update({
      nome,
      categoriaId,
      quantidade,
      valor,
    });

    mostrarToast("Item atualizado!", "success");
    fecharModal();
  } catch (error) {
    console.error("Erro ao atualizar item:", error);
    mostrarToast("Erro ao atualizar item", "error");
  }
}

async function excluirItem() {
  if (!itemEditando) return;

  if (!confirmarAcao("Tem certeza que deseja excluir este item?")) {
    return;
  }

  const itemSnapshot = { ...itemEditando };

  try {
    await db.collection("itens").doc(itemEditando.id).delete();
    mostrarToast("Item excluído.", "success", {
      duration: 6000,
      actionLabel: "Desfazer",
      onAction: async () => {
        const { id, ...dadosItem } = itemSnapshot;
        await db.collection("itens").doc(id).set(dadosItem);
        mostrarToast("Item restaurado.", "success");
      },
    });
    fecharModal();
  } catch (error) {
    console.error("Erro ao excluir item:", error);
    mostrarToast("Erro ao excluir item", "error");
  }
}

async function toggleComprado(itemId, comprado) {
  try {
    await db.collection("itens").doc(itemId).update({ comprado: Boolean(comprado) });
  } catch (error) {
    console.error("Erro ao atualizar item:", error);
    mostrarToast("Erro ao atualizar item", "error");
  }
}

async function limparComprados() {
  const comprados = itens.filter((item) => item.comprado);

  if (comprados.length === 0) {
    mostrarToast("Nenhum item comprado para limpar", "info");
    return;
  }

  if (!confirmarAcao(`Deseja remover ${comprados.length} item(ns) comprado(s)?`)) {
    return;
  }

  const itensRemovidos = comprados.map((item) => ({ ...item }));

  try {
    const batch = db.batch();
    comprados.forEach((item) => {
      batch.delete(db.collection("itens").doc(item.id));
    });
    await batch.commit();
    mostrarToast("Itens comprados removidos.", "success", {
      duration: 7000,
      actionLabel: "Desfazer",
      onAction: async () => {
        const restoreBatch = db.batch();
        itensRemovidos.forEach((item) => {
          const { id, ...dados } = item;
          restoreBatch.set(db.collection("itens").doc(id), dados);
        });
        await restoreBatch.commit();
        mostrarToast("Itens restaurados.", "success");
      },
    });
  } catch (error) {
    console.error("Erro ao limpar comprados:", error);
    mostrarToast("Erro ao limpar comprados", "error");
  }
}

function calcularSubtotalItem(item) {
  const quantidade = parsePositiveInt(item?.quantidade, 1);
  const valor = parseNonNegativeNumber(item?.valor, 0);
  return quantidade * valor;
}

function obterTimestampCriacao(item) {
  const timestamp = Date.parse(item?.dataCriacao || "");
  return Number.isFinite(timestamp) ? timestamp : 0;
}

function setBotaoCarregando(botao, carregando, texto, iconClass = "fas fa-spinner fa-spin") {
  if (!botao) return;

  botao.disabled = carregando;
  botao.innerHTML = carregando
    ? `<i class="fas fa-spinner fa-spin" aria-hidden="true"></i> ${texto}`
    : `<i class="${iconClass}" aria-hidden="true"></i> ${texto}`;
}

function fecharModal() {
  document.getElementById("editModal").classList.remove("active");
  itemEditando = null;
}

function isMobileViewport() {
  return window.matchMedia("(max-width: 768px)").matches;
}

function ajustarEstadoInicialMobile() {
  if (mobileStateInitialized || !isMobileViewport()) return;
  if (itens.length > 0) {
    toggleNovoItemCard(true);
  }
  mobileStateInitialized = true;
}

function toggleNovoItemCard(forceCollapsed = null) {
  const card = document.getElementById("novoItemCard");
  const toggleBtn = document.getElementById("toggleItemFormBtn");
  if (!card || !toggleBtn) return;

  const collapsedAtual = card.classList.contains("is-collapsed");
  const novoEstado = forceCollapsed === null ? !collapsedAtual : Boolean(forceCollapsed);

  card.classList.toggle("is-collapsed", novoEstado);
  toggleBtn.setAttribute("aria-expanded", String(!novoEstado));
  toggleBtn.innerHTML = novoEstado
    ? '<i class="fas fa-chevron-down" aria-hidden="true"></i> Mostrar'
    : '<i class="fas fa-chevron-up" aria-hidden="true"></i> Ocultar';
}

function expandirNovoItemCard() {
  toggleNovoItemCard(false);
}

function abrirFormularioNovoItem() {
  expandirNovoItemCard();
  scrollParaElemento("novoItemCard");
  const nomeInput = document.getElementById("itemNome");
  if (nomeInput) {
    setTimeout(() => nomeInput.focus(), 180);
  }
}

function scrollParaElemento(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
}
