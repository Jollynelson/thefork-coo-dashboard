import { useState } from 'react'
import { AlertCircle, TrendingUp, TrendingDown, Minus, Plus, Flag } from 'lucide-react'
import { cn } from '../lib/cn'
import { strategicPriorities, okrs, priorityEnrichment, krEnrichment, PERSON_ID } from '../data/mockData'
import { useToast, ToastContainer } from '../components/Toast'
import QuickAddModal from '../components/QuickAddModal'
import RecordLink from '../components/RecordLink'

const statusConfig: Record<string, { label: string; cls: string; bg: string; bar: string }> = {
  'on-track': { label: 'On Track', cls: 'badge-track', bg: 'border-emerald-200', bar: 'bg-emerald-500' },
  'watch':    { label: 'Watch',    cls: 'badge-watch', bg: 'border-amber-200',   bar: 'bg-amber-400' },
  'at-risk':  { label: 'At Risk',  cls: 'badge-risk',  bg: 'border-red-200',     bar: 'bg-red-400' },
}
const confCls: Record<string, string> = { high: 'badge-done', medium: 'badge-watch', low: 'badge-risk' }
const krStatusCls: Record<string, string> = {
  'on-track': 'badge-track', 'watch': 'badge-watch', 'at-risk': 'badge-risk',
  'critical': 'badge-crit', 'behind': 'badge-risk', 'done': 'badge-done',
}
const barColor: Record<string, string> = {
  'on-track': 'bg-emerald-500', 'watch': 'bg-amber-400', 'at-risk': 'bg-red-400',
  'critical': 'bg-purple-500', 'behind': 'bg-red-500', 'done': 'bg-emerald-600',
}

function TrendIcon({ trend }: { trend: string }) {
  if (trend === 'improving') return <TrendingUp size={13} className="text-emerald-500" />
  if (trend === 'declining') return <TrendingDown size={13} className="text-red-500" />
  return <Minus size={13} className="text-slate-400" />
}

export default function PrioritiesOKRs() {
  const [tab,     setTab]     = useState<'priorities' | 'okrs'>('priorities')
  const [addOpen, setAddOpen] = useState(false)
  const { toasts, toast, remove } = useToast()

  const onTrack = strategicPriorities.filter(p => p.status === 'on-track').length
  const atRisk  = strategicPriorities.filter(p => p.status === 'at-risk').length
  const watch   = strategicPriorities.filter(p => p.status === 'watch').length

  return (
    <div className="space-y-5">
      <ToastContainer toasts={toasts} remove={remove} />
      <QuickAddModal open={addOpen} itemType="Action"
        onClose={() => { setAddOpen(false); toast('Action added.') }} />

      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <h1 className="page-title">Priorities & OKRs</h1>
          <p className="page-subtitle">Strategic priorities with confidence ratings and OKR accountability tracking.</p>
        </div>
        <button onClick={() => setAddOpen(true)} className="btn-primary shrink-0">
          <Plus size={13} /> Add Action
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 bg-slate-100 rounded-xl p-1 w-fit">
        <button onClick={() => setTab('priorities')}
          className={cn('px-4 py-2 rounded-lg text-sm font-medium transition-all',
            tab === 'priorities' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700')}>
          Strategic Priorities
        </button>
        <button onClick={() => setTab('okrs')}
          className={cn('px-4 py-2 rounded-lg text-sm font-medium transition-all',
            tab === 'okrs' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700')}>
          OKRs
        </button>
      </div>

      {/* ── PRIORITIES TAB ── */}
      {tab === 'priorities' && (
        <div className="space-y-5">
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'On Track', value: onTrack, cls: 'text-emerald-600' },
              { label: 'Watch',    value: watch,   cls: 'text-amber-600' },
              { label: 'At Risk',  value: atRisk,  cls: 'text-red-600' },
            ].map(m => (
              <div key={m.label} className="card p-4">
                <p className={cn('text-2xl font-bold', m.cls)}>{m.value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{m.label}</p>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            {strategicPriorities.map(sp => {
              const cfg  = statusConfig[sp.status] ?? statusConfig['watch']
              const enr  = priorityEnrichment[sp.id]
              return (
                <div key={sp.id} className={cn('card p-4 sm:p-6 border', cfg.bg)}>
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm sm:text-base font-bold text-slate-900 leading-snug">{sp.title}</p>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">{sp.description}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <span className={cn('badge', cfg.cls)}>{cfg.label}</span>
                      {enr && <span className={cn('badge', confCls[enr.confidence])}>{enr.confidence} conf.</span>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase tracking-wide font-semibold mb-1.5">Progress</p>
                      <div className="flex items-center gap-2">
                        <div className="prog-bar flex-1 h-2.5">
                          <div className={cn('prog-fill', cfg.bar)} style={{ width: `${sp.progress}%` }} />
                        </div>
                        <span className="text-sm font-bold text-slate-700 shrink-0">{sp.progress}%</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase tracking-wide font-semibold mb-1.5">Target vs. Current</p>
                      <p className="text-xs font-medium text-slate-700">{sp.current}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Target: {sp.target}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase tracking-wide font-semibold mb-1.5">Next Milestone</p>
                      <p className="text-xs font-medium text-slate-700">{sp.nextMilestone}</p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <p className="text-[10px] text-slate-400">{sp.milestoneDate}</p>
                        <span className={cn('badge text-[9px]',
                          sp.daysToMilestone <= 7 ? 'badge-risk' : sp.daysToMilestone <= 21 ? 'badge-watch' : 'badge-parked')}>
                          {sp.daysToMilestone}d
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* What changed + owner */}
                  {enr && (
                    <div className={cn('p-2.5 rounded-lg border mb-3 flex items-start gap-2',
                      enr.whatChanged.includes('No change') ? 'bg-slate-50 border-slate-200' :
                      enr.whatChanged.includes('jeopardy') || enr.whatChanged.includes('overdue') ? 'bg-red-50 border-red-200' :
                      'bg-amber-50 border-amber-200')}>
                      <span className="text-[10px] font-semibold uppercase tracking-wide shrink-0 mt-0.5" style={{ color: '#64748B' }}>This week:</span>
                      <p className="text-xs text-slate-700 leading-snug">{enr.whatChanged}</p>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100 text-[11px] text-slate-400">
                    <span>Owner:</span>
                    <RecordLink type="person" id={PERSON_ID[sp.owner]} label={sp.owner} />
                    <span>Sponsor:</span>
                    <RecordLink type="person" id={PERSON_ID[sp.sponsor]} label={sp.sponsor} />
                  </div>

                  {sp.blocker && (
                    <div className="mt-3 flex items-start gap-2 p-3 bg-red-50 rounded-lg border border-red-100">
                      <AlertCircle size={13} className="text-red-400 mt-0.5 shrink-0" />
                      <p className="text-xs text-red-700 font-medium leading-snug">{sp.blocker}</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── OKRs TAB ── */}
      {tab === 'okrs' && (
        <div className="space-y-5">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-700 leading-relaxed">
            <strong>OKR accountability standard:</strong> Any key result below threshold must have a corrective action owner and due date. Red flag = below threshold with no corrective action filed.
          </div>

          {okrs.map(obj => (
            <div key={obj.id} className="card p-4 sm:p-6">
              <div className="mb-5">
                <span className="badge badge-parked mb-2">{obj.level} Objective</span>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">{obj.objective}</h3>
              </div>
              <div className="space-y-3.5">
                {obj.keyResults.map(kr => {
                  const enr = krEnrichment[kr.id]
                  const belowThreshold = kr.status === 'at-risk' || kr.status === 'critical' || kr.status === 'watch'
                  const needsAction = belowThreshold && enr && !enr.correctiveAction
                  let progress = 0
                  if (kr.unit === 'NPS score') progress = Math.min((kr.current / kr.target) * 100, 100)
                  else if (kr.unit === '% change' || kr.unit === '€ variance') {
                    progress = kr.current <= kr.target ? 100 : Math.max(0, 100 - ((kr.current - kr.target) / Math.max(kr.target, 1) * 100))
                  } else progress = Math.min((kr.current / kr.target) * 100, 100)
                  progress = Math.round(Math.max(0, Math.min(100, progress)))

                  const fmtVal = (v: number) => {
                    if (kr.unit === 'MAD' || kr.unit === 'partners') return v.toLocaleString()
                    if (kr.unit === '€ variance') return `€${(v / 1e6).toFixed(1)}M`
                    return String(v)
                  }

                  return (
                    <div key={kr.id} className={cn('rounded-xl p-3.5 sm:p-4 border',
                      needsAction ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-100')}>
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-3">
                        <div className="flex items-start gap-2 flex-1">
                          {needsAction && <Flag size={13} className="text-red-500 shrink-0 mt-0.5" />}
                          <p className="text-sm font-medium text-slate-800 leading-snug">{kr.title}</p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                          {enr && <TrendIcon trend={enr.trend} />}
                          <span className={cn('badge', kr.confidence === 'high' ? 'badge-done' : kr.confidence === 'medium' ? 'badge-watch' : 'badge-risk')}>
                            {kr.confidence} conf.
                          </span>
                          <span className={cn('badge', krStatusCls[kr.status] ?? 'badge-parked')}>
                            {kr.status === 'on-track' ? 'On Track' : kr.status === 'watch' ? 'Watch' :
                             kr.status === 'at-risk' ? 'At Risk' : kr.status === 'critical' ? 'Critical' : kr.status}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="prog-bar flex-1 h-2">
                          <div className={cn('prog-fill', barColor[kr.status] ?? 'bg-slate-400')}
                            style={{ width: `${progress}%` }} />
                        </div>
                        <span className="text-xs font-bold text-slate-600 shrink-0">{progress}%</span>
                      </div>
                      <div className="flex flex-wrap gap-x-3 gap-y-1 items-center text-[11px] text-slate-500 mb-2">
                        <span>Current: <strong className="text-slate-700">{fmtVal(kr.current)} {kr.unit}</strong></span>
                        <span>Target: <strong className="text-slate-700">{fmtVal(kr.target)} {kr.unit}</strong></span>
                        <span>Owner:</span>
                        <RecordLink type="person" id={PERSON_ID[kr.owner]} label={kr.owner} />
                      </div>

                      {/* Corrective action panel */}
                      {belowThreshold && enr && (
                        enr.correctiveAction ? (
                          <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200 mt-2">
                            <p className="text-[9.5px] font-semibold text-amber-600 uppercase tracking-wide mb-0.5">Corrective Action</p>
                            <p className="text-xs text-amber-800">{enr.correctiveAction}</p>
                          </div>
                        ) : (
                          <div className="p-2.5 bg-red-50 rounded-lg border border-red-200 mt-2 flex items-center gap-2">
                            <Flag size={12} className="text-red-500 shrink-0" />
                            <div className="flex-1">
                              <p className="text-xs font-semibold text-red-700">No corrective action filed — accountability gap</p>
                              <button onClick={() => setAddOpen(true)}
                                className="text-[10.5px] text-red-600 underline hover:no-underline">
                                File corrective action →
                              </button>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
