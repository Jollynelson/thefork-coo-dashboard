import { useState } from 'react'
import { AlertTriangle, User, Clock, ChevronDown, ChevronUp, CheckCircle2, Eye, Plus, ExternalLink } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { cn } from '../lib/cn'
import { risks as initialRisks, projects, decisions } from '../data/mockData'
import { useToast, ToastContainer } from '../components/Toast'
import QuickAddModal from '../components/QuickAddModal'

type RiskStatus = 'open' | 'in-progress' | 'mitigated' | 'resolved'

const exposureConfig: Record<string, { label: string; cls: string; bg: string; border: string }> = {
  'critical': { label: 'Critical', cls: 'badge-crit', bg: 'bg-purple-50', border: 'border-purple-200' },
  'at-risk':  { label: 'High',     cls: 'badge-risk', bg: 'bg-red-50',    border: 'border-red-200' },
  'watch':    { label: 'Medium',   cls: 'badge-watch', bg: 'bg-amber-50', border: 'border-amber-200' },
}
const riskStatusConfig: Record<RiskStatus, { label: string; cls: string }> = {
  'open':        { label: 'Open',        cls: 'badge-open' },
  'in-progress': { label: 'In Progress', cls: 'badge-watch' },
  'mitigated':   { label: 'Mitigated',   cls: 'badge-track' },
  'resolved':    { label: 'Resolved',    cls: 'badge-done' },
}

export default function Risks() {
  const navigate  = useNavigate()
  const [expanded, setExpanded] = useState<string | null>(null)
  const [statuses, setStatuses] = useState<Record<string, RiskStatus>>(
    () => Object.fromEntries(initialRisks.map(r => [r.id, 'open' as RiskStatus]))
  )
  const [addOpen, setAddOpen] = useState(false)
  const { toasts, toast, remove } = useToast()

  const updateStatus = (id: string, next: RiskStatus, msg: string) => {
    setStatuses(p => ({ ...p, [id]: next }))
    toast(msg)
  }

  const summary = {
    critical:  initialRisks.filter(r => r.exposure === 'critical').length,
    high:      initialRisks.filter(r => r.exposure === 'at-risk').length,
    medium:    initialRisks.filter(r => r.exposure === 'watch').length,
    resolved:  Object.values(statuses).filter(s => s === 'resolved').length,
  }

  return (
    <div className="space-y-5">
      <ToastContainer toasts={toasts} remove={remove} />
      <QuickAddModal open={addOpen} itemType="Risk" onClose={() => { setAddOpen(false); toast('Risk added.') }} />

      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <h1 className="page-title">Risk & Issue Center</h1>
          <p className="page-subtitle">Consolidated risk register with probability, impact, and mitigation tracking.</p>
        </div>
        <button onClick={() => setAddOpen(true)} className="btn-primary shrink-0">
          <Plus size={13} /> Add Risk
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Critical',   value: summary.critical, cls: 'text-purple-600' },
          { label: 'High',       value: summary.high,     cls: 'text-red-600' },
          { label: 'Medium',     value: summary.medium,   cls: 'text-amber-600' },
          { label: 'Resolved',   value: summary.resolved, cls: 'text-emerald-600' },
        ].map(m => (
          <div key={m.label} className="card p-4">
            <p className={cn('text-2xl font-bold', m.cls)}>{m.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{m.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2 space-y-3">
          {initialRisks.map(risk => {
            const ecfg    = exposureConfig[risk.exposure] ?? exposureConfig['watch']
            const rStatus = statuses[risk.id]
            const rscfg   = riskStatusConfig[rStatus]
            const isOpen  = expanded === risk.id
            const isResolved = rStatus === 'resolved' || rStatus === 'mitigated'
            const linkedProject  = risk.relatedProject  ? projects.find(p => p.id === risk.relatedProject) : null
            const linkedDecision = risk.relatedDecision ? decisions.find(d => d.id === risk.relatedDecision) : null

            return (
              <div key={risk.id}
                className={cn('card overflow-hidden border', ecfg.border, isResolved && 'opacity-55')}>
                <button
                  onClick={() => setExpanded(isOpen ? null : risk.id)}
                  className={cn('w-full flex items-start gap-3 px-4 sm:px-5 py-4 text-left hover:bg-slate-50/50 transition-colors', ecfg.bg + '/30')}
                >
                  <AlertTriangle size={15} className={cn('mt-0.5 shrink-0',
                    risk.exposure === 'critical' ? 'text-purple-500' :
                    risk.exposure === 'at-risk'  ? 'text-red-400' : 'text-amber-400')} />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className={cn('badge', ecfg.cls)}>{ecfg.label} exposure</span>
                      <span className={cn('badge', rscfg.cls)}>{rscfg.label}</span>
                      <span className="badge badge-parked hidden sm:inline-flex">{risk.category}</span>
                      {(linkedProject || linkedDecision) && (
                        <span className="badge badge-new">Linked</span>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-slate-900 leading-snug">{risk.title}</p>
                    {!isOpen && (
                      <p className="text-xs text-slate-500 mt-1 leading-snug line-clamp-1">{risk.description}</p>
                    )}
                  </div>
                  {isOpen ? <ChevronUp size={15} className="text-slate-400 shrink-0 mt-0.5" /> : <ChevronDown size={15} className="text-slate-400 shrink-0 mt-0.5" />}
                </button>

                {isOpen && (
                  <div className="px-4 sm:px-5 pb-5 pt-4 border-t border-slate-100 space-y-3">
                    <p className="text-sm text-slate-600 leading-relaxed">{risk.description}</p>

                    <div className="p-3 bg-white rounded-lg border border-slate-200">
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1">Mitigation Plan</p>
                      <p className="text-sm text-slate-700 leading-relaxed">{risk.mitigation}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                      <span className="flex items-center gap-1"><User size={10} />{risk.owner}</span>
                      <span className="flex items-center gap-1"><Clock size={10} />Due {risk.dueDate.slice(5).replace('-','/')}</span>
                      <span>Probability: <strong className="text-slate-600">{risk.probability}</strong></span>
                      <span>Impact: <strong className="text-slate-600">{risk.impact}</strong></span>
                    </div>

                    {/* Linked items */}
                    {(linkedProject || linkedDecision) && (
                      <div className="space-y-2">
                        {linkedProject && (
                          <button onClick={() => navigate('/projects')}
                            className="w-full flex items-center gap-2 p-2.5 bg-blue-50 rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors text-left">
                            <span className="text-[10px] font-semibold text-blue-600 uppercase tracking-wide w-16 shrink-0">Project</span>
                            <span className="text-xs text-blue-800 flex-1 truncate">{linkedProject.name}</span>
                            <ExternalLink size={10} className="text-blue-300 shrink-0" />
                          </button>
                        )}
                        {linkedDecision && (
                          <button onClick={() => navigate('/decisions')}
                            className="w-full flex items-center gap-2 p-2.5 bg-orange-50 rounded-lg border border-orange-100 hover:bg-orange-100 transition-colors text-left">
                            <span className="text-[10px] font-semibold text-orange-600 uppercase tracking-wide w-16 shrink-0">Decision</span>
                            <span className="text-xs text-orange-800 flex-1 truncate">{linkedDecision.title}</span>
                            <ExternalLink size={10} className="text-orange-300 shrink-0" />
                          </button>
                        )}
                      </div>
                    )}

                    {!isResolved && (
                      <div className="flex flex-wrap gap-2">
                        <button onClick={() => updateStatus(risk.id, 'in-progress', 'Risk marked as in progress.')} className="btn-secondary">
                          <Eye size={13} /> Mark In Progress
                        </button>
                        <button onClick={() => updateStatus(risk.id, 'mitigated', 'Risk mitigation applied.')} className="btn-success">
                          <CheckCircle2 size={13} /> Mark Mitigated
                        </button>
                        <button onClick={() => updateStatus(risk.id, 'resolved', 'Risk resolved and closed.')} className="btn-secondary">
                          <CheckCircle2 size={13} /> Resolve
                        </button>
                      </div>
                    )}
                    {isResolved && (
                      <div className="flex items-center gap-2">
                        <span className={cn('badge', rscfg.cls)}>{rscfg.label}</span>
                        <button onClick={() => updateStatus(risk.id, 'open', 'Risk reopened.')}
                          className="text-xs text-slate-400 hover:text-slate-600 underline">Reopen</button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Heat map */}
        <div className="space-y-4">
          <div className="card p-5">
            <p className="section-header">Risk Heat Map</p>
            <div className="space-y-1.5">
              <div className="grid grid-cols-5 gap-1 text-[9px] text-slate-400 mb-1 text-center">
                <div className="text-right text-[8px] leading-tight">Prob ↑</div>
                {['Low','Med','High','Crit'].map(i => <div key={i}>{i}</div>)}
              </div>
              {(['high','medium','low'] as const).map(prob => (
                <div key={prob} className="grid grid-cols-5 gap-1 items-center">
                  <div className="text-[9px] text-slate-400 capitalize text-right pr-1">{prob}</div>
                  {['low','medium','high','critical'].map(imp => {
                    const colorMap: Record<string,Record<string,string>> = {
                      high:   { critical:'bg-purple-500', high:'bg-red-500', medium:'bg-amber-400', low:'bg-amber-200' },
                      medium: { critical:'bg-red-400',    high:'bg-amber-500',medium:'bg-amber-300',low:'bg-emerald-300' },
                      low:    { critical:'bg-amber-400',  high:'bg-amber-300',medium:'bg-emerald-300',low:'bg-emerald-200' },
                    }
                    const color = colorMap[prob]?.[imp] ?? 'bg-slate-100'
                    const count = initialRisks.filter(r => r.probability === prob && r.impact === imp).length
                    return (
                      <div key={imp} className={cn('h-10 rounded-lg flex items-center justify-center text-white text-xs font-bold', color)}>
                        {count > 0 ? count : ''}
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
          <div className="card p-5">
            <p className="section-header">By Category</p>
            {['Operations','Technology','Financial','Regulatory','People','Integration','Payments'].map(cat => {
              const count = initialRisks.filter(r => r.category === cat).length
              if (!count) return null
              return (
                <div key={cat} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                  <span className="text-xs text-slate-700">{cat}</span>
                  <span className="text-xs font-bold text-slate-500">{count}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
