interface SuggestionChipProps {
  label: string
  onClick: (label: string) => void
}

export function SuggestionChip({ label, onClick }: SuggestionChipProps) {
  return (
    <button
      onClick={() => onClick(label)}
      className="px-3 py-1.5 text-xs rounded-full bg-white border border-brand-200 text-brand-700
        hover:bg-brand-50 hover:border-brand-400 transition-colors whitespace-nowrap"
    >
      {label}
    </button>
  )
}

export const SUGGESTIONS = [
  'Qual é o meu saldo?',
  'Como está meu cartão?',
  'Gastos por categoria',
  'Maiores gastos do mês',
  'Padrões de gasto',
  'Quanto gastei em julho?',
  'Quais foram minhas receitas?',
  'O que é um Item no Open Finance?',
]
