document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname.split("/").pop();
    
    atualizarContadorCarrinho();

    if (path === 'index.html' || path === '') {
        exibirVitrine();
    } else if (path === 'produtos.html') {
        document.getElementById('btn-mostrar-form').addEventListener('click', () => {
            const formSection = document.querySelector('.admin-section');
            const isVisible = formSection.style.display === 'block';
            formSection.style.display = isVisible ? 'none' : 'block';
            if (!isVisible) {
                formSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
        document.getElementById('form-produto').addEventListener('submit', adicionarProduto);
        document.getElementById('barra-pesquisa').addEventListener('keyup', filtrarProdutos);
        exibirProdutos();
    } else if (path === 'cadastro.html') {
        document.getElementById('form-cadastro').addEventListener('submit', cadastrarUsuario);
    } else if (path === 'login.html') {
        document.getElementById('form-login').addEventListener('submit', loginUsuario);
    } else if (path === 'produto.html') {
        exibirDetalheProduto();
    } else if (path === 'carrinho.html') {
        exibirCarrinho();
    }
});

function cadastrarUsuario(event) {
    event.preventDefault();
    const nome = document.getElementById('nome-usuario').value;
    const email = document.getElementById('email-usuario').value;
    const senha = document.getElementById('senha-usuario').value;
    const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    if (usuarios.find(user => user.email === email)) {
        alert('Este email já está cadastrado!');
        return;
    }
    usuarios.push({ nome, email, senha });
    localStorage.setItem('usuarios', JSON.stringify(usuarios));
    alert('Usuário cadastrado com sucesso!');
    event.target.reset();
}

function loginUsuario(event) {
    event.preventDefault();
    const email = document.getElementById('email-login').value;
    const senha = document.getElementById('senha-login').value;
    const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    const usuario = usuarios.find(user => user.email === email && user.senha === senha);
    if (usuario) {
        alert(`Login bem-sucedido! Bem-vindo(a), ${usuario.nome}!`);
        window.location.href = 'index.html';
    } else {
        alert('Email ou senha incorretos.');
    }
}

function adicionarProduto(event) {
    event.preventDefault();
    const produto = {
        id: Date.now(),
        nome: document.getElementById('nome-produto').value,
        preco: parseFloat(document.getElementById('preco-produto').value),
        imagem: document.getElementById('img-produto').value || 'https://via.placeholder.com/250'
    };
    const produtos = JSON.parse(localStorage.getItem('produtos')) || [];
    produtos.push(produto);
    localStorage.setItem('produtos', JSON.stringify(produtos));
    alert('Produto adicionado com sucesso!');
    event.target.reset();
    document.querySelector('.admin-section').style.display = 'none';
    exibirProdutos();
}

function exibirProdutos(produtosParaExibir) {
    const todosProdutos = JSON.parse(localStorage.getItem('produtos')) || [];
    const produtos = produtosParaExibir || todosProdutos;
    const container = document.getElementById('lista-produtos');
    container.innerHTML = '';

    if (produtos.length === 0) {
        container.innerHTML = '<p>Nenhum produto encontrado.</p>';
        return;
    }

    produtos.forEach(produto => {
        const card = document.createElement('div');
        card.className = 'produto-card';
        card.innerHTML = `
            <a href="produto.html?id=${produto.id}">
                <img src="${produto.imagem}" alt="${produto.nome}">
                <h3>${produto.nome}</h3>
            </a>
            <p class="preco">R$ ${produto.preco.toFixed(2)}</p>
            <div class="botoes-card">
                <button data-id="${produto.id}" onclick="adicionarAoCarrinho(${produto.id}, this)">Adicionar ao Carrinho</button>
                <button class="btn-remover" onclick="removerProduto(${produto.id})">Remover Produto</button>
            </div>
        `;
        container.appendChild(card);
    });
}

function exibirVitrine() {
    const todosProdutos = JSON.parse(localStorage.getItem('produtos')) || [];
    const produtosVitrine = todosProdutos.slice(0, 5);
    const container = document.getElementById('vitrine-produtos');
    container.innerHTML = '';

    if (produtosVitrine.length === 0) {
        container.innerHTML = '<p>Nenhum produto cadastrado para exibir na vitrine.</p>';
        return;
    }

    produtosVitrine.forEach(produto => {
        const card = document.createElement('div');
        card.className = 'produto-card';
        card.innerHTML = `
            <a href="produto.html?id=${produto.id}">
                <img src="${produto.imagem}" alt="${produto.nome}">
                <h3>${produto.nome}</h3>
            </a>
            <p class="preco">R$ ${produto.preco.toFixed(2)}</p>
            <div class="botoes-card">
                <button onclick="adicionarAoCarrinho(${produto.id}, this)">Adicionar ao Carrinho</button>
            </div>
        `;
        container.appendChild(card);
    });
}

function removerProduto(idProduto) {
    if (!confirm('Tem certeza que deseja remover este produto?')) return;
    let produtos = JSON.parse(localStorage.getItem('produtos')) || [];
    produtos = produtos.filter(p => p.id !== idProduto);
    localStorage.setItem('produtos', JSON.stringify(produtos));
    exibirProdutos();
}

function exibirDetalheProduto() {
    const params = new URLSearchParams(window.location.search);
    const idProduto = parseInt(params.get('id'));
    const produtos = JSON.parse(localStorage.getItem('produtos')) || [];
    const produto = produtos.find(p => p.id === idProduto);
    const container = document.getElementById('detalhe-produto');

    if (produto) {
        container.innerHTML = `
            <img src="${produto.imagem}" alt="${produto.nome}">
            <div>
                <h2>${produto.nome}</h2>
                <p class="preco">R$ ${produto.preco.toFixed(2)}</p>
                <p>Descrição detalhada do produto. Este é um texto de exemplo para preencher o espaço, mostrando como a Lojas PW pode detalhar seus produtos.</p>
                <button onclick="adicionarAoCarrinho(${produto.id}, this)">Adicionar ao Carrinho</button>
            </div>
        `;
    } else {
        container.innerHTML = '<p>Produto não encontrado.</p>';
    }
}

function filtrarProdutos() {
    const termo = document.getElementById('barra-pesquisa').value.toLowerCase();
    const todosProdutos = JSON.parse(localStorage.getItem('produtos')) || [];
    const produtosFiltrados = todosProdutos.filter(produto =>
        produto.nome.toLowerCase().includes(termo)
    );
    exibirProdutos(produtosFiltrados);
}

function adicionarAoCarrinho(idProduto, botao) {
    const produtos = JSON.parse(localStorage.getItem('produtos')) || [];
    const produto = produtos.find(p => p.id === idProduto);
    if (produto) {
        const carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
        carrinho.push(produto);
        localStorage.setItem('carrinho', JSON.stringify(carrinho));
        if (botao) {
            botao.textContent = 'Adicionado!';
            botao.classList.add('adicionado');
            botao.disabled = true;
        }
        atualizarContadorCarrinho();
    }
}

function exibirCarrinho() {
    const carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
    const container = document.getElementById('itens-carrinho');
    const totalContainer = document.getElementById('total-carrinho');
    container.innerHTML = '';

    if (carrinho.length === 0) {
        container.innerHTML = '<p>Seu carrinho está vazio.</p>';
        totalContainer.innerHTML = '';
        return;
    }

    let total = 0;
    carrinho.forEach((produto, index) => {
        const item = document.createElement('div');
        item.className = 'carrinho-item';
        item.innerHTML = `
            <span>${produto.nome} - R$ ${produto.preco.toFixed(2)}</span>
            <button onclick="removerDoCarrinho(${index})">Remover</button>
        `;
        container.appendChild(item);
        total += produto.preco;
    });

    totalContainer.innerHTML = `Total: R$ ${total.toFixed(2)}`;
}

function removerDoCarrinho(index) {
    let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
    carrinho.splice(index, 1);
    localStorage.setItem('carrinho', JSON.stringify(carrinho));
    exibirCarrinho();
    atualizarContadorCarrinho();
}

function atualizarContadorCarrinho() {
    const contador = document.getElementById('contador-carrinho');
    if (contador) {
        const carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
        contador.textContent = carrinho.length;
    }
}