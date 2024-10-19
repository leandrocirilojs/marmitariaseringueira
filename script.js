function carregarBebidas() {
    fetch('bebidas.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao carregar o arquivo de bebidas');
            }
            return response.json();
        })
        .then(bebidas => {
            localStorage.setItem('bebidas', JSON.stringify(bebidas));
            const selectBebida = document.getElementById('bebida');
            selectBebida.innerHTML = '';

            bebidas.forEach((bebida, index) => {
                const option = document.createElement('option');
                option.value = index;
                option.text = `${bebida.nome} - R$${bebida.preco.toFixed(2)}`;
                selectBebida.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Erro:', error);
            alert('Não foi possível carregar a lista de bebidas.');
        });
}

function adicionarBebida() {
    const bebidas = JSON.parse(localStorage.getItem('bebidas')) || [];
    const bebidaSelecionadaIndex = document.getElementById('bebida').value;
    const bebidaSelecionada = bebidas[bebidaSelecionadaIndex];

    if (bebidaSelecionada) {
        const itemPedido = {
            item: bebidaSelecionada.nome,
            preco: bebidaSelecionada.preco,
            quantidade: 1,
            total: bebidaSelecionada.preco
        };

        itensPedido.push(itemPedido);
        atualizarTabelaPedidos();
    }
}

document.addEventListener('DOMContentLoaded', carregarBebidas);

let pedidos = [];
let itensPedido = [];

document.getElementById('adicionar-item').addEventListener('click', adicionarItem);
document.getElementById('finalizar-pedido').addEventListener('click', finalizarPedido);
document.getElementById('limpar-pedido').addEventListener('click', limparPedido);

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

function atualizarTabelaPedidos() {
    const tabelaItens = document.getElementById('tabela-itens');
    tabelaItens.innerHTML = '';

    itensPedido.forEach((item, index) => {
        const row = tabelaItens.insertRow();
        row.insertCell(0).textContent = item.item;
        row.insertCell(1).textContent = item.quantidade;
        row.insertCell(2).textContent = `R$${item.preco.toFixed(2)}`;
        row.insertCell(3).textContent = `R$${item.total.toFixed(2)}`;

        const btnRemover = document.createElement('button');
        btnRemover.textContent = ' X ';
        btnRemover.onclick = function() {
            removerItem(index);
        };
        row.insertCell(4).appendChild(btnRemover);
    });
}

function removerItem(index) {
    itensPedido.splice(index, 1);
    atualizarTabelaPedidos();
}

document.getElementById('garcom').addEventListener('change', function() {
    const outroGarcomInput = document.getElementById('outroGarcom');
    outroGarcomInput.style.display = this.value === 'Outros' ? 'block' : 'none';
});

function finalizarPedido() {
    const mesa = document.getElementById('mesa').value;
    let garcom = document.getElementById('garcom').value;

    if (garcom === 'Outros') {
        garcom = document.getElementById('outroGarcom').value;
    }

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

function limparPedido() {
    document.getElementById('mesa').value = '';
    document.getElementById('garcom').value = '';
    document.getElementById('item').value = '';
    document.getElementById('quantidade').value = 1;
    document.getElementById('preco').value = '';
    itensPedido = [];
    atualizarTabelaItens();
}

function salvarPedidos() {
    localStorage.setItem('pedidos', JSON.stringify(pedidos));
}

function carregarPedidos() {
    const pedidosSalvos = JSON.parse(localStorage.getItem('pedidos'));
    if (pedidosSalvos) {
        pedidos = pedidosSalvos;
        atualizarHistorico();
    }
}

function atualizarHistorico() {
    const historicoLista = document.getElementById('historico-lista');
    historicoLista.innerHTML = '';
    pedidos.forEach((pedido, index) => {
        const li = document.createElement('li');
        li.textContent = `Mesa ${pedido.mesa} - Garçom: ${pedido.garcom} - Total: R$${pedido.totalPedido.toFixed(2)}`;
        li.addEventListener('click', function() {
            abrirModal(pedido);
        });
        historicoLista.appendChild(li);
    });
}

carregarPedidos();

function abrirModal(pedido) {
    const modal = document.getElementById('modal');
    const detalhes = document.getElementById('detalhes-pedido');
    detalhes.innerHTML = '';

    const infoBasica = `<p><strong>Mesa:</strong> ${pedido.mesa}</p>
                        <p><strong>Garçom:</strong> ${pedido.garcom}</p>`;
    detalhes.innerHTML = infoBasica;

    const listaItens = document.createElement('ul');
    pedido.itens.forEach(item => {
        const li = document.createElement('li');
        li.innerHTML = `${item.quantidade}x ${item.item} - R$${item.preco.toFixed(2)} (Total: R$${item.total.toFixed(2)})`;
        listaItens.appendChild(li);
    });
    detalhes.appendChild(listaItens);

    const total = document.createElement('p');
    total.innerHTML = `<strong>Total do Pedido:</strong> R$${pedido.totalPedido.toFixed(2)}`;
    detalhes.appendChild(total);

    modal.style.display = 'flex';
}

document.querySelector('.close').addEventListener('click', function() {
    document.getElementById('modal').style
