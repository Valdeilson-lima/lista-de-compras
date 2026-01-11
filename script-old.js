// Variáveis globais
let categorias = [];
let itens = [];
let categoriaSelecionada = null;
let itemEditando = null;

// Elementos DOM
const categoriaNomeInput = document.getElementById("categoriaNome");
const addCategoriaBtn = document.getElementById("addCategoriaBtn");
const itemNomeInput = document.getElementById("itemNome");
const itemCategoriaSelect = document.getElementById("itemCategoria");
const addItemBtn = document.getElementById("addItemBtn");
const categoriasList = document.getElementById("categoriasList");
const itensList = document.getElementById("itensList");
const categoriaSelecionadaTitulo = document.getElementById(
  "categoriaSelecionadaTitulo"
);
const categoriaTotalElement = document.getElementById("categoriaTotal");
const totalCategoriasElement = document.getElementById("totalCategorias");
const totalItensElement = document.getElementById("totalItens");
const totalGeralElement = document.getElementById("totalGeral");

// Modal
const editModal = document.getElementById("editModal");
const closeModal = document.querySelector(".close");
const editItemNomeInput = document.getElementById("editItemNome");
const editItemValorInput = document.getElementById("editItemValor");
const saveEditBtn = document.getElementById("saveEditBtn");
const deleteItemBtn = document.getElementById("deleteItemBtn");

// Inicialização
document.addEventListener("DOMContentLoaded", function () {
  carregarCategorias();
  carregarItens();

  // Event Listeners
  addCategoriaBtn.addEventListener("click", adicionarCategoria);
  addItemBtn.addEventListener("click", adicionarItem);
  closeModal.addEventListener("click", fecharModal);
  saveEditBtn.addEventListener("click", salvarEdicaoItem);
  deleteItemBtn.addEventListener("click", excluirItem);

  // Fechar modal ao clicar fora
  window.addEventListener("click", function (event) {
    if (event.target === editModal) {
      fecharModal();
    }
  });

  // Permitir adicionar categoria com Enter
  categoriaNomeInput.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
      adicionarCategoria();
    }
  });

  // Permitir adicionar item com Enter
  itemNomeInput.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
      adicionarItem();
    }
  });
});

// Funções Firebase
async function carregarCategorias() {
  try {
    const snapshot = await db.collection("categorias").orderBy("nome").get();
    categorias = [];
    snapshot.forEach((doc) => {
      categorias.push({
        id: doc.id,
        ...doc.data(),
      });
    });
    atualizarSelectCategorias();
    renderizarCategorias();
    atualizarResumo();
  } catch (error) {
    console.error("Erro ao carregar categorias:", error);
  }
}

async function carregarItens() {
  try {
    const snapshot = await db.collection("itens").get();
    itens = [];
    snapshot.forEach((doc) => {
      itens.push({
        id: doc.id,
        ...doc.data(),
      });
    });
    // Ordenar no lado do cliente
    itens.sort((a, b) => {
      if (a.categoriaId !== b.categoriaId) {
        return a.categoriaId.localeCompare(b.categoriaId);
      }
      return a.nome.localeCompare(b.nome);
    });
    renderizarItensCategoriaSelecionada();
    atualizarResumo();
  } catch (error) {
    console.error("Erro ao carregar itens:", error);
  }
}

async function adicionarCategoria() {
  const nome = categoriaNomeInput.value.trim();

  if (!nome) {
    alert("Por favor, digite um nome para a categoria");
    return;
  }

  try {
    const docRef = await db.collection("categorias").add({
      nome: nome,
      dataCriacao: new Date(),
    });

    categoriaNomeInput.value = "";
    carregarCategorias();

    // Selecionar automaticamente a nova categoria
    const novaCategoria = { id: docRef.id, nome: nome };
    categorias.push(novaCategoria);
    selecionarCategoria(novaCategoria.id);
  } catch (error) {
    console.error("Erro ao adicionar categoria:", error);
    alert("Erro ao adicionar categoria. Tente novamente.");
  }
}

async function adicionarItem() {
  const nome = itemNomeInput.value.trim();
  const categoriaId = itemCategoriaSelect.value;

  if (!nome) {
    alert("Por favor, digite um nome para o item");
    return;
  }

  if (!categoriaId) {
    alert("Por favor, selecione uma categoria");
    return;
  }

  try {
    await db.collection("itens").add({
      nome: nome,
      categoriaId: categoriaId,
      valor: 0,
      dataCriacao: new Date(),
    });

    itemNomeInput.value = "";
    carregarItens();
  } catch (error) {
    console.error("Erro ao adicionar item:", error);
    alert("Erro ao adicionar item. Tente novamente.");
  }
}

async function atualizarItem(itemId, novosDados) {
  try {
    await db.collection("itens").doc(itemId).update(novosDados);
    carregarItens();
  } catch (error) {
    console.error("Erro ao atualizar item:", error);
    alert("Erro ao atualizar item. Tente novamente.");
  }
}

async function excluirItemFirebase(itemId) {
  try {
    await db.collection("itens").doc(itemId).delete();
    carregarItens();
  } catch (error) {
    console.error("Erro ao excluir item:", error);
    alert("Erro ao excluir item. Tente novamente.");
  }
}

// Funções de UI
function atualizarSelectCategorias() {
  itemCategoriaSelect.innerHTML =
    '<option value="">Selecione uma categoria</option>';

  categorias.forEach((categoria) => {
    const option = document.createElement("option");
    option.value = categoria.id;
    option.textContent = categoria.nome;
    itemCategoriaSelect.appendChild(option);
  });
}

function renderizarCategorias() {
  categoriasList.innerHTML = "";

  if (categorias.length === 0) {
    categoriasList.innerHTML = `
            <div class="empty-state">
                <p>Nenhuma categoria cadastrada. Adicione sua primeira categoria!</p>
            </div>
        `;
    return;
  }

  categorias.forEach((categoria) => {
    const itensCategoria = itens.filter(
      (item) => item.categoriaId === categoria.id
    );
    const totalCategoria = calcularTotalCategoria(categoria.id);

    const categoriaElement = document.createElement("div");
    categoriaElement.className = `category-card ${
      categoriaSelecionada === categoria.id ? "active" : ""
    }`;
    categoriaElement.innerHTML = `
            <div class="category-name">${categoria.nome}</div>
            <div class="category-info">
                <span class="category-count">${
                  itensCategoria.length
                } itens</span>
                <span class="category-total">R$ ${totalCategoria.toFixed(
                  2
                )}</span>
            </div>
        `;

    categoriaElement.addEventListener("click", () =>
      selecionarCategoria(categoria.id)
    );

    categoriasList.appendChild(categoriaElement);
  });
}

function selecionarCategoria(categoriaId) {
  categoriaSelecionada = categoriaId;
  renderizarCategorias();
  renderizarItensCategoriaSelecionada();

  const categoria = categorias.find((c) => c.id === categoriaId);
  if (categoria) {
    categoriaSelecionadaTitulo.innerHTML = `<i class="fas fa-tag"></i> ${categoria.nome}`;
  }
}

function renderizarItensCategoriaSelecionada() {
  itensList.innerHTML = "";

  if (!categoriaSelecionada) {
    itensList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-clipboard-list fa-3x"></i>
                <p>Selecione uma categoria para ver os itens</p>
            </div>
        `;
    categoriaTotalElement.textContent = "R$ 0,00";
    return;
  }

  const itensCategoria = itens.filter(
    (item) => item.categoriaId === categoriaSelecionada
  );

  if (itensCategoria.length === 0) {
    itensList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-box-open fa-3x"></i>
                <p>Nenhum item nesta categoria. Adicione itens!</p>
            </div>
        `;
  } else {
    itensCategoria.forEach((item) => {
      const itemElement = document.createElement("div");
      itemElement.className = "item-card";
      itemElement.innerHTML = `
                <div class="item-info">
                    <div class="item-name">${item.nome}</div>
                    <div class="item-value">Valor: R$ ${item.valor.toFixed(
                      2
                    )}</div>
                </div>
                <div class="item-actions">
                    <input type="number" 
                           class="item-value-input" 
                           value="${item.valor}" 
                           step="0.01" 
                           min="0" 
                           data-item-id="${item.id}"
                           placeholder="R$ 0,00">
                    <button class="edit-btn" data-item-id="${item.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                </div>
            `;

      itensList.appendChild(itemElement);
    });

    // Adicionar event listeners para os inputs de valor
    document.querySelectorAll(".item-value-input").forEach((input) => {
      input.addEventListener("change", function () {
        const itemId = this.getAttribute("data-item-id");
        const novoValor = parseFloat(this.value) || 0;
        atualizarItem(itemId, { valor: novoValor });
      });

      input.addEventListener("keypress", function (event) {
        if (event.key === "Enter") {
          this.blur();
        }
      });
    });

    // Adicionar event listeners para os botões de edição
    document.querySelectorAll(".edit-btn").forEach((button) => {
      button.addEventListener("click", function () {
        const itemId = this.getAttribute("data-item-id");
        abrirModalEdicao(itemId);
      });
    });
  }

  // Atualizar total da categoria
  const totalCategoria = calcularTotalCategoria(categoriaSelecionada);
  categoriaTotalElement.textContent = `R$ ${totalCategoria.toFixed(2)}`;
}

function calcularTotalCategoria(categoriaId) {
  const itensCategoria = itens.filter(
    (item) => item.categoriaId === categoriaId
  );
  return itensCategoria.reduce((total, item) => total + (item.valor || 0), 0);
}

function calcularTotalGeral() {
  return itens.reduce((total, item) => total + (item.valor || 0), 0);
}

function atualizarResumo() {
  totalCategoriasElement.textContent = categorias.length;
  totalItensElement.textContent = itens.length;
  totalGeralElement.textContent = `R$ ${calcularTotalGeral().toFixed(2)}`;
}

// Funções do Modal
function abrirModalEdicao(itemId) {
  const item = itens.find((i) => i.id === itemId);
  if (!item) return;

  itemEditando = item;
  editItemNomeInput.value = item.nome;
  editItemValorInput.value = item.valor;
  editModal.style.display = "flex";
}

function fecharModal() {
  editModal.style.display = "none";
  itemEditando = null;
  editItemNomeInput.value = "";
  editItemValorInput.value = "";
}

function salvarEdicaoItem() {
  if (!itemEditando) return;

  const novoNome = editItemNomeInput.value.trim();
  const novoValor = parseFloat(editItemValorInput.value) || 0;

  if (!novoNome) {
    alert("Por favor, digite um nome para o item");
    return;
  }

  atualizarItem(itemEditando.id, {
    nome: novoNome,
    valor: novoValor,
  });

  fecharModal();
}

function excluirItem() {
  if (!itemEditando) return;

  if (
    confirm(`Tem certeza que deseja excluir o item "${itemEditando.nome}"?`)
  ) {
    excluirItemFirebase(itemEditando.id);
    fecharModal();
  }
}
