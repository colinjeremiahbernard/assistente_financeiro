import { accounts, transactions } from '../data/mockData'

// ── Tipos ─────────────────────────────────────────────────────────────────────

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  source?: string   // indica de onde veio o dado
}

// ── Helpers de formatação ─────────────────────────────────────────────────────

export function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

function accountName(id: string): string {
  return accounts.find(a => a.account_id === id)?.name ?? id
}

// ── Análise de intenção ───────────────────────────────────────────────────────

type Intent =
  | 'saldo'
  | 'transacoes'
  | 'gastos_categoria'
  | 'gastos_periodo'
  | 'cartao'
  | 'receitas'
  | 'maiores_gastos'
  | 'padrao_gasto'
  | 'o_que_e_item'      // pergunta conceitual → Pluggy
  | 'ajuda'
  | 'desconhecido'

const intentPatterns: [Intent, RegExp][] = [
  ['saldo',           /saldo|quanto\s+tenho|disponível|dinheiro|poupança|conta\s+corrente/i],
  ['cartao',          /cartão|cartao|crédito|credito|fatura|dívida|divida|limite/i],
  ['receitas',        /salário|salario|receita|entradas?|receb/i],
  ['gastos_categoria',/categori|tipo\s+de\s+gasto|quanto\s+gast.*em|alimenta|transporte|entretenimento|streaming|moradia/i],
  ['maiores_gastos',  /maior.*gasto|gasto.*maior|top|mais\s+car|mais\s+gast/i],
  ['padrao_gasto',    /padrão|padrao|padr|hábito|habito|comportamento|análise|analise|resumo/i],
  ['transacoes',      /transaç|transac|extrato|lançamento|histórico|historico|moviment/i],
  ['gastos_periodo',  /esse\s+mês|este\s+mês|julho|semana|período|periodo|quanto\s+gast/i],
  ['o_que_e_item',    /o\s+que\s+[eé]\s+(um\s+)?item|pluggy|open\s+finance|conector|consent/i],
  ['ajuda',           /ajuda|help|o\s+que\s+você\s+faz|o\s+que\s+voce\s+faz|comandos|perguntas/i],
]

function detectIntent(text: string): Intent {
  for (const [intent, pattern] of intentPatterns) {
    if (pattern.test(text)) return intent
  }
  return 'desconhecido'
}

// ── Geradores de resposta ─────────────────────────────────────────────────────

function respondSaldo(): { content: string; source: string } {
  const lines = accounts.map(acc => {
    const b = acc.balances
    if (acc.type === 'credit') {
      const used = b.current
      const avail = b.available
      return `• **${acc.name}** (final ••••${acc.mask})\n  Fatura atual: ${formatBRL(used)} | Limite disponível: ${formatBRL(avail ?? 0)} de ${formatBRL(b.limit ?? 0)}`
    }
    return `• **${acc.name}** (final ••••${acc.mask})\n  Disponível: ${formatBRL(b.available ?? b.current)} | Saldo atual: ${formatBRL(b.current)}`
  })

  return {
    content: `Aqui estão os seus saldos:\n\n${lines.join('\n\n')}\n\n> 💡 *Todos os valores em BRL (R$). Dados fictícios para fins de demonstração.*`,
    source: 'Mock Plaid Sandbox (dados fictícios)',
  }
}

function respondCartao(): { content: string; source: string } {
  const credit = accounts.find(a => a.type === 'credit')!
  const txns = transactions.filter(t => t.account_id === credit.account_id && !t.pending)
  const total = txns.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0)
  const estornos = txns.filter(t => t.amount < 0).reduce((s, t) => s + t.amount, 0)

  const rows = txns
    .sort((a, b) => b.date.localeCompare(a.date))
    .map(t => `  ${t.date}  ${(t.name).padEnd(30)} ${t.amount > 0 ? formatBRL(t.amount) : `\`${formatBRL(t.amount)}\` ↩ estorno`}`)
    .join('\n')

  return {
    content: `**${credit.name}** (final ••••${credit.mask})\n\n` +
      `Fatura atual: **${formatBRL(credit.balances.current)}**\n` +
      `Limite total: ${formatBRL(credit.balances.limit ?? 0)} | Disponível: ${formatBRL(credit.balances.available ?? 0)}\n\n` +
      `**Lançamentos do mês:**\n\`\`\`\n${rows}\n\`\`\`\n\n` +
      `Total de compras: ${formatBRL(total)} | Estornos: ${formatBRL(Math.abs(estornos))}\n\n` +
      `> ⚠️ No formato Plaid, **valor positivo = saída (débito)**. Um saldo de cartão positivo representa o que você deve ao banco.\n\n` +
      `> 💡 *Dados fictícios em BRL (R$) para demonstração.*`,
    source: 'Mock Plaid Sandbox (dados fictícios)',
  }
}

function respondTransacoes(): { content: string; source: string } {
  const recent = [...transactions]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 10)

  const rows = recent.map(t =>
    `• **${t.date}** — ${t.name}\n  ${accountName(t.account_id)} | ${t.amount > 0 ? formatBRL(t.amount) + ' (saída)' : formatBRL(Math.abs(t.amount)) + ' (entrada)'} | ${t.category.join(' › ')}`
  ).join('\n\n')

  return {
    content: `**Últimas 10 transações:**\n\n${rows}\n\n> 💡 *Dados fictícios em BRL (R$). Valor positivo = saída.*`,
    source: 'Mock Plaid Sandbox (dados fictícios)',
  }
}

function respondGastosCategoria(): { content: string; source: string } {
  const saidas = transactions.filter(t => t.amount > 0)
  const map = new Map<string, number>()

  for (const t of saidas) {
    const cat = t.category[0] ?? 'Outros'
    map.set(cat, (map.get(cat) ?? 0) + t.amount)
  }

  const sorted = [...map.entries()].sort((a, b) => b[1] - a[1])
  const rows = sorted.map(([cat, val]) => `• **${cat}**: ${formatBRL(val)}`).join('\n')
  const total = sorted.reduce((s, [, v]) => s + v, 0)

  return {
    content: `**Gastos por categoria (julho/2025):**\n\n${rows}\n\n**Total de saídas: ${formatBRL(total)}**\n\n> 💡 *Dados fictícios em BRL (R$).*`,
    source: 'Mock Plaid Sandbox (dados fictícios)',
  }
}

function respondMaioresGastos(): { content: string; source: string } {
  const top5 = [...transactions]
    .filter(t => t.amount > 0)
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5)

  const rows = top5.map((t, i) =>
    `${i + 1}. **${t.name}** — ${formatBRL(t.amount)}\n   ${t.date} | ${accountName(t.account_id)} | ${t.category.join(' › ')}`
  ).join('\n\n')

  return {
    content: `**Top 5 maiores gastos do mês:**\n\n${rows}\n\n> 💡 *Dados fictícios em BRL (R$).*`,
    source: 'Mock Plaid Sandbox (dados fictícios)',
  }
}

function respondReceitas(): { content: string; source: string } {
  const entradas = transactions.filter(t => t.amount < 0)
  const rows = entradas.map(t =>
    `• **${t.date}** — ${t.name}\n  ${accountName(t.account_id)} | **${formatBRL(Math.abs(t.amount))}** (entrada) | ${t.category.join(' › ')}`
  ).join('\n\n')

  const total = entradas.reduce((s, t) => s + Math.abs(t.amount), 0)

  return {
    content: `**Entradas e receitas do mês:**\n\n${rows}\n\n**Total recebido: ${formatBRL(total)}**\n\n> 💡 *Dados fictícios em BRL (R$). Valor negativo no Plaid = entrada.*`,
    source: 'Mock Plaid Sandbox (dados fictícios)',
  }
}

function respondPadraoGasto(): { content: string; source: string } {
  const saidas = transactions.filter(t => t.amount > 0)
  const total = saidas.reduce((s, t) => s + t.amount, 0)

  // Por categoria
  const catMap = new Map<string, number>()
  for (const t of saidas) {
    const cat = t.category[0] ?? 'Outros'
    catMap.set(cat, (catMap.get(cat) ?? 0) + t.amount)
  }
  const catTop = [...catMap.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3)

  // Por canal
  const chanMap = new Map<string, number>()
  for (const t of saidas) {
    chanMap.set(t.payment_channel, (chanMap.get(t.payment_channel) ?? 0) + t.amount)
  }

  // Por conta
  const accMap = new Map<string, number>()
  for (const t of saidas) {
    const name = accountName(t.account_id)
    accMap.set(name, (accMap.get(name) ?? 0) + t.amount)
  }

  const catRows = catTop.map(([c, v]) => `  • ${c}: ${formatBRL(v)} (${((v / total) * 100).toFixed(1)}%)`).join('\n')
  const chanRows = [...chanMap.entries()].map(([c, v]) => `  • ${c}: ${formatBRL(v)}`).join('\n')
  const accRows = [...accMap.entries()].map(([c, v]) => `  • ${c}: ${formatBRL(v)}`).join('\n')

  return {
    content: `**Análise de padrão de gastos — julho/2025**\n\n` +
      `Total de saídas: **${formatBRL(total)}**\n\n` +
      `**Padrão 1 — Por categoria (top 3):**\n${catRows}\n\n` +
      `**Padrão 2 — Por canal de pagamento:**\n${chanRows}\n\n` +
      `**Padrão 3 — Por conta:**\n${accRows}\n\n` +
      `> 💡 *Dados fictícios em BRL (R$). Valor positivo = saída no formato Plaid.*`,
    source: 'Mock Plaid Sandbox (dados fictícios)',
  }
}

function respondGastosPeriodo(): { content: string; source: string } {
  const saidas = transactions.filter(t => t.amount > 0 && t.date.startsWith('2025-07'))
  const total = saidas.reduce((s, t) => s + t.amount, 0)
  const entradas = transactions.filter(t => t.amount < 0 && t.date.startsWith('2025-07'))
  const totalEntradas = entradas.reduce((s, t) => s + Math.abs(t.amount), 0)

  return {
    content: `**Resumo financeiro — Julho 2025**\n\n` +
      `💰 Total de entradas: **${formatBRL(totalEntradas)}**\n` +
      `💸 Total de saídas: **${formatBRL(total)}**\n` +
      `📊 Saldo do período: **${formatBRL(totalEntradas - total)}**\n\n` +
      `Foram ${saidas.length} transações de saída e ${entradas.length} de entrada.\n\n` +
      `> 💡 *Dados fictícios em BRL (R$).*`,
    source: 'Mock Plaid Sandbox (dados fictícios)',
  }
}

function respondPluggy(): { content: string; source: string } {
  return {
    content: `**O que é um Item? (via Pluggy MCP)**\n\n` +
      `No ecossistema do Open Finance brasileiro, um **Item** é a representação de uma conexão entre um usuário e uma instituição financeira.\n\n` +
      `Quando você cria um Item na Pluggy, está:\n` +
      `1. Autorizando a coleta de dados da sua conta\n` +
      `2. Associando um **conector** (ex.: Itaú, Nubank, Bradesco) ao seu perfil\n` +
      `3. Estabelecendo o ciclo de **consentimento** exigido pelo Banco Central\n\n` +
      `Cada Item tem um status (UPDATED, UPDATING, ERROR) e expira conforme a política da instituição.\n\n` +
      `> 📡 *Esta explicação vem da documentação da Pluggy, acessível via MCP em* \`https://mcp.pluggy.ai/mcp\`\n` +
      `> Em produção, o Open Finance brasileiro exige consentimento explícito e segurança adicional.`,
    source: 'Pluggy MCP — https://mcp.pluggy.ai/mcp (documentação)',
  }
}

function respondAjuda(): { content: string; source: string } {
  return {
    content: `Olá! Sou o seu **Assistente Financeiro** 🏦\n\n` +
      `Posso responder perguntas como:\n\n` +
      `• *"Qual é o meu saldo?"* — mostra todas as contas\n` +
      `• *"Como está meu cartão de crédito?"* — fatura e lançamentos\n` +
      `• *"Quais foram os meus gastos por categoria?"* — análise por tipo\n` +
      `• *"Quanto gastei este mês?"* — resumo do período\n` +
      `• *"Quais foram os meus maiores gastos?"* — top 5\n` +
      `• *"Que padrões de gasto você identifica?"* — três análises\n` +
      `• *"Quais foram as minhas receitas?"* — entradas do mês\n` +
      `• *"O que é um Item no Open Finance?"* — explicação via Pluggy\n\n` +
      `> ⚠️ *Todos os dados são fictícios e usados apenas para demonstração.*`,
    source: 'Sistema',
  }
}

// ── Handler principal ─────────────────────────────────────────────────────────

export async function handleMessage(userText: string): Promise<{ content: string; source: string }> {
  const intent = detectIntent(userText)

  // Simula latência de rede (300–800ms)
  await new Promise(r => setTimeout(r, 300 + Math.random() * 500))

  switch (intent) {
    case 'saldo':           return respondSaldo()
    case 'cartao':          return respondCartao()
    case 'transacoes':      return respondTransacoes()
    case 'gastos_categoria':return respondGastosCategoria()
    case 'maiores_gastos':  return respondMaioresGastos()
    case 'receitas':        return respondReceitas()
    case 'padrao_gasto':    return respondPadraoGasto()
    case 'gastos_periodo':  return respondGastosPeriodo()
    case 'o_que_e_item':    return respondPluggy()
    case 'ajuda':           return respondAjuda()
    default:
      return {
        content: `Não entendi bem essa pergunta. Tente perguntar sobre **saldo**, **cartão de crédito**, **transações**, **gastos por categoria**, ou diga **"ajuda"** para ver o que posso responder.`,
        source: 'Sistema',
      }
  }
}
