// Dados fictícios inspirados no formato Plaid (sandbox local)
// Todos os valores já estão em BRL (R$).
// ATENÇÃO: estes dados são fictícios e usados apenas para demonstração.

export interface Account {
  account_id: string
  name: string
  official_name: string
  type: 'depository' | 'credit' | 'investment'
  subtype: 'checking' | 'savings' | 'credit card' | 'brokerage'
  balances: {
    available: number | null
    current: number
    limit: number | null
    iso_currency_code: 'BRL'
  }
  mask: string
}

export interface Transaction {
  transaction_id: string
  account_id: string
  amount: number        // positivo = saída (débito); negativo = entrada (crédito)
  date: string          // YYYY-MM-DD
  name: string
  merchant_name: string | null
  category: string[]
  payment_channel: 'online' | 'in store' | 'other'
  pending: boolean
}

// ── Contas ────────────────────────────────────────────────────────────────────

export const accounts: Account[] = [
  {
    account_id: 'acc_checking_001',
    name: 'Conta Corrente',
    official_name: 'Conta Corrente Pessoa Física',
    type: 'depository',
    subtype: 'checking',
    balances: {
      available: 4_320.50,
      current: 4_320.50,
      limit: null,
      iso_currency_code: 'BRL',
    },
    mask: '1234',
  },
  {
    account_id: 'acc_savings_001',
    name: 'Poupança',
    official_name: 'Conta Poupança',
    type: 'depository',
    subtype: 'savings',
    balances: {
      available: 12_800.00,
      current: 12_800.00,
      limit: null,
      iso_currency_code: 'BRL',
    },
    mask: '5678',
  },
  {
    account_id: 'acc_credit_001',
    name: 'Cartão de Crédito',
    official_name: 'Cartão Visa Platinum',
    type: 'credit',
    subtype: 'credit card',
    balances: {
      available: 6_500.00,
      current: 1_543.75,   // dívida atual (positivo = você deve)
      limit: 8_000.00,
      iso_currency_code: 'BRL',
    },
    mask: '9012',
  },
]

// ── Transações (últimos 30 dias) ──────────────────────────────────────────────

export const transactions: Transaction[] = [
  // Conta Corrente
  {
    transaction_id: 'txn_001',
    account_id: 'acc_checking_001',
    amount: 3_200.00,
    date: '2025-07-01',
    name: 'Salário',
    merchant_name: null,
    category: ['Receita', 'Salário'],
    payment_channel: 'other',
    pending: false,
  },
  {
    transaction_id: 'txn_002',
    account_id: 'acc_checking_001',
    amount: 1_800.00,
    date: '2025-07-05',
    name: 'Aluguel',
    merchant_name: null,
    category: ['Moradia', 'Aluguel'],
    payment_channel: 'other',
    pending: false,
  },
  {
    transaction_id: 'txn_003',
    account_id: 'acc_checking_001',
    amount: 320.00,
    date: '2025-07-08',
    name: 'Supermercado Extra',
    merchant_name: 'Extra',
    category: ['Alimentação', 'Supermercado'],
    payment_channel: 'in store',
    pending: false,
  },
  {
    transaction_id: 'txn_004',
    account_id: 'acc_checking_001',
    amount: 89.90,
    date: '2025-07-10',
    name: 'NET Virtua Internet',
    merchant_name: 'Claro/NET',
    category: ['Utilidades', 'Internet'],
    payment_channel: 'other',
    pending: false,
  },
  {
    transaction_id: 'txn_005',
    account_id: 'acc_checking_001',
    amount: 45.00,
    date: '2025-07-12',
    name: 'Farmácia São João',
    merchant_name: 'Farmácia São João',
    category: ['Saúde', 'Farmácia'],
    payment_channel: 'in store',
    pending: false,
  },
  {
    transaction_id: 'txn_006',
    account_id: 'acc_checking_001',
    amount: -500.00,
    date: '2025-07-15',
    name: 'PIX Recebido – Ana Lima',
    merchant_name: null,
    category: ['Receita', 'Transferência'],
    payment_channel: 'other',
    pending: false,
  },
  {
    transaction_id: 'txn_007',
    account_id: 'acc_checking_001',
    amount: 180.00,
    date: '2025-07-18',
    name: 'Posto Shell Gasolina',
    merchant_name: 'Shell',
    category: ['Transporte', 'Combustível'],
    payment_channel: 'in store',
    pending: false,
  },
  {
    transaction_id: 'txn_008',
    account_id: 'acc_checking_001',
    amount: 210.50,
    date: '2025-07-20',
    name: 'Supermercado Pão de Açúcar',
    merchant_name: 'Pão de Açúcar',
    category: ['Alimentação', 'Supermercado'],
    payment_channel: 'in store',
    pending: false,
  },
  {
    transaction_id: 'txn_009',
    account_id: 'acc_checking_001',
    amount: 55.00,
    date: '2025-07-22',
    name: 'Restaurante Sabor & Arte',
    merchant_name: 'Sabor & Arte',
    category: ['Alimentação', 'Restaurante'],
    payment_channel: 'in store',
    pending: false,
  },
  {
    transaction_id: 'txn_010',
    account_id: 'acc_checking_001',
    amount: 30.00,
    date: '2025-07-25',
    name: 'iFood Delivery',
    merchant_name: 'iFood',
    category: ['Alimentação', 'Delivery'],
    payment_channel: 'online',
    pending: false,
  },
  // Cartão de Crédito
  {
    transaction_id: 'txn_011',
    account_id: 'acc_credit_001',
    amount: 299.99,
    date: '2025-07-03',
    name: 'Amazon.com.br',
    merchant_name: 'Amazon',
    category: ['Compras', 'Online'],
    payment_channel: 'online',
    pending: false,
  },
  {
    transaction_id: 'txn_012',
    account_id: 'acc_credit_001',
    amount: 39.90,
    date: '2025-07-06',
    name: 'Netflix',
    merchant_name: 'Netflix',
    category: ['Entretenimento', 'Streaming'],
    payment_channel: 'online',
    pending: false,
  },
  {
    transaction_id: 'txn_013',
    account_id: 'acc_credit_001',
    amount: 29.90,
    date: '2025-07-06',
    name: 'Spotify',
    merchant_name: 'Spotify',
    category: ['Entretenimento', 'Streaming'],
    payment_channel: 'online',
    pending: false,
  },
  {
    transaction_id: 'txn_014',
    account_id: 'acc_credit_001',
    amount: 154.00,
    date: '2025-07-11',
    name: 'Renner Roupas',
    merchant_name: 'Renner',
    category: ['Vestuário', 'Loja'],
    payment_channel: 'in store',
    pending: false,
  },
  {
    transaction_id: 'txn_015',
    account_id: 'acc_credit_001',
    amount: 78.50,
    date: '2025-07-14',
    name: 'Rappi Farmácia',
    merchant_name: 'Rappi',
    category: ['Saúde', 'Delivery'],
    payment_channel: 'online',
    pending: false,
  },
  {
    transaction_id: 'txn_016',
    account_id: 'acc_credit_001',
    amount: 320.00,
    date: '2025-07-17',
    name: 'Passagem Aérea LATAM',
    merchant_name: 'LATAM',
    category: ['Viagem', 'Passagem'],
    payment_channel: 'online',
    pending: false,
  },
  {
    transaction_id: 'txn_017',
    account_id: 'acc_credit_001',
    amount: 95.00,
    date: '2025-07-19',
    name: 'Decathlon',
    merchant_name: 'Decathlon',
    category: ['Esporte', 'Loja'],
    payment_channel: 'in store',
    pending: false,
  },
  {
    transaction_id: 'txn_018',
    account_id: 'acc_credit_001',
    amount: 249.99,
    date: '2025-07-23',
    name: 'Americanas.com',
    merchant_name: 'Americanas',
    category: ['Compras', 'Online'],
    payment_channel: 'online',
    pending: true,
  },
  {
    transaction_id: 'txn_019',
    account_id: 'acc_credit_001',
    amount: -200.00,
    date: '2025-07-24',
    name: 'Estorno – Amazon',
    merchant_name: 'Amazon',
    category: ['Estorno', 'Compras'],
    payment_channel: 'online',
    pending: false,
  },
  // Poupança
  {
    transaction_id: 'txn_020',
    account_id: 'acc_savings_001',
    amount: -800.00,
    date: '2025-07-01',
    name: 'Rendimento Poupança',
    merchant_name: null,
    category: ['Receita', 'Investimento'],
    payment_channel: 'other',
    pending: false,
  },
]
