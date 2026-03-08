let userIdAtual = "";
let listaAtivaId = "";
let listasUsuario = [];
let unsubscribeCategorias = null;
let unsubscribeItens = null;

onDomReady(() => {
  inicializarPaginaConfiguracoes();
});

async function inicializarPaginaConfiguracoes() {
  initPageBase({ bindThemeToggle: false });
  configurarTema();

  bindEventById("exportPdfBtn", "click", exportarPDF);
  bindEventById("exportJsonBtn", "click", exportarJSON);
  bindEventById("clearCompradosBtn", "click", limparComprados);
  bindEventById("clearAllBtn", "click", limparTodosDados);
  bindEventById("addListBtn", "click", criarNovaLista);
  bindEventById("deleteListBtn", "click", excluirListaSelecionada);
  bindEventById("activeListSelect", "change", trocarListaAtiva);

  if (typeof verificarAutenticacao !== "function") {
    mostrarToast("Falha ao validar autenticação", "error");
    return;
  }

  const user = await verificarAutenticacao();
  userIdAtual = user?.uid || "";
  if (!userIdAtual) return;

  await carregarListasConfiguracao();
  iniciarListenersEstatisticas();
}

function configurarTema() {
  const darkModeToggle = document.getElementById("darkModeToggle");
  if (!darkModeToggle) return;

  darkModeToggle.checked = document.body.classList.contains("dark-mode");
  darkModeToggle.addEventListener("change", function () {
    aplicarTema(this.checked);
  });
}

async function carregarListasConfiguracao() {
  const select = document.getElementById("activeListSelect");
  if (!select || !userIdAtual) return;

  const contexto = await prepararContextoListas(userIdAtual);
  listasUsuario = contexto.listas;
  listaAtivaId = contexto.listaAtivaId;

  select.innerHTML = listasUsuario
    .map((lista) => `<option value="${lista.id}">${sanitizeInput(lista.nome)}</option>`)
    .join("");

  select.value = listaAtivaId;
}

function iniciarListenersEstatisticas() {
  if (!db || !userIdAtual) return;

  if (typeof unsubscribeCategorias === "function") unsubscribeCategorias();
  if (typeof unsubscribeItens === "function") unsubscribeItens();

  unsubscribeCategorias = db
    .collection("categorias")
    .where("userId", "==", userIdAtual)
    .onSnapshot(
      (snapshot) => {
        const categorias = filtrarRegistrosPorListaAtiva(snapshotToArray(snapshot), userIdAtual);
        document.getElementById("totalCategorias").textContent = String(categorias.length);
      },
      (error) => {
        console.error("Erro ao carregar categorias:", error);
      },
    );

  unsubscribeItens = db
    .collection("itens")
    .where("userId", "==", userIdAtual)
    .onSnapshot(
      (snapshot) => {
        const itens = filtrarRegistrosPorListaAtiva(snapshotToArray(snapshot), userIdAtual);
        const totalComprados = itens.filter((item) => item.comprado).length;

        document.getElementById("totalItens").textContent = String(itens.length);
        document.getElementById("totalComprados").textContent = String(totalComprados);
      },
      (error) => {
        console.error("Erro ao carregar itens:", error);
      },
    );
}

async function trocarListaAtiva() {
  const select = document.getElementById("activeListSelect");
  if (!select || !userIdAtual) return;

  const proximaListaId = select.value;
  if (!proximaListaId || proximaListaId === listaAtivaId) return;

  listaAtivaId = proximaListaId;
  salvarListaAtivaIdUsuario(userIdAtual, listaAtivaId);

  iniciarListenersEstatisticas();

  const listaAtiva = listasUsuario.find((lista) => lista.id === listaAtivaId);
  mostrarToast(`Lista ativa alterada para ${listaAtiva?.nome || "selecionada"}.`, "success");
}

async function criarNovaLista() {
  const input = document.getElementById("newListName");
  if (!input || !userIdAtual) return;

  const nome = (input.value || "").trim();
  if (nome.length < 3 || nome.length > 60) {
    mostrarToast("Informe um nome de lista entre 3 e 60 caracteres.", "warning");
    return;
  }

  try {
    const novaListaRef = db.collection("listas").doc();
    await novaListaRef.set({
      userId: userIdAtual,
      nome,
      padrao: false,
      dataCriacao: new Date().toISOString(),
      dataAtualizacao: new Date().toISOString(),
    });

    input.value = "";
    await carregarListasConfiguracao();
    const select = document.getElementById("activeListSelect");
    if (select) {
      select.value = novaListaRef.id;
      await trocarListaAtiva();
    }
    mostrarToast("Nova lista criada com sucesso!", "success");
  } catch (error) {
    console.error("Erro ao criar lista:", error);
    mostrarToast("Erro ao criar nova lista", "error");
  }
}

async function excluirListaSelecionada() {
  const select = document.getElementById("activeListSelect");
  if (!select || !userIdAtual) return;

  const listaId = select.value;
  const lista = listasUsuario.find((item) => item.id === listaId);
  if (!lista) return;

  if (lista.padrao) {
    mostrarToast("A lista principal não pode ser excluída.", "warning");
    return;
  }

  if (!confirmarAcao(`Deseja excluir a lista "${lista.nome}" e todos os dados dela?`)) {
    return;
  }

  try {
    const categoriasSnapshot = await db
      .collection("categorias")
      .where("userId", "==", userIdAtual)
      .where("listaId", "==", listaId)
      .get();

    const itensSnapshot = await db
      .collection("itens")
      .where("userId", "==", userIdAtual)
      .where("listaId", "==", listaId)
      .get();

    const batch = db.batch();
    categoriasSnapshot.forEach((doc) => batch.delete(doc.ref));
    itensSnapshot.forEach((doc) => batch.delete(doc.ref));
    batch.delete(db.collection("listas").doc(listaId));
    await batch.commit();

    listaAtivaId = obterListaPadraoId(userIdAtual);
    salvarListaAtivaIdUsuario(userIdAtual, listaAtivaId);

    await carregarListasConfiguracao();
    iniciarListenersEstatisticas();
    mostrarToast("Lista excluída com sucesso.", "success");
  } catch (error) {
    console.error("Erro ao excluir lista:", error);
    mostrarToast("Erro ao excluir lista", "error");
  }
}

async function exportarPDF() {
  try {
    mostrarToast("Gerando PDF...", "info");

    if (!userIdAtual) return;

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.setTextColor(16, 185, 129);
    doc.text("Lista de Compras", 105, 20, { align: "center" });

    const listaAtiva = listasUsuario.find((lista) => lista.id === listaAtivaId);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Lista: ${listaAtiva?.nome || "Lista Principal"}`, 105, 28, {
      align: "center",
    });
    doc.text(`Gerado em: ${new Date().toLocaleDateString("pt-BR")}`, 105, 34, {
      align: "center",
    });

    let y = 46;

    const categoriasSnapshot = await db
      .collection("categorias")
      .where("userId", "==", userIdAtual)
      .get();
    const itensSnapshot = await db
      .collection("itens")
      .where("userId", "==", userIdAtual)
      .get();

    const categorias = filtrarRegistrosPorListaAtiva(snapshotToArray(categoriasSnapshot), userIdAtual);
    const itens = filtrarRegistrosPorListaAtiva(snapshotToArray(itensSnapshot), userIdAtual);

    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text("Resumo Geral", 20, y);
    y += 10;

    doc.setFontSize(10);
    const totalItens = itens.length;
    const totalComprados = itens.filter((item) => item.comprado).length;
    const totalGeral = itens.reduce((total, item) => {
      return total + parseNonNegativeNumber(item.valor, 0) * parsePositiveInt(item.quantidade, 1);
    }, 0);

    doc.text(`Total de Categorias: ${categorias.length}`, 20, y);
    y += 7;
    doc.text(`Total de Itens: ${totalItens}`, 20, y);
    y += 7;
    doc.text(`Itens Comprados: ${totalComprados}`, 20, y);
    y += 7;
    doc.text(`Valor Total: ${formatarReal(totalGeral)}`, 20, y);
    y += 15;

    doc.setFontSize(14);
    doc.text("Detalhamento por Categoria", 20, y);
    y += 10;

    categorias.forEach((categoria) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }

      const itensCategoria = itens.filter((item) => item.categoriaId === categoria.id);
      if (itensCategoria.length === 0) return;

      const totalCategoria = itensCategoria.reduce((total, item) => {
        return (
          total + parseNonNegativeNumber(item.valor, 0) * parsePositiveInt(item.quantidade, 1)
        );
      }, 0);

      doc.setFontSize(12);
      doc.setTextColor(16, 185, 129);
      doc.text(`${categoria.nome} - ${formatarReal(totalCategoria)}`, 20, y);
      y += 7;

      doc.setFontSize(9);
      doc.setTextColor(0);
      itensCategoria.forEach((item) => {
        if (y > 280) {
          doc.addPage();
          y = 20;
        }

        const status = item.comprado ? "[X]" : "[ ]";
        const subtotal = parseNonNegativeNumber(item.valor, 0) * parsePositiveInt(item.quantidade, 1);
        const linha = `  ${status} ${item.nome} - Qtd: ${parsePositiveInt(item.quantidade, 1)} - ${formatarReal(subtotal)}`;
        doc.text(linha, 25, y);
        y += 6;
      });

      y += 5;
    });

    doc.save("lista-de-compras.pdf");
    mostrarToast("PDF gerado com sucesso!", "success");
  } catch (error) {
    console.error("Erro ao gerar PDF:", error);
    mostrarToast("Erro ao gerar PDF", "error");
  }
}

async function exportarJSON() {
  try {
    if (!userIdAtual) return;

    const categoriasSnapshot = await db
      .collection("categorias")
      .where("userId", "==", userIdAtual)
      .get();
    const itensSnapshot = await db
      .collection("itens")
      .where("userId", "==", userIdAtual)
      .get();

    const dados = {
      exportadoEm: new Date().toISOString(),
      versao: "2.1.0",
      listaAtivaId,
      listas: listasUsuario,
      categorias: filtrarRegistrosPorListaAtiva(snapshotToArray(categoriasSnapshot), userIdAtual),
      itens: filtrarRegistrosPorListaAtiva(snapshotToArray(itensSnapshot), userIdAtual),
    };

    const blob = new Blob([JSON.stringify(dados, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "lista-de-compras-backup.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    mostrarToast("Backup JSON criado com sucesso!", "success");
  } catch (error) {
    console.error("Erro ao exportar JSON:", error);
    mostrarToast("Erro ao exportar dados", "error");
  }
}

async function limparComprados() {
  if (!confirmarAcao("Deseja remover todos os itens comprados da lista ativa?")) {
    return;
  }

  try {
    if (!userIdAtual) return;

    const snapshot = await db
      .collection("itens")
      .where("userId", "==", userIdAtual)
      .where("comprado", "==", true)
      .get();

    const itensComprados = filtrarRegistrosPorListaAtiva(snapshotToArray(snapshot), userIdAtual);

    if (!itensComprados.length) {
      mostrarToast("Nenhum item comprado para remover", "info");
      return;
    }

    const batch = db.batch();
    itensComprados.forEach((item) => {
      batch.delete(db.collection("itens").doc(item.id));
    });
    await batch.commit();

    mostrarToast(`${itensComprados.length} item(ns) removido(s)!`, "success");
  } catch (error) {
    console.error("Erro ao limpar comprados:", error);
    mostrarToast("Erro ao limpar itens comprados", "error");
  }
}

async function limparTodosDados() {
  const confirmacao = prompt(
    "ATENÇÃO: Esta ação é IRREVERSÍVEL!\\n\\n" +
      "Todos os dados (listas, categorias e itens) serão APAGADOS PERMANENTEMENTE.\\n\\n" +
      'Digite "CONFIRMAR" para prosseguir:',
  );

  if (confirmacao !== "CONFIRMAR") {
    mostrarToast("Operação cancelada", "info");
    return;
  }

  if (!userIdAtual) return;

  try {
    const itensSnapshot = await db
      .collection("itens")
      .where("userId", "==", userIdAtual)
      .get();
    const categoriasSnapshot = await db
      .collection("categorias")
      .where("userId", "==", userIdAtual)
      .get();
    const listasSnapshot = await db
      .collection("listas")
      .where("userId", "==", userIdAtual)
      .get();

    const batch = db.batch();
    itensSnapshot.forEach((doc) => batch.delete(doc.ref));
    categoriasSnapshot.forEach((doc) => batch.delete(doc.ref));
    listasSnapshot.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();

    await prepararContextoListas(userIdAtual);
    await carregarListasConfiguracao();
    iniciarListenersEstatisticas();

    mostrarToast("Todos os dados foram apagados!", "success");
  } catch (error) {
    console.error("Erro ao limpar dados:", error);
    mostrarToast("Erro ao apagar dados", "error");
  }
}
