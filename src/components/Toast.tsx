import { useState, useCallback } from 'react'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'
import { cn } from '../lib/cn'

type ToastType = 'success' | 'error' | 'info'
export interface Toast { id: number; message: string; type: ToastType }

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Date.now()
    setToasts(p => [...p, { id, message, type }])
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3500)
  }, [])

  const remove = useCallback((id: number) => setToasts(p => p.filter(t => t.id !== id)), [])

  return { toasts, toast, remove }
}

export function ToastContainer({ toasts, remove }: { toasts: Toast[]; remove: (id: number) => void }) {
  if (!toasts.length) return null
  return (
    <div className="fixed bottom-20 right-3 z-[500] flex flex-col gap-2 max-w-xs w-full sm:right-4">
      {toasts.map(t => (
        <div key={t.id}
          className={cn(
            'flex items-start gap-2.5 px-4 py-3 rounded-xl shadow-2xl text-sm font-medium',
            'animate-[slide-in_0.2s_ease-out]',
            t.type === 'success' ? 'bg-slate-900 text-white border border-emerald-500/20' :
            t.type === 'error'   ? 'bg-red-900 text-red-100 border border-red-700' :
                                   'bg-slate-900 text-white border border-blue-500/20'
          )}>
          {t.type === 'success' ? <CheckCircle2 size={15} className="text-emerald-400 shrink-0 mt-0.5" /> :
           t.type === 'error'   ? <AlertCircle  size={15} className="text-red-400   shrink-0 mt-0.5" /> :
                                  <Info         size={15} className="text-blue-400  shrink-0 mt-0.5" />}
          <span className="flex-1 leading-snug">{t.message}</span>
          <button onClick={() => remove(t.id)} className="text-slate-500 hover:text-slate-300 ml-1 mt-0.5 shrink-0">
            <X size={12} />
          </button>
        </div>
      ))}
    </div>
  )
}
