// =========================================================
// SISTEMA DE ORÇAMENTOS - CODRAIZOLIVEIRA
// Desenvolvedor: André Luis | script.js
// =========================================================

// --- SEGURANÇA E INICIALIZAÇÃO ---
window.addEventListener('pageshow', function (event) {
    // 1. Verificação de Segurança
    if (window.location.pathname.includes('dashboard.html')) {
        if (localStorage.getItem('logado') !== 'true') {
            window.location.replace("index.html");
            return;
        }
    }

    // 2. Carregamento Automático de Dados
    if (document.getElementById('formPrecos')) {
        carregarConfiguracoesPrecos();
    }

    if (document.getElementById('tabelaVendas')) {
        listarVendas();
    }
});

function logout() {
    localStorage.removeItem('logado');
    window.location.replace("index.html");
}

const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (document.getElementById('email_login').value === "Teste" && document.getElementById('password').value === "1234") {
            localStorage.setItem('logado', 'true');
            window.location.href = "dashboard.html";
        } else {
            alert("Acesso negado!");
        }
    });
}

// --- LÓGICA DE ITENS DO ORÇAMENTO ---
let itensDoOrcamento = [];

// 1. Atualiza as linhas conforme o tipo (Porta ou Esquadria)
function atualizarLinhas(tipoForced = "", linhaForced = "") {
    const tipo = tipoForced || document.getElementById('tipo').value;
    const linhaSelect = document.getElementById('linha');
    const containerEspessura = document.getElementById('container-espessura');

    linhaSelect.innerHTML = '<option value="">Selecione...</option>';
    
    const opcoes = { 
        'Porta': ['Interna', 'Externa', 'De Correr'], 
        'Esquadria': ['Gold', 'Suprema'],
        'Painel': ['Ripado', 'Liso', 'Frisado'] // Opções para o novo tipo Painel
    };

    if (tipo && opcoes[tipo]) {
        opcoes[tipo].forEach(item => {
            const opt = document.createElement('option');
            opt.value = item; 
            opt.textContent = item;
            linhaSelect.appendChild(opt);
        });
        if (linhaForced) linhaSelect.value = linhaForced;
    }

    // Reset de segurança: Esconde campos específicos ao mudar o tipo
    if (containerEspessura) containerEspessura.style.display = 'none';
}

// 2. Monitora especificamente a Linha "Externa" para mostrar milímetros
document.addEventListener('change', function (e) {
    if (e.target && e.target.id === 'linha') {
        const linhaVal = e.target.value;
        const container = document.getElementById('container-espessura');
        const selectEsp = document.getElementById('espessura_porta');
        const precos = JSON.parse(localStorage.getItem('tabela_precos')) || {};

        if (linhaVal === 'Externa') {
            container.style.display = 'block';
            selectEsp.innerHTML = '<option value="">Selecione mm...</option>';

            const opcoesMM = [precos.p_ext_1_mm, precos.p_ext_2_mm, precos.p_ext_3_mm];
            opcoesMM.forEach(mm => {
                if (mm) {
                    const opt = document.createElement('option');
                    opt.value = mm;
                    opt.textContent = mm + ' mm';
                    selectEsp.appendChild(opt);
                }
            });
        } else {
            if (container) container.style.display = 'none';
        }
    }
});

function gerenciarCamposPorta() {
    const tipo = document.getElementById('tipo').value;
    const modeloSelect = document.getElementById('modelo');

    if (tipo === 'Porta') {
        modeloSelect.disabled = false;
        modeloSelect.classList.add('border-primary');
    } else {
        modeloSelect.disabled = true;
        modeloSelect.value = "Nulo";
        modeloSelect.classList.remove('border-primary');
    }
}
function gerenciarCamposExtras() {
    const tipo = document.getElementById('tipo').value;
    const containerPainel = document.getElementById('container-painel');
    const containerAcessorios = document.getElementById('container-acessorios');
    const containerModelo = document.getElementById('container-modelo');
    const modeloSelect = document.getElementById('modelo');
    const containerEspessura = document.getElementById('container-espessura');

    // 1. Exibição do bloco de Medidas de Painel
    containerPainel.style.display = (tipo === 'Painel') ? 'block' : 'none';

    // 2. Exibição do bloco de Acessórios (Apenas para Portas)
    if (containerAcessorios) {
        containerAcessorios.style.display = (tipo === 'Porta') ? 'block' : 'none';
    }

    // 3. Exibição do Modelo (Porta e Painel sim / Esquadria não)
    if (tipo === 'Porta' || tipo === 'Painel') {
        containerModelo.style.display = 'block';
        modeloSelect.disabled = false;
        modeloSelect.classList.add('border-primary');
    } else {
        containerModelo.style.display = 'none';
        modeloSelect.disabled = true;
        modeloSelect.value = "Nulo";
        modeloSelect.classList.remove('border-primary');
    }

    // 4. Reset de Espessura
    if (tipo !== 'Porta' && containerEspessura) {
        containerEspessura.style.display = 'none';
    }
}

// 3. Função Principal: Adicionar Item à Lista
function adicionarItemALista() {
    const local = document.getElementById('local').value || "Geral";
    const tipo = document.getElementById('tipo').value;
    const linha = document.getElementById('linha').value;
    const modelo = document.getElementById('modelo').value;
    const cor = document.getElementById('cor').value;
    const larguraGeral = parseFloat(document.getElementById('largura').value) || 0;
    const alturaGeral = parseFloat(document.getElementById('altura').value) || 0;
    const quantidade = parseInt(document.getElementById('quantidade').value) || 1;
    const obsGeral = document.getElementById('observacao').value;

    if (!tipo || !linha) {
        alert("Selecione o Tipo e a Linha.");
        return;
    }

    const precos = JSON.parse(localStorage.getItem('tabela_precos')) || {};
    let vU = 0; 
    let especificacaoExtra = "";
    let larguraCalculo = larguraGeral;
    let alturaCalculo = alturaGeral;

    // --- 1. VALOR BASE ---
    if (tipo === 'Porta') {
        if (larguraGeral <= 0 || alturaGeral <= 0) { alert("Informe as medidas da porta."); return; }
        if (linha === 'Interna') vU = parseFloat(precos.p_interna_m2) || 0;
        else if (linha === 'De Correr') vU = parseFloat(precos.p_correr_m2) || 0;
        else if (linha === 'Externa') {
            const mmEscolhido = document.getElementById('espessura_porta').value;
            if (!mmEscolhido) { alert("Selecione a espessura."); return; }
            if (mmEscolhido == precos.p_ext_1_mm) vU = parseFloat(precos.p_ext_1_valor);
            else if (mmEscolhido == precos.p_ext_2_mm) vU = parseFloat(precos.p_ext_2_valor);
            else if (mmEscolhido == precos.p_ext_3_mm) vU = parseFloat(precos.p_ext_3_valor);
            especificacaoExtra = ` (${mmEscolhido}mm)`;
        }
    } 
    else if (tipo === 'Painel') {
        const faces = document.getElementById('painel_faces').value;
        larguraCalculo = parseFloat(document.getElementById('painel_largura').value) || 0;
        alturaCalculo = parseFloat(document.getElementById('painel_altura').value) || 0;
        vU = (faces === "1 Face") ? (parseFloat(precos.preco_painel_1face) || 0) : (parseFloat(precos.preco_painel_2faces) || 0);
        especificacaoExtra = ` (Painel ${faces})`;
    }
    else if (tipo === 'Esquadria') {
        vU = (linha === 'Gold') ? (parseFloat(precos.e_gold) || 0) : (parseFloat(precos.e_suprema) || 0);
    }

    // --- 2. ADICIONAIS (Modelo e Cor) ---
    if (tipo !== 'Esquadria') {
        if (modelo === 'Ripada') vU += (parseFloat(precos.add_ripada) || 0);
        if (modelo === 'Com Cava') vU += (parseFloat(precos.add_cava) || 0);
    }
    if (cor.includes('metalica') || cor === 'metalico') vU += (parseFloat(precos.add_cor_metalico) || 0);
    if (cor.includes('amadeirado') || cor === 'amaderado') vU += (parseFloat(precos.add_cor_amadeirado) || 0);

    // --- 3. ACESSÓRIOS (Portas) ---
    let totalAcessorios = 0;
    let resumoAcessorios = "";
    if (tipo === 'Porta') {
        const acessoriosIds = ['veda', 'pivo', 'fech', 'pux'];
        acessoriosIds.forEach(id => {
            const q = parseInt(document.getElementById(`${id}_qtd`).value) || 0;
            const v = parseFloat(document.getElementById(`${id}_val`).value) || 0;
            const t = document.getElementById(id === 'fech' ? 'fech_mod' : `${id}_tam`).value || "";
            if (q > 0) {
                totalAcessorios += (q * v);
                resumoAcessorios += `[${id.toUpperCase()}: ${q}un - ${t}] `;
            }
        });
        const obsAcc = document.getElementById('obs_acessorios').value;
        if (obsAcc) resumoAcessorios += ` | Obs: ${obsAcc}`;
    }

    // --- 4. CÁLCULO FINAL ---
    const m2Item = larguraCalculo * alturaCalculo;
    const subtotalFinal = ((m2Item * vU) * quantidade) + totalAcessorios;

    itensDoOrcamento.push({
        local, tipo, linha: linha + especificacaoExtra,
        modelo: modelo !== 'Nulo' ? modelo : "",
        cor: (cor !== 'nulo' && cor !== "") ? cor : "",
        largura: larguraCalculo.toFixed(2), altura: alturaCalculo.toFixed(2),
        m2: m2Item.toFixed(2), qtd: quantidade,
        obs: obsGeral + (resumoAcessorios ? " | ACESSÓRIOS: " + resumoAcessorios : ""),
        subtotal: subtotalFinal
    });

    atualizarTabelaTemporaria();
    limparCamposAposAdicionar();
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
                <td>${item.tipo} ${item.linha} ${item.modelo ? '(' + item.modelo + ')' : ''} ${item.cor}</td>
                <td>${item.largura}x${item.altura} (${item.m2}m²)</td>
                <td>${item.qtd}</td>
                <td>R$ ${item.subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                <td class="text-center"><button type="button" class="btn btn-danger btn-sm" onclick="removerItem(${index})">X</button></td>
            </tr>`;
    });

    document.getElementById('valor_total_venda').value = totalGeral.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function limparCamposAposAdicionar() {
    // Campos principais
    const idsParaLimpar = ['largura', 'altura', 'local', 'observacao', 'painel_largura', 'painel_altura', 'obs_acessorios'];
    idsParaLimpar.forEach(id => { if(document.getElementById(id)) document.getElementById(id).value = ""; });
    
    document.getElementById('quantidade').value = "1";
    document.getElementById('modelo').value = "Nulo";

    // Campos de acessórios
    const acessIds = ['veda_qtd', 'veda_val', 'veda_tam', 'pivo_qtd', 'pivo_val', 'pivo_tam', 
                      'fech_qtd', 'fech_val', 'fech_mod', 'pux_qtd', 'pux_val', 'pux_tam'];
    acessIds.forEach(id => { if(document.getElementById(id)) document.getElementById(id).value = ""; });

    // Esconde containers específicos
    if (document.getElementById('container-espessura')) document.getElementById('container-espessura').style.display = 'none';
}

function removerItem(index) {
    itensDoOrcamento.splice(index, 1);
    atualizarTabelaTemporaria();
}

// --- CRUD VENDAS ---
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
            const idx = vendas.findIndex(v => v.id == idVenda);
            vendas[idx] = venda;
        } else {
            vendas.push(venda);
        }

        localStorage.setItem('banco_vendas', JSON.stringify(vendas));
        cancelarEdicao();
        listarVendas();
        alert("Salvo com sucesso!");
    });
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
    if (vendaForm) vendaForm.reset();
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
            <td>${i.tipo} ${i.linha} ${i.modelo ? '- ' + i.modelo : ''}</td>
            <td>${i.largura}x${i.altura}</td>
            <td>${i.qtd}</td>
            <td>R$ ${i.subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
        </tr>`).join('');

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

// --- FUNÇÕES DE PREÇOS (CONFIGURAÇÃO) ---
function carregarConfiguracoesPrecos() {
    const salvos = JSON.parse(localStorage.getItem('tabela_precos'));
    if (salvos) {
        Object.keys(salvos).forEach(id => {
            const input = document.getElementById(id);
            if (input) input.value = salvos[id];
        });
    }
}

function salvarPrecos() {
    const novosPrecos = {};
    const campos = document.querySelectorAll('#formPrecos input[type="number"]');
    campos.forEach(campo => {
        novosPrecos[campo.id] = parseFloat(campo.value) || 0;
    });
    localStorage.setItem('tabela_precos', JSON.stringify(novosPrecos));
    alert("Preços salvos com sucesso!");
}