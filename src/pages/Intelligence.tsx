import { useState } from 'react'
import {
  AlertTriangle, Clock, ChevronDown, ChevronUp,
  CheckCircle2, Eye, Plus, TrendingUp, TrendingDown,
  Minus, Lightbulb, HelpCircle, ArrowRight,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { cn } from '../lib/cn'
import {
  risks as initialRisks, signals as initialSignals, opportunities,
  observations, projects, decisions, riskEnrichment, PERSON_ID,
} from '../data/mockData'
import { useToast, ToastContainer } from '../components/Toast'
import QuickAddModal from '../components/QuickAddModal'
import RecordLink from '../components/RecordLink'
import { useAutoExpand } from '../hooks/useAutoExpand'

type RiskStatus = 'open' | 'in-progress' | 'mitigated' | 'resolved'
type SigStatus  = 'new' | 'monitoring' | 'investigating' | 'action-required' | 'resolved'
type ItemType   = 'Risk' | 'Observation'

const exposureCfg: Record<string, { label: string; cls: string; bg: string; border: string }> = {
  'critical': { label: 'Critical', cls: 'badge-crit', bg: 'bg-purple-50', border: 'border-purple-200' },
  'at-risk':  { label: 'High',     cls: 'badge-risk', bg: 'bg-red-50',    border: 'border-red-200' },
  'watch':    { label: 'Medium',   cls: 'badge-watch', bg: 'bg-amber-50', border: 'border-amber-200' },
}
const riskStatusCfg: Record<RiskStatus, { label: string; cls: string }> = {
  'open':        { label: 'Open',        cls: 'badge-open' },
  'in-progress': { label: 'In Progress', cls: 'badge-watch' },
  'mitigated':   { label: 'Mitigated',   cls: 'badge-track' },
  'resolved':    { label: 'Resolved',    cls: 'badge-done' },
}
const sigStatusCfg: Record<SigStatus, { label: string; cls: string }> = {
  'new':             { label: 'New',             cls: 'badge-new' },
  'monitoring':      { label: 'Monitoring',      cls: 'badge-watch' },
  'investigating':   { label: 'Investigating',   cls: 'badge-risk' },
  'action-required': { label: 'Action Required', cls: 'badge-crit' },
  'resolved':        { label: 'Resolved',        cls: 'badge-done' },
}
const sigFlow: SigStatus[] = ['new','monitoring','investigating','action-required','resolved']
const stageMap: Record<string, { label: string; cls: string; step: number }> = {
  signal:     { label: 'Signal',     cls: 'badge-parked', step: 1 },
  hypothesis: { label: 'Hypothesis', cls: 'badge-new',    step: 2 },
  validation: { label: 'Validation', cls: 'badge-watch',  step: 3 },
  experiment: { label: 'Experiment', cls: 'badge-track',  step: 4 },
  decision:   { label: 'Decision',   cls: 'badge-open',   step: 5 },
}
const flagMap: Record<string,string> = {
  Italy: '🇮🇹', Sweden: '🇸🇪', France: '🇫🇷', Portugal: '🇵🇹',
  Spain: '🇪🇸', Netherlands: '🇳🇱', Global: '🌍', 'All EU': '🇪🇺',
  UK: '🇬🇧', DACH: '🇩🇪', Industry: '📰',
}

function TrajIcon({ t }: { t?: string }) {
  if (t === 'worsening') return <TrendingDown size={13} className="text-red-500 shrink-0" />
  if (t === 'improving') return <TrendingUp   size={13} className="text-emerald-500 shrink-0" />
  return <Minus size={13} className="text-slate-400 shrink-0" />
}

export default function Intelligence() {
  const navigate = useNavigate()
  const [tab,        setTab]        = useState<'risks' | 'signals' | 'opportunities'>('risks')
  const { expanded, setExpanded }  = useAutoExpand()
  const [riskStatus, setRiskStatus] = useState<Record<string, RiskStatus>>(
    () => Object.fromEntries(initialRisks.map(r => [r.id, 'open' as RiskStatus]))
  )
  const [sigStatus, setSigStatus] = useState<Record<string, SigStatus>>(
    () => Object.fromEntries(initialSignals.map(s => [s.id, s.status as SigStatus]))
  )
  const [sigCat,     setSigCat]     = useState('all')
  const [addOpen,    setAddOpen]    = useState(false)
  const [addType,    setAddType]    = useState<ItemType>('Risk')
  const { toasts, toast, remove } = useToast()

  const openAdd = (type: ItemType) => { setAddType(type); setAddOpen(true) }

  const summary = {
    critical:  initialRisks.filter(r => r.exposure === 'critical').length,
    high:      initialRisks.filter(r => r.exposure === 'at-risk').length,
    resolved:  Object.values(riskStatus).filter(s => s === 'resolved').length,
    newSigs:   Object.values(sigStatus).filter(s => s === 'new').length,
    investing: Object.values(sigStatus).filter(s => s === 'investigating').length,
  }

  const sigCategories = ['all', ...Array.from(new Set(initialSignals.map(s => s.category)))]
  const filteredSigs  = initialSignals.filter(s => sigCat === 'all' || s.category === sigCat)

  return (
    <div className="space-y-5">
      <ToastContainer toasts={toasts} remove={remove} />
      <QuickAddModal open={addOpen} itemType={addType}
        onClose={() => { setAddOpen(false); toast(`${addType} added.`) }} />

      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <h1 className="page-title">Risks & Signals</h1>
          <p className="page-subtitle">Risk register with trajectory tracking, early-warning signals, and opportunity pipeline.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => openAdd('Risk')} className="btn-secondary text-xs shrink-0">
            <Plus size={12} /> Add Risk
          </button>
          <button onClick={() => openAdd('Observation')} className="btn-secondary text-xs shrink-0">
            <Plus size={12} /> Add Signal
          </button>
        </div>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: 'Critical Risks',   value: summary.critical,  cls: 'text-purple-600' },
          { label: 'High Risks',       value: summary.high,      cls: 'text-red-600' },
          { label: 'Risks Resolved',   value: summary.resolved,  cls: 'text-emerald-600' },
          { label: 'New Signals',      value: summary.newSigs,   cls: 'text-blue-600' },
          { label: 'Investigating',    value: summary.investing, cls: 'text-amber-600' },
        ].map(m => (
          <div key={m.label} className="card p-4">
            <p className={cn('text-2xl font-bold', m.cls)}>{m.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{m.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 bg-slate-100 rounded-xl p-1 w-fit flex-wrap">
        {(['risks', 'signals', 'opportunities'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={cn('px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize',
              tab === t ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700')}>
            {t}
          </button>
        ))}
      </div>

      {/* ── RISKS ── */}
      {tab === 'risks' && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          <div className="xl:col-span-2 space-y-3">
            {initialRisks.map(risk => {
              const ecfg   = exposureCfg[risk.exposure] ?? exposureCfg['watch']
              const rStat  = riskStatus[risk.id]
              const rscfg  = riskStatusCfg[rStat]
              const enr    = riskEnrichment[risk.id]
              const isOpen = expanded === risk.id
              const isRes  = rStat === 'resolved' || rStat === 'mitigated'
              const linkedProject  = (risk as any).relatedProject  ? projects.find(p => p.id === (risk as any).relatedProject) : null
              const linkedDecision = (risk as any).relatedDecision ? decisions.find(d => d.id === (risk as any).relatedDecision) : null

              return (
                <div key={risk.id} className={cn('card overflow-hidden border', ecfg.border, isRes && 'opacity-55')}>
                  <button
                    onClick={() => setExpanded(isOpen ? null : risk.id)}
                    className={cn('w-full flex items-start gap-3 px-4 sm:px-5 py-4 text-left hover:bg-slate-50/50 transition-colors')}>
                    <AlertTriangle size={15} className={cn('mt-0.5 shrink-0',
                      risk.exposure === 'critical' ? 'text-purple-500' :
                      risk.exposure === 'at-risk'  ? 'text-red-400' : 'text-amber-400')} />
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className={cn('badge', ecfg.cls)}>{ecfg.label}</span>
                        <span className={cn('badge', rscfg.cls)}>{rscfg.label}</span>
                        <span className="badge badge-parked hidden sm:inline-flex">{risk.category}</span>
                        {enr && <TrajIcon t={enr.trajectory} />}
                        {enr && <span className="text-[10px] text-slate-400">Last reviewed {enr.lastReviewed.slice(5).replace('-','/')}</span>}
                      </div>
                      <p className="text-sm font-semibold text-slate-900 leading-snug">{risk.title}</p>
                      {!isOpen && <p className="text-xs text-slate-500 mt-1 line-clamp-1">{risk.description}</p>}
                    </div>
                    {isOpen ? <ChevronUp size={15} className="text-slate-400 shrink-0 mt-0.5" /> :
                               <ChevronDown size={15} className="text-slate-400 shrink-0 mt-0.5" />}
                  </button>

                  {isOpen && (
                    <div className="px-4 sm:px-5 pb-5 pt-4 border-t border-slate-100 space-y-3">
                      <p className="text-sm text-slate-600 leading-relaxed">{risk.description}</p>
                      <div className="p-3 bg-white rounded-lg border border-slate-200">
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1">Mitigation Plan</p>
                        <p className="text-sm text-slate-700 leading-relaxed">{risk.mitigation}</p>
                      </div>
                      <div className="flex flex-wrap gap-2 items-center">
                        <span className="text-[10px] text-slate-400">Owner:</span>
                        <RecordLink type="person" id={PERSON_ID[risk.owner] ?? PERSON_ID[risk.owner.replace(/\s*\(.*\)/,'').trim()]} label={risk.owner.replace(/\s*\(.*\)/,'').trim()} />
                        <span className="text-[10px] text-slate-400 flex items-center gap-1"><Clock size={9} />Due {risk.dueDate.slice(5).replace('-','/')}</span>
                        <span className="text-[10px] text-slate-400">P: <strong className="text-slate-600">{risk.probability}</strong></span>
                        <span className="text-[10x] text-slate-400">I: <strong className="text-slate-600">{risk.impact}</strong></span>
                        {enr && <span className="flex items-center gap-1 text-[10px] text-slate-400">Trend: <TrajIcon t={enr.trajectory} /> <strong className="text-slate-600">{enr.trajectory}</strong></span>}
                      </div>
                      {(linkedProject || linkedDecision) && (
                        <div className="flex flex-wrap gap-2">
                          {linkedProject && <RecordLink type="project" id={linkedProject.id} label={linkedProject.name} truncate={35} />}
                          {linkedDecision && <RecordLink type="decision" id={linkedDecision.id} label={linkedDecision.title} truncate={40} />}
                        </div>
                      )}
                      {!isRes ? (
                        <div className="flex flex-wrap gap-2">
                          <button onClick={() => { setRiskStatus(p => ({...p, [risk.id]: 'in-progress'})); toast('Risk marked in progress.') }} className="btn-secondary"><Eye size={13} /> In Progress</button>
                          <button onClick={() => { setRiskStatus(p => ({...p, [risk.id]: 'mitigated'})); toast('Risk mitigation applied.') }} className="btn-success"><CheckCircle2 size={13} /> Mitigate</button>
                          <button onClick={() => { setRiskStatus(p => ({...p, [risk.id]: 'resolved'})); toast('Risk resolved.') }} className="btn-secondary"><CheckCircle2 size={13} /> Resolve</button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className={cn('badge', rscfg.cls)}>{rscfg.label}</span>
                          <button onClick={() => setRiskStatus(p => ({...p, [risk.id]: 'open'}))}
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
                  <div className="text-right text-[8px]">Prob ↑</div>
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
              <p className="section-header">Trajectory Summary</p>
              {(['worsening','stable','improving'] as const).map(t => {
                const count = Object.values(riskEnrichment).filter(e => e.trajectory === t).length
                const icon  = t === 'worsening' ? <TrendingDown size={13} className="text-red-500" /> :
                              t === 'improving' ? <TrendingUp   size={13} className="text-emerald-500" /> :
                              <Minus size={13} className="text-slate-400" />
                return (
                  <div key={t} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                    <span className="flex items-center gap-2 text-xs text-slate-700 capitalize">{icon} {t}</span>
                    <span className="text-xs font-bold text-slate-500">{count}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── SIGNALS ── */}
      {tab === 'signals' && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-1.5">
            {sigCategories.map(c => (
              <button key={c} onClick={() => setSigCat(c)} className={cn('tab text-[11px]', sigCat === c && 'active')}>
                {c === 'all' ? 'All Categories' : c}
              </button>
            ))}
          </div>
          {filteredSigs.map(sig => {
            const status = sigStatus[sig.id]
            const scfg   = sigStatusCfg[status]
            const flag   = flagMap[sig.market] ?? '🌍'
            const canAdv = sigFlow.indexOf(status) < sigFlow.length - 1

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
                  <div className="mt-3">
                    <button
                      onClick={() => {
                        const idx = sigFlow.indexOf(status)
                        const next = sigFlow[idx + 1]
                        setSigStatus(p => ({...p, [sig.id]: next}))
                        toast(`Signal updated → ${sigStatusCfg[next].label}`, 'info')
                      }}
                      className="btn-secondary text-[11px]">
                      Move to: {sigStatusCfg[sigFlow[sigFlow.indexOf(status) + 1]].label} →
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* ── OPPORTUNITIES ── */}
      {tab === 'opportunities' && (
        <div className="space-y-6">
          {/* Pipeline */}
          <div className="card p-5">
            <p className="section-header">Opportunity Pipeline</p>
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {['signal','hypothesis','validation','experiment','decision'].map((stage, i) => {
                const count = opportunities.filter(o => o.stage === stage).length
                const scfg  = stageMap[stage]
                return (
                  <div key={stage} className="flex items-center gap-2 shrink-0">
                    <div className={cn('rounded-xl px-4 py-3 min-w-[90px] text-center',
                      count > 0 ? 'bg-slate-50 border border-slate-200' : 'bg-slate-50/50 border border-dashed border-slate-200')}>
                      <p className={cn('text-xl font-bold', count > 0 ? 'text-slate-800' : 'text-slate-300')}>{count}</p>
                      <span className={cn('badge mt-1 text-[9.5px]', scfg.cls)}>{scfg.label}</span>
                    </div>
                    {i < 4 && <ArrowRight size={13} className="text-slate-300 shrink-0" />}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Opportunities */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {opportunities.map(opp => {
              const scfg = stageMap[opp.stage] ?? stageMap['signal']
              return (
                <div key={opp.id} className="card p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 border border-amber-200">
                        <Lightbulb size={14} className="text-amber-500" />
                      </div>
                      <span className={cn('badge', scfg.cls)}>{scfg.label}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10.5px] text-slate-400">Effort: <strong>{opp.effort}</strong></span>
                      <span className={cn('badge', opp.confidence === 'high' ? 'badge-done' : 'badge-watch')}>
                        {opp.confidence} conf.
                      </span>
                    </div>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 mb-2 leading-snug">{opp.title}</h3>
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
                    {opp.recommendation && (
                      <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-100">
                        <p className="text-[9px] font-semibold text-emerald-600 uppercase tracking-wide mb-0.5">Recommendation</p>
                        <p className="text-emerald-800">{opp.recommendation}</p>
                      </div>
                    )}
                    <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                      <span className="text-[10.5px] text-slate-400">Owner: <strong className="text-slate-600">{opp.owner}</strong></span>
                      <span className="badge badge-parked">Align: {opp.strategicAlignment}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Outside-In Observations */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <p className="section-header mb-0">Outside-In Observations</p>
              <span className="badge badge-watch">Candidate Hypotheses</span>
            </div>
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 mb-4">
              <div className="flex items-start gap-2">
                <HelpCircle size={14} className="text-amber-500 mt-0.5 shrink-0" />
                <p className="text-xs text-amber-700 leading-relaxed">
                  <strong>Independent hypotheses only.</strong> These are not statements about TheFork's internal performance or confirmed company priorities.
                </p>
              </div>
            </div>
            <div className="space-y-4">
              {observations.map(obs => (
                <div key={obs.id} className="card p-5">
                  <div className="flex items-start gap-3 mb-3">
                    <span className="badge badge-crit shrink-0">{obs.label}</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 mb-3">{obs.title}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600">
                    <div>
                      <p className="section-header">Observation</p>
                      <p className="leading-relaxed">{obs.observation}</p>
                    </div>
                    <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                      <p className="text-[9px] font-semibold text-indigo-500 uppercase tracking-wide mb-1">Hypothesis</p>
                      <p className="text-indigo-800 leading-relaxed font-medium">{obs.hypothesis}</p>
                    </div>
                    <div>
                      <p className="section-header">Small Experiment</p>
                      <p className="leading-relaxed">{obs.smallExperiment}</p>
                    </div>
                    <div>
                      <p className="section-header">Success Metric</p>
                      <p className="leading-relaxed">{obs.successMetric}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
