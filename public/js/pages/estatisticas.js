let categorias = [];
let itens = [];
let pieChart = null;
let barChart = null;
let userIdAtual = "";

onDomReady(() => {
  initPageBase({
    onThemeToggled: () => {
      setTimeout(() => {
        criarGraficosComFallback();
      }, 100);
    },
  });

  carregarDados();
});

async function carregarDados() {
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
  await prepararContextoListas(userIdAtual);

  db.collection("categorias")
    .where("userId", "==", userIdAtual)
    .onSnapshot(
      (snapshot) => {
        categorias = filtrarRegistrosPorListaAtiva(snapshotToArray(snapshot), userIdAtual);
        processarDados();
      },
      (error) => {
        console.error("Erro ao carregar categorias:", error);
        mostrarToast("Erro ao carregar categorias", "error");
      },
    );

  db.collection("itens")
    .where("userId", "==", userIdAtual)
    .onSnapshot(
      (snapshot) => {
        itens = filtrarRegistrosPorListaAtiva(snapshotToArray(snapshot), userIdAtual);
        processarDados();
      },
      (error) => {
        console.error("Erro ao carregar itens:", error);
        mostrarToast("Erro ao carregar itens", "error");
      },
    );
}

function processarDados() {
  atualizarEstatisticas();
  criarGraficosComFallback();
  criarRanking();
  criarStatusOrcamento();
}

function atualizarEstatisticas() {
  const totalItens = itens.length;
  const totalComprados = itens.filter((item) => item.comprado).length;
  const totalCategorias = categorias.length;
  const totalGasto = itens.reduce((total, item) => {
    const quantidade = item.quantidade || 1;
    const valor = item.valor || 0;
    return total + quantidade * valor;
  }, 0);

  document.getElementById("totalItens").textContent = totalItens;
  document.getElementById("totalComprados").textContent = totalComprados;
  document.getElementById("totalCategorias").textContent = totalCategorias;
  document.getElementById("totalGasto").textContent = formatarReal(totalGasto);
}

function criarGraficos() {
  const gastosPorCategoria = {};

  categorias.forEach((categoria) => {
    gastosPorCategoria[categoria.id] = {
      nome: categoria.nome,
      total: 0,
    };
  });

  itens.forEach((item) => {
    if (gastosPorCategoria[item.categoriaId]) {
      const quantidade = item.quantidade || 1;
      const valor = item.valor || 0;
      gastosPorCategoria[item.categoriaId].total += quantidade * valor;
    }
  });

  const dados = Object.values(gastosPorCategoria).filter(
    (categoria) => categoria.total > 0,
  );
  const labels = dados.map((categoria) => categoria.nome);
  const valores = dados.map((categoria) => categoria.total);
  const cores = obterCoresGraficos(dados.length);

  const isDark = document.body.classList.contains("dark-mode");
  const textColor = isDark ? "#f9fafb" : "#1f2937";
  const gridColor = isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)";

  const pieCtx = document.getElementById("pieChart");
  if (pieChart) pieChart.destroy();

  pieChart = new Chart(pieCtx, {
    type: "pie",
    data: {
      labels,
      datasets: [
        {
          data: valores,
          backgroundColor: cores,
          borderWidth: 2,
          borderColor: isDark ? "#2d3748" : "#ffffff",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            color: textColor,
            padding: 15,
            font: { size: 12 },
          },
        },
        tooltip: {
          callbacks: {
            label(context) {
              const valor = context.parsed;
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentual = ((valor / total) * 100).toFixed(1);
              return `${context.label}: ${formatarReal(valor)} (${percentual}%)`;
            },
          },
        },
      },
    },
  });

  const barCtx = document.getElementById("barChart");
  if (barChart) barChart.destroy();

  barChart = new Chart(barCtx, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "Gastos por Categoria",
          data: valores,
          backgroundColor: cores,
          borderWidth: 0,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label(context) {
              return `Gasto: ${formatarReal(context.parsed.y)}`;
            },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            color: textColor,
            callback(value) {
              return `R$ ${value.toFixed(0)}`;
            },
          },
          grid: {
            color: gridColor,
          },
        },
        x: {
          ticks: {
            color: textColor,
          },
          grid: {
            display: false,
          },
        },
      },
    },
  });
}

function criarGraficosComFallback() {
  const pieCtx = document.getElementById("pieChart");
  const barCtx = document.getElementById("barChart");
  if (!pieCtx || !barCtx) return;

  const possuiDados = itens.some(
    (item) => parsePositiveInt(item.quantidade, 1) * parseNonNegativeNumber(item.valor, 0) > 0,
  );

  if (!possuiDados) {
    if (pieChart) {
      pieChart.destroy();
      pieChart = null;
    }
    if (barChart) {
      barChart.destroy();
      barChart = null;
    }
    return;
  }

  criarGraficos();
}

function criarRanking() {
  const gastosPorCategoria = {};

  categorias.forEach((categoria) => {
    gastosPorCategoria[categoria.id] = {
      nome: categoria.nome,
      total: 0,
      itens: 0,
    };
  });

  itens.forEach((item) => {
    if (gastosPorCategoria[item.categoriaId]) {
      const quantidade = item.quantidade || 1;
      const valor = item.valor || 0;
      gastosPorCategoria[item.categoriaId].total += quantidade * valor;
      gastosPorCategoria[item.categoriaId].itens += 1;
    }
  });

  const ranking = Object.values(gastosPorCategoria)
    .filter((categoria) => categoria.total > 0)
    .sort((a, b) => b.total - a.total);

  const container = document.getElementById("rankingCategorias");
  if (!container) return;

  if (ranking.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-chart-line fa-2x"></i>
        <p>Nenhum gasto registrado ainda</p>
      </div>
    `;
    return;
  }

  const totalGeral = ranking.reduce((total, categoria) => total + categoria.total, 0);

  container.innerHTML = ranking
    .map((categoria, index) => {
      const percentual = ((categoria.total / totalGeral) * 100).toFixed(1);
      const medalha = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : "";

      return `
        <div class="ranking-item">
          <div class="ranking-position">${medalha} #${index + 1}</div>
          <div class="ranking-info">
            <div class="ranking-nome">${sanitizeInput(categoria.nome)}</div>
            <div class="ranking-meta">${categoria.itens} itens • ${percentual}% do total</div>
          </div>
          <div class="ranking-valor">${formatarReal(categoria.total)}</div>
        </div>
      `;
    })
    .join("");
}

function criarStatusOrcamento() {
  const container = document.getElementById("orcamentoStatus");
  if (!container) return;

  const categoriasComOrcamento = categorias.filter((categoria) => categoria.orcamento > 0);

  if (categoriasComOrcamento.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-piggy-bank fa-2x"></i>
        <p>Nenhuma categoria possui orçamento definido</p>
      </div>
    `;
    return;
  }

  const statusList = categoriasComOrcamento.map((categoria) => {
    const itensCategoria = itens.filter((item) => item.categoriaId === categoria.id);
    const totalGasto = itensCategoria.reduce((total, item) => {
      const quantidade = item.quantidade || 1;
      const valor = item.valor || 0;
      return total + quantidade * valor;
    }, 0);

    const orcamento = categoria.orcamento || 0;
    const percentual = orcamento > 0 ? (totalGasto / orcamento) * 100 : 0;
    const disponivel = Math.max(0, orcamento - totalGasto);

    let statusClass = "";
    let statusText = "";
    let statusIcon = "";

    if (percentual >= 100) {
      statusClass = "danger";
      statusText = "Orçamento excedido";
      statusIcon = "exclamation-circle";
    } else if (percentual >= 80) {
      statusClass = "warning";
      statusText = "Atenção ao limite";
      statusIcon = "exclamation-triangle";
    } else {
      statusClass = "success";
      statusText = "Dentro do orçamento";
      statusIcon = "check-circle";
    }

    return {
      nome: categoria.nome,
      orcamento,
      totalGasto,
      disponivel,
      percentual,
      statusClass,
      statusText,
      statusIcon,
    };
  });

  container.innerHTML = statusList
    .map(
      (status) => `
        <div class="orcamento-card">
          <div class="orcamento-header">
            <h3>${sanitizeInput(status.nome)}</h3>
            <span class="badge badge-${status.statusClass}">
              <i class="fas fa-${status.statusIcon}"></i> ${status.statusText}
            </span>
          </div>
          <div class="orcamento-body">
            <div class="orcamento-valores">
              <div class="orcamento-item">
                <span>Orçamento:</span>
                <strong>${formatarReal(status.orcamento)}</strong>
              </div>
              <div class="orcamento-item">
                <span>Gasto:</span>
                <strong>${formatarReal(status.totalGasto)}</strong>
              </div>
              <div class="orcamento-item">
                <span>Disponível:</span>
                <strong class="text-${status.disponivel > 0 ? "success" : "danger"}">
                  ${formatarReal(status.disponivel)}
                </strong>
              </div>
            </div>
            <div class="progress-bar-container">
              <div class="progress-bar ${status.statusClass}" style="width: ${Math.min(status.percentual, 100)}%"></div>
            </div>
            <div class="progress-text">${status.percentual.toFixed(1)}% utilizado</div>
          </div>
        </div>
      `,
    )
    .join("");
}
