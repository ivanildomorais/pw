document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname.split("/").pop();
    
    atualizarContadorCarrinho();

    if (path === 'index.html' || path === '') {
        exibirVitrine();
    } else if (path === 'produtos.html') {
        const btnMostrar = document.getElementById('btn-mostrar-form');
        const formProduto = document.getElementById('form-produto');
        const barraPesquisa = document.getElementById('barra-pesquisa');

        if (btnMostrar) {
            btnMostrar.addEventListener('click', () => {
                const formSection = document.querySelector('.admin-section');
                const isVisible = formSection.style.display === 'block';
                formSection.style.display = isVisible ? 'none' : 'block';
                if (!isVisible) {
                    formSection.scrollIntoView({ behavior: 'smooth' });
                }
            });
        }
        if (formProduto) {
            formProduto.addEventListener('submit', adicionarProduto);
        }
        if (barraPesquisa) {
            barraPesquisa.addEventListener('keyup', filtrarProdutos);
        }
        exibirProdutos();
    } else if (path === 'cadastro.html') {
        const formCadastro = document.getElementById('form-cadastro');
        if (formCadastro) {
            formCadastro.addEventListener('submit', cadastrarUsuario);
        }
    } else if (path === 'login.html') {
        const formLogin = document.getElementById('form-login');
        if (formLogin) {
            formLogin.addEventListener('submit', loginUsuario);
        }
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
    
    if (!container) return; 
    
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
                <button class="btn-adicionar" data-id="${produto.id}">Adicionar ao Carrinho</button>
                <button class="btn-remover" data-id="${produto.id}">Remover Produto</button>
            </div>
        `;
        
        card.querySelector('.btn-adicionar').addEventListener('click', (e) => {
            adicionarAoCarrinho(produto.id, e.target);
        });
        
        card.querySelector('.btn-remover').addEventListener('click', () => {
            removerProduto(produto.id);
        });
        
        container.appendChild(card);
    });
}

function exibirVitrine() {
    const todosProdutos = JSON.parse(localStorage.getItem('produtos')) || [];
 
    const produtosVitrine = todosProdutos.slice(-5).reverse();
    const container = document.getElementById('vitrine-produtos');
    
    if (!container) return;

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
                <button class="btn-adicionar" data-id="${produto.id}">Adicionar ao Carrinho</button>
            </div>
        `;
        
        
        card.querySelector('.btn-adicionar').addEventListener('click', (e) => {
            adicionarAoCarrinho(produto.id, e.target);
        });
        
        container.appendChild(card);
    });
}

function removerProduto(idProduto) {
    if (!confirm('Tem certeza que deseja remover este produto?')) return;
    
    let produtos = JSON.parse(localStorage.getItem('produtos')) || [];
    produtos = produtos.filter(p => p.id !== idProduto);
    localStorage.setItem('produtos', JSON.stringify(produtos));
    
    // Remove também do carrinho, se estiver lá
    let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
    carrinho = carrinho.filter(p => p.id !== idProduto);
    localStorage.setItem('carrinho', JSON.stringify(carrinho));

    exibirProdutos();
    atualizarContadorCarrinho();
}

function exibirDetalheProduto() {
    const params = new URLSearchParams(window.location.search);
    const idProduto = parseInt(params.get('id'));
    const produtos = JSON.parse(localStorage.getItem('produtos')) || [];
    const produto = produtos.find(p => p.id === idProduto);
    const container = document.querySelector('main'); 

    if (produto) {
        container.innerHTML = `
            <section class="detalhe-produto-container">
                <img src="${produto.imagem}" alt="${produto.nome}">
                <div>
                    <h2>${produto.nome}</h2>
                    <p class="preco">R$ ${produto.preco.toFixed(2)}</p>
                    <p>Descrição detalhada do produto. Este é um texto de exemplo para preencher o espaço, mostrando como a Lojas PW pode detalhar seus produtos.</p>
                    <button class="btn-adicionar" data-id="${produto.id}">Adicionar ao Carrinho</button>
                </div>
            </section>
        `;
        
        container.querySelector('.btn-adicionar').addEventListener('click', (e) => {
            adicionarAoCarrinho(produto.id, e.target);
        });

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
    
    if (!container || !totalContainer) return;

    container.innerHTML = '';

    if (carrinho.length === 0) {
        container.innerHTML = '<p>Seu carrinho está vazio.</p>';
        totalContainer.innerHTML = '';
        return;
    }

    let total = 0;
    
    const carrinhoAgrupado = {};
    carrinho.forEach(produto => {
        if (carrinhoAgrupado[produto.id]) {
            carrinhoAgrupado[produto.id].quantidade++;
        } else {
            carrinhoAgrupado[produto.id] = { ...produto, quantidade: 1 };
        }
        total += produto.preco;
    });


    Object.values(carrinhoAgrupado).forEach(produto => {
        const item = document.createElement('div');
        item.className = 'carrinho-item';
        item.innerHTML = `
            <span>${produto.nome} (x${produto.quantidade}) - R$ ${(produto.preco * produto.quantidade).toFixed(2)}</span>
            <button class="btn-remover-carrinho" data-id="${produto.id}">Remover 1</button>
        `;
        
        item.querySelector('.btn-remover-carrinho').addEventListener('click', () => {
            removerDoCarrinho(produto.id);
        });
        
        container.appendChild(item);
    });

    totalContainer.innerHTML = `Total: R$ ${total.toFixed(2)}`;
}

function removerDoCarrinho(idProduto) {
    let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
    

    const indexParaRemover = carrinho.findIndex(produto => produto.id === idProduto);

    if (indexParaRemover > -1) {
        carrinho.splice(indexParaRemover, 1);
        localStorage.setItem('carrinho', JSON.stringify(carrinho));
    }

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
