onDomReady(() => {
  initPageBase({ bindThemeToggle: false });
  carregarEstatisticas();
  configurarTema();

  bindEventById("exportPdfBtn", "click", exportarPDF);
  bindEventById("exportJsonBtn", "click", exportarJSON);
  bindEventById("clearCompradosBtn", "click", limparComprados);
  bindEventById("clearAllBtn", "click", limparTodosDados);
});

function configurarTema() {
  const darkModeToggle = document.getElementById("darkModeToggle");
  if (!darkModeToggle) return;

  darkModeToggle.checked = document.body.classList.contains("dark-mode");
  darkModeToggle.addEventListener("change", function () {
    aplicarTema(this.checked);
  });
}

function carregarEstatisticas() {
  if (!db) return;

  const userId = obterUserId();
  if (!userId) return;

  db.collection("categorias")
    .where("userId", "==", userId)
    .onSnapshot(
      (snapshot) => {
        document.getElementById("totalCategorias").textContent = snapshot.size;
      },
      (error) => {
        console.error("Erro ao carregar categorias:", error);
      },
    );

  db.collection("itens")
    .where("userId", "==", userId)
    .onSnapshot(
      (snapshot) => {
        let totalComprados = 0;
        snapshot.forEach((doc) => {
          if (doc.data().comprado) totalComprados += 1;
        });

        document.getElementById("totalItens").textContent = snapshot.size;
        document.getElementById("totalComprados").textContent = totalComprados;
      },
      (error) => {
        console.error("Erro ao carregar itens:", error);
      },
    );
}

async function exportarPDF() {
  try {
    mostrarToast("Gerando PDF...", "info");

    const userId = obterUserId();
    if (!userId) return;

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.setTextColor(16, 185, 129);
    doc.text("Lista de Compras", 105, 20, { align: "center" });

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Gerado em: ${new Date().toLocaleDateString("pt-BR")}`, 105, 28, {
      align: "center",
    });

    let y = 40;

    const categoriasSnapshot = await db
      .collection("categorias")
      .where("userId", "==", userId)
      .get();
    const itensSnapshot = await db
      .collection("itens")
      .where("userId", "==", userId)
      .get();

    const categorias = snapshotToArray(categoriasSnapshot);
    const itens = snapshotToArray(itensSnapshot);

    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text("Resumo Geral", 20, y);
    y += 10;

    doc.setFontSize(10);
    const totalItens = itens.length;
    const totalComprados = itens.filter((item) => item.comprado).length;
    const totalGeral = itens.reduce((total, item) => {
      return total + (item.valor || 0) * (item.quantidade || 1);
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
        return total + (item.valor || 0) * (item.quantidade || 1);
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
        const subtotal = (item.valor || 0) * (item.quantidade || 1);
        const linha = `  ${status} ${item.nome} - Qtd: ${item.quantidade || 1} - ${formatarReal(subtotal)}`;
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
    const userId = obterUserId();
    if (!userId) return;

    const categoriasSnapshot = await db
      .collection("categorias")
      .where("userId", "==", userId)
      .get();
    const itensSnapshot = await db
      .collection("itens")
      .where("userId", "==", userId)
      .get();

    const dados = {
      exportadoEm: new Date().toISOString(),
      versao: "2.0.0",
      categorias: snapshotToArray(categoriasSnapshot),
      itens: snapshotToArray(itensSnapshot),
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
  if (!confirmarAcao("Deseja remover todos os itens marcados como comprados?")) {
    return;
  }

  try {
    const userId = obterUserId();
    if (!userId) return;

    const snapshot = await db
      .collection("itens")
      .where("userId", "==", userId)
      .where("comprado", "==", true)
      .get();

    if (snapshot.empty) {
      mostrarToast("Nenhum item comprado para remover", "info");
      return;
    }

    const batch = db.batch();
    snapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();

    mostrarToast(`${snapshot.size} item(ns) removido(s)!`, "success");
  } catch (error) {
    console.error("Erro ao limpar comprados:", error);
    mostrarToast("Erro ao limpar itens comprados", "error");
  }
}

async function limparTodosDados() {
  const confirmacao = prompt(
    "ATENÇÃO: Esta ação é IRREVERSÍVEL!\n\n" +
      "Todos os dados (categorias e itens) serão APAGADOS PERMANENTEMENTE.\n\n" +
      'Digite "CONFIRMAR" para prosseguir:',
  );

  if (confirmacao !== "CONFIRMAR") {
    mostrarToast("Operação cancelada", "info");
    return;
  }

  const userId = obterUserId();
  if (!userId) return;

  try {
    const itensSnapshot = await db
      .collection("itens")
      .where("userId", "==", userId)
      .get();
    const batchItens = db.batch();
    itensSnapshot.forEach((doc) => {
      batchItens.delete(doc.ref);
    });
    await batchItens.commit();

    const categoriasSnapshot = await db
      .collection("categorias")
      .where("userId", "==", userId)
      .get();
    const batchCategorias = db.batch();
    categoriasSnapshot.forEach((doc) => {
      batchCategorias.delete(doc.ref);
    });
    await batchCategorias.commit();

    mostrarToast("Todos os dados foram apagados!", "success");
  } catch (error) {
    console.error("Erro ao limpar dados:", error);
    mostrarToast("Erro ao apagar dados", "error");
  }
}
