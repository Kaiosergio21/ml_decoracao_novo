function toggleSenha() {
    const senhaInput = document.getElementById("senha");
    const tipoAtual = senhaInput.getAttribute("type");
    senhaInput.setAttribute("type", tipoAtual === "password" ? "text" : "password");
}