import { Telescope, HelpCircle } from 'lucide-react'
import { cn } from '../lib/cn'
import { observations } from '../data/mockData'

const labelConfig: Record<string, { cls: string }> = {
  'Candidate hypothesis': { cls: 'badge-crit' },
  'Worth investigating':  { cls: 'badge-watch' },
  'Potential experiment': { cls: 'badge-track' },
}

export default function StrategicObservations() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Strategic Observations</h1>
        <p className="page-subtitle mt-1">
          Independent hypotheses and ideas for discussion.{' '}
          <strong className="text-amber-600">These are not statements about TheFork's internal performance or confirmed company priorities.</strong>
        </p>
      </div>

      <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
        <div className="flex items-start gap-3">
          <HelpCircle size={16} className="text-amber-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-amber-800">Independent Outside-In Observations</p>
            <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
              The observations in this section represent independent hypotheses based on publicly available market knowledge and general industry trends.
              They are intended to demonstrate a structured approach to strategic thinking, not to imply knowledge of TheFork's internal operations or performance.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {observations.map(obs => {
          const lcfg = labelConfig[obs.label] ?? labelConfig['Worth investigating']
          return (
            <div key={obs.id} className="card p-6">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 border border-indigo-200">
                    <Telescope size={16} className="text-indigo-500" />
                  </div>
                  <div>
                    <span className={cn('badge', lcfg.cls)}>{obs.label}</span>
                    <h3 className="text-base font-bold text-slate-900 mt-1 leading-snug">{obs.title}</h3>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-600">
                <div>
                  <p className="section-header">Observation</p>
                  <p className="leading-relaxed">{obs.observation}</p>
                </div>
                <div>
                  <p className="section-header">Why It Matters</p>
                  <p className="leading-relaxed">{obs.whyItMatters}</p>
                </div>
                <div className="md:col-span-2 p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                  <p className="text-[9px] font-semibold text-indigo-500 uppercase tracking-wide mb-1">Hypothesis</p>
                  <p className="text-indigo-800 leading-relaxed font-medium">{obs.hypothesis}</p>
                </div>
                <div>
                  <p className="section-header">Potential User Value</p>
                  <p className="leading-relaxed">{obs.potentialUserValue}</p>
                </div>
                <div>
                  <p className="section-header">Potential Business Value</p>
                  <p className="leading-relaxed">{obs.potentialBusinessValue}</p>
                </div>
                <div>
                  <p className="section-header">Small Experiment</p>
                  <p className="leading-relaxed">{obs.smallExperiment}</p>
                  <div className="mt-2 p-2 bg-emerald-50 rounded-lg border border-emerald-100">
                    <p className="text-[9px] font-semibold text-emerald-600 uppercase tracking-wide mb-0.5">Success Metric</p>
                    <p className="text-emerald-800">{obs.successMetric}</p>
                  </div>
                </div>
                <div>
                  <p className="section-header">Questions for TheFork</p>
                  <p className="leading-relaxed italic text-slate-500">{obs.questionsForTheFork}</p>
                </div>
                <div>
                  <p className="section-header">Risks</p>
                  <p className="leading-relaxed">{obs.risks}</p>
                </div>
                <div>
                  <p className="section-header">What I Would Investigate</p>
                  <p className="leading-relaxed">{obs.wouldInvestigate}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
