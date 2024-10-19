// Carregar bebidas do LocalStorage e preencher o menu de bebidas
function carregarBebidas() {
    const bebidas = JSON.parse(localStorage.getItem('bebidas')) || [];
    const selectBebida = document.getElementById('bebida');

    // Limpar o select antes de adicionar as opções
    selectBebida.innerHTML = '';

    // Adicionar as bebidas como opções
    bebidas.forEach((bebida, index) => {
        const option = document.createElement('option');
        option.value = index;  // Usar o índice como valor para buscar depois
        option.text = `${bebida.nome} - R$${bebida.preco.toFixed(2)}`;
        selectBebida.appendChild(option);
    });
}

// Adicionar a bebida selecionada ao pedido
function adicionarBebida() {
    const bebidas = JSON.parse(localStorage.getItem('bebidas')) || [];
    const bebidaSelecionadaIndex = document.getElementById('bebida').value;
    const bebidaSelecionada = bebidas[bebidaSelecionadaIndex];

    if (bebidaSelecionada) {
        const itemPedido = {
            item: bebidaSelecionada.nome,
            preco: bebidaSelecionada.preco,
            quantidade: 1,  // Por padrão, começa com 1 unidade
            total: bebidaSelecionada.preco
        };

        itensPedido.push(itemPedido);
        atualizarTabelaPedidos();
    }
}

// Função para inicializar o menu de bebidas ao carregar a página
document.addEventListener('DOMContentLoaded', carregarBebidas);


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

function atualizarTabelaPedidos() {
    const tabelaItens = document.getElementById('tabela-itens');
    tabelaItens.innerHTML = '';  // Limpar a tabela antes de atualizá-la

    itensPedido.forEach((item, index) => {
        const row = tabelaItens.insertRow();
        row.insertCell(0).textContent = item.item;
        row.insertCell(1).textContent = item.quantidade;
        row.insertCell(2).textContent = `R$${item.preco.toFixed(2)}`;
        row.insertCell(3).textContent = `R$${item.total.toFixed(2)}`;

        const btnRemover = document.createElement('button');
        btnRemover.textContent = 'Remover';
        btnRemover.onclick = function() {
            removerItem(index);
        };
        row.insertCell(4).appendChild(btnRemover);
    });
}

// Função para remover um item do pedido
function removerItem(index) {
    itensPedido.splice(index, 1);
    atualizarTabelaPedidos();
}


// Função para remover um item
function removerItem(index) {
    itensPedido.splice(index, 1);
    atualizarTabelaItens();
}

// Função para finalizar o pedido
// Adicionar evento de mudança no select do garçom
document.getElementById('garcom').addEventListener('change', function() {
    const outroGarcomInput = document.getElementById('outroGarcom');
    if (this.value === 'Outros') {
        outroGarcomInput.style.display = 'block';
    } else {
        outroGarcomInput.style.display = 'none';
    }
});

// Modificar a função de finalizar pedido para incluir o valor correto do garçom
function finalizarPedido() {
    const mesa = document.getElementById('mesa').value;
    let garcom = document.getElementById('garcom').value;
    
    // Verificar se o campo "Outros" foi selecionado e utilizar o nome do outro garçom
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

// Função para abrir o modal com os detalhes do pedido
function abrirModal(pedido) {
    const modal = document.getElementById('modal');
    const detalhes = document.getElementById('detalhes-pedido');

    // Limpar os detalhes do pedido antes de preencher com novas informações
    detalhes.innerHTML = '';

    // Adicionar informações da mesa e garçom
    const infoBasica = `<p><strong>Mesa:</strong> ${pedido.mesa}</p>
                        <p><strong>Garçom:</strong> ${pedido.garcom}</p>`;
    detalhes.innerHTML = infoBasica;

    // Adicionar detalhes dos itens do pedido
    const listaItens = document.createElement('ul');
    pedido.itens.forEach(item => {
        const li = document.createElement('li');
        li.innerHTML = `${item.quantidade}x ${item.item} - R$${item.preco.toFixed(2)} (Total: R$${item.total.toFixed(2)})`;
        listaItens.appendChild(li);
    });
    detalhes.appendChild(listaItens);

    // Adicionar total do pedido
    const total = document.createElement('p');
    total.innerHTML = `<strong>Total do Pedido:</strong> R$${pedido.totalPedido.toFixed(2)}`;
    detalhes.appendChild(total);

    // Exibir o modal
    modal.style.display = 'flex';
}

// Função para fechar o modal
document.querySelector('.close').addEventListener('click', function() {
    document.getElementById('modal').style.display = 'none';
});

// Fechar o modal ao clicar fora da área de conteúdo
window.addEventListener('click', function(event) {
    const modal = document.getElementById('modal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});

// Modificar a função para atualizar o histórico de pedidos
function atualizarHistorico() {
    const historicoLista = document.getElementById('historico-lista');
    historicoLista.innerHTML = '';
    pedidos.forEach((pedido, index) => {
        const li = document.createElement('li');
        li.textContent = `Mesa ${pedido.mesa} - Garçom: ${pedido.garcom} - Total: R$${pedido.totalPedido.toFixed(2)}`;
        
        // Adicionar evento de clique para abrir o modal com os detalhes do pedido
        li.addEventListener('click', function() {
            abrirModal(pedido);
        });

        historicoLista.appendChild(li);
    });
}
