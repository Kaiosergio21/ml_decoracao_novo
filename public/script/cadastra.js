 // Função para buscar o endereço com base no CEP
    function buscarEndereco() {
        const cep = document.getElementById('cep').value.replace(/\D/g, ''); // Remove qualquer caractere não numérico

        if (cep.length === 8) { // Verifica se o CEP tem 8 dígitos
            const url = `https://viacep.com.br/ws/${cep}/json/`;

            // Faz a requisição para a API ViaCEP
            fetch(url)
                .then(response => response.json())
                .then(data => {
                    if (data.erro) {
                        alert('CEP não encontrado.');
                    } else {
                        // Preenche os campos com os dados retornados pela API
                        document.getElementById('estado').value = data.uf;
                        document.getElementById('cidade').value = data.localidade;
                        document.getElementById('bairro').value = data.bairro;
                        document.getElementById('rua').value = data.logradouro;
                    }
                })
                .catch(error => {
                    console.error('Erro ao buscar o endereço:', error);
                });
        } else {
            alert('CEP inválido!');
        }
    }

    function aplicarMascaraCPFouCNPJ(valor) {
    valor = valor.replace(/\D/g, '');
    if (valor.length <= 11) {
        return valor.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
    } else {
        return valor.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{1,2})/, '$1.$2.$3/$4-$5');
    }
}

function aplicarMascaraTelefone(valor) {
    valor = valor.replace(/\D/g, '');
    if (valor.length <= 10) {
        return valor.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
    } else {
        return valor.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
    }
}

function aplicarMascaraCEP(valor) {
    valor = valor.replace(/\D/g, '');
    return valor.replace(/(\d{5})(\d{0,3})/, '$1-$2');
}

document.getElementById('cpf_cnpj').addEventListener('input', function(e) {
    e.target.value = aplicarMascaraCPFouCNPJ(e.target.value);
});

document.getElementById('telefone').addEventListener('input', function(e) {
    e.target.value = aplicarMascaraTelefone(e.target.value);
});

document.getElementById('cep').addEventListener('input', function(e) {
    e.target.value = aplicarMascaraCEP(e.target.value);
});

