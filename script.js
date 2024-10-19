
let pedidos = [];
let itensPedido = [];

document.getElementById('adicionar-item').addEventListener('click', adicionarItem);
document.getElementById('finalizar-pedido').addEventListener('click', finalizarPedido);
document.getElementById('limpar-pedido').addEventListener('click', limparPedido);

// Função para adicionar itens ao pedido
function adicionarItem() {
    const item = document.getElementById('item').value;
    const quantidade = parseInt(document.getElementById('quantidade').value);
    const preco = parseFloat(document.getElementById('preco').value);

    if (item && quantidade > 0 && preco > 0) {
        const total = quantidade * preco;
        itensPedido.push({ item, quantidade, preco, total });
        atualizarTabelaItens();
    } else {
        alert('Preencha todos os campos corretamente.');
    }
}

// Função para atualizar a tabela de itens do pedido
function atualizarTabelaItens() {
    const listaItens = document.getElementById('lista-itens');
    listaItens.innerHTML = '';
    itensPedido.forEach((item, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.item}</td>
            <td>${item.quantidade}</td>
            <td>${item.preco.toFixed(2)}</td>
            <td>${item.total.toFixed(2)}</td>
            <td><button onclick="removerItem(${index})">Remover</button></td>
        `;
        listaItens.appendChild(row);
    });
}

// Função para remover um item
function removerItem(index) {
    itensPedido.splice(index, 1);
    atualizarTabelaItens();
}

// Função para finalizar o pedido
function finalizarPedido() {
    const mesa = document.getElementById('mesa').value;
    const garcom = document.getElementById('garcom').value;

    if (mesa && garcom && itensPedido.length > 0) {
        const totalPedido = itensPedido.reduce((acc, item) => acc + item.total, 0);
        const pedido = { mesa, garcom, itens: [...itensPedido], totalPedido };
        pedidos.push(pedido);
        salvarPedidos();
        atualizarHistorico();
        limparPedido();
    } else {
        alert('Preencha todos os campos e adicione ao menos um item.');
    }
}

// Função para limpar o pedido atual
function limparPedido() {
    document.getElementById('mesa').value = '';
    document.getElementById('garcom').value = '';
    document.getElementById('item').value = '';
    document.getElementById('quantidade').value = 1;
    document.getElementById('preco').value = '';
    itensPedido = [];
    atualizarTabelaItens();
}

// Função para salvar pedidos no localStorage
function salvarPedidos() {
    localStorage.setItem('pedidos', JSON.stringify(pedidos));
}

// Função para carregar pedidos do localStorage
function carregarPedidos() {
    const pedidosSalvos = JSON.parse(localStorage.getItem('pedidos'));
    if (pedidosSalvos) {
        pedidos = pedidosSalvos;
        atualizarHistorico();
    }
}

// Função para atualizar o histórico de pedidos
function atualizarHistorico() {
    const historicoLista = document.getElementById('historico-lista');
    historicoLista.innerHTML = '';
    pedidos.forEach(pedido => {
        const li = document.createElement('li');
        li.textContent = `Mesa ${pedido.mesa} - Garçom: ${pedido.garcom} - Total: R$${pedido.totalPedido.toFixed(2)}`;
        historicoLista.appendChild(li);
    });
}

// Carregar pedidos do localStorage ao iniciar
carregarPedidos();
