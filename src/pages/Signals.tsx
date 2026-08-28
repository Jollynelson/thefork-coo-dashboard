import { useState } from 'react'
import { Plus } from 'lucide-react'
import { cn } from '../lib/cn'
import { signals as initialSignals } from '../data/mockData'
import { useToast, ToastContainer } from '../components/Toast'
import QuickAddModal from '../components/QuickAddModal'

type SigStatus = 'new' | 'monitoring' | 'investigating' | 'action-required' | 'resolved'

const statusConfig: Record<SigStatus, { label: string; cls: string }> = {
  'new':             { label: 'New',             cls: 'badge-new' },
  'monitoring':      { label: 'Monitoring',      cls: 'badge-watch' },
  'investigating':   { label: 'Investigating',   cls: 'badge-risk' },
  'action-required': { label: 'Action Required', cls: 'badge-crit' },
  'resolved':        { label: 'Resolved',        cls: 'badge-done' },
}

const flagMap: Record<string,string> = {
  Italy: '🇮🇹', Sweden: '🇸🇪', France: '🇫🇷',
  Portugal: '🇵🇹', Spain: '🇪🇸', Netherlands: '🇳🇱', Global: '🌍',
  'All EU': '🇪🇺', UK: '🇬🇧', DACH: '🇩🇪', Industry: '📰',
}

const statusFlow: SigStatus[] = ['new','monitoring','investigating','action-required','resolved']

export default function Signals() {
  const [filter,    setFilter]    = useState('all')
  const [catFilter, setCatFilter] = useState('all')
  const [statuses,  setStatuses]  = useState<Record<string, SigStatus>>(
    () => Object.fromEntries(initialSignals.map(s => [s.id, s.status as SigStatus]))
  )
  const [addOpen, setAddOpen] = useState(false)
  const { toasts, toast, remove } = useToast()

  const advance = (id: string) => {
    const current = statuses[id]
    const idx = statusFlow.indexOf(current)
    if (idx < statusFlow.length - 1) {
      const next = statusFlow[idx + 1]
      setStatuses(p => ({ ...p, [id]: next }))
      toast(`Signal updated → ${statusConfig[next].label}`, 'info')
    }
  }

  const categories = ['all', ...Array.from(new Set(initialSignals.map(s => s.category)))]

  const filtered = initialSignals.filter(s => {
    const statusMatch = filter === 'all' || statuses[s.id] === filter
    const catMatch    = catFilter === 'all' || s.category === catFilter
    return statusMatch && catMatch
  })

  const counts = {
    new:           Object.values(statuses).filter(s => s === 'new').length,
    investigating: Object.values(statuses).filter(s => s === 'investigating').length,
    positive:      initialSignals.filter(s => s.impact === 'positive').length,
    resolved:      Object.values(statuses).filter(s => s === 'resolved').length,
  }

  return (
    <div className="space-y-5">
      <ToastContainer toasts={toasts} remove={remove} />
      <QuickAddModal open={addOpen} itemType="Observation" onClose={() => { setAddOpen(false); toast('Signal added.') }} />

      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <h1 className="page-title">Signals Center</h1>
          <p className="page-subtitle">Early-warning feed from operations, markets, partners, and external sources.</p>
        </div>
        <button onClick={() => setAddOpen(true)} className="btn-primary shrink-0">
          <Plus size={13} /> Add Signal
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'New',           value: counts.new,           cls: 'text-blue-600' },
          { label: 'Investigating', value: counts.investigating, cls: 'text-red-600' },
          { label: 'Positive',      value: counts.positive,      cls: 'text-emerald-600' },
          { label: 'Resolved',      value: counts.resolved,      cls: 'text-slate-600' },
        ].map(m => (
          <div key={m.label} className="card p-4">
            <p className={cn('text-2xl font-bold', m.cls)}>{m.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{m.label}</p>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <div className="flex flex-wrap gap-1.5">
          {(['all','new','monitoring','investigating','action-required'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} className={cn('tab', filter === f && 'active')}>
              {f === 'all' ? 'All' : statusConfig[f]?.label ?? f}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {categories.map(c => (
            <button key={c} onClick={() => setCatFilter(c)} className={cn('tab text-[11px]', catFilter === c && 'active')}>
              {c === 'all' ? 'All Categories' : c}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map(sig => {
          const status  = statuses[sig.id]
          const scfg    = statusConfig[status]
          const flag    = flagMap[sig.market] ?? '🌍'
          const canAdv  = statusFlow.indexOf(status) < statusFlow.length - 1

          return (
            <div key={sig.id} className={cn('card p-4 sm:p-5 hover:shadow-sm transition-shadow',
              status === 'resolved' && 'opacity-50')}>
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xl">{flag}</div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                      <span className={cn('badge', scfg.cls)}>{scfg.label}</span>
                      <span className="badge badge-parked">{sig.category}</span>
                      <span className="badge badge-parked">{sig.market}</span>
                      <span className={cn('badge',
                        sig.impact === 'positive' ? 'badge-done' :
                        sig.impact === 'critical' ? 'badge-crit' : 'badge-watch')}>
                        {sig.impact === 'positive' ? '↑ Positive' : sig.impact + ' impact'}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-slate-900 leading-snug">{sig.signal}</p>
                    <p className="text-[11px] text-slate-400 mt-1">{sig.source} · {sig.date.slice(5).replace('-','/')}</p>
                  </div>
                </div>
                <span className={cn('badge shrink-0 self-start',
                  sig.confidence === 'high' ? 'badge-done' :
                  sig.confidence === 'medium' ? 'badge-watch' : 'badge-parked')}>
                  {sig.confidence} conf.
                </span>
              </div>

              {sig.suggestedResponse && (
                <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-0.5">Suggested Response</p>
                  <p className="text-xs text-slate-700 leading-relaxed">{sig.suggestedResponse}</p>
                </div>
              )}

              {canAdv && status !== 'resolved' && (
                <div className="mt-3 flex items-center gap-2">
                  <button onClick={() => advance(sig.id)} className="btn-secondary text-[11px]">
                    Move to: {statusConfig[statusFlow[statusFlow.indexOf(status) + 1]].label} →
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
