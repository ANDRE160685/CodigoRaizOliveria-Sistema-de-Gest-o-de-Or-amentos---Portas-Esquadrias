// =========================================================
// SISTEMA DE PREÇOS - CODRAIZOLIVEIRA
// Desenvolvedor: André Luis | scriptPreco.js
// =========================================================

document.addEventListener('DOMContentLoaded', () => {
    carregarConfiguracoesPrecos();
});

// --- FUNÇÕES DE PERSISTÊNCIA ---

function salvarPrecos() {
    const novosPrecos = {};
    const campos = document.querySelectorAll('#formPrecos input[type="number"]');
    campos.forEach(campo => {
        novosPrecos[campo.id] = parseFloat(campo.value) || 0;
    });
    localStorage.setItem('tabela_precos', JSON.stringify(novosPrecos));
    alert("✅ Configurações de preços e milímetros salvas!");
}

function carregarConfiguracoesPrecos() {
    const dadosSalvos = localStorage.getItem('tabela_precos');
    if (dadosSalvos) {
        const precos = JSON.parse(dadosSalvos);
        Object.keys(precos).forEach(id => {
            const input = document.getElementById(id);
            if (input) input.value = precos[id];
        });
    }
}

// --- FUNÇÕES DINÂMICAS DO FORMULÁRIO ---

function atualizarLinhas() {
    const tipo = document.getElementById('tipo').value;
    const linhaSelect = document.getElementById('linha');

    // Limpa as opções atuais
    linhaSelect.innerHTML = '<option value="">Selecione...</option>';

    if (tipo === "Porta") {
        const opcoes = ["Interna", "Externa", "De Correr"];
        opcoes.forEach(op => {
            const el = document.createElement("option");
            el.value = op;
            el.textContent = op;
            linhaSelect.appendChild(el);
        });
    } else if (tipo === "Esquadria") {
        const opcoes = ["Gold", "Suprema"];
        opcoes.forEach(op => {
            const el = document.createElement("option");
            el.value = op;
            el.textContent = op;
            linhaSelect.appendChild(el);
        });
    }
}

function gerenciarCamposPorta() {
    const tipo = document.getElementById('tipo').value;
    const containerMilimetro = document.getElementById('containerMilimetro');
    const selectMilimetro = document.getElementById('milimetroPorta');

    // Recupera os dados salvos no localStorage
    const precos = JSON.parse(localStorage.getItem('tabela_precos')) || {};

    if (tipo === "Porta") {
        // Mostra o campo de milímetros
        containerMilimetro.style.display = "block";

        // Limpa e preenche com os milímetros capturados da tela de preços
        selectMilimetro.innerHTML = '<option value="">Escolha o mm...</option>';

        // IDs que você usa no formulário de preços para os milímetros
        const mms = [
            { label: 'Interna', valor: precos.p_interna_esp },
            { label: 'Externa', valor: precos.p_ext_1_esp },
            { label: 'De Correr', valor: precos.p_correr_esp }
        ];

        mms.forEach(mm => {
            if (mm.valor) { // Só adiciona se o milímetro foi cadastrado
                const opt = document.createElement('option');
                opt.value = mm.valor;
                opt.textContent = `${mm.label} (${mm.valor}mm)`;
                selectMilimetro.appendChild(opt);
            }
        });
    } else {
        // Esconde se for esquadria ou vazio
        containerMilimetro.style.display = "none";
    }
}