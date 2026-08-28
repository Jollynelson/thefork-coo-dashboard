import { useState } from 'react'
import { AlertTriangle, ChevronDown, ChevronUp, Plus } from 'lucide-react'
import { cn } from '../lib/cn'
import { projects, actions, decisions, PERSON_ID } from '../data/mockData'
import { useToast, ToastContainer } from '../components/Toast'
import QuickAddModal from '../components/QuickAddModal'
import RecordLink from '../components/RecordLink'
import { useAutoExpand } from '../hooks/useAutoExpand'

const healthConfig: Record<string, { label: string; cls: string; bar: string; border: string }> = {
  'on-track': { label: 'On Track', cls: 'badge-track', bar: 'bg-emerald-500', border: 'border-t-emerald-400' },
  'watch':    { label: 'Watch',    cls: 'badge-watch', bar: 'bg-amber-400',   border: 'border-t-amber-400' },
  'at-risk':  { label: 'At Risk',  cls: 'badge-risk',  bar: 'bg-red-400',     border: 'border-t-red-400' },
  'behind':   { label: 'Behind',   cls: 'badge-risk',  bar: 'bg-red-500',     border: 'border-t-red-500' },
}

const dimLabel: Record<string, string> = {
  scope: 'Scope', schedule: 'Schedule', budget: 'Budget',
  resources: 'Resources', dependencies: 'Deps', outcomes: 'Outcomes',
}
const dimDot: Record<string, string> = {
  'on-track': 'bg-emerald-400', 'watch': 'bg-amber-400', 'at-risk': 'bg-red-400', 'critical': 'bg-purple-500',
}

const marketIds: Record<string, string> = {
  FR: 'fr', ES: 'es', IT: 'it', UK: 'uk', DACH: 'dach',
}

export default function Projects() {
  const { expanded, setExpanded } = useAutoExpand()
  const [filter,  setFilter]  = useState('all')
  const [addOpen, setAddOpen] = useState(false)
  const { toasts, toast, remove } = useToast()

  const filtered = filter === 'all' ? projects : filter === 'integration'
    ? projects.filter(p => p.id === 'proj-007')
    : projects.filter(p => p.health === filter)

  const counts = {
    total:    projects.length,
    onTrack:  projects.filter(p => p.health === 'on-track').length,
    watch:    projects.filter(p => p.health === 'watch').length,
    atRisk:   projects.filter(p => p.health === 'at-risk' || p.health === 'behind').length,
    needsDec: projects.filter(p => p.decisionNeeded).length,
  }

  const getProjectActions   = (id: string) => actions.filter(a => a.relatedProject === id)
  const getProjectDecisions = (id: string) => decisions.filter(d => (d as any).relatedProject === id)

  return (
    <div className="space-y-5">
      <ToastContainer toasts={toasts} remove={remove} />
      <QuickAddModal open={addOpen} itemType="Project" onClose={() => { setAddOpen(false); toast('Project added.') }} />

      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <h1 className="page-title">Strategic Project Center</h1>
          <p className="page-subtitle">{projects.length} active projects — linked to decisions, actions, OKRs, and market owners.</p>
        </div>
        <button onClick={() => setAddOpen(true)} className="btn-primary shrink-0"><Plus size={13} /> Add Project</button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'On Track',      value: counts.onTrack,  cls: 'text-emerald-600' },
          { label: 'Watch',         value: counts.watch,    cls: 'text-amber-600' },
          { label: 'At Risk',       value: counts.atRisk,   cls: 'text-red-600' },
          { label: 'Need Decision', value: counts.needsDec, cls: 'text-orange-600' },
        ].map(m => (
          <div key={m.label} className="card p-4">
            <p className={cn('text-2xl font-bold', m.cls)}>{m.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{m.label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {[
          { key: 'all',         label: `All (${counts.total})` },
          { key: 'on-track',    label: `On Track (${counts.onTrack})` },
          { key: 'watch',       label: `Watch (${counts.watch})` },
          { key: 'at-risk',     label: `At Risk / Behind (${counts.atRisk})` },
          { key: 'integration', label: '🤝 Integration' },
        ].map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)} className={cn('tab', filter === f.key && 'active')}>
            {f.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map(p => {
          const hcfg   = healthConfig[p.health] ?? healthConfig['on-track']
          const isOpen = expanded === p.id
          const projActions   = getProjectActions(p.id)
          const projDecisions = getProjectDecisions(p.id)
          const isIntegration = p.id === 'proj-007'
          const linkedOKR     = (p as any).linkedOKRId as string | undefined

          return (
            <div key={p.id} id={`record-${p.id}`}
              className={cn('card overflow-hidden border-t-2', hcfg.border,
                isIntegration && 'ring-1 ring-[#00856F]/30')}>
              {isIntegration && (
                <div className="px-4 sm:px-5 pt-3 pb-0">
                  <span className="badge badge-open text-[10px]">🤝 Acquisition & Integration Programme</span>
                </div>
              )}

              <button
                onClick={() => setExpanded(isOpen ? null : p.id)}
                className="w-full flex items-start gap-3 sm:gap-4 px-4 sm:px-5 py-4 text-left hover:bg-slate-50/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className={cn('badge', hcfg.cls)}>{hcfg.label}</span>
                    {p.decisionNeeded && <span className="badge badge-open">Decision needed</span>}
                    {p.risks.length > 0 && <span className="badge badge-watch">{p.risks.length} risk{p.risks.length > 1 ? 's' : ''}</span>}
                    {projActions.length > 0 && <span className="badge badge-parked">{projActions.length} action{projActions.length > 1 ? 's' : ''}</span>}
                    {linkedOKR && <span className="badge badge-new">OKR linked</span>}
                  </div>
                  <p className="text-sm font-bold text-slate-900 leading-snug">{p.name}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-1.5">
                    <span className="text-[10.5px] text-slate-400">Lead:</span>
                    <RecordLink type="person" id={PERSON_ID[p.lead] ?? PERSON_ID[p.lead.replace(/\s*\(.*\)/, '').trim()]} label={p.lead.replace(/\s*\(.*\)/, '').trim()} />
                    <span className="text-[10.5px] text-slate-400">Sponsor:</span>
                    <RecordLink type="person" id={PERSON_ID[p.sponsor]} label={p.sponsor} />
                    <span className="text-[10.5px] text-slate-400">Budget: {p.budget}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-center hidden sm:block">
                    <p className="text-lg font-bold text-slate-800">{p.progress}%</p>
                    <p className="text-[9px] text-slate-400">complete</p>
                  </div>
                  {isOpen ? <ChevronUp size={15} className="text-slate-400" /> : <ChevronDown size={15} className="text-slate-400" />}
                </div>
              </button>

              {/* Progress bar */}
              <div className="px-4 sm:px-5 pb-4">
                <div className="prog-bar h-1.5">
                  <div className={cn('prog-fill', hcfg.bar)} style={{ width: `${p.progress}%` }} />
                </div>
              </div>

              {isOpen && (
                <div className="px-4 sm:px-5 pb-5 border-t border-slate-100 pt-4 space-y-4">
                  {/* Health dimensions */}
                  <div>
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-2">Health Dimensions</p>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                      {Object.entries(p.healthDimensions).map(([dim, status]) => {
                        const s = status as string
                        return (
                          <div key={dim} className={cn('rounded-lg p-2.5 text-center',
                            s === 'on-track' ? 'bg-emerald-50' : s === 'critical' ? 'bg-purple-50' : s === 'at-risk' ? 'bg-red-50' : 'bg-amber-50')}>
                            <p className="text-[9px] text-slate-500 leading-none mb-1.5">{dimLabel[dim]}</p>
                            <div className={cn('w-2 h-2 rounded-full mx-auto', dimDot[s] ?? 'bg-amber-400')} />
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1">Next Milestone</p>
                      <p className="text-sm font-medium text-slate-700">{p.nextMilestone}</p>
                      <p className="text-xs text-slate-400">{p.milestoneDate}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1">Budget</p>
                      <p className="text-sm font-medium text-slate-700">{p.budget}</p>
                      <p className={cn('text-xs', p.budgetVariance.startsWith('+') ? 'text-red-500' : 'text-emerald-600')}>
                        {p.budgetVariance} variance
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1">Markets</p>
                      <div className="flex flex-wrap gap-1">
                        {p.markets.map((m, i) => {
                          const mid = marketIds[m]
                          return mid
                            ? <RecordLink key={i} type="market" id={mid} label={m} />
                            : <span key={i} className="badge badge-parked">{m}</span>
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Linked OKR */}
                  {linkedOKR && (
                    <div>
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Linked OKR</p>
                      <RecordLink type="okr" id={linkedOKR} label={`View linked OKR (${linkedOKR})`} />
                    </div>
                  )}

                  {/* Linked decisions */}
                  {projDecisions.length > 0 && (
                    <div>
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-2">
                        Linked Decisions ({projDecisions.length})
                      </p>
                      <div className="space-y-1.5">
                        {projDecisions.map(dec => (
                          <div key={dec.id} className="flex items-start gap-2 p-2.5 bg-orange-50 rounded-lg border border-orange-100">
                            <div className="flex-1 min-w-0">
                              <RecordLink type="decision" id={dec.id} label={dec.title} truncate={55} />
                              <p className="text-[10px] text-orange-600 mt-0.5">Due {dec.deadline.slice(5).replace('-','/')} · {dec.status}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Linked actions */}
                  {projActions.length > 0 && (
                    <div>
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-2">
                        Linked Actions ({projActions.length})
                      </p>
                      <div className="space-y-1.5">
                        {projActions.map(act => (
                          <div key={act.id} className="flex items-start gap-2 p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-slate-700 leading-snug">{act.title}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <RecordLink type="person" id={(act as any).ownerPersonId ?? PERSON_ID[act.owner]} label={act.owner} />
                                <span className={cn('text-[10px]', act.status === 'overdue' && 'text-red-500 font-medium')}>
                                  {act.dueDate.slice(5).replace('-','/')}{act.status === 'overdue' && ' · OVERDUE'}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Risks */}
                  {p.risks.length > 0 && (
                    <div>
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-2">Risks</p>
                      {p.risks.map((r, i) => (
                        <div key={i} className="flex gap-2 items-start mb-1.5">
                          <AlertTriangle size={11} className="text-amber-400 mt-0.5 shrink-0" />
                          <p className="text-xs text-slate-600 leading-snug">{r}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {p.decisionNeeded && p.decisionNote && (
                    <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                      <p className="text-[10px] font-semibold text-orange-600 uppercase tracking-wide mb-0.5">Decision Required</p>
                      <p className="text-xs text-orange-800">{p.decisionNote}</p>
                    </div>
                  )}

                  {isIntegration && (
                    <div className="p-3 rounded-lg border" style={{ background: 'rgba(0,133,111,0.06)', borderColor: 'rgba(0,133,111,0.2)' }}>
                      <p className="text-[10px] font-semibold uppercase tracking-wide mb-1" style={{ color: '#00856F' }}>
                        Full Integration View
                      </p>
                      <p className="text-xs text-slate-600 mb-2">
                        7 workstreams, Day-1 readiness, communications tracker, and integration decisions.
                      </p>
                      <RecordLink type="integration" id="proj-007" label="Open Acquisition & Integration view" />
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
