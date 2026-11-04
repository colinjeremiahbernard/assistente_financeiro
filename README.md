# assistente-financeiro

Um assistente financeiro em formato de chat que responde perguntas sobre contas, saldos, transações e padrões de gasto — levando o banco até onde o cliente já está.

> ⚠️ **Todos os dados são fictícios e usados apenas para demonstração.** Nenhuma informação bancária real é utilizada.

---

## Onde o cliente está e o que o assistente responde

**Cenário:** chat standalone de banco — o cliente acessa diretamente pelo app ou site do banco para consultar sua vida financeira em linguagem simples.

| Pergunta do cliente | O que o assistente responde | De onde vem o dado |
|---------------------|-----------------------------|--------------------|
| "Qual é o meu saldo?" | Saldo disponível e atual de cada conta | Mock Plaid Sandbox (dados fictícios em BRL) |
| "Como está meu cartão?" | Fatura, limite, lançamentos do mês | Mock Plaid Sandbox |
| "Gastos por categoria?" | Tabela de saídas agrupadas por categoria | Mock Plaid Sandbox |
| "Maiores gastos do mês?" | Top 5 transações por valor | Mock Plaid Sandbox |
| "Que padrões você identifica?" | Três análises: categoria, canal, conta | Mock Plaid Sandbox |
| "Quanto gastei em julho?" | Resumo do período: entradas, saídas, saldo | Mock Plaid Sandbox |
| "O que é um Item no Open Finance?" | Explicação conceitual de Item, conector e consentimento | Pluggy MCP (documentação) |

**Caminho de uma pergunta como "qual é o meu saldo?":**

```
Usuário digita → detectIntent() identifica "saldo"
  → respondSaldo() lê accounts[] do mockData.ts
  → formata valores com Intl.NumberFormat (BRL)
  → retorna bubble com saldos + fonte declarada
  → MessageBubble renderiza markdown + badge de fonte
```

O fluxo com a Plaid real seguiria o mesmo caminho, mas com uma chamada MCP à ferramenta `plaid_balance_get` no lugar do mock local.

---

## Configuração dos servidores MCP

### 1. Pluggy (Streamable HTTP — sem chave)

Nas configurações de MCP da sua IA (Codex, Claude Desktop, Bob, etc.):

```json
{
  "mcpServers": {
    "pluggy": {
      "type": "streamable-http",
      "url": "https://mcp.pluggy.ai/mcp"
    }
  }
}
```

Após conectar, peça à IA: *"O que é um Item na Pluggy? Use as fontes disponíveis."*  
O servidor expõe a documentação do Open Finance brasileiro sem necessidade de autenticação.

### 2. Mock Plaid local (STDIO — dados fictícios em BRL)

Pré-requisito: `uv` instalado ([astral.sh/uv](https://astral.sh/uv)).

```json
{
  "mcpServers": {
    "plaid-mock": {
      "type": "stdio",
      "command": "python",
      "args": ["mcp/plaid-mock/server.py"]
    }
  }
}
```

Ou com `uvx` a partir do diretório do projeto:

```json
{
  "mcpServers": {
    "plaid-mock": {
      "type": "stdio",
      "command": "uvx",
      "args": ["--from", "./mcp/plaid-mock", "mock-plaid-mcp"]
    }
  }
}
```

**Ferramentas expostas pelo mock:**

| Ferramenta | O que retorna |
|------------|---------------|
| `plaid_accounts_get` | Lista de contas com saldos em BRL |
| `plaid_transactions_get` | Transações filtradas por data e conta |
| `plaid_balance_get` | Saldo atual e disponível por conta |
| `plaid_item_get` | Informações do Item de sandbox |

### 3. Plaid real (quando disponível)

Substitua o mock pelo servidor oficial:

```json
{
  "mcpServers": {
    "plaid": {
      "type": "stdio",
      "command": "uvx",
      "args": ["mcp-server-plaid"],
      "env": {
        "PLAID_CLIENT_ID": "seu_client_id_aqui",
        "PLAID_SECRET": "seu_secret_sandbox_aqui",
        "PLAID_ENV": "sandbox"
      }
    }
  }
}
```

> 🔐 **Nunca versione chaves.** Use variáveis de ambiente ou um arquivo `.env` listado no `.gitignore`.

---

## Especificação enviada ao Lovable / prompt OpenSpec

O frontend foi construído diretamente em React + Vite (sem Lovable) com a seguinte especificação funcional:

```
Crie um web app de chat financeiro em português (pt-BR) com:

PÁGINAS:
- Uma única página: interface de chat estilo WhatsApp/iMessage

COMPONENTES:
- Header: nome "Assistente Financeiro", subtítulo "Banco Demo · Dados fictícios", indicador online
- Banner de aviso: "Dados fictícios. Usado apenas para demonstração." com ícone de alerta
- Área de mensagens: bubbles do usuário (direita, azul) e do assistente (esquerda, branco)
- Indicador de digitação: três pontinhos animados enquanto processa
- Chips de sugestão: perguntas pré-definidas clicáveis (aparecem só na abertura)
- Input: campo de texto + botão enviar, Enter para enviar

DADOS:
- Fonte: mockData.ts com contas, saldos e transações fictícias em BRL
- Detecção de intenção por regex no messageHandler.ts
- Cada resposta declara sua fonte de dados

ESTILO:
- Tailwind CSS, paleta azul (brand-600/700), fundo slate-50
- Responsivo, max-width 2xl centralizado
- Markdown simples: negrito, listas, blocos de código, citações

MELHORIA IMPLEMENTADA:
- Todos os valores formatados em BRL com Intl.NumberFormat('pt-BR')
- Nota de conversão declarada em cada resposta
```

**Ajustes feitos após a geração inicial:**
- Renderer de markdown leve (sem dependência externa) para formatar as respostas
- Badge de fonte em cada resposta do assistente
- Nota explicativa sobre "valor positivo = saída" no contexto Plaid
- Sugestões desaparecem após a primeira mensagem enviada

---

## Melhoria implementada: Valores em BRL com conversão declarada

Todos os valores monetários são formatados usando a API nativa do browser:

```ts
new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
}).format(value)
```

Cada resposta inclui a nota:
> 💡 *Todos os valores em BRL (R$). Dados fictícios para fins de demonstração.*

Isso garante que o usuário sempre saiba a moeda e a natureza dos dados, mesmo que no futuro o app suporte múltiplas moedas.

---

## Como rodar localmente

```bash
cd financial-chat/frontend
npm install
npm run dev
```

Acesse em: [http://localhost:5173](http://localhost:5173)

---

## Estrutura do projeto

```
financial-chat/
├── frontend/                  # React + Vite + Tailwind
│   └── src/
│       ├── App.tsx            # Componente principal do chat
│       ├── components/
│       │   ├── MessageBubble.tsx   # Bubble com markdown renderer
│       │   ├── TypingIndicator.tsx # Animação de digitação
│       │   ├── Disclaimer.tsx      # Banner de dados fictícios
│       │   └── SuggestionChip.tsx  # Chips de sugestão
│       ├── data/
│       │   └── mockData.ts    # Contas e transações fictícias em BRL
│       └── lib/
│           └── messageHandler.ts  # Detecção de intenção + respostas
└── mcp/
    └── plaid-mock/
        ├── server.py          # Servidor MCP STDIO (JSON-RPC 2.0)
        └── pyproject.toml     # Config do pacote Python
```

---

## Endereço do app publicado

> 🔗 **https://frontend-six-dusky-54.vercel.app**

---

## Checklist de entrega

- [x] O app avisa que os dados são fictícios
- [x] Nenhuma chave, token ou senha versionada
- [x] Todo arquivo e pasta citada no README existem e têm conteúdo
- [x] Estrutura do projeto documentada
- [x] Configuração dos servidores MCP documentada
- [x] Melhoria (BRL) implementada e documentada
