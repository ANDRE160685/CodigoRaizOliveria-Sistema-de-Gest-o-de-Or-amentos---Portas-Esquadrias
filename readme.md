# 🚪 Sistema de Gestão de Orçamentos - Portas & Esquadrias
**Versão 1.0 (Local Storage Edition)**

Este sistema foi desenvolvido para sanar uma dor comum em serralherias e lojas de acabamentos: a demora e o erro humano no cálculo de orçamentos complexos. Através de uma interface intuitiva, o software automatiza o cálculo de área, aplica acréscimos por acabamento e gera um espelho de venda pronto para o cliente.

---

## 🚀 Funcionalidades Principais

### ⚙️ Configuração Dinâmica de Preços
Diferente de sistemas rígidos, este software permite que o administrador altere o valor do $m^2$ conforme o mercado oscila.
* **Linhas de Portas:** Configuração individual para Portas Internas, Externas e de Correr.
* **Adicionais de Modelo:** Definição de taxas extras para modelos **Ripada** ou **Com Cava**.
* **Adicionais de Cor:** Tabelas de acréscimo para cores **Metálicas** e **Amadeiradas**.

### 📊 Painel de Vendas (Dashboard)
* **Cadastro de Clientes:** Captura de dados básicos, endereço e integração com link direto para WhatsApp.
* **Motor de Cálculo Automático:** O sistema processa a fórmula:
    $$Valor Final = (Largura \times Altura) \times (Preço Base + Adicionais)$$
* **Gestão de Itens:** Adição de múltiplos itens em um único orçamento com visualização em tabela temporária antes da finalização.

### 🖨️ Relatórios e Impressão
* Geração de orçamento formatado com design limpo.
* Suporte a exportação para PDF via comando de impressão do navegador.
* Otimização de layout (oculta menus e botões durante a impressão).

---

## 📁 Arquitetura do Projeto

### 1. Camada de Estrutura (HTML)
* `index.html`: Portal de segurança com sistema de autenticação via sessão.
* `dashboard.html`: Central de operações. Utiliza componentes dinâmicos (Modais e Tabelas) para gerenciar o fluxo de dados.
* `precos.html`: Módulo de administração de variáveis de custo.

### 2. Camada de Estilo (CSS)
* `style.css`: Além do design responsivo, implementa o "Print Mode". Utiliza variáveis para destacar campos críticos, como o **Valor Total Acumulado**, garantindo visibilidade imediata do fechamento da venda.

### 3. Camada de Inteligência (JavaScript)
* `script.js`: Core da aplicação. Gerencia o ciclo de vida dos dados, desde a captura dos inputs até o armazenamento no Banco de Dados Local (LocalStorage). Implementa funções de busca (filtro de clientes) e CRUD completo das vendas.
* `scriptPreco.js`: Responsável pela integridade das tabelas de preço, garantindo que os cálculos de milímetros e valores $m^2$ sejam persistidos e recuperados sem erros de arredondamento.

---

## 🛠️ Especificações Técnicas

* **Linguagem:** JavaScript (ES6+).
* **Framework de UI:** Bootstrap 5.3 (via CDN para alta performance).
* **Ícones:** Emojis e caracteres Unicode (leveza no carregamento).
* **Persistência:** `window.localStorage` — Garantia de que os dados permanecem salvos localmente mesmo após o fechamento do navegador ou desligamento do computador.
* **Compatibilidade:** Navegadores modernos (Chrome, Edge, Firefox).

---

## 📖 Regras de Negócio Implementadas

1.  **Segurança:** Bloqueio de acesso às páginas internas se o token de `logado` não estiver ativo no navegador.
2.  **Cálculo de Área:** Arredondamento para duas casas decimais, garantindo precisão financeira.
3.  **Filtro de Busca:** Busca em tempo real na lista de vendas por nome do cliente, facilitando o pós-venda.

---
**Desenvolvido por André Luis | CodRaizOliveira** *Focado em transformar processos complexos em soluções digitais simples.*


## 📖 Guia de Utilização (Passo a Passo)

### 1. Configuração Inicial (Obrigatório)
Antes de realizar a primeira venda, acesse a página **Configurar Preços**. Sem este passo, o sistema não terá base de cálculo.
* Insira os valores de $m^2$ praticados pela sua empresa.
* Defina os valores adicionais para modelos (Ripada/Cava) e cores especiais.
* Clique em **Salvar Configurações**. O sistema memorizará estes valores para todos os cálculos futuros.

### 2. Realizando um Orçamento
* Acesse o **Dashboard** e preencha os dados do cliente (Nome, WhatsApp e Endereço).
* Na seção **Itens do Orçamento**, selecione o tipo de produto (Porta ou Esquadria).
* Informe a linha, o modelo e as medidas (Largura e Altura).
* Clique em **+ Adicionar Item**. Você pode adicionar quantos itens forem necessários.
* Escolha a forma de pagamento e clique em **Finalizar Venda**.

### 3. Gestão e Impressão
* Na tabela **Vendas Realizadas**, localize o cliente desejado (use a barra de busca se necessário).
* Clique no ícone do olho (👁️) para visualizar o espelho do orçamento.
* Clique em **Imprimir / PDF** para gerar o documento final para o cliente.

---

## ⚠️ Observações e Limitações Técnicas

Como esta versão utiliza o **LocalStorage** para armazenamento, é importante observar os seguintes pontos:

1. **Persistência Local:** Os dados ficam salvos exclusivamente no navegador e computador onde foram inseridos. Se você formatar o computador ou limpar os dados de navegação (cache/cookies), as informações serão perdidas.
2. **Uso Individual:** O sistema não sincroniza dados entre computadores diferentes nesta versão. O que for feito no PC 'A' não aparecerá no PC 'B'.
3. **Backup Manual:** Recomenda-se a geração de PDFs dos orçamentos importantes como forma de backup externo.
4. **Segurança de Acesso:** A senha de acesso administrativo é fixa para esta versão (Usuário: `Teste` | Senha: `1234`).

---

## 🛠️ Instalação e Execução

Por ser uma aplicação **Client-Side**, não é necessário instalar servidores de banco de dados ou ambientes complexos (como Node.js ou PHP) para esta versão:

1. Faça o download de todos os arquivos do projeto para uma pasta.
2. Certifique-se de que todos os arquivos (`.html`, `.css`, `.js`) estejam no mesmo diretório.
3. Abra o arquivo `index.html` em qualquer navegador moderno.

---
**Suporte e Customização:**
Caso necessite de alterações na lógica de cálculo ou migração para banco de dados em nuvem, entre em contato com o desenvolvedor.