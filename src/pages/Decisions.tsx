import { useState } from 'react'
import {
  CheckCircle2, XCircle, Info, ArrowRight, Clock,
  ChevronDown, ChevronUp, Plus, AlertCircle,
} from 'lucide-react'
import { cn } from '../lib/cn'
import { decisions as initialDecisions, actions, projects, decisionCostOfDelay, PERSON_ID } from '../data/mockData'
import { useToast, ToastContainer } from '../components/Toast'
import QuickAddModal from '../components/QuickAddModal'
import RecordLink from '../components/RecordLink'
import { useAutoExpand } from '../hooks/useAutoExpand'

type DecStatus = 'open' | 'pending-info' | 'approved' | 'delegated' | 'parked'

const statusConfig: Record<DecStatus, { label: string; cls: string }> = {
  'open':         { label: 'Open',         cls: 'badge-open' },
  'pending-info': { label: 'Pending Info', cls: 'badge-watch' },
  'approved':     { label: 'Approved',     cls: 'badge-done' },
  'delegated':    { label: 'Delegated',    cls: 'badge-new' },
  'parked':       { label: 'Parked',       cls: 'badge-parked' },
}
const priorityConfig: Record<string, { label: string; cls: string }> = {
  critical: { label: 'Critical', cls: 'badge-crit' },
  high:     { label: 'High',     cls: 'badge-risk' },
  medium:   { label: 'Medium',   cls: 'badge-watch' },
  low:      { label: 'Low',      cls: 'badge-parked' },
}

function personId(name: string): string | undefined {
  return PERSON_ID[name]
}

export default function Decisions() {
  const { expanded, setExpanded } = useAutoExpand()
  const [filter,   setFilter]   = useState('all')
  const [statuses, setStatuses] = useState<Record<string, DecStatus>>(
    () => Object.fromEntries(initialDecisions.map(d => [d.id, d.status as DecStatus]))
  )
  const [addOpen, setAddOpen] = useState(false)
  const { toasts, toast, remove } = useToast()

  const updateStatus = (id: string, next: DecStatus, msg: string) => {
    setStatuses(p => ({ ...p, [id]: next }))
    toast(msg)
    if (expanded === id) setExpanded(null)
  }

  const filtered = initialDecisions.filter(d =>
    filter === 'all' ? true : statuses[d.id] === filter
  )

  const counts = {
    open:         Object.values(statuses).filter(s => s === 'open').length,
    pendingInfo:  Object.values(statuses).filter(s => s === 'pending-info').length,
    approved:     Object.values(statuses).filter(s => s === 'approved').length,
    avg:          Math.round(initialDecisions.reduce((a, d) => a + d.daysOpen, 0) / initialDecisions.length),
  }

  return (
    <div className="space-y-5">
      <ToastContainer toasts={toasts} remove={remove} />
      <QuickAddModal open={addOpen} itemType="Decision" onClose={() => { setAddOpen(false); toast('Decision added.') }} />

      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <h1 className="page-title">Decision Center</h1>
          <p className="page-subtitle">Structured decision tracking with options, recommendations, and cost-of-delay.</p>
        </div>
        <button onClick={() => setAddOpen(true)} className="btn-primary shrink-0">
          <Plus size={13} /> Add Decision
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Open Decisions', value: counts.open,        cls: 'text-orange-600' },
          { label: 'Pending Info',   value: counts.pendingInfo, cls: 'text-amber-600' },
          { label: 'Approved',       value: counts.approved,    cls: 'text-emerald-600' },
          { label: 'Avg. Age (days)',value: counts.avg,         cls: 'text-slate-700' },
        ].map(m => (
          <div key={m.label} className="card p-4">
            <p className={cn('text-2xl font-bold', m.cls)}>{m.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{m.label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {[
          { key: 'all',          label: `All (${initialDecisions.length})` },
          { key: 'open',         label: `Open (${counts.open})` },
          { key: 'pending-info', label: 'Pending Info' },
          { key: 'approved',     label: `Approved (${counts.approved})` },
          { key: 'parked',       label: 'Parked' },
        ].map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)} className={cn('tab', filter === f.key && 'active')}>
            {f.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="card p-8 text-center">
            <CheckCircle2 size={28} className="text-emerald-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">All decisions handled</p>
            <button onClick={() => setAddOpen(true)} className="btn-primary mt-4 mx-auto"><Plus size={13} /> Add Decision</button>
          </div>
        )}

        {filtered.map(dec => {
          const status     = statuses[dec.id]
          const scfg       = statusConfig[status]
          const pcfg       = priorityConfig[dec.priority]
          const isOpen     = expanded === dec.id
          const isResolved = status === 'approved' || status === 'parked' || status === 'delegated'
          const linkedActions  = actions.filter(a => a.relatedDecision === dec.id)
          const linkedProject  = (dec as any).relatedProject ? projects.find(p => p.id === (dec as any).relatedProject) : null
          const cod            = (dec as any).costOfDelay ?? decisionCostOfDelay[dec.id]

          return (
            <div key={dec.id} id={`record-${dec.id}`}
              className={cn('card overflow-hidden transition-all',
                isResolved && 'opacity-60',
                status === 'open' && 'border-l-4 border-l-orange-400',
                status === 'pending-info' && 'border-l-4 border-l-amber-400',
                status === 'approved' && 'border-l-4 border-l-emerald-400',
              )}>
              <button
                onClick={() => setExpanded(isOpen ? null : dec.id)}
                className="w-full flex items-start gap-3 px-4 sm:px-5 py-4 text-left hover:bg-slate-50/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    {pcfg && <span className={cn('badge', pcfg.cls)}>{pcfg.label}</span>}
                    <span className={cn('badge', scfg.cls)}>{scfg.label}</span>
                    <span className="badge badge-parked text-[10px]">{dec.category}</span>
                    <span className="flex items-center gap-1 text-[10.5px] text-slate-400">
                      <Clock size={10} />Due {dec.deadline.slice(5).replace('-','/')}
                    </span>
                    {linkedActions.length > 0 && <span className="badge badge-new">{linkedActions.length} action{linkedActions.length > 1 ? 's' : ''}</span>}
                    {linkedProject && <span className="badge badge-parked">Project linked</span>}
                  </div>
                  <p className="text-sm font-semibold text-slate-900 leading-snug">{dec.title}</p>
                  {!isOpen && <p className="text-xs text-slate-500 mt-1 leading-snug line-clamp-1">{dec.whyNow}</p>}
                </div>
                <div className="flex items-center gap-2 shrink-0 mt-0.5">
                  <span className="text-xs text-slate-400 hidden sm:block">{dec.daysOpen}d open</span>
                  {isOpen ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                </div>
              </button>

              {isOpen && (
                <div className="px-4 sm:px-5 pb-5 space-y-4 border-t border-slate-100 pt-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1">Why Now</p>
                      <p className="text-sm text-slate-600 leading-relaxed">{dec.whyNow}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1">Context</p>
                      <p className="text-sm text-slate-600 leading-relaxed">{dec.context}</p>
                    </div>
                  </div>

                  {/* Cost of Delay — prominent amber box */}
                  {cod && (
                    <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-2.5">
                      <AlertCircle size={15} className="text-amber-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wide mb-0.5">⏱ Cost of Delay</p>
                        <p className="text-sm text-amber-900 font-medium leading-snug">{cod}</p>
                      </div>
                    </div>
                  )}

                  <div>
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-2">Options</p>
                    <div className="space-y-1.5">
                      {dec.options.map((opt, i) => (
                        <div key={i} className="flex gap-2.5 text-sm text-slate-600">
                          <span className="text-slate-300 shrink-0 font-medium">{i + 1}.</span>
                          <span className="leading-snug">{opt}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-3.5 bg-indigo-50 rounded-xl border border-indigo-100">
                    <p className="text-[10px] font-semibold text-indigo-600 uppercase tracking-wide mb-1">Recommendation</p>
                    <p className="text-sm text-indigo-800 leading-relaxed font-medium">{dec.recommendation}</p>
                  </div>

                  <div>
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1">Impact</p>
                    <p className="text-sm text-slate-600 leading-relaxed">{dec.impact}</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <span>Owner: <RecordLink type="person" id={personId(dec.owner)} label={dec.owner} /></span>
                    <span>Decision maker: <RecordLink type="person" id={personId(dec.decisionMaker)} label={dec.decisionMaker} /></span>
                  </div>

                  {/* Linked project */}
                  {linkedProject && (
                    <div>
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-2">Linked Project</p>
                      <RecordLink type="project" id={linkedProject.id} label={linkedProject.name} />
                    </div>
                  )}

                  {/* Linked actions */}
                  {linkedActions.length > 0 && (
                    <div>
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-2">Actions from this Decision ({linkedActions.length})</p>
                      <div className="space-y-1.5">
                        {linkedActions.map(act => (
                          <div key={act.id} className="flex items-start gap-2 p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-slate-700 leading-snug">{act.title}</p>
                              <div className="flex flex-wrap items-center gap-2 mt-0.5">
                                <RecordLink type="person" id={(act as any).ownerPersonId ?? personId(act.owner)} label={act.owner} />
                                <span className="text-[10px] text-slate-400">{act.dueDate.slice(5).replace('-','/')}{act.status === 'overdue' && ' · OVERDUE'}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action buttons */}
                  {!isResolved ? (
                    <div className="flex flex-wrap gap-2 pt-1">
                      <button onClick={() => updateStatus(dec.id, 'approved', `Decision approved: "${dec.title.slice(0,40)}…"`)} className="btn-success">
                        <CheckCircle2 size={13} /> Approve
                      </button>
                      <button onClick={() => updateStatus(dec.id, 'pending-info', 'Information requested — owner notified.')} className="btn-secondary">
                        <Info size={13} /> Request Info
                      </button>
                      <button onClick={() => updateStatus(dec.id, 'delegated', `Decision delegated to ${dec.owner}.`)} className="btn-secondary">
                        <ArrowRight size={13} /> Delegate
                      </button>
                      <button onClick={() => updateStatus(dec.id, 'parked', 'Decision parked for later.')} className="btn-secondary text-slate-500">
                        <XCircle size={13} /> Park
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className={cn('badge', scfg.cls)}>
                        {status === 'approved' ? '✓ Approved' : status === 'delegated' ? '→ Delegated' : '· Parked'}
                      </span>
                      <button onClick={() => updateStatus(dec.id, 'open', 'Decision reopened.')}
                        className="text-xs text-slate-400 hover:text-slate-600 underline">Reopen</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
