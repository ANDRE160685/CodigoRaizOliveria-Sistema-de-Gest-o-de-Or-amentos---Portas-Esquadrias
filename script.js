// --- SEGURANÇA E INICIALIZAÇÃO ---
window.addEventListener('pageshow', function (event) {
    // 1. Verificação de Segurança (o que você já tinha)
    if (window.location.pathname.includes('dashboard.html')) {
        if (localStorage.getItem('logado') !== 'true') {
            window.location.replace("index.html");
            return; // Para a execução aqui se não estiver logado
        }
    }

    // 2. Carregamento Automático de Dados (a parte nova)
    
    // Se estiver na página de Preços
    if (document.getElementById('formPrecos')) {
        carregarConfiguracoesPrecos();
    }
    
    // Se estiver no Dashboard
    if (document.getElementById('tabelaVendas')) {
        listarVendas();
    }
});

function logout() { localStorage.removeItem('logado'); window.location.replace("index.html"); }

const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (document.getElementById('email_login').value === "Teste" && document.getElementById('password').value === "1234") {
            localStorage.setItem('logado', 'true'); window.location.href = "dashboard.html";
        } else { alert("Acesso negado!"); }
    });
}

// --- LÓGICA DE ITENS ---
let itensDoOrcamento = [];

function atualizarLinhas(tipoForced = "", linhaForced = "") {
    const tipo = tipoForced || document.getElementById('tipo').value;
    const linhaSelect = document.getElementById('linha');
    linhaSelect.innerHTML = '<option value="">Selecione...</option>';
    const opcoes = { 'Porta': ['Interna', 'Externa', 'De Correr'], 'Esquadria': ['Gold', 'Suprema'] };

    if (tipo && opcoes[tipo]) {
        opcoes[tipo].forEach(item => {
            const opt = document.createElement('option');
            opt.value = item; opt.textContent = item;
            linhaSelect.appendChild(opt);
        });
        if (linhaForced) linhaSelect.value = linhaForced;
    }
}
function gerenciarCamposPorta() {
    const tipo = document.getElementById('tipo').value;
    const modeloSelect = document.getElementById('modelo');

    if (tipo === 'Porta') {
        modeloSelect.disabled = false;
        modeloSelect.classList.add('border-primary'); // Destaque visual
    } else {
        modeloSelect.disabled = true;
        modeloSelect.value = "Nulo";
        modeloSelect.classList.remove('border-primary');
    }
}

function adicionarItemALista() {
    // 1. Captura de dados da interface
    const local = document.getElementById('local').value || "Geral";
    const tipo = document.getElementById('tipo').value;
    const linha = document.getElementById('linha').value;
    const modelo = document.getElementById('modelo').value;
    const cor = document.getElementById('cor').value;
    const largura = parseFloat(document.getElementById('largura').value) || 0;
    const altura = parseFloat(document.getElementById('altura').value) || 0;
    const obs = document.getElementById('observacao').value;

    // 2. Validação básica
    if (!tipo || !linha || largura <= 0 || altura <= 0) {
        alert("Preencha o Tipo, Linha e as Medidas (Largura/Altura).");
        return;
    }

    // 3. BUSCA OS PREÇOS SALVOS MANUALMENTE (do precos.html)
    // Se não houver nada salvo, ele assume 0 para evitar erros
    const precos = JSON.parse(localStorage.getItem('tabela_precos')) || {};

    // 4. Lógica de Cálculo
    const m2Item = largura * altura;
    let vU = 0; // Valor Unitário do m²

    if (tipo === 'Porta') {
        // Seleciona o preço base de acordo com a Linha escolhida
        if (linha === 'Interna') {
            vU = precos.p_interna_m2 || 0;
        } else if (linha === 'Externa') {
            vU = precos.p_externa_m2 || 0;
        } else if (linha === 'De Correr') {
            vU = precos.p_correr_m2 || 0;
        }

        const corSelecionada = document.getElementById('cor').value;
        if (tipo === 'Porta' && linha === 'Externa') {
            if (corSelecionada === 'metalica' || corSelecionada === 'metalico') {
                vU += (precos.add_cor_metalico || 0);
            } else if (corSelecionada === 'amadeirado' || corSelecionada === 'amaderado') {
                vU += (precos.add_cor_amadeirado || 0);
            }
        }

        // Soma os adicionais de modelo (Ripada ou Cava)
        if (modelo === 'Ripada') vU += (precos.add_ripada || 0);
        if (modelo === 'Com Cava') vU += (precos.add_cava || 0);

    } else if (tipo === 'Esquadria') {
        // Para esquadrias, busca o valor da Linha Gold ou Suprema
        vU = (linha === 'Gold') ? (precos.e_gold || 0) : (precos.e_suprema || 0);
    }

    // 5. Cálculo Final
    const subtotalFinal = m2Item * vU;

    // 6. Salvar no array de itens (sem coluna de quantidade)
    itensDoOrcamento.push({ 
        local, 
        tipo, 
        linha, 
        modelo: modelo !== 'Nulo' ? modelo : "", 
        cor: cor !== 'nulo' ? cor : "",
        medidas: `${largura.toFixed(2)}m x ${altura.toFixed(2)}m (${m2Item.toFixed(2)}m²)`, 
        subtotal: subtotalFinal 
    });

    // 7. Atualizar interface e limpar campos
    atualizarTabelaTemporaria();
    
    document.getElementById('largura').value = "";
    document.getElementById('altura').value = "";
    document.getElementById('local').value = "";
    document.getElementById('observacao').value = "";
}

// 2. Ajuste na tabela para não mostrar Quantidade (Qtd)
function atualizarTabelaTemporaria() {
    const tbody = document.getElementById('listaItensTemporarios');
    tbody.innerHTML = "";
    let totalGeral = 0;

    itensDoOrcamento.forEach((item, index) => {
        totalGeral += item.subtotal;
        tbody.innerHTML += `
            <tr>
                <td>${item.local}</td>
                <td>${item.tipo} ${item.linha} ${item.modelo} ${item.cor}</td>
                <td>${item.medidas}</td>
                <td>R$ ${item.subtotal.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
                <td class="text-center">
                    <button type="button" class="btn btn-danger btn-sm" onclick="removerItem(${index})">X</button>
                </td>
            </tr>`;
    });

    document.getElementById('valor_total_venda').value = totalGeral.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'});
}
function atualizarTabelaTemporaria() {
    const tbody = document.getElementById('listaItensTemporarios');
    tbody.innerHTML = "";
    let totalGeral = 0;

    itensDoOrcamento.forEach((item, index) => {
        totalGeral += item.subtotal;
        tbody.innerHTML += `
            <tr>
                <td>${item.local}</td>
                <td>${item.tipo} ${item.linha} ${item.modelo !== 'Nulo' ? '(' + item.modelo + ')' : ''} ${item.painel !== 'Nulo' ? '[' + item.painel + ']' : ''}</td>
                <td>${item.largura}x${item.altura}</td>
                <td>${item.qtd}</td>
                <td>R$ ${item.subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                <td class="text-center"><button type="button" class="btn btn-danger btn-sm" onclick="removerItem(${index})">X</button></td>
            </tr>`;
    });

    document.getElementById('valor_total_venda').value = totalGeral.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function removerItem(index) {
    itensDoOrcamento.splice(index, 1);
    atualizarTabelaTemporaria();
}

// --- CRUD ---
const vendaForm = document.getElementById('vendaForm');
if (vendaForm) {
    vendaForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (itensDoOrcamento.length === 0) { alert("Adicione itens."); return; }

        const idVenda = document.getElementById('idVenda').value;
        const venda = {
            id: idVenda ? parseInt(idVenda) : Date.now(),
            cliente: document.getElementById('cliente').value,
            whatsapp: document.getElementById('whatsapp').value,
            telefone: document.getElementById('telefone').value,
            rua: document.getElementById('rua').value,
            numero: document.getElementById('numero').value,
            cidade: document.getElementById('cidade').value,
            pagamento: document.getElementById('forma_pagamento').value,
            itens: itensDoOrcamento,
            total: document.getElementById('valor_total_venda').value
        };

        let vendas = JSON.parse(localStorage.getItem('banco_vendas')) || [];

        if (idVenda) {
            // Se tem ID, substitui a venda existente (Edição)
            const index = vendas.findIndex(v => v.id == idVenda);
            vendas[index] = venda;
        } else {
            // Se não tem ID, adiciona nova (Criação)
            vendas.push(venda);
        }

        localStorage.setItem('banco_vendas', JSON.stringify(vendas));
        cancelarEdicao();
        listarVendas();
        alert(idVenda ? "Orçamento atualizado!" : "Venda salva com sucesso!");
    });
    listarVendas();
}

function listarVendas() {
    const tabela = document.getElementById('tabelaVendas');
    const busca = document.getElementById('inputBusca').value.toLowerCase();
    let vendas = JSON.parse(localStorage.getItem('banco_vendas')) || [];
    const filtradas = vendas.filter(v => v.cliente.toLowerCase().includes(busca));

    tabela.innerHTML = "";
    filtradas.reverse().forEach(v => {
        tabela.innerHTML += `
            <tr>
                <td><strong>${v.cliente}</strong></td>
                <td><small>${v.cidade}</small></td>
                <td>${v.itens.length}</td>
                <td class="text-primary fw-bold">${v.total}</td>
                <td class="text-center">
                    <button onclick="visualizarRelatorio(${v.id})" class="btn btn-sm btn-info text-white">👁️</button>
                    <button onclick="prepararEdicao(${v.id})" class="btn btn-sm btn-warning">✏️</button>
                    <button onclick="excluirVenda(${v.id})" class="btn btn-sm btn-danger">🗑️</button>
                </td>
            </tr>`;
    });
}

// FUNÇÃO DE EDIÇÃO
function prepararEdicao(id) {
    let vendas = JSON.parse(localStorage.getItem('banco_vendas')) || [];
    const v = vendas.find(x => x.id == id);
    if (v) {
        document.getElementById('idVenda').value = v.id;
        document.getElementById('cliente').value = v.cliente;
        document.getElementById('whatsapp').value = v.whatsapp;
        document.getElementById('telefone').value = v.telefone;
        document.getElementById('rua').value = v.rua;
        document.getElementById('numero').value = v.numero;
        document.getElementById('cidade').value = v.cidade;
        document.getElementById('forma_pagamento').value = v.pagamento;
        document.getElementById('painel').value = v.painel || "Nulo";

        itensDoOrcamento = [...v.itens];
        atualizarTabelaTemporaria();

        document.getElementById('btnSalvar').innerText = "Atualizar Orçamento";
        document.getElementById('btnCancelar').classList.remove('d-none');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function excluirVenda(id) {
    if (confirm("Excluir esta venda?")) {
        let v = JSON.parse(localStorage.getItem('banco_vendas'));
        localStorage.setItem('banco_vendas', JSON.stringify(v.filter(x => x.id != id)));
        listarVendas();
    }
}

function cancelarEdicao() {
    vendaForm.reset();
    itensDoOrcamento = [];
    document.getElementById('idVenda').value = "";
    document.getElementById('btnSalvar').innerText = "Finalizar Venda";
    document.getElementById('btnCancelar').classList.add('d-none');
    atualizarTabelaTemporaria();
}

function visualizarRelatorio(id) {
    let vendas = JSON.parse(localStorage.getItem('banco_vendas')) || [];
    const v = vendas.find(x => x.id == id);
    if (!v) return;

    let itensHtml = v.itens.map(i => `
        <tr>
            <td>${i.local}</td>
            <td>${i.tipo} ${i.linha} ${i.modelo !== 'Nulo' ? '- Mod: ' + i.modelo : ''} ${i.painel !== 'Nulo' ? '- Painel: ' + i.painel : ''}</td>
            <td>${i.largura}x${i.altura}</td>
            <td>${i.qtd}</td>
            <td>R$ ${i.subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
        </tr>
    `).join('');

    document.getElementById('conteudoRelatorio').innerHTML = `
        <div class="p-4">
            <h4 class="text-center border-bottom pb-3">ORÇAMENTO</h4>
            <p><strong>Cliente:</strong> ${v.cliente} | <strong>WhatsApp:</strong> ${v.whatsapp}</p>
            <table class="table table-bordered table-sm">
                <thead><tr><th>Ambiente</th><th>Descrição</th><th>Medidas</th><th>Qtd</th><th>Total</th></tr></thead>
                <tbody>${itensHtml}</tbody>
            </table>
            <p><strong>Pagamento:</strong> ${v.pagamento}</p>
            <h3 class="text-end text-primary">TOTAL: ${v.total}</h3>
        </div>`;
    new bootstrap.Modal(document.getElementById('relatorioModal')).show();
}

function copiarParaWhatsapp() {
    const tel = document.getElementById('telefone').value.replace(/\D/g, '');
    if (tel) document.getElementById('whatsapp').value = "55" + tel;
}

// --- FUNÇÕES ESPECÍFICAS PARA A PÁGINA PRECOS.HTML ---

// Carrega os valores nos inputs quando a página precos.html abre
function carregarConfiguracoesPrecos() {
    const salvos = JSON.parse(localStorage.getItem('tabela_precos'));
    if (salvos) {
        Object.keys(salvos).forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                input.value = salvos[id];
            }
        });
    }
}

// Salva os valores digitados manualmente (incluindo m2 e milímetros)
function salvarPrecos() {
    const novosPrecos = {};
    // Pega todos os campos de número do formulário de preços
    const campos = document.querySelectorAll('#formPrecos input[type="number"]');
    
    campos.forEach(campo => {
        novosPrecos[campo.id] = parseFloat(campo.value) || 0;
    });

    localStorage.setItem('tabela_precos', JSON.stringify(novosPrecos));
    alert("Configurações de preços e milímetros salvas com sucesso!");
}