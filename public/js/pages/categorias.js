let categorias = [];
let categoriaEditando = null;

onDomReady(() => {
  initPageBase();

  bindEventById("categoriaForm", "submit", adicionarCategoria);
  bindEventById("saveBtn", "click", salvarEdicao);
  bindEventById("deleteBtn", "click", excluirCategoria);
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

  carregarCategorias(user.uid);
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
        categorias = snapshotToArray(snapshot).sort((a, b) =>
          String(a.nome || "").localeCompare(String(b.nome || ""), "pt-BR"),
        );
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

function renderizarCategorias() {
  const container = document.getElementById("categoriasList");
  if (!container) return;

  if (categorias.length === 0) {
    container.innerHTML = `
      <div class="empty-state empty-state-full">
        <i class="fas fa-folder-open fa-3x"></i>
        <p>Nenhuma categoria cadastrada ainda</p>
      </div>
    `;
    return;
  }

  const itensPromises = categorias.map((categoria) =>
    db.collection("itens").where("categoriaId", "==", categoria.id).get(),
  );

  Promise.all(itensPromises)
    .then((results) => {
      container.innerHTML = categorias
        .map((categoria, index) => {
          const itensSnapshot = results[index];
          let totalItens = 0;
          let totalGasto = 0;

          itensSnapshot.forEach((doc) => {
            const item = doc.data();
            totalItens += 1;
            const quantidade = item.quantidade || 1;
            const valor = parseFloat(item.valor) || 0;
            totalGasto += valor * quantidade;
          });

          const orcamento = categoria.orcamento || 0;
          const percentual = orcamento > 0 ? (totalGasto / orcamento) * 100 : 0;

          let barClass = "";
          if (percentual >= 100) barClass = "danger";
          else if (percentual >= 80) barClass = "warning";

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
    })
    .catch((error) => {
      console.error("Erro ao calcular dados de categorias:", error);
      mostrarToast("Erro ao renderizar categorias", "error");
    });
}

async function adicionarCategoria(event) {
  event.preventDefault();

  const nome = document.getElementById("categoriaNome").value.trim();
  const orcamento =
    parseFloat(document.getElementById("categoriaOrcamento").value) || 0;

  if (!validateInput(nome, "categoria")) {
    mostrarToast("Digite um nome válido (máx. 50 caracteres)", "warning");
    return;
  }

  const userId = obterUserId();
  if (!userId) return;

  try {
    await db.collection("categorias").add({
      nome,
      orcamento,
      userId,
      dataCriacao: new Date().toISOString(),
    });

    document.getElementById("categoriaForm").reset();
    mostrarToast("Categoria adicionada com sucesso!", "success");
  } catch (error) {
    console.error("Erro ao adicionar categoria:", error);
    mostrarToast("Erro ao adicionar categoria", "error");
  }
}

function editarCategoria(categoriaId) {
  categoriaEditando = categorias.find((categoria) => categoria.id === categoriaId);
  if (!categoriaEditando) return;

  document.getElementById("editCategoriaNome").value = categoriaEditando.nome;
  document.getElementById("editCategoriaOrcamento").value =
    categoriaEditando.orcamento || "";
  document.getElementById("editModal").classList.add("active");
}

async function salvarEdicao() {
  if (!categoriaEditando) return;

  const nome = document.getElementById("editCategoriaNome").value.trim();
  const orcamento =
    parseFloat(document.getElementById("editCategoriaOrcamento").value) || 0;

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
    const itens = await db
      .collection("itens")
      .where("categoriaId", "==", categoriaEditando.id)
      .get();

    const batch = db.batch();
    itens.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();

    await db.collection("categorias").doc(categoriaEditando.id).delete();

    mostrarToast("Categoria excluída!", "success");
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
