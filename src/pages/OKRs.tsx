import { cn } from '../lib/cn'
import { okrs } from '../data/mockData'

const statusCls: Record<string, string> = {
  'on-track': 'badge-track', 'watch': 'badge-watch', 'at-risk': 'badge-risk',
  'critical': 'badge-crit',  'behind': 'badge-risk', 'done': 'badge-done',
}
const statusLabel: Record<string, string> = {
  'on-track': 'On Track', 'watch': 'Watch', 'at-risk': 'At Risk',
  'critical': 'Critical', 'behind': 'Behind', 'done': 'Done',
}
const barColor: Record<string, string> = {
  'on-track': 'bg-emerald-500', 'watch': 'bg-amber-400', 'at-risk': 'bg-red-400',
  'critical': 'bg-purple-500', 'behind': 'bg-red-500', 'done': 'bg-emerald-600',
}

export default function OKRs() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">OKRs</h1>
        <p className="page-subtitle">Company and operations-level objectives with key result tracking.</p>
      </div>

      <div className="space-y-5">
        {okrs.map(obj => (
          <div key={obj.id} className="card p-4 sm:p-6">
            <div className="mb-5">
              <span className="badge badge-parked mb-2">{obj.level} Objective</span>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">{obj.objective}</h3>
            </div>
            <div className="space-y-3.5">
              {obj.keyResults.map(kr => {
                let progress = 0
                if (kr.unit === 'NPS score') progress = Math.min((kr.current / kr.target) * 100, 100)
                else if (kr.unit === '% change' || kr.unit === '€ variance') {
                  progress = kr.current <= kr.target ? 100 : Math.max(0, 100 - ((kr.current - kr.target) / Math.max(kr.target, 1) * 100))
                } else {
                  progress = Math.min((kr.current / kr.target) * 100, 100)
                }
                progress = Math.round(Math.max(0, Math.min(100, progress)))

                const fmtVal = (v: number) => {
                  if (kr.unit === 'MAD' || kr.unit === 'partners') return v.toLocaleString()
                  if (kr.unit === '€ variance') return `€${(v/1e6).toFixed(1)}M`
                  return String(v)
                }

                return (
                  <div key={kr.id} className="bg-slate-50 rounded-xl p-3.5 sm:p-4">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-3">
                      <p className="text-sm font-medium text-slate-800 leading-snug flex-1">{kr.title}</p>
                      <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                        <span className={cn('badge', kr.confidence === 'high' ? 'badge-done' : kr.confidence === 'medium' ? 'badge-watch' : 'badge-risk')}>
                          {kr.confidence} conf.
                        </span>
                        <span className={cn('badge', statusCls[kr.status] ?? 'badge-parked')}>
                          {statusLabel[kr.status] ?? kr.status}
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
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-500">
                      <span>Current: <strong className="text-slate-700">{fmtVal(kr.current)} {kr.unit}</strong></span>
                      <span>Target: <strong className="text-slate-700">{fmtVal(kr.target)} {kr.unit}</strong></span>
                      <span>Owner: <strong className="text-slate-700">{kr.owner}</strong></span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
