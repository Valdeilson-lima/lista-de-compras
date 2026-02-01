// Variáveis globais
let categorias = [];
let itens = [];
let categoriaSelecionada = null;
let itemEditando = null;
let categoriaEditando = null;
let searchTerm = '';
let sortBy = 'nome';
let darkMode = localStorage.getItem('darkMode') === 'true';

// Elementos DOM (carregados quando disponíveis)
let categoriaNomeInput, addCategoriaBtn, itemNomeInput, itemCategoriaSelect, addItemBtn;
let categoriasList, itensList, categoriaSelecionadaTitulo, categoriaTotalElement;
let totalCategoriasElement, totalItensElement, totalGeralElement, totalCompradosElement;
let searchInput, sortSelect, clearCompradosBtn;
let editModal, closeModal, editItemNomeInput, editItemValorInput, editItemQuantidadeInput;
let editSubtotal, saveEditBtn, deleteItemBtn;
let editCategoriaModal, closeCategoriaModal, editCategoriaNomeInput, editCategoriaOrcamentoInput;
let saveCategoriaBtn, deleteCategoriaBtn;
let viewChartsBtn, exportPdfBtn, toggleThemeBtn;
let chartsModal, closeChartsModal;

// Função para inicializar elementos DOM
function inicializarElementosDOM() {
    categoriaNomeInput = document.getElementById('categoriaNome');
    addCategoriaBtn = document.getElementById('addCategoriaBtn');
    itemNomeInput = document.getElementById('itemNome');
    itemCategoriaSelect = document.getElementById('itemCategoria');
    addItemBtn = document.getElementById('addItemBtn');
    categoriasList = document.getElementById('categoriasList');
    itensList = document.getElementById('itensList');
    categoriaSelecionadaTitulo = document.getElementById('categoriaSelecionadaTitulo');
    categoriaTotalElement = document.getElementById('categoriaTotal');
    totalCategoriasElement = document.getElementById('totalCategorias');
    totalItensElement = document.getElementById('totalItens');
    totalGeralElement = document.getElementById('totalGeral');
    totalCompradosElement = document.getElementById('totalComprados');
    searchInput = document.getElementById('searchInput');
    sortSelect = document.getElementById('sortSelect');
    clearCompradosBtn = document.getElementById('clearCompradosBtn');
    editModal = document.getElementById('editModal');
    closeModal = document.querySelector('.close');
    editItemNomeInput = document.getElementById('editItemNome');
    editItemValorInput = document.getElementById('editItemValor');
    editItemQuantidadeInput = document.getElementById('editItemQuantidade');
    editSubtotal = document.getElementById('editSubtotal');
    saveEditBtn = document.getElementById('saveEditBtn');
    deleteItemBtn = document.getElementById('deleteItemBtn');
    editCategoriaModal = document.getElementById('editCategoriaModal');
    closeCategoriaModal = document.querySelector('.close-categoria');
    editCategoriaNomeInput = document.getElementById('editCategoriaNome');
    editCategoriaOrcamentoInput = document.getElementById('editCategoriaOrcamento');
    saveCategoriaBtn = document.getElementById('saveCategoriaBtn');
    deleteCategoriaBtn = document.getElementById('deleteCategoriaBtn');
    viewChartsBtn = document.getElementById('viewChartsBtn');
    exportPdfBtn = document.getElementById('exportPdfBtn');
    toggleThemeBtn = document.getElementById('toggleThemeBtn');
    chartsModal = document.getElementById('chartsModal');
    closeChartsModal = document.querySelector('.close-charts');
}

// Utilitários de performance
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function sanitizeInput(input) {
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
}

function validateInput(input, type = 'text') {
    if (!input || typeof input !== 'string') return false;
    
    input = input.trim();
    if (input.length === 0) return false;
    
    switch(type) {
        case 'number':
            return !isNaN(input) && parseFloat(input) >= 0;
        case 'text':
            return input.length > 0 && input.length <= 100;
        case 'categoria':
            return input.length > 0 && input.length <= 50;
        default:
            return input.length > 0;
    }
}

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar elementos DOM primeiro
    inicializarElementosDOM();
    
    // Verificar se elementos críticos foram encontrados
    if (!toggleThemeBtn) {
        console.error('Botão de tema não encontrado!');
        return;
    }
    
    // Aplicar tema salvo
    aplicarTemaSalvo();
    
    // Inicializar Firebase listeners (tempo real)
    inicializarFirebaseListeners();
    
    // Form submission handlers
    document.getElementById('categoriaForm')?.addEventListener('submit', function(e) {
        e.preventDefault();
        adicionarCategoria();
    });
    
    document.getElementById('itemForm')?.addEventListener('submit', function(e) {
        e.preventDefault();
        adicionarItem();
    });
    
    // Event Listeners com verificação de existência
    if (addCategoriaBtn) addCategoriaBtn.addEventListener('click', adicionarCategoria);
    if (addItemBtn) addItemBtn.addEventListener('click', adicionarItem);
    if (closeModal) closeModal.addEventListener('click', fecharModal);
    if (saveEditBtn) saveEditBtn.addEventListener('click', salvarEdicaoItem);
    if (deleteItemBtn) deleteItemBtn.addEventListener('click', excluirItem);
    
    if (closeCategoriaModal) closeCategoriaModal.addEventListener('click', fecharModalCategoria);
    if (saveCategoriaBtn) saveCategoriaBtn.addEventListener('click', salvarEdicaoCategoria);
    if (deleteCategoriaBtn) deleteCategoriaBtn.addEventListener('click', excluirCategoria);
    
    if (viewChartsBtn) viewChartsBtn.addEventListener('click', abrirModalGraficos);
    if (exportPdfBtn) exportPdfBtn.addEventListener('click', exportarPDF);
    if (toggleThemeBtn) toggleThemeBtn.addEventListener('click', toggleTema);
    if (closeChartsModal) closeChartsModal.addEventListener('click', fecharModalGraficos);
    
    if (searchInput) {
        searchInput.addEventListener('input', debounce((e) => {
            searchTerm = sanitizeInput(e.target.value.toLowerCase());
            renderizarItensCategoriaSelecionada();
        }, 300));
    }
    
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            sortBy = e.target.value;
            renderizarItensCategoriaSelecionada();
        });
    }
    
    if (clearCompradosBtn) clearCompradosBtn.addEventListener('click', limparComprados);
    
    // Atualizar subtotal ao editar
    if (editItemValorInput) editItemValorInput.addEventListener('input', debounce(atualizarSubtotal, 300));
    if (editItemQuantidadeInput) editItemQuantidadeInput.addEventListener('input', debounce(atualizarSubtotal, 300));
    
    // Fechar modais ao clicar fora
    window.addEventListener('click', function(event) {
        if (event.target === editModal) fecharModal();
        if (event.target === editCategoriaModal) fecharModalCategoria();
        if (event.target === chartsModal) fecharModalGraficos();
    });
    
    // Registrar Service Worker para PWA
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
});

// Função para aplicar tema salvo
function aplicarTemaSalvo() {
    if (darkMode) {
        document.body.classList.add('dark-mode');
        if (toggleThemeBtn) {
            toggleThemeBtn.innerHTML = '<i class="fas fa-sun"></i>';
        }
    } else {
        if (toggleThemeBtn) {
            toggleThemeBtn.innerHTML = '<i class="fas fa-moon"></i>';
        }
    }
}
    
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

// Firebase - Listeners em tempo real com tratamento de erros robusto
function inicializarFirebaseListeners() {
    // Verificar conexão com Firebase
    if (!db) {
        mostrarToast('Erro de conexão com o banco de dados', 'error');
        return;
    }

    // Categorias em tempo real
    try {
        db.collection('categorias').orderBy('nome').onSnapshot((snapshot) => {
            categorias = [];
            snapshot.forEach((doc) => {
                if (doc.exists) {
                    categorias.push({ id: doc.id, ...doc.data() });
                }
            });
            
            // Verificar se há dados válidos antes de renderizar
            if (Array.isArray(categorias)) {
                atualizarSelectCategorias();
                renderizarCategorias();
                atualizarResumo();
            }
        }, (error) => {
            console.error('Erro ao carregar categorias:', error);
            handleFirebaseError(error, 'categorias');
        });
    } catch (error) {
        console.error('Erro ao inicializar listener de categorias:', error);
        mostrarToast('Falha ao sincronizar categorias', 'error');
    }
    
    // Itens em tempo real
    try {
        db.collection('itens').onSnapshot((snapshot) => {
            itens = [];
            snapshot.forEach((doc) => {
                if (doc.exists) {
                    itens.push({ id: doc.id, ...doc.data() });
                }
            });
            
            // Verificar se há dados válidos antes de renderizar
            if (Array.isArray(itens)) {
                renderizarItensCategoriaSelecionada();
                atualizarResumo();
            }
        }, (error) => {
            console.error('Erro ao carregar itens:', error);
            handleFirebaseError(error, 'itens');
        });
    } catch (error) {
        console.error('Erro ao inicializar listener de itens:', error);
        mostrarToast('Falha ao sincronizar itens', 'error');
    }
}

// Tratamento de erros específicos do Firebase
function handleFirebaseError(error, context) {
    let message = 'Erro desconhecido';
    
    if (error.code === 'unavailable') {
        message = 'Sem conexão com a internet. Verifique sua rede.';
    } else if (error.code === 'permission-denied') {
        message = 'Sem permissão para acessar os dados.';
    } else if (error.code === 'resource-exhausted') {
        message = 'Limite de requisições excedido. Tente mais tarde.';
    } else if (error.code === 'deadline-exceeded') {
        message = 'Tempo limite excedido. Tente novamente.';
    } else if (error.code === 'not-found') {
        message = 'Dados não encontrados.';
    } else if (error.code === 'already-exists') {
        message = 'Item já existe.';
    } else {
        message = `Erro no ${context}: ${error.message || 'Tente novamente.'}`;
    }
    
    mostrarToast(message, 'error');
    
    // Tentar reconectar após erro de conexão
    if (error.code === 'unavailable' || error.code === 'deadline-exceeded') {
        setTimeout(() => {
            inicializarFirebaseListeners();
        }, 5000);
    }
}

// Adicionar categoria
async function adicionarCategoria() {
    if (!categoriaNomeInput) {
        console.error('Input de categoria não encontrado');
        return;
    }
    
    const nome = sanitizeInput(categoriaNomeInput.value);
    
    if (!validateInput(nome, 'categoria')) {
        mostrarToast('Digite um nome válido para a categoria (máx. 50 caracteres)', 'warning');
        categoriaNomeInput.focus();
        return;
    }
    
    try {
        const categoriaData = {
            nome: nome,
            orcamento: 0,
            dataCriacao: new Date().toISOString()
        };
        
        await db.collection('categorias').add(categoriaData);
        
        categoriaNomeInput.value = '';
        mostrarToast('Categoria adicionada com sucesso!', 'success');
    } catch (error) {
        console.error('Erro ao adicionar categoria:', error);
        mostrarToast('Erro ao adicionar categoria. Tente novamente.', 'error');
    }
}

// Adicionar item
async function adicionarItem() {
    if (!itemNomeInput || !itemCategoriaSelect) {
        console.error('Inputs de item não encontrados');
        return;
    }
    
    const nome = sanitizeInput(itemNomeInput.value);
    const categoriaId = itemCategoriaSelect.value;
    
    if (!validateInput(nome, 'text')) {
        mostrarToast('Digite um nome válido para o item (máx. 100 caracteres)', 'warning');
        itemNomeInput.focus();
        return;
    }
    
    if (!categoriaId) {
        mostrarToast('Selecione uma categoria', 'warning');
        itemCategoriaSelect.focus();
        return;
    }
    
    try {
        const itemData = {
            nome: nome,
            categoriaId: categoriaId,
            valor: 0,
            quantidade: 1,
            comprado: false,
            dataCriacao: new Date().toISOString()
        };
        
        await db.collection('itens').add(itemData);
        
        itemNomeInput.value = '';
        mostrarToast('Item adicionado com sucesso!', 'success');
        
        // Selecionar automaticamente a categoria
        selecionarCategoria(categoriaId);
    } catch (error) {
        console.error('Erro ao adicionar item:', error);
        mostrarToast('Erro ao adicionar item. Tente novamente.', 'error');
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
    if (!categoriasList) return;
    
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
                    <div class="category-name">${sanitizeInput(categoria.nome)}</div>
                    <div class="category-info">
                        <span class="category-count">${itensCategoria.length} itens</span>
                        <span class="category-total">R$ ${totalCategoria.toFixed(2)}</span>
                    </div>
                    ${budgetHtml}
                </div>
                <div class="category-actions">
                    <button class="category-action-btn edit" title="Editar categoria">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="category-action-btn delete" title="Excluir categoria">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
        
        const categoryMain = categoriaElement.querySelector('.category-main');
        if (categoryMain) {
            categoryMain.addEventListener('click', () => {
                selecionarCategoria(categoria.id);
            });
        }
        
        const editBtn = categoriaElement.querySelector('.edit');
        if (editBtn) {
            editBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                abrirModalEdicaoCategoria(categoria.id);
            });
        }
        
        const deleteBtn = categoriaElement.querySelector('.delete');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (confirm(`Deseja excluir a categoria "${categoria.nome}"?`)) {
                    excluirCategoriaFirebase(categoria.id);
                }
            });
        }
        
        categoriasList.appendChild(categoriaElement);
    });
}

// Selecionar categoria
function selecionarCategoria(categoriaId) {
    categoriaSelecionada = categoriaId;
    renderizarCategorias();
    renderizarItensCategoriaSelecionada();
    
    const categoria = categorias.find(c => c.id === categoriaId);
    if (categoria && categoriaSelecionadaTitulo) {
        categoriaSelecionadaTitulo.innerHTML = `<i class="fas fa-tag"></i> ${sanitizeInput(categoria.nome)}`;
    }
}

// Renderizar itens
function renderizarItensCategoriaSelecionada() {
    if (!itensList) return;
    
    itensList.innerHTML = '';
    
    if (!categoriaSelecionada) {
        itensList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-clipboard-list fa-3x"></i>
                <p>Selecione uma categoria</p>
            </div>
        `;
        if (categoriaTotalElement) categoriaTotalElement.textContent = 'R$ 0,00';
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
                    <div class="item-name">${sanitizeInput(item.nome)}</div>
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
    if (categoriaTotalElement) {
        categoriaTotalElement.textContent = `R$ ${totalCategoria.toFixed(2)}`;
    }
}

// Modais
function abrirModalEdicao(itemId) {
    const item = itens.find(i => i.id === itemId);
    if (!item) return;
    
    itemEditando = item;
    
    if (editItemNomeInput) editItemNomeInput.value = item.nome;
    if (editItemValorInput) editItemValorInput.value = item.valor || 0;
    if (editItemQuantidadeInput) editItemQuantidadeInput.value = item.quantidade || 1;
    
    atualizarSubtotal();
    if (editModal) editModal.style.display = 'flex';
}

function fecharModal() {
    if (editModal) editModal.style.display = 'none';
    itemEditando = null;
}

function salvarEdicaoItem() {
    if (!itemEditando) return;
    
    const novoNome = editItemNomeInput ? editItemNomeInput.value.trim() : '';
    const novoValor = editItemValorInput ? parseFloat(editItemValorInput.value) || 0 : 0;
    const novaQuantidade = editItemQuantidadeInput ? parseInt(editItemQuantidadeInput.value) || 1 : 1;
    
    if (!validateInput(novoNome, 'text')) {
        mostrarToast('Digite um nome válido para o item', 'warning');
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
    if (!editItemValorInput || !editItemQuantidadeInput || !editSubtotal) return;
    
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
    
    if (toggleThemeBtn) {
        if (darkMode) {
            toggleThemeBtn.innerHTML = '<i class="fas fa-sun"></i>';
        } else {
            toggleThemeBtn.innerHTML = '<i class="fas fa-moon"></i>';
        }
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

// Toast notifications melhorado
function mostrarToast(mensagem, tipo = 'success', duracao = 3000) {
    // Remover toasts existentes para evitar acúmulo
    const toastsExistentes = document.querySelectorAll('.toast');
    toastsExistentes.forEach(toast => toast.remove());
    
    const toast = document.createElement('div');
    toast.className = `toast ${tipo}`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'polite');
    
    const iconMap = {
        'success': 'check-circle',
        'error': 'exclamation-circle',
        'warning': 'exclamation-triangle',
        'info': 'info-circle'
    };
    
    const icon = iconMap[tipo] || 'info-circle';
    toast.innerHTML = `
        <i class="fas fa-${icon}" aria-hidden="true"></i>
        <span class="toast-message">${sanitizeInput(mensagem)}</span>
        <button class="toast-close" aria-label="Fechar notificação">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    document.body.appendChild(toast);
    
    // Adicionar botão de fechar
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => {
        toast.remove();
    });
    
    // Auto-remove após duração
    setTimeout(() => {
        if (document.body.contains(toast)) {
            toast.style.animation = 'slideOutRight 0.3s ease-in forwards';
            setTimeout(() => toast.remove(), 300);
        }
    }, duracao);
}
