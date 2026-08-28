import { useState } from 'react'
import { Download, Loader2, CheckCircle2 } from 'lucide-react'
import { cn } from '../lib/cn'
import { useToast, ToastContainer } from '../components/Toast'

const reports = [
  { id: 'r1', name: 'Daily COO Brief',         desc: 'Concise executive summary of decisions, priorities, and actions for the day.', icon: '☀️', freq: 'Daily',     last: 'Today 07:00', status: 'ready' },
  { id: 'r2', name: 'Weekly Operations Brief',  desc: 'Operations health, market updates, project status, and stakeholder radar.',   icon: '📊', freq: 'Weekly',    last: '2024-08-19',  status: 'ready' },
  { id: 'r3', name: 'Monthly Operations Review',desc: 'Full performance review for senior leadership: KPIs, budget, strategic progress.', icon: '📋', freq: 'Monthly', last: '2024-08-01', status: 'ready' },
  { id: 'r4', name: 'Market Review',            desc: 'Deep-dive on each market health score, NPS, escalations, and local priorities.', icon: '🌍', freq: 'Monthly',  last: '2024-08-01',  status: 'ready' },
  { id: 'r5', name: 'Budget Review',            desc: 'YTD actuals, forecast vs. plan, variance analysis, and headcount tracking.',  icon: '💰', freq: 'Monthly',    last: '2024-08-01',  status: 'ready' },
  { id: 'r6', name: 'Strategic Project Review', desc: 'All active projects: health, progress, risks, dependencies, decisions needed.',icon: '🚀', freq: 'Bi-weekly', last: '2024-08-19', status: 'ready' },
  { id: 'r7', name: 'OKR Review',               desc: 'Key result progress, confidence levels, and interventions required.',         icon: '🎯', freq: 'Quarterly',  last: '2024-07-01',  status: 'outdated' },
  { id: 'r8', name: 'Decision Review',          desc: 'All decisions: open, overdue, approved — average age and function breakdown.',icon: '✅', freq: 'Monthly',    last: '2024-08-01',  status: 'ready' },
]

export default function Reports() {
  const [generating, setGenerating] = useState<string | null>(null)
  const [generated,  setGenerated]  = useState<Set<string>>(new Set())
  const { toasts, toast, remove } = useToast()

  const generate = (id: string, name: string) => {
    setGenerating(id)
    setTimeout(() => {
      setGenerating(null)
      setGenerated(p => new Set([...p, id]))
      toast(`"${name}" generated — ready to export.`)
    }, 1600)
  }

  return (
    <div className="space-y-5">
      <ToastContainer toasts={toasts} remove={remove} />
      <div>
        <h1 className="page-title">Reports</h1>
        <p className="page-subtitle">Generate and export structured executive reports. All data is illustrative.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {reports.map(r => {
          const isGenerating = generating === r.id
          const isDone       = generated.has(r.id)

          return (
            <div key={r.id} className="card p-5 flex flex-col">
              <div className="flex items-start justify-between mb-3">
                <span className="text-2xl">{r.icon}</span>
                <span className={cn('badge', r.status === 'ready' ? 'badge-done' : 'badge-watch')}>
                  {r.status === 'ready' ? 'Ready' : 'Outdated'}
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">{r.name}</h3>
              <p className="text-xs text-slate-500 mb-3 leading-relaxed flex-1">{r.desc}</p>
              <div className="flex items-center gap-3 text-[10.5px] text-slate-400 mb-4">
                <span>{r.freq}</span>
                <span>·</span>
                <span>Last: {r.last}</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => generate(r.id, r.name)}
                  disabled={isGenerating}
                  className={cn('btn-primary flex-1 justify-center', isDone && 'bg-emerald-700')}
                >
                  {isGenerating ? (
                    <><Loader2 size={12} className="animate-spin" /> Generating…</>
                  ) : isDone ? (
                    <><CheckCircle2 size={12} /> Generated</>
                  ) : (
                    'Generate'
                  )}
                </button>
                {isDone && (
                  <button
                    onClick={() => toast(`"${r.name}" exported.`)}
                    className="btn-secondary"
                    title="Export PDF"
                  >
                    <Download size={13} />
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
