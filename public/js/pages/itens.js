let categorias = [];
let itens = [];
let itemEditando = null;

const filtros = {
  searchTerm: "",
  categoriaId: "",
  sortBy: "nome",
};

onDomReady(() => {
  initPageBase();

  bindEventById("itemForm", "submit", adicionarItem);
  bindEventById("searchInput", "input", debounce(aplicarFiltros, 300));
  bindEventById("categoriaFiltro", "change", aplicarFiltros);
  bindEventById("sortSelect", "change", aplicarFiltros);
  bindEventById("clearCompradosBtn", "click", limparComprados);
  bindEventById("saveBtn", "click", salvarEdicao);
  bindEventById("deleteBtn", "click", excluirItem);
  bindEventById("editItemQuantidade", "input", atualizarSubtotal);
  bindEventById("editItemValor", "input", atualizarSubtotal);

  setupModalBehavior("editModal", fecharModal);
  inicializarDadosItens();
});

async function inicializarDadosItens() {
  if (typeof verificarAutenticacao !== "function") {
    mostrarToast("Falha ao validar autenticação", "error");
    return;
  }

  const user = await verificarAutenticacao();
  if (!user) return;

  carregarCategorias(user.uid);
  carregarItens(user.uid);
}

function carregarCategorias(userId) {
  if (!db) return;
  if (!userId) return;

  db.collection("categorias")
    .where("userId", "==", userId)
    .onSnapshot(
      (snapshot) => {
        categorias = snapshotToArray(snapshot).sort((a, b) =>
          String(a.nome || "").localeCompare(String(b.nome || ""), "pt-BR"),
        );
        atualizarSelectCategorias();
      },
      (error) => {
        console.error("Erro ao carregar categorias:", error);
        mostrarToast("Erro ao carregar categorias", "error");
      },
    );
}

function carregarItens(userId) {
  if (!db) return;
  if (!userId) return;

  db.collection("itens")
    .where("userId", "==", userId)
    .onSnapshot(
      (snapshot) => {
        itens = snapshotToArray(snapshot);
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

  if (valorAtual) {
    select.value = valorAtual;
  }
}

function aplicarFiltros() {
  const searchInput = document.getElementById("searchInput");
  const categoriaFiltro = document.getElementById("categoriaFiltro");
  const sortSelect = document.getElementById("sortSelect");

  filtros.searchTerm = (searchInput?.value || "").toLowerCase();
  filtros.categoriaId = categoriaFiltro?.value || "";
  filtros.sortBy = sortSelect?.value || "nome";

  let itensFiltrados = [...itens];

  if (filtros.searchTerm) {
    itensFiltrados = itensFiltrados.filter((item) =>
      item.nome.toLowerCase().includes(filtros.searchTerm),
    );
  }

  if (filtros.categoriaId) {
    itensFiltrados = itensFiltrados.filter(
      (item) => item.categoriaId === filtros.categoriaId,
    );
  }

  ordenarItens(itensFiltrados, filtros.sortBy);
  renderizarItens(itensFiltrados);
}

function ordenarItens(lista, sortBy) {
  switch (sortBy) {
    case "nome-desc":
      lista.sort((a, b) => b.nome.localeCompare(a.nome));
      break;
    case "valor":
      lista.sort((a, b) => (a.valor || 0) - (b.valor || 0));
      break;
    case "valor-desc":
      lista.sort((a, b) => (b.valor || 0) - (a.valor || 0));
      break;
    case "nome":
    default:
      lista.sort((a, b) => a.nome.localeCompare(b.nome));
      break;
  }
}

function renderizarItens(itensParaRenderizar) {
  const container = document.getElementById("itensList");
  if (!container) return;

  if (itensParaRenderizar.length === 0) {
    const mensagem =
      filtros.searchTerm || filtros.categoriaId
        ? "Nenhum item encontrado"
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
      const quantidade = item.quantidade || 1;
      const valor = item.valor || 0;
      const subtotal = quantidade * valor;

      return `
        <div class="item-card ${item.comprado ? "comprado" : ""}" data-id="${item.id}">
          <div class="item-checkbox">
            <input
              type="checkbox"
              ${item.comprado ? "checked" : ""}
              onchange="toggleComprado('${item.id}', this.checked)"
            >
          </div>
          <div class="item-content">
            <div class="item-nome">${sanitizeInput(item.nome)}</div>
            <div class="item-meta">
              <span class="badge badge-primary">
                <i class="fas fa-tag"></i> ${categoria ? sanitizeInput(categoria.nome) : "Sem categoria"}
              </span>
              <span class="item-quantidade">Qtd: ${quantidade}</span>
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
  const totalValor = itens.reduce((total, item) => {
    const quantidade = item.quantidade || 1;
    const valor = item.valor || 0;
    return total + quantidade * valor;
  }, 0);

  document.getElementById("totalItens").textContent = totalItens;
  document.getElementById("totalComprados").textContent = totalComprados;
  document.getElementById("totalValor").textContent = formatarReal(totalValor);
}

async function adicionarItem(event) {
  event.preventDefault();

  const nome = document.getElementById("itemNome").value.trim();
  const categoriaId = document.getElementById("itemCategoria").value;
  const quantidade = parseInt(document.getElementById("itemQuantidade").value, 10) || 1;
  const valor = parseFloat(document.getElementById("itemValor").value) || 0;

  if (!validateInput(nome, "text")) {
    mostrarToast("Digite um nome válido (máx. 100 caracteres)", "warning");
    return;
  }

  if (!categoriaId) {
    mostrarToast("Selecione uma categoria", "warning");
    return;
  }

  const userId = obterUserId();
  if (!userId) return;

  try {
    await db.collection("itens").add({
      nome,
      categoriaId,
      userId,
      quantidade,
      valor,
      comprado: false,
      dataCriacao: new Date().toISOString(),
    });

    document.getElementById("itemForm").reset();
    document.getElementById("itemQuantidade").value = 1;
    document.getElementById("itemValor").value = 0;
    mostrarToast("Item adicionado com sucesso!", "success");
  } catch (error) {
    console.error("Erro ao adicionar item:", error);
    mostrarToast("Erro ao adicionar item", "error");
  }
}

function editarItem(itemId) {
  itemEditando = itens.find((item) => item.id === itemId);
  if (!itemEditando) return;

  document.getElementById("editItemNome").value = itemEditando.nome;
  document.getElementById("editItemCategoria").value = itemEditando.categoriaId;
  document.getElementById("editItemQuantidade").value = itemEditando.quantidade || 1;
  document.getElementById("editItemValor").value = itemEditando.valor || 0;
  atualizarSubtotal();
  document.getElementById("editModal").classList.add("active");
}

function atualizarSubtotal() {
  const quantidade = parseInt(document.getElementById("editItemQuantidade").value, 10) || 1;
  const valor = parseFloat(document.getElementById("editItemValor").value) || 0;
  document.getElementById("editSubtotal").textContent = formatarReal(quantidade * valor);
}

async function salvarEdicao() {
  if (!itemEditando) return;

  const nome = document.getElementById("editItemNome").value.trim();
  const categoriaId = document.getElementById("editItemCategoria").value;
  const quantidade = parseInt(document.getElementById("editItemQuantidade").value, 10) || 1;
  const valor = parseFloat(document.getElementById("editItemValor").value) || 0;

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

  try {
    await db.collection("itens").doc(itemEditando.id).delete();
    mostrarToast("Item excluído!", "success");
    fecharModal();
  } catch (error) {
    console.error("Erro ao excluir item:", error);
    mostrarToast("Erro ao excluir item", "error");
  }
}

async function toggleComprado(itemId, comprado) {
  try {
    await db.collection("itens").doc(itemId).update({ comprado });
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

  try {
    const batch = db.batch();
    comprados.forEach((item) => {
      batch.delete(db.collection("itens").doc(item.id));
    });
    await batch.commit();
    mostrarToast("Itens comprados removidos!", "success");
  } catch (error) {
    console.error("Erro ao limpar comprados:", error);
    mostrarToast("Erro ao limpar comprados", "error");
  }
}

function fecharModal() {
  document.getElementById("editModal").classList.remove("active");
  itemEditando = null;
}
