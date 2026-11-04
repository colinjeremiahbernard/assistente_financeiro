import { AlertTriangle } from 'lucide-react'

export function Disclaimer() {
  return (
    <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 text-xs text-amber-800">
      <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
      <span>
        <strong>Dados fictícios.</strong> Este assistente usa informações de sandbox para fins de demonstração. Nenhum dado bancário real é utilizado.
      </span>
    </div>
  )
}
