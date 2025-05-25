
const H4FooterCreditos = document.getElementById('H4FooterCreditos')
const SpanCategoriasUm = document.getElementById('SpanCategoriasUm')
const SpanCategoriasDois = document.getElementById('SpanCategoriasDois')
const SpanCategoriasTrez = document.getElementById('SpanCategoriasTrez')
const BtnToggleCategorias = document.querySelectorAll('#BtnToggleCategorias')
const MenuFloat = document.getElementById('MenuFloat')
const InsertProdutosHome = document.getElementById("InsertProdutosHome")

const ProdutosList = []

function GerarListaDeProdutos() {
    InsertProdutosHome.innerHTML = ''

    ProdutosList.forEach(Produto => {
        const CardProdutosHome = document.createElement('div')
        CardProdutosHome.classList = 'CardProdutosHome'

        const Top = document.createElement("div")
        Top.classList = 'Top'

        const Img = document.createElement('img')
        if (!Produto.Src) Img.src = 'https://static.vecteezy.com/system/resources/thumbnails/005/720/408/small_2x/crossed-image-icon-picture-not-available-delete-picture-symbol-free-vector.jpg'
        else Img.src = Produto.Src

        const Ptitle = document.createElement("p")
        Ptitle.textContent = Produto.Title

        const Bottom = document.createElement('div')
        Bottom.classList = 'Bottom'

        const Ppreco = document.createElement('p')
        Ppreco.textContent = Produto.Preco

        const BtnVerMais = document.createElement('button')
        BtnVerMais.textContent = 'Ver mais'
        
        InsertProdutosHome.appendChild(CardProdutosHome)
        CardProdutosHome.appendChild(Top)
        Top.appendChild(Img)
        Top.appendChild(Ptitle)
        CardProdutosHome.appendChild(Bottom)
        Bottom.appendChild(Ppreco)
        Bottom.appendChild(BtnVerMais)
    })
}

addEventListener('DOMContentLoaded', () => {

    const NewYear = new Date().getFullYear()

    H4FooterCreditos.textContent = `© ${NewYear} ML Decor Inc. All Rights Reserved.`
})

BtnToggleCategorias.forEach(Btn => {
    Btn.onclick = () => {
        if (MenuFloat.style.padding == "10px") {
            MenuFloat.style.padding = '0'
            MenuFloat.style.height = '0'
            document.querySelectorAll('#BtnToggleCategorias')[2].style.transform = 'rotate(0deg)'

        }else {
            MenuFloat.style.padding = '10px'
            MenuFloat.style.height = 'auto'
            document.querySelectorAll('#BtnToggleCategorias')[2].style.transform = 'rotate(180deg)'
        }

        SpanCategoriasUm.classList.toggle("SpanCategoriasUm")
        SpanCategoriasDois.classList.toggle("SpanCategoriasDois")
        SpanCategoriasTrez.classList.toggle("SpanCategoriasTrez")
         SpanCategoriasTrez.classList.toggle("SpanCategoriasTrez")
    }
})

//filtros
document.querySelectorAll('.NavCategorias button').forEach(button => {
  button.addEventListener('click', () => {
    const categoriaSelecionada = button.getAttribute('data-categoria');
    const produtos = document.querySelectorAll('.CardProdutosHome');

    produtos.forEach(produto => {
      const categoriaDoProduto = produto.getAttribute('data-categoria');

      if (categoriaSelecionada === 'todos' || categoriaSelecionada === categoriaDoProduto) {
        produto.style.display = 'block';
      } else {
        produto.style.display = 'none';
      }
    });
  });
});

//barra de pesquisa
 const inputSearch = document.getElementById('InputSearchHome');
  const botaoLupa = document.getElementById('LupaSearchHome');

  function filtrarProdutos() {
    const termo = inputSearch.value.toLowerCase().trim();
    const produtos = document.querySelectorAll('.CardProdutosHome');

    produtos.forEach(produto => {
      const nome = produto.getAttribute('data-nome').toLowerCase();

      if (nome.includes(termo)) {
        produto.style.display = 'block';
      } else {
        produto.style.display = 'none';
      }
    });
  }

  // Ao clicar na lupa
  botaoLupa.addEventListener('click', filtrarProdutos);

  // Ao digitar e pressionar Enter
  inputSearch.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      filtrarProdutos();
    }
  });