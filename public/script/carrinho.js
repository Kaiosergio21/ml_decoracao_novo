const menu = document.getElementById("dropdown-menu");
const botaoMenu = document.getElementById("button-all");


botaoMenu.addEventListener("click", () => {
    menu.classList.toggle("ativo");
    menu.classList.toggle("menucult");
});

async function adicionarAoCarrinho(idProduto, nomeProduto, precoProduto) {
    const usuarioId = 1; // Substitua pelo ID do usuário logado

    try {
        const response = await fetch('http://localhost:3000/carrinho/adicionar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                fk_usuario_id_usuario: usuarioId,
                fk_produto_id_produto: idProduto,
                quantidade_carrinho: 1,
                preco_total_carrinho: precoProduto,
                data_e_hora_criacao_carrinho: new Date(),
                status_carrinho: true
            })
        });

        if (response.ok) {
            alert('Produto adicionado ao carrinho!');
            carregarCarrinho(); // Atualiza o carrinho se estiver na página carrinho
        } else {
            alert('Erro ao adicionar produto ao carrinho');
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro na comunicação com o servidor');
    }
}

const usuarioId = 1; // Ajuste para pegar do login/sessão

// Função para carregar os itens do carrinho do backend
async function carregarCarrinho() {
    try {
        const res = await fetch(`http://localhost:3000/carrinho/${usuarioId}`);
        const itens = await res.json();

        const container = document.getElementById('itens-carrinho');
        container.innerHTML = '';

        let totalQuantidade = 0;
        let totalPreco = 0;

        itens.forEach(item => {
            totalQuantidade += item.quantidade_carrinho;
            totalPreco += parseFloat(item.preco_total_carrinho);

            container.innerHTML += `
                <div class="cart-item" data-id="${item.id_carrinho}">
                    <img src="file/Sem título.jpg" alt="${item.nome_produto}">
                    <p>${item.nome_produto}</p>
                    <p>R$${parseFloat(item.preco_produto).toFixed(2)}</p>
                    <p>
                        <input type="number" min="1" value="${item.quantidade_carrinho}" onchange="alterarQuantidade(${item.id_carrinho}, this.value, ${item.preco_produto})">
                    </p>
                    <p>R$${parseFloat(item.preco_total_carrinho).toFixed(2)}</p>
                    <p>
                        <img src="file/recycle.png" class="trash-icon" alt="Remover" onclick="removerItem(${item.id_carrinho})" style="cursor:pointer;">
                    </p>
                </div>
            `;
        });

        document.getElementById('total-itens').innerText = `Quantidade (${totalQuantidade})`;
        document.getElementById('total-preco').innerText = `Total: R$${totalPreco.toFixed(2)}`;

    } catch (error) {
        console.error('Erro ao carregar carrinho:', error);
    }
}

// Alterar quantidade do item no backend
async function alterarQuantidade(idCarrinho, novaQuantidade, precoUnitario) {
    if (novaQuantidade < 1) return alert('Quantidade mínima: 1');
    try {
        const res = await fetch(`http://localhost:3000/carrinho/atualizar/${idCarrinho}`, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({quantidade: novaQuantidade, precoUnitario})
        });
        const msg = await res.text();
        alert(msg);
        carregarCarrinho(); // atualizar tela
    } catch (error) {
        console.error('Erro ao atualizar quantidade:', error);
    }
}

// Remover item do carrinho
async function removerItem(idCarrinho) {
    if (!confirm('Deseja remover este item do carrinho?')) return;

    try {
        const res = await fetch(`http://localhost:3000/carrinho/remover/${idCarrinho}`, {
            method: 'DELETE'
        });
        const msg = await res.text();
        alert(msg);
        carregarCarrinho(); // atualizar tela
    } catch (error) {
        console.error('Erro ao remover item:', error);
    }
}

// Finalizar aluguel
async function finalizarAluguel() {
    if (!confirm('Confirma finalização do aluguel?')) return;

    try {
        const res = await fetch(`http://localhost:3000/carrinho/finalizar/${usuarioId}`, {
            method: 'PUT'
        });
        const msg = await res.text();
        alert(msg);
        carregarCarrinho(); // limpar ou atualizar a tela
    } catch (error) {
        console.error('Erro ao finalizar aluguel:', error);
    }
}

// Evento para botão finalizar
document.getElementById('btn-finalizar').addEventListener('click', finalizarAluguel);

// Carrega o carrinho ao abrir a página
window.onload = carregarCarrinho;
