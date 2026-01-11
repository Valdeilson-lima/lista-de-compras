// Variáveis globais
let categorias = [];
let itens = [];
let categoriaSelecionada = null;
let itemEditando = null;
let categoriaEditando = null;
let searchTerm = '';
let sortBy = 'nome';
let darkMode = localStorage.getItem('darkMode') === 'true';

// Elementos DOM
const categoriaNomeInput = document.getElementById('categoriaNome');
const addCategoriaBtn = document.getElementById('addCategoriaBtn');
const itemNomeInput = document.getElementById('itemNome');
const itemCategoriaSelect = document.getElementById('itemCategoria');
const addItemBtn = document.getElementById('addItemBtn');
const categoriasList = document.getElementById('categoriasList');
const itensList = document.getElementById('itensList');
const categoriaSelecionadaTitulo = document.getElementById('categoriaSelecionadaTitulo');
const categoriaTotalElement = document.getElementById('categoriaTotal');
const totalCategoriasElement = document.getElementById('totalCategorias');
const totalItensElement = document.getElementById('totalItens');
const totalGeralElement = document.getElementById('totalGeral');
const totalCompradosElement = document.getElementById('totalComprados');

// Busca e filtros
const searchInput = document.getElementById('searchInput');
const sortSelect = document.getElementById('sortSelect');
const clearCompradosBtn = document.getElementById('clearCompradosBtn');

// Modal item
const editModal = document.getElementById('editModal');
const closeModal = document.querySelector('.close');
const editItemNomeInput = document.getElementById('editItemNome');
const editItemValorInput = document.getElementById('editItemValor');
const editItemQuantidadeInput = document.getElementById('editItemQuantidade');
const editSubtotal = document.getElementById('editSubtotal');
const saveEditBtn = document.getElementById('saveEditBtn');
const deleteItemBtn = document.getElementById('deleteItemBtn');

// Modal categoria
const editCategoriaModal = document.getElementById('editCategoriaModal');
const closeCategoriaModal = document.querySelector('.close-categoria');
const editCategoriaNomeInput = document.getElementById('editCategoriaNome');
const editCategoriaOrcamentoInput = document.getElementById('editCategoriaOrcamento');
const saveCategoriaBtn = document.getElementById('saveCategoriaBtn');
const deleteCategoriaBtn = document.getElementById('deleteCategoriaBtn');

// Botões de ação
const viewChartsBtn = document.getElementById('viewChartsBtn');
const exportPdfBtn = document.getElementById('exportPdfBtn');
const toggleThemeBtn = document.getElementById('toggleThemeBtn');

// Modal gráficos
const chartsModal = document.getElementById('chartsModal');
const closeChartsModal = document.querySelector('.close-charts');

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    // Aplicar tema salvo
    if (darkMode) {
        document.body.classList.add('dark-mode');
        toggleThemeBtn.innerHTML = '<i class="fas fa-sun"></i>';
    }
    
    // Inicializar Firebase listeners (tempo real)
    inicializarFirebaseListeners();
    
    // Event Listeners
    addCategoriaBtn.addEventListener('click', adicionarCategoria);
    addItemBtn.addEventListener('click', adicionarItem);
    closeModal.addEventListener('click', fecharModal);
    saveEditBtn.addEventListener('click', salvarEdicaoItem);
    deleteItemBtn.addEventListener('click', excluirItem);
    
    closeCategoriaModal.addEventListener('click', fecharModalCategoria);
    saveCategoriaBtn.addEventListener('click', salvarEdicaoCategoria);
    deleteCategoriaBtn.addEventListener('click', excluirCategoria);
    
    viewChartsBtn.addEventListener('click', abrirModalGraficos);
    exportPdfBtn.addEventListener('click', exportarPDF);
    toggleThemeBtn.addEventListener('click', toggleTema);
    closeChartsModal.addEventListener('click', fecharModalGraficos);
    
    searchInput.addEventListener('input', (e) => {
        searchTerm = e.target.value.toLowerCase();
        renderizarItensCategoriaSelecionada();
    });
    
    sortSelect.addEventListener('change', (e) => {
        sortBy = e.target.value;
        renderizarItensCategoriaSelecionada();
    });
    
    clearCompradosBtn.addEventListener('click', limparComprados);
    
    // Atualizar subtotal ao editar
    editItemValorInput.addEventListener('input', atualizarSubtotal);
    editItemQuantidadeInput.addEventListener('input', atualizarSubtotal);
    
    // Fechar modais ao clicar fora
    window.addEventListener('click', function(event) {
        if (event.target === editModal) fecharModal();
        if (event.target === editCategoriaModal) fecharModalCategoria();
        if (event.target === chartsModal) fecharModalGraficos();
    });
    
    // Enter para adicionar
    categoriaNomeInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') adicionarCategoria();
    });
    
    itemNomeInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') adicionarItem();
    });
    
    // Registrar Service Worker para PWA
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
});

// Firebase - Listeners em tempo real
function inicializarFirebaseListeners() {
    // Categorias em tempo real
    db.collection('categorias').orderBy('nome').onSnapshot((snapshot) => {
        categorias = [];
        snapshot.forEach((doc) => {
            categorias.push({ id: doc.id, ...doc.data() });
        });
        atualizarSelectCategorias();
        renderizarCategorias();
        atualizarResumo();
    }, (error) => {
        console.error('Erro ao carregar categorias:', error);
        mostrarToast('Erro ao carregar categorias', 'error');
    });
    
    // Itens em tempo real
    db.collection('itens').onSnapshot((snapshot) => {
        itens = [];
        snapshot.forEach((doc) => {
            itens.push({ id: doc.id, ...doc.data() });
        });
        renderizarItensCategoriaSelecionada();
        atualizarResumo();
    }, (error) => {
        console.error('Erro ao carregar itens:', error);
        mostrarToast('Erro ao carregar itens', 'error');
    });
}

// Adicionar categoria
async function adicionarCategoria() {
    const nome = categoriaNomeInput.value.trim();
    
    if (!nome) {
        mostrarToast('Digite um nome para a categoria', 'warning');
        return;
    }
    
    try {
        await db.collection('categorias').add({
            nome: nome,
            orcamento: 0,
            dataCriacao: new Date()
        });
        
        categoriaNomeInput.value = '';
        mostrarToast('Categoria adicionada!', 'success');
    } catch (error) {
        console.error('Erro ao adicionar categoria:', error);
        mostrarToast('Erro ao adicionar categoria', 'error');
    }
}

// Adicionar item
async function adicionarItem() {
    const nome = itemNomeInput.value.trim();
    const categoriaId = itemCategoriaSelect.value;
    
    if (!nome) {
        mostrarToast('Digite um nome para o item', 'warning');
        return;
    }
    
    if (!categoriaId) {
        mostrarToast('Selecione uma categoria', 'warning');
        return;
    }
    
    try {
        await db.collection('itens').add({
            nome: nome,
            categoriaId: categoriaId,
            valor: 0,
            quantidade: 1,
            comprado: false,
            dataCriacao: new Date()
        });
        
        itemNomeInput.value = '';
        mostrarToast('Item adicionado!', 'success');
        
        // Selecionar automaticamente a categoria
        selecionarCategoria(categoriaId);
    } catch (error) {
        console.error('Erro ao adicionar item:', error);
        mostrarToast('Erro ao adicionar item', 'error');
    }
}

// Atualizar item
async function atualizarItem(itemId, novosDados) {
    try {
        await db.collection('itens').doc(itemId).update(novosDados);
    } catch (error) {
        console.error('Erro ao atualizar item:', error);
        mostrarToast('Erro ao atualizar item', 'error');
    }
}

// Excluir item
async function excluirItemFirebase(itemId) {
    try {
        await db.collection('itens').doc(itemId).delete();
        mostrarToast('Item excluído!', 'success');
    } catch (error) {
        console.error('Erro ao excluir item:', error);
        mostrarToast('Erro ao excluir item', 'error');
    }
}

// Excluir categoria
async function excluirCategoriaFirebase(categoriaId) {
    try {
        // Verificar se há itens
        const itensCategoria = itens.filter(item => item.categoriaId === categoriaId);
        
        if (itensCategoria.length > 0) {
            const confirmar = confirm(`Esta categoria tem ${itensCategoria.length} itens. Deseja excluir todos?`);
            if (!confirmar) return;
            
            // Excluir todos os itens
            const batch = db.batch();
            itensCategoria.forEach(item => {
                batch.delete(db.collection('itens').doc(item.id));
            });
            await batch.commit();
        }
        
        await db.collection('categorias').doc(categoriaId).delete();
        categoriaSelecionada = null;
        mostrarToast('Categoria excluída!', 'success');
    } catch (error) {
        console.error('Erro ao excluir categoria:', error);
        mostrarToast('Erro ao excluir categoria', 'error');
    }
}

// UI - Renderizar categorias
function renderizarCategorias() {
    categoriasList.innerHTML = '';
    
    if (categorias.length === 0) {
        categoriasList.innerHTML = `
            <div class="empty-state">
                <p>Nenhuma categoria cadastrada</p>
            </div>
        `;
        return;
    }
    
    categorias.forEach(categoria => {
        const itensCategoria = itens.filter(item => item.categoriaId === categoria.id);
        const totalCategoria = calcularTotalCategoria(categoria.id);
        const orcamento = categoria.orcamento || 0;
        const percentual = orcamento > 0 ? (totalCategoria / orcamento) * 100 : 0;
        
        const categoriaElement = document.createElement('div');
        categoriaElement.className = `category-card ${categoriaSelecionada === categoria.id ? 'active' : ''}`;
        
        let budgetHtml = '';
        if (orcamento > 0) {
            let barClass = '';
            if (percentual >= 100) barClass = 'danger';
            else if (percentual >= 80) barClass = 'warning';
            
            budgetHtml = `
                <div class="budget-bar-container">
                    <div class="budget-bar ${barClass}" style="width: ${Math.min(percentual, 100)}%"></div>
                </div>
                <div class="budget-info">
                    <span>Orçamento: R$ ${orcamento.toFixed(2)}</span>
                    <span>${percentual.toFixed(0)}%</span>
                </div>
            `;
        }
        
        categoriaElement.innerHTML = `
            <div class="category-card-content">
                <div class="category-main">
                    <div class="category-name">${categoria.nome}</div>
                    <div class="category-info">
                        <span class="category-count">${itensCategoria.length} itens</span>
                        <span class="category-total">R$ ${totalCategoria.toFixed(2)}</span>
                    </div>
                    ${budgetHtml}
                </div>
                <div class="category-actions">
                    <button class="category-action-btn edit" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="category-action-btn delete" title="Excluir">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
        
        categoriaElement.querySelector('.category-main').addEventListener('click', () => {
            selecionarCategoria(categoria.id);
        });
        
        categoriaElement.querySelector('.edit').addEventListener('click', (e) => {
            e.stopPropagation();
            abrirModalEdicaoCategoria(categoria.id);
        });
        
        categoriaElement.querySelector('.delete').addEventListener('click', (e) => {
            e.stopPropagation();
            if (confirm(`Deseja excluir a categoria "${categoria.nome}"?`)) {
                excluirCategoriaFirebase(categoria.id);
            }
        });
        
        categoriasList.appendChild(categoriaElement);
    });
}

// Selecionar categoria
function selecionarCategoria(categoriaId) {
    categoriaSelecionada = categoriaId;
    renderizarCategorias();
    renderizarItensCategoriaSelecionada();
    
    const categoria = categorias.find(c => c.id === categoriaId);
    if (categoria) {
        categoriaSelecionadaTitulo.innerHTML = `<i class="fas fa-tag"></i> ${categoria.nome}`;
    }
}

// Renderizar itens
function renderizarItensCategoriaSelecionada() {
    itensList.innerHTML = '';
    
    if (!categoriaSelecionada) {
        itensList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-clipboard-list fa-3x"></i>
                <p>Selecione uma categoria</p>
            </div>
        `;
        categoriaTotalElement.textContent = 'R$ 0,00';
        return;
    }
    
    let itensCategoria = itens.filter(item => item.categoriaId === categoriaSelecionada);
    
    // Aplicar busca
    if (searchTerm) {
        itensCategoria = itensCategoria.filter(item => 
            item.nome.toLowerCase().includes(searchTerm)
        );
    }
    
    // Aplicar ordenação
    itensCategoria.sort((a, b) => {
        switch(sortBy) {
            case 'nome':
                return a.nome.localeCompare(b.nome);
            case 'nome-desc':
                return b.nome.localeCompare(a.nome);
            case 'valor':
                return (a.valor || 0) - (b.valor || 0);
            case 'valor-desc':
                return (b.valor || 0) - (a.valor || 0);
            default:
                return 0;
        }
    });
    
    if (itensCategoria.length === 0) {
        itensList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-box-open fa-3x"></i>
                <p>${searchTerm ? 'Nenhum item encontrado' : 'Nenhum item nesta categoria'}</p>
            </div>
        `;
    } else {
        itensCategoria.forEach(item => {
            const quantidade = item.quantidade || 1;
            const valor = item.valor || 0;
            const subtotal = quantidade * valor;
            
            const itemElement = document.createElement('div');
            itemElement.className = `item-card ${item.comprado ? 'comprado' : ''}`;
            itemElement.innerHTML = `
                <input type="checkbox" 
                       class="item-checkbox" 
                       ${item.comprado ? 'checked' : ''}
                       data-item-id="${item.id}">
                <div class="item-info">
                    <div class="item-name">${item.nome}</div>
                    <div class="item-value">
                        ${quantidade}x R$ ${valor.toFixed(2)} = R$ ${subtotal.toFixed(2)}
                    </div>
                </div>
                <div class="item-actions">
                    <input type="number" 
                           class="item-value-input" 
                           value="${valor}" 
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
        
        // Event listeners para checkboxes
        document.querySelectorAll('.item-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', function() {
                const itemId = this.getAttribute('data-item-id');
                atualizarItem(itemId, { comprado: this.checked });
            });
        });
        
        // Event listeners para inputs de valor
        document.querySelectorAll('.item-value-input').forEach(input => {
            input.addEventListener('change', function() {
                const itemId = this.getAttribute('data-item-id');
                const novoValor = parseFloat(this.value) || 0;
                atualizarItem(itemId, { valor: novoValor });
            });
        });
        
        // Event listeners para botões de edição
        document.querySelectorAll('.edit-btn').forEach(button => {
            button.addEventListener('click', function() {
                const itemId = this.getAttribute('data-item-id');
                abrirModalEdicao(itemId);
            });
        });
    }
    
    const totalCategoria = calcularTotalCategoria(categoriaSelecionada);
    categoriaTotalElement.textContent = `R$ ${totalCategoria.toFixed(2)}`;
}

// Modais
function abrirModalEdicao(itemId) {
    const item = itens.find(i => i.id === itemId);
    if (!item) return;
    
    itemEditando = item;
    editItemNomeInput.value = item.nome;
    editItemValorInput.value = item.valor || 0;
    editItemQuantidadeInput.value = item.quantidade || 1;
    atualizarSubtotal();
    editModal.style.display = 'flex';
}

function fecharModal() {
    editModal.style.display = 'none';
    itemEditando = null;
}

function salvarEdicaoItem() {
    if (!itemEditando) return;
    
    const novoNome = editItemNomeInput.value.trim();
    const novoValor = parseFloat(editItemValorInput.value) || 0;
    const novaQuantidade = parseInt(editItemQuantidadeInput.value) || 1;
    
    if (!novoNome) {
        mostrarToast('Digite um nome para o item', 'warning');
        return;
    }
    
    atualizarItem(itemEditando.id, {
        nome: novoNome,
        valor: novoValor,
        quantidade: novaQuantidade
    });
    
    fecharModal();
    mostrarToast('Item atualizado!', 'success');
}

function excluirItem() {
    if (!itemEditando) return;
    
    if (confirm(`Deseja excluir "${itemEditando.nome}"?`)) {
        excluirItemFirebase(itemEditando.id);
        fecharModal();
    }
}

function atualizarSubtotal() {
    const valor = parseFloat(editItemValorInput.value) || 0;
    const quantidade = parseInt(editItemQuantidadeInput.value) || 1;
    const subtotal = valor * quantidade;
    editSubtotal.textContent = `R$ ${subtotal.toFixed(2)}`;
}

// Modal categoria
function abrirModalEdicaoCategoria(categoriaId) {
    const categoria = categorias.find(c => c.id === categoriaId);
    if (!categoria) return;
    
    categoriaEditando = categoria;
    editCategoriaNomeInput.value = categoria.nome;
    editCategoriaOrcamentoInput.value = categoria.orcamento || 0;
    editCategoriaModal.style.display = 'flex';
}

function fecharModalCategoria() {
    editCategoriaModal.style.display = 'none';
    categoriaEditando = null;
}

async function salvarEdicaoCategoria() {
    if (!categoriaEditando) return;
    
    const novoNome = editCategoriaNomeInput.value.trim();
    const novoOrcamento = parseFloat(editCategoriaOrcamentoInput.value) || 0;
    
    if (!novoNome) {
        mostrarToast('Digite um nome para a categoria', 'warning');
        return;
    }
    
    try {
        await db.collection('categorias').doc(categoriaEditando.id).update({
            nome: novoNome,
            orcamento: novoOrcamento
        });
        
        fecharModalCategoria();
        mostrarToast('Categoria atualizada!', 'success');
    } catch (error) {
        console.error('Erro ao atualizar categoria:', error);
        mostrarToast('Erro ao atualizar categoria', 'error');
    }
}

function excluirCategoria() {
    if (!categoriaEditando) return;
    
    if (confirm(`Deseja excluir "${categoriaEditando.nome}"?`)) {
        excluirCategoriaFirebase(categoriaEditando.id);
        fecharModalCategoria();
    }
}

// Limpar comprados
async function limparComprados() {
    if (!categoriaSelecionada) return;
    
    const itensComprados = itens.filter(item => 
        item.categoriaId === categoriaSelecionada && item.comprado
    );
    
    if (itensComprados.length === 0) {
        mostrarToast('Nenhum item comprado para limpar', 'warning');
        return;
    }
    
    if (!confirm(`Excluir ${itensComprados.length} itens comprados?`)) return;
    
    try {
        const batch = db.batch();
        itensComprados.forEach(item => {
            batch.delete(db.collection('itens').doc(item.id));
        });
        await batch.commit();
        mostrarToast('Itens comprados removidos!', 'success');
    } catch (error) {
        console.error('Erro ao limpar comprados:', error);
        mostrarToast('Erro ao limpar itens', 'error');
    }
}

// Gráficos
function abrirModalGraficos() {
    chartsModal.style.display = 'flex';
    setTimeout(() => {
        renderizarGraficos();
    }, 100);
}

function fecharModalGraficos() {
    chartsModal.style.display = 'none';
}

function renderizarGraficos() {
    const pieCtx = document.getElementById('pieChart').getContext('2d');
    const barCtx = document.getElementById('barChart').getContext('2d');
    
    // Dados para os gráficos
    const labels = categorias.map(c => c.nome);
    const data = categorias.map(c => calcularTotalCategoria(c.id));
    const cores = [
        '#10b981', '#3b82f6', '#ef4444', '#f59e0b', 
        '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'
    ];
    
    // Gráfico de pizza
    new Chart(pieCtx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: cores,
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.label}: R$ ${context.parsed.toFixed(2)}`;
                        }
                    }
                }
            }
        }
    });
    
    // Gráfico de barras
    new Chart(barCtx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Total por Categoria',
                data: data,
                backgroundColor: cores,
                borderWidth: 0,
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `R$ ${context.parsed.y.toFixed(2)}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return 'R$ ' + value.toFixed(2);
                        }
                    }
                }
            }
        }
    });
}

// Exportar PDF
async function exportarPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    let y = 20;
    
    // Título
    doc.setFontSize(20);
    doc.text('Lista de Compras', 105, y, { align: 'center' });
    y += 15;
    
    doc.setFontSize(12);
    doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 20, y);
    y += 10;
    
    // Total geral
    const totalGeral = calcularTotalGeral();
    doc.setFontSize(14);
    doc.text(`Total Geral: R$ ${totalGeral.toFixed(2)}`, 20, y);
    y += 15;
    
    // Categorias e itens
    categorias.forEach(categoria => {
        const itensCategoria = itens.filter(item => item.categoriaId === categoria.id);
        if (itensCategoria.length === 0) return;
        
        // Categoria
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text(categoria.nome, 20, y);
        y += 8;
        
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        
        // Itens
        itensCategoria.forEach(item => {
            if (y > 270) {
                doc.addPage();
                y = 20;
            }
            
            const quantidade = item.quantidade || 1;
            const valor = item.valor || 0;
            const subtotal = quantidade * valor;
            const status = item.comprado ? '[✓]' : '[ ]';
            
            doc.text(`${status} ${item.nome}`, 25, y);
            doc.text(`${quantidade}x R$ ${valor.toFixed(2)} = R$ ${subtotal.toFixed(2)}`, 150, y);
            y += 6;
        });
        
        // Total da categoria
        const totalCategoria = calcularTotalCategoria(categoria.id);
        doc.setFont(undefined, 'bold');
        doc.text(`Subtotal: R$ ${totalCategoria.toFixed(2)}`, 150, y);
        doc.setFont(undefined, 'normal');
        y += 10;
    });
    
    doc.save('lista-de-compras.pdf');
    mostrarToast('PDF exportado!', 'success');
}

// Tema
function toggleTema() {
    darkMode = !darkMode;
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', darkMode);
    
    if (darkMode) {
        toggleThemeBtn.innerHTML = '<i class="fas fa-sun"></i>';
    } else {
        toggleThemeBtn.innerHTML = '<i class="fas fa-moon"></i>';
    }
}

// Funções auxiliares
function atualizarSelectCategorias() {
    itemCategoriaSelect.innerHTML = '<option value="">Selecione uma categoria</option>';
    
    categorias.forEach(categoria => {
        const option = document.createElement('option');
        option.value = categoria.id;
        option.textContent = categoria.nome;
        itemCategoriaSelect.appendChild(option);
    });
}

function calcularTotalCategoria(categoriaId) {
    const itensCategoria = itens.filter(item => item.categoriaId === categoriaId);
    return itensCategoria.reduce((total, item) => {
        const quantidade = item.quantidade || 1;
        const valor = item.valor || 0;
        return total + (quantidade * valor);
    }, 0);
}

function calcularTotalGeral() {
    return itens.reduce((total, item) => {
        const quantidade = item.quantidade || 1;
        const valor = item.valor || 0;
        return total + (quantidade * valor);
    }, 0);
}

function atualizarResumo() {
    const totalComprados = itens.filter(item => item.comprado).length;
    
    totalCategoriasElement.textContent = categorias.length;
    totalItensElement.textContent = itens.length;
    totalCompradosElement.textContent = totalComprados;
    totalGeralElement.textContent = `R$ ${calcularTotalGeral().toFixed(2)}`;
}

// Toast notifications
function mostrarToast(mensagem, tipo = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${tipo}`;
    toast.innerHTML = `<i class="fas fa-${tipo === 'success' ? 'check-circle' : tipo === 'error' ? 'exclamation-circle' : 'exclamation-triangle'}"></i> ${mensagem}`;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}
