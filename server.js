const menu = document.getElementById("dropdown-menu");
const botaoMenu = document.getElementById("button-all");


botaoMenu.addEventListener("click", () => {
    menu.classList.toggle("ativo");
    menu.classList.toggle("menucult");
});

//carrousel
    const images = document.querySelectorAll('.carousel-img');
    const prev = document.querySelector('.prev');
    const next = document.querySelector('.next');
    let current = 0;

    function showImage(index) {
        images.forEach((img, i) => {
            img.classList.remove('active');
            if (i === index) img.classList.add('active');
        });
    }

    prev.addEventListener('click', () => {
        current = (current === 0) ? images.length - 1 : current - 1;
        showImage(current);
    });

    next.addEventListener('click', () => {
        current = (current === images.length - 1) ? 0 : current + 1;
        showImage(current);
    });

    // Mostrar a primeira imagem
    showImage(current);


let estrelasSelecionadas = 0;

function atualizarVisualEstrelas() {
  const estrelas = document.querySelectorAll('#estrelas span');
  estrelas.forEach(star => {
    const valor = parseInt(star.getAttribute('data-valor'));
    star.textContent = valor <= estrelasSelecionadas ? '★' : '☆';
    star.style.color = valor <= estrelasSelecionadas ? 'gold' : '#999';
  });
}



function configurarEstrelas() {
  const estrelas = document.querySelectorAll('#estrelas span');
  estrelas.forEach(star => {
    star.addEventListener('click', () => {
      estrelasSelecionadas = parseInt(star.getAttribute('data-valor'));
      atualizarVisualEstrelas();
    });

    // Opcional: destacar estrelas no hover
    star.addEventListener('mouseenter', () => {
      const valor = parseInt(star.getAttribute('data-valor'));
      preencherEstrelasHover(valor);
    });

    star.addEventListener('mouseleave', () => {
      atualizarVisualEstrelas();
    });
  });
}

function preencherEstrelasHover(valor) {
  const estrelas = document.querySelectorAll('#estrelas span');
  estrelas.forEach(star => {
    const starValor = parseInt(star.getAttribute('data-valor'));
    star.textContent = starValor <= valor ? '★' : '☆';
    star.style.color = starValor <= valor ? 'gold' : '#999';
  });
}

function enviarAvaliacao() {
  const comentario = document.getElementById('comentario').value.trim();
  const produtoId = document.getElementById('produto-id').value;
  const usuarioId = 1; // Substitua pelo id real do usuário logado

  if (estrelasSelecionadas === 0) {
    alert('Por favor, selecione uma quantidade de estrelas.');
    return;
  }

  if (!comentario) {
    alert('Digite um comentário antes de enviar.');
    return;
  }
  

  fetch('/avaliacoes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      estrelas: estrelasSelecionadas,
      comentario,
      produtoId,
      usuarioId
    })
  })
  .then(res => res.json())
  .then(data => {
    alert(data.message || 'Avaliação enviada!');
    document.getElementById('comentario').value = '';
    estrelasSelecionadas = 0;
    atualizarVisualEstrelas();
    carregarAvaliacoes(produtoId);
  })
  .catch(err => {
    console.error('Erro:', err);
    alert('Erro ao enviar avaliação. Tente novamente.');
  });

  console.log({
  estrelas: estrelasSelecionadas,
  comentario,
  produtoId,
  usuarioId
});

}

function carregarAvaliacoes(produtoId) {
  fetch(`/avaliacoes/${produtoId}`)
    .then(res => res.json())
    .then(avaliacoes => {
      const lista = document.getElementById('lista-avaliacoes');
      lista.innerHTML = '';
      if(avaliacoes.length === 0) {
        lista.innerHTML = '<p>Nenhuma avaliação ainda.</p>';
        return;
      }
   avaliacoes.forEach(a => {
  const div = document.createElement('div');
  div.innerHTML = `
    <p><strong>${'★'.repeat(a.estrelas)}${'☆'.repeat(5 - a.estrelas)}</strong></p>
    <p><strong>${a.nome_usuario}</strong></p>
    <p>${a.comentario}</p>
    

    <hr>
  `;
        div.appendChild(document.createElement('hr'));

        lista.appendChild(div);
});

    })
    .catch(err => {
      console.error('Erro ao carregar avaliações:', err);
    });
}


document.addEventListener('DOMContentLoaded', () => {
  configurarEstrelas();
  atualizarVisualEstrelas();

  const produtoId = document.getElementById('produto-id').value;
  carregarAvaliacoes(produtoId);
});




//favoritos
const btnFavorito = document.getElementById('btn-favorito');
  const produtoId = document.getElementById('produto-id').value; // ou outro jeito de pegar o id
  const usuarioId = 1; // exemplo, pegue dinamicamente do login

  btnFavorito.addEventListener('click', async () => {
    try {
      const response = await fetch('/favoritos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ produtoId, usuarioId }),
      });
      const data = await response.json();

      if (data.sucesso) {
        if (data.favorito) {
          btnFavorito.classList.add('favorito');
          btnFavorito.textContent = '♥'; // cheio e vermelho
        } else {
          btnFavorito.classList.remove('favorito');
          btnFavorito.textContent = '♡'; // vazio e cinza
        }
      } else {
        alert('Erro ao favoritar: ' + data.mensagem);
      }
    } catch (err) {
      console.error(err);
      alert('Erro na comunicação com o servidor.');
    }
  });


document.getElementById('btn-reservar').addEventListener('click', async () => {
  const resposta = await fetch('/verificar-login');
  const dados = await resposta.json();

  if (!dados.logado) {
    alert('Você precisa estar logado para fazer uma reserva!');
    window.location.href = '/login';
  } else {
   
    window.location.href = '/views/carrinho.html';
  }
});



