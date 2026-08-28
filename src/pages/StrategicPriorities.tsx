import { AlertCircle, User } from 'lucide-react'
import { cn } from '../lib/cn'
import { strategicPriorities } from '../data/mockData'

const statusConfig: Record<string, { label: string; cls: string; bg: string; bar: string }> = {
  'on-track': { label: 'On Track', cls: 'badge-track', bg: 'border-emerald-200', bar: 'bg-emerald-500' },
  'watch':    { label: 'Watch',    cls: 'badge-watch', bg: 'border-amber-200',   bar: 'bg-amber-400' },
  'at-risk':  { label: 'At Risk',  cls: 'badge-risk',  bg: 'border-red-200',     bar: 'bg-red-400' },
}

export default function StrategicPriorities() {
  const onTrack = strategicPriorities.filter(p => p.status === 'on-track').length
  const atRisk  = strategicPriorities.filter(p => p.status === 'at-risk').length
  const watch   = strategicPriorities.filter(p => p.status === 'watch').length

  return (
    <div className="space-y-5">
      <div>
        <h1 className="page-title">Strategic Priorities</h1>
        <p className="page-subtitle">Operations-level objectives with milestone and blocker tracking.</p>
      </div>

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
          const cfg = statusConfig[sp.status] ?? statusConfig['watch']
          return (
            <div key={sp.id} className={cn('card p-4 sm:p-6 border', cfg.bg)}>
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm sm:text-base font-bold text-slate-900 leading-snug">{sp.title}</p>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{sp.description}</p>
                </div>
                <span className={cn('badge shrink-0 self-start', cfg.cls)}>{cfg.label}</span>
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
                      sp.daysToMilestone <= 7  ? 'badge-risk' :
                      sp.daysToMilestone <= 21 ? 'badge-watch' : 'badge-parked')}>
                      {sp.daysToMilestone}d
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400">
                <span className="flex items-center gap-1"><User size={11} />Owner: {sp.owner}</span>
                <span>Sponsor: {sp.sponsor}</span>
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
  )
}
