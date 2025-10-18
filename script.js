document.addEventListener('DOMContentLoaded', () => {
    // Remove o alert desnecessário
    const menuItemsContainer = document.getElementById('menu-items');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalSpan = document.getElementById('cart-total');
    const cartCountSpan = document.getElementById('cart-count');
    const floatingCartBtn = document.getElementById('floating-cart-btn');
    const checkoutBtn = document.getElementById('checkout-btn');
    const continueShoppingBtn = document.getElementById('continue-shopping-btn');
    const menuSection = document.getElementById('menu');
    const cartSection = document.getElementById('cart');
    const deliveryAddressFields = document.getElementById('delivery-address-fields');

    let cart = loadCartFromLocalStorage();

    const menu = [
        {
            id: 1,
            name: 'Marmita de Frango Grelhado',
            description: 'Frango grelhado, arroz integral, feijão e salada mista.',
            price: 25.00,
            image: 'https://phygital-files.mercafacil.com/tartufo-bucket/uploads/produto/marmita_do_chef_estrogonofe_frango_400g_520c4b57-b1bd-45e8-9791-10da2169a31c.png'
        },
        {
            id: 2,
            name: 'Marmita de Carne Moída',
            description: 'Carne moída com legumes, purê de batata e brócolis.',
            price: 28.00,
            image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTplVEIeFXJp4XwuZf4l6UN3N778qx_EOT0oRuUDstZOUTnhDvBdN_ZZPN6&s=10'
        },
        {
            id: 3,
            name: 'Marmita Vegetariana',
            description: 'Mix de legumes salteados, grão de bico e quinoa.',
            price: 22.00,
            image: 'https://cdn.shopify.com/s/files/1/0127/3711/8265/files/243029377_1042477169819729_6514968479383064676_n.jpg?v=1642721207'
        },
        {
            id: 4,
            name: 'Coca-Cola Lata',
            description: 'Refrigerante Coca-Cola, 350ml.',
            price: 6.00,
            image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRsOi38z15AjNHrIfH3Sq9wkR2mxN7Svl8vdszKmR5-6w&s=10'
        },
        {
            id: 5,
            name: 'Água Mineral',
            description: 'Água mineral sem gás, 500ml.',
            price: 3.00,
            image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQIjh02MzuEZmdiZNdM7x8wLcpjUQJd8wEDjmKp0n8_KA&s=10'
        }
    ];

    function renderMenu() {
        menuItemsContainer.innerHTML = '';
        menu.forEach(item => {
            const menuItemDiv = document.createElement('div');
            menuItemDiv.classList.add('menu-item');
            menuItemDiv.innerHTML = `
                <img src="${item.image}" alt="${item.name}">
                <h3>${item.name}</h3>
                <p>${item.description}</p>
                <p class="price">R$ ${item.price.toFixed(2)}</p>
                <button data-id="${item.id}">Adicionar ao Carrinho</button>
            `;
            menuItemsContainer.appendChild(menuItemDiv);
        });

        document.querySelectorAll('.menu-item button').forEach(button => {
            button.addEventListener('click', (event) => {
                const itemId = parseInt(event.target.dataset.id);
                addToCart(itemId);
            });
        });
    }

    function addToCart(itemId) {
        const existingItem = cart.find(item => item.id === itemId);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            const itemToAdd = menu.find(item => item.id === itemId);
            cart.push({ ...itemToAdd, quantity: 1 });
        }
        updateCart(); // Renderiza o carrinho com os itens carregados do localStorage
    }

    function removeFromCart(itemId) {
        cart = cart.filter(item => item.id !== itemId);
        updateCart(); // Renderiza o carrinho com os itens carregados do localStorage
    }

    function updateQuantity(itemId, change) {
        const item = cart.find(item => item.id === itemId);
        if (item) {
            item.quantity += change;
            if (item.quantity <= 0) {
                removeFromCart(itemId);
            }
            updateCart(); // Renderiza o carrinho com os itens carregados do localStorage
        }
    }

    function saveCartToLocalStorage() {
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    function loadCartFromLocalStorage() {
        const storedCart = localStorage.getItem('cart');
        return storedCart ? JSON.parse(storedCart) : [];
    }

    function updateCart() {
        saveCartToLocalStorage(); // Salva o carrinho no localStorage a cada atualização
        cartItemsContainer.innerHTML = '';
        let total = 0;
        let itemCount = 0;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p>Seu carrinho está vazio.</p>';
        } else {
            cart.forEach(item => {
                const cartItemDiv = document.createElement('div');
                cartItemDiv.classList.add('cart-item');
                cartItemDiv.innerHTML = `
                    <div class="cart-item-info">
                        <img src="${item.image}" alt="${item.name}">
                        <div class="cart-item-details">
                            <h4>${item.name}</h4>
                            <p>R$ ${item.price.toFixed(2)}</p>
                        </div>
                    </div>
                    <div class="cart-item-actions">
                        <div class="quantity-controls">
                            <button data-id="${item.id}" data-action="decrease">-</button>
                            <span>${item.quantity}</span>
                            <button data-id="${item.id}" data-action="increase">+</button>
                        </div>
                        <button data-id="${item.id}" data-action="remove">Remover</button>
                    </div>
                `;
                cartItemsContainer.appendChild(cartItemDiv);
                total += item.price * item.quantity;
                itemCount += item.quantity;
            });
        }

        const orderType = document.querySelector('input[name="order-type"]:checked').value;
        if (orderType === 'delivery') {
            total += 6; // Adiciona a taxa de entrega
        }

        cartTotalSpan.textContent = total.toFixed(2);
        cartCountSpan.textContent = itemCount;

        document.querySelectorAll('.cart-item-actions button[data-action="decrease"]').forEach(button => {
            button.addEventListener('click', (event) => {
                const itemId = parseInt(event.target.dataset.id);
                updateQuantity(itemId, -1);
            });
        });

        document.querySelectorAll('.cart-item-actions button[data-action="increase"]').forEach(button => {
            button.addEventListener('click', (event) => {
                const itemId = parseInt(event.target.dataset.id);
                updateQuantity(itemId, 1);
            });
        });

        document.querySelectorAll('.cart-item-actions button[data-action="remove"]').forEach(button => {
            button.addEventListener('click', (event) => {
                const itemId = parseInt(event.target.dataset.id);
                removeFromCart(itemId);
            });
        });
    }

    function generateWhatsAppLink() {
        if (cart.length === 0) {
            alert('Seu carrinho está vazio. Adicione itens antes de finalizar o pedido.');
            return;
        }

        let message = 'Olá! Gostaria de fazer o seguinte pedido:\n\n';
        let total = 0;

        cart.forEach(item => {
            message += `${item.quantity}x ${item.name} - R$ ${(item.price * item.quantity).toFixed(2)}\n`;
            total += item.price * item.quantity;
        });

        const orderType = document.querySelector('input[name="order-type"]:checked').value;
        const paymentMethod = document.querySelector('input[name="payment-method"]:checked').value;

        message += `\n**Tipo de Pedido:** ${orderType === 'delivery' ? 'Delivery' : 'Retirada'}\n`;
        message += `**Forma de Pagamento:** ${paymentMethod.replace('_', ' ')}\n`;

        if (orderType === 'delivery') {
            const rua = document.getElementById('rua').value;
            const numero = document.getElementById('numero').value;
            const bairro = document.getElementById('bairro').value;
            const referencia = document.getElementById('referencia').value;
            const complemento = document.getElementById('complemento').value;

            if (!rua || !numero || !bairro) {
                alert('Por favor, preencha todos os campos de endereço para entrega.');
                return;
            }

            message += `\n**Endereço de Entrega:**\n`;
            message += `Rua: ${rua}, ${numero}\n`;
            message += `Bairro: ${bairro}\n`;
            if (referencia) message += `Referência: ${referencia}\n`;
            if (complemento) message += `Complemento: ${complemento}\n`;

            total += 5; // Adiciona a taxa de entrega
            message += `\nTaxa de Entrega: R$ 5,00\n`;
        }

        message += `\n**Total do Pedido:** R$ ${total.toFixed(2)}\n\n`;
        message += 'Por favor, confirme meu pedido e me informe sobre as opções de pagamento e entrega. Obrigado!';

        const phoneNumber = '5511977930984';
        const whatsappUrl = `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    }

    document.querySelectorAll('input[name="order-type"]').forEach(radio => {
        radio.addEventListener('change', () => {
            if (radio.value === 'delivery') {
                deliveryAddressFields.classList.remove('hidden');
            } else {
                deliveryAddressFields.classList.add('hidden');
            }
            updateCart(); // Renderiza o carrinho com os itens carregados do localStorage
        });
    });

    // Event listeners para os botões do carrinho
    if (floatingCartBtn) {
        floatingCartBtn.addEventListener('click', () => {
            menuSection.classList.add('hidden');
            cartSection.classList.remove('hidden');
            updateCart(); // Renderiza o carrinho com os itens carregados do localStorage
        });
    }

    continueShoppingBtn.addEventListener('click', () => {
        cartSection.classList.add('hidden');
        menuSection.classList.remove('hidden');
    });

    checkoutBtn.addEventListener('click', generateWhatsAppLink);

    renderMenu();
    updateCart(); // Renderiza o carrinho com os itens carregados do localStorage
});        },
        {
            id: 4,
            name: 'Coca-Cola Lata',
            description: 'Refrigerante Coca-Cola, 350ml.',
            price: 6.00,
            image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRsOi38z15AjNHrIfH3Sq9wkR2mxN7Svl8vdszKmR5-6w&s=10'
        },
        {
            id: 5,
            name: 'Água Mineral',
            description: 'Água mineral sem gás, 500ml.',
            price: 3.00,
            image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQIjh02MzuEZmdiZNdM7x8wLcpjUQJd8wEDjmKp0n8_KA&s=10'
        }
    ];

    function renderMenu() {
        menuItemsContainer.innerHTML = '';
        menu.forEach(item => {
            const menuItemDiv = document.createElement('div');
            menuItemDiv.classList.add('menu-item');
            menuItemDiv.innerHTML = `
                <img src="${item.image}" alt="${item.name}">
                <h3>${item.name}</h3>
                <p>${item.description}</p>
                <p class="price">R$ ${item.price.toFixed(2)}</p>
                <button data-id="${item.id}">Adicionar ao Carrinho</button>
            `;
            menuItemsContainer.appendChild(menuItemDiv);
        });

        document.querySelectorAll('.menu-item button').forEach(button => {
            button.addEventListener('click', (event) => {
                const itemId = parseInt(event.target.dataset.id);
                addToCart(itemId);
            });
        });
    }

    function addToCart(itemId) {
        const existingItem = cart.find(item => item.id === itemId);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            const itemToAdd = menu.find(item => item.id === itemId);
            cart.push({ ...itemToAdd, quantity: 1 });
        }
        updateCart(); // Renderiza o carrinho com os itens carregados do localStorage
    }

    function removeFromCart(itemId) {
        cart = cart.filter(item => item.id !== itemId);
        updateCart(); // Renderiza o carrinho com os itens carregados do localStorage
    }

    function updateQuantity(itemId, change) {
        const item = cart.find(item => item.id === itemId);
        if (item) {
            item.quantity += change;
            if (item.quantity <= 0) {
                removeFromCart(itemId);
            }
            updateCart(); // Renderiza o carrinho com os itens carregados do localStorage
        }
    }

    function saveCartToLocalStorage() {
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    function loadCartFromLocalStorage() {
        const storedCart = localStorage.getItem('cart');
        return storedCart ? JSON.parse(storedCart) : [];
    }

    function updateCart() {
        saveCartToLocalStorage(); // Salva o carrinho no localStorage a cada atualização
        cartItemsContainer.innerHTML = '';
        let total = 0;
        let itemCount = 0;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p>Seu carrinho está vazio.</p>';
        } else {
            cart.forEach(item => {
                const cartItemDiv = document.createElement('div');
                cartItemDiv.classList.add('cart-item');
                cartItemDiv.innerHTML = `
                    <div class="cart-item-info">
                        <img src="${item.image}" alt="${item.name}">
                        <div class="cart-item-details">
                            <h4>${item.name}</h4>
                            <p>R$ ${item.price.toFixed(2)}</p>
                        </div>
                    </div>
                    <div class="cart-item-actions">
                        <div class="quantity-controls">
                            <button data-id="${item.id}" data-action="decrease">-</button>
                            <span>${item.quantity}</span>
                            <button data-id="${item.id}" data-action="increase">+</button>
                        </div>
                        <button data-id="${item.id}" data-action="remove">Remover</button>
                    </div>
                `;
                cartItemsContainer.appendChild(cartItemDiv);
                total += item.price * item.quantity;
                itemCount += item.quantity;
            });
        }

        const orderType = document.querySelector('input[name="order-type"]:checked').value;
        if (orderType === 'delivery') {
            total += 6; // Adiciona a taxa de entrega
        }

        cartTotalSpan.textContent = total.toFixed(2);
        cartCountSpan.textContent = itemCount;

        document.querySelectorAll('.cart-item-actions button[data-action="decrease"]').forEach(button => {
            button.addEventListener('click', (event) => {
                const itemId = parseInt(event.target.dataset.id);
                updateQuantity(itemId, -1);
            });
        });

        document.querySelectorAll('.cart-item-actions button[data-action="increase"]').forEach(button => {
            button.addEventListener('click', (event) => {
                const itemId = parseInt(event.target.dataset.id);
                updateQuantity(itemId, 1);
            });
        });

        document.querySelectorAll('.cart-item-actions button[data-action="remove"]').forEach(button => {
            button.addEventListener('click', (event) => {
                const itemId = parseInt(event.target.dataset.id);
                removeFromCart(itemId);
            });
        });
    }

    function generateWhatsAppLink() {
        if (cart.length === 0) {
            alert('Seu carrinho está vazio. Adicione itens antes de finalizar o pedido.');
            return;
        }

        let message = 'Olá! Gostaria de fazer o seguinte pedido:\n\n';
        let total = 0;

        cart.forEach(item => {
            message += `${item.quantity}x ${item.name} - R$ ${(item.price * item.quantity).toFixed(2)}\n`;
            total += item.price * item.quantity;
        });

        const orderType = document.querySelector('input[name="order-type"]:checked').value;
        const paymentMethod = document.querySelector('input[name="payment-method"]:checked').value;

        message += `\n**Tipo de Pedido:** ${orderType === 'delivery' ? 'Delivery' : 'Retirada'}\n`;
        message += `**Forma de Pagamento:** ${paymentMethod.replace('_', ' ')}\n`;

        if (orderType === 'delivery') {
            const rua = document.getElementById('rua').value;
            const numero = document.getElementById('numero').value;
            const bairro = document.getElementById('bairro').value;
            const referencia = document.getElementById('referencia').value;
            const complemento = document.getElementById('complemento').value;

            if (!rua || !numero || !bairro) {
                alert('Por favor, preencha todos os campos de endereço para entrega.');
                return;
            }

            message += `\n**Endereço de Entrega:**\n`;
            message += `Rua: ${rua}, ${numero}\n`;
            message += `Bairro: ${bairro}\n`;
            if (referencia) message += `Referência: ${referencia}\n`;
            if (complemento) message += `Complemento: ${complemento}\n`;

            total += 5; // Adiciona a taxa de entrega
            message += `\nTaxa de Entrega: R$ 5,00\n`;
        }

        message += `\n**Total do Pedido:** R$ ${total.toFixed(2)}\n\n`;
        message += 'Por favor, confirme meu pedido e me informe sobre as opções de pagamento e entrega. Obrigado!';

        const phoneNumber = '5511977930984';
        const whatsappUrl = `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    }

    document.querySelectorAll('input[name="order-type"]').forEach(radio => {
        radio.addEventListener('change', () => {
            if (radio.value === 'delivery') {
                deliveryAddressFields.classList.remove('hidden');
            } else {
                deliveryAddressFields.classList.add('hidden');
            }
            updateCart(); // Renderiza o carrinho com os itens carregados do localStorage
        });
    });

    // Event listeners para os botões do carrinho
    if (floatingCartBtn) {
        floatingCartBtn.addEventListener('click', () => {
            menuSection.classList.add('hidden');
            cartSection.classList.remove('hidden');
            updateCart(); // Renderiza o carrinho com os itens carregados do localStorage
        });
    }

    continueShoppingBtn.addEventListener('click', () => {
        cartSection.classList.add('hidden');
        menuSection.classList.remove('hidden');
    });

    checkoutBtn.addEventListener('click', generateWhatsAppLink);

    renderMenu();
    updateCart(); // Renderiza o carrinho com os itens carregados do localStorage
});            button.addEventListener('click', (event) => {
                const itemId = parseInt(event.target.dataset.id);
                addToCart(itemId);
            });
        });
    }

    function addToCart(itemId) {
        const existingItem = cart.find(item => item.id === itemId);
        if (existingItem) existingItem.quantity++;
        else {
            const itemToAdd = menu.find(item => item.id === itemId);
            cart.push({ ...itemToAdd, quantity: 1 });
        }
        updateCart();
    }

    function removeFromCart(itemId) {
        cart = cart.filter(item => item.id !== itemId);
        updateCart();
    }

    function updateQuantity(itemId, change) {
        const item = cart.find(item => item.id === itemId);
        if (item) {
            item.quantity += change;
            if (item.quantity <= 0) removeFromCart(itemId);
            updateCart();
        }
    }

    function saveCartToLocalStorage() {
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    function updateCart() {
        saveCartToLocalStorage();
        cartItemsContainer.innerHTML = '';
        let total = 0;
        let itemCount = 0;

        if (cart.length === 0) {
            cartModal.classList.remove('active');
            cartCountSpan.textContent = 0;
            return;
        }

        cart.forEach(item => {
            const cartItemDiv = document.createElement('div');
            cartItemDiv.classList.add('cart-item');
            cartItemDiv.innerHTML = `
                <div class="cart-item-info">
                    <img src="${item.image}" alt="${item.name}">
                    <div class="cart-item-details">
                        <h4>${item.name}</h4>
                        <p>R$ ${item.price.toFixed(2)}</p>
                    </div>
                </div>
                <div class="cart-item-actions">
                    <div class="quantity-controls">
                        <button data-id="${item.id}" data-action="decrease">-</button>
                        <span>${item.quantity}</span>
                        <button data-id="${item.id}" data-action="increase">+</button>
                    </div>
                    <button data-id="${item.id}" data-action="remove">Remover</button>
                </div>
            `;
            cartItemsContainer.appendChild(cartItemDiv);
            total += item.price * item.quantity;
            itemCount += item.quantity;
        });

        cartTotalSpan.textContent = total.toFixed(2);
        cartCountSpan.textContent = itemCount;

        document.querySelectorAll('.cart-item-actions button[data-action="decrease"]').forEach(btn => {
            btn.addEventListener('click', e => updateQuantity(parseInt(e.target.dataset.id), -1));
        });

        document.querySelectorAll('.cart-item-actions button[data-action="increase"]').forEach(btn => {
            btn.addEventListener('click', e => updateQuantity(parseInt(e.target.dataset.id), 1));
        });

        document.querySelectorAll('.cart-item-actions button[data-action="remove"]').forEach(btn => {
            btn.addEventListener('click', e => removeFromCart(parseInt(e.target.dataset.id)));
        });
    }

    // Abrir Modal Carrinho
    floatingCartBtn.addEventListener('click', () => {
        if (cart.length > 0) {
            cartModal.classList.add('active');
            updateCart();
        }
    });

    // Fechar Modal
    cartModalClose.addEventListener('click', () => cartModal.classList.remove('active'));
    cartModal.addEventListener('click', e => { if(e.target === cartModal) cartModal.classList.remove('active'); });

    renderMenu();
    updateCart();
});
