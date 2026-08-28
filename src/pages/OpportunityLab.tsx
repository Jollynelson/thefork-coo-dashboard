import { Lightbulb, ArrowRight } from 'lucide-react'
import { cn } from '../lib/cn'
import { opportunities } from '../data/mockData'

const stageConfig: Record<string, { label: string; cls: string; step: number }> = {
  signal:     { label: 'Signal',     cls: 'badge-parked', step: 1 },
  hypothesis: { label: 'Hypothesis', cls: 'badge-new',    step: 2 },
  validation: { label: 'Validation', cls: 'badge-watch',  step: 3 },
  experiment: { label: 'Experiment', cls: 'badge-track',  step: 4 },
  decision:   { label: 'Decision',   cls: 'badge-open',   step: 5 },
}

const pipeline = ['signal', 'hypothesis', 'validation', 'experiment', 'decision']

export default function OpportunityLab() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Opportunity Lab</h1>
        <p className="page-subtitle">Structured pipeline from signal to validated experiment. Independent candidate hypotheses.</p>
      </div>

      {/* Pipeline view */}
      <div className="card p-5">
        <p className="section-header">Opportunity Pipeline</p>
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {pipeline.map((stage, i) => {
            const count = opportunities.filter(o => o.stage === stage).length
            const scfg = stageConfig[stage]
            return (
              <div key={stage} className="flex items-center gap-2 shrink-0">
                <div className={cn('rounded-xl px-4 py-3 min-w-[100px] text-center', count > 0 ? 'bg-slate-50 border border-slate-200' : 'bg-slate-50/50 border border-dashed border-slate-200')}>
                  <p className={cn('text-xl font-bold', count > 0 ? 'text-slate-800' : 'text-slate-300')}>{count}</p>
                  <span className={cn('badge mt-1', scfg.cls)}>{scfg.label}</span>
                </div>
                {i < pipeline.length - 1 && <ArrowRight size={14} className="text-slate-300 shrink-0" />}
              </div>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {opportunities.map(opp => {
          const scfg = stageConfig[opp.stage] ?? stageConfig['signal']
          return (
            <div key={opp.id} className="card p-5">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 border border-amber-200">
                    <Lightbulb size={14} className="text-amber-500" />
                  </div>
                  <span className={cn('badge', scfg.cls)}>{scfg.label}</span>
                </div>
                <div className="flex items-center gap-2 text-[10.5px] text-slate-400 shrink-0">
                  <span>Effort: <strong>{opp.effort}</strong></span>
                  <span>·</span>
                  <span className={cn('badge', opp.confidence === 'high' ? 'badge-done' : 'badge-watch')}>
                    {opp.confidence} conf.
                  </span>
                </div>
              </div>

              <h3 className="text-sm font-bold text-slate-900 mb-1.5 leading-snug">{opp.title}</h3>

              <div className="space-y-2 text-xs text-slate-600">
                <div>
                  <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-wide mb-0.5">Problem</p>
                  <p className="leading-relaxed">{opp.problem}</p>
                </div>
                <div>
                  <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-wide mb-0.5">Evidence</p>
                  <p className="leading-relaxed">{opp.evidence}</p>
                </div>
                <div className="p-2.5 bg-indigo-50 rounded-lg border border-indigo-100">
                  <p className="text-[9px] font-semibold text-indigo-500 uppercase tracking-wide mb-0.5">Potential Impact</p>
                  <p className="text-indigo-800 font-medium">{opp.potentialImpact}</p>
                </div>
                <div>
                  <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-wide mb-0.5">Proposed Experiment</p>
                  <p className="leading-relaxed">{opp.experiment}</p>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <span className="text-[10.5px] text-slate-400">Owner: <strong className="text-slate-600">{opp.owner}</strong></span>
                  <span className="badge badge-parked">
                    Align: <strong className="ml-1">{opp.strategicAlignment}</strong>
                  </span>
                </div>
              </div>

              {opp.recommendation && (
                <div className="mt-3 p-2.5 bg-emerald-50 rounded-lg border border-emerald-100">
                  <p className="text-[9px] font-semibold text-emerald-600 uppercase tracking-wide mb-0.5">Recommendation</p>
                  <p className="text-xs text-emerald-800">{opp.recommendation}</p>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
