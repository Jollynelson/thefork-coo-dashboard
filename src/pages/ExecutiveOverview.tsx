import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { TrendingUp, TrendingDown, AlertCircle, Clock, User, ChevronRight, CheckCircle2, XCircle, Info, ArrowRight, Sparkles } from 'lucide-react'
import { cn } from '../lib/cn'
import {
  healthStrip, markets, decisions as allDecisions, strategicPriorities,
  projects, budgetData, meetings, stakeholders, signals, actions, PERSON_ID,
} from '../data/mockData'
import { useToast, ToastContainer } from '../components/Toast'
import COOBriefModal from '../components/COOBriefModal'
import RecordLink from '../components/RecordLink'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const statusMap: Record<string, { label: string; cls: string; dot: string }> = {
  'on-track':     { label: 'On Track',    cls: 'badge-track', dot: 'bg-emerald-500' },
  'watch':        { label: 'Watch',       cls: 'badge-watch', dot: 'bg-amber-500' },
  'at-risk':      { label: 'At Risk',     cls: 'badge-risk',  dot: 'bg-red-500' },
  'critical':     { label: 'Critical',    cls: 'badge-crit',  dot: 'bg-purple-500' },
  'behind':       { label: 'Behind',      cls: 'badge-risk',  dot: 'bg-red-500' },
  'done':         { label: 'Done',        cls: 'badge-done',  dot: 'bg-green-600' },
  'parked':       { label: 'Parked',      cls: 'badge-parked',dot: 'bg-slate-400' },
  'open':         { label: 'Open',        cls: 'badge-open',  dot: 'bg-orange-500' },
  'monitoring':   { label: 'Monitoring',  cls: 'badge-watch', dot: 'bg-amber-500' },
  'investigating':{ label: 'Investig.',   cls: 'badge-risk',  dot: 'bg-red-500' },
  'new':          { label: 'New',         cls: 'badge-new',   dot: 'bg-blue-500' },
}
const StatusBadge = ({ status }: { status: string }) => {
  const cfg = statusMap[status] ?? statusMap['open']
  return (
    <span className={cn('badge', cfg.cls)}>
      <span className={cn('w-[5px] h-[5px] rounded-full shrink-0', cfg.dot)} />
      {cfg.label}
    </span>
  )
}

function HealthCard({ item }: { item: typeof healthStrip[0] }) {
  const isRisk  = item.status === 'at-risk' || item.status === 'critical'
  const isWatch = item.status === 'watch'
  const top     = isRisk ? 'border-t-red-400' : isWatch ? 'border-t-amber-400' : 'border-t-emerald-400'
  const trendNeg = item.trend.startsWith('-') || item.label === 'Open Risks'
  return (
    <div className={cn('card p-3 sm:p-3.5 border-t-2', top)}>
      <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400 leading-none truncate">{item.label}</p>
      <div className="mt-1.5 flex items-baseline gap-0.5 flex-wrap">
        <span className="text-base sm:text-lg font-bold text-slate-900 leading-none">{item.value}</span>
        {item.unit && <span className="text-[10px] text-slate-400 leading-none">{item.unit}</span>}
      </div>
      {item.trend && (
        <div className={cn('flex items-center gap-0.5 mt-0.5 text-[9px] font-medium', trendNeg ? 'text-red-500' : 'text-emerald-600')}>
          {trendNeg ? <TrendingDown size={9} /> : <TrendingUp size={9} />}{item.trend}
        </div>
      )}
      <p className="mt-1 text-[9px] text-slate-400 leading-snug">{item.note}</p>
    </div>
  )
}

const attentionItems = [
  { severity: 'critical', type: 'Decision Deadline',    title: 'ODP technology partner decision — deadline tomorrow', impact: 'Delays Q4 delivery 2 weeks per day. Also blocks integration data readiness.', owner: 'Luca Marini', deadline: 'Aug 29', action: 'Approve or request information', link: '/decisions' },
  { severity: 'high',     type: 'Market Risk',          title: 'Italy restaurant churn 18% above critical threshold', impact: 'Q3 partner target at risk. NPS declining 3rd consecutive month.', owner: 'Sofia Martini', deadline: 'Aug 30', action: 'Review Italy recovery plan', link: '/markets' },
  { severity: 'high',     type: 'Integration',          title: 'Partner communications decision needed — top-50 accounts already asking questions', impact: 'Uncoordinated messaging risks partner anxiety and potential churn.', owner: 'Claire Fontaine', deadline: 'Sep 5', action: 'Decide communications timing', link: '/acquisition-integration' },
  { severity: 'medium',   type: 'Financial',            title: 'T&E spend €2.3M over FY forecast', impact: 'FY budget overrun projected +4.3%. Integration travel is a key driver.', owner: 'Emma Larsson (CFO)', deadline: 'Sep 5', action: 'Review T&E reduction plan', link: '/people-budget' },
  { severity: 'high',     type: 'Project',              title: 'Restaurant Onboarding 2.0 moved to At Risk', impact: 'Scope +30%, 2 FTE resource gap. Dec delivery date at risk.', owner: 'Tom Berg', deadline: 'Sep 1', action: 'Request scope reduction brief', link: '/projects' },
]

export default function ExecutiveOverview() {
  const navigate = useNavigate()
  const [activeTab,   setActiveTab]   = useState('Today')
  const [briefOpen,   setBriefOpen]   = useState(false)
  const [decStatuses, setDecStatuses] = useState<Record<string, string>>(
    () => Object.fromEntries(allDecisions.map(d => [d.id, d.status]))
  )
  const { toasts, toast, remove } = useToast()

  const updateDec = (id: string, next: string, msg: string) => {
    setDecStatuses(p => ({ ...p, [id]: next }))
    toast(msg)
  }

  const openDecs       = allDecisions.filter(d => decStatuses[d.id] === 'open').slice(0, 2)
  const overdueActions = actions.filter(a => a.status === 'overdue')
  const todayMeetings  = meetings.slice(0, 3)

  return (
    <div className="space-y-6">
      <ToastContainer toasts={toasts} remove={remove} />
      <COOBriefModal open={briefOpen} onClose={() => setBriefOpen(false)} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <Sparkles size={14} className="text-orange-400" />
            <span className="text-xs text-slate-400 font-medium">Thursday, 28 August 2026</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Good morning, Amanda.</h1>
          <p className="text-sm text-slate-500 mt-0.5">Your operating picture for today. <span className="font-medium" style={{ color: '#00856F' }}>2 time-sensitive decisions require your attention.</span></p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex bg-slate-100 rounded-lg p-0.5">
            {['Today','This Week','This Month'].map(t => (
              <button key={t} onClick={() => setActiveTab(t)}
                className={cn('px-2.5 py-1.5 rounded-md text-xs font-medium transition-all',
                  activeTab === t ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700')}>
                {t}
              </button>
            ))}
          </div>
          <button onClick={() => setBriefOpen(true)} className="btn-primary">
            <Sparkles size={12} /> Generate COO Brief
          </button>
        </div>
      </div>

      {/* ─── WHAT CHANGED SINCE MONDAY — always first after header ─── */}
      <section>
        <div className="rounded-xl overflow-hidden border border-slate-800" style={{ background: '#0F172A' }}>
          <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-slate-700/60">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">What Changed Since Monday</span>
              <span className="badge bg-slate-700 text-slate-300 border-slate-600 text-[9.5px]">28 Aug 2026</span>
            </div>
            <span className="text-[10px] text-slate-500">5 updates</span>
          </div>
          {[
            { icon: '🔴', dir: 'down',  cat: 'Market Risk',   title: 'Italy churn trending to 7.1% — 3rd consecutive month worsening.', detail: 'Recovery budget still awaiting COO approval. Sep QBR data will reflect this month.', action: 'Approve budget →', link: '/decisions' },
            { icon: '🔴', dir: 'down',  cat: 'Decision',      title: 'ODP vendor decision now 15 days overdue — deadline TOMORROW (Aug 29).', detail: 'Every day of delay = 2-week Q4 slip + €420k contract extension cost.', action: 'Decide now →', link: '/decisions' },
            { icon: '🟡', dir: 'down',  cat: 'Integration',   title: 'Systems workstream moved to At Risk — sequencing decision blocking progress.', detail: 'Integration programme overall readiness stalled at 42%. Systems team unblocked by Sep 12 decision.', action: 'View workstream →', link: '/acquisition-integration' },
            { icon: '🟢', dir: 'up',    cat: 'Signal',        title: 'France NPS: +4pts MoM — highest in 18 months. Loyalty pilot driving uplift.', detail: 'Playbook not yet shared with other markets. Portugal also up +2pts. Italy unchanged.', action: 'Share playbook →', link: '/markets' },
            { icon: '🔵', dir: 'stable',cat: 'Competitive',   title: 'DACH: Competitor loyalty programme launched — 200 sign-ups in first week.', detail: 'Moderate confidence. Our loyalty revamp timeline should be reviewed for DACH acceleration.', action: 'View signal →', link: '/intelligence' },
          ].map((item, i) => (
            <Link key={i} to={item.link}
              className="flex items-start gap-3 px-4 sm:px-5 py-3.5 border-b border-slate-800/60 last:border-0 hover:bg-slate-800/40 transition-colors group">
              <span className="text-base shrink-0 mt-0.5">{item.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-0.5">
                  <span className="text-[9.5px] font-bold uppercase tracking-wider text-slate-500">{item.cat}</span>
                </div>
                <p className="text-sm font-semibold text-white leading-snug">{item.title}</p>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">{item.detail}</p>
              </div>
              <span className="text-[10.5px] font-medium shrink-0 mt-1 group-hover:underline" style={{ color: '#6EC9BC' }}>
                {item.action}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Health Strip — 9+1 cards, horizontal scroll on mobile */}
      <section>
        <p className="section-header">Executive Health</p>
        {/* Mobile: snap-scroll row  |  Desktop: 9-col grid */}
        <div className="flex gap-2 overflow-x-auto snap-x snap-mandatory pb-1 -mx-4 px-4
                        sm:mx-0 sm:px-0 sm:overflow-visible sm:pb-0
                        sm:grid sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-10">
          {healthStrip.map(item => (
            <div key={item.label} className="snap-start flex-shrink-0 w-36 sm:w-auto">
              <HealthCard item={item} />
            </div>
          ))}
        </div>
      </section>

      {/* Attention + Decisions */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">
        <section className="xl:col-span-3">
          <div className="flex items-center justify-between mb-3">
            <p className="section-header mb-0">Attention Required</p>
            <span className="badge badge-risk">{attentionItems.length} items</span>
          </div>
          <div className="card overflow-hidden">
            {attentionItems.map((item, i) => (
              <Link key={i} to={item.link}
                className={cn('flex gap-3 px-4 sm:px-5 py-3.5 border-b border-slate-50 last:border-0',
                  'hover:bg-slate-50/70 active:bg-slate-100 transition-colors group border-l-[3px]',
                  item.severity === 'critical' ? 'border-l-purple-500' :
                  item.severity === 'high'     ? 'border-l-red-400'    : 'border-l-amber-400'
                )}>
                <AlertCircle size={14} className={cn('mt-0.5 shrink-0',
                  item.severity === 'critical' ? 'text-purple-500' :
                  item.severity === 'high'     ? 'text-red-400'    : 'text-amber-400'
                )} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[9.5px] font-semibold uppercase tracking-wider text-slate-400">{item.type}</p>
                      <p className="text-sm font-semibold text-slate-800 leading-snug mt-0.5">{item.title}</p>
                    </div>
                    <ChevronRight size={14} className="text-slate-300 group-hover:text-slate-500 mt-1 shrink-0 transition-colors" />
                  </div>
                  <p className="text-xs text-slate-500 mt-1 leading-snug">{item.impact}</p>
                  <div className="flex flex-wrap items-center gap-3 mt-1.5">
                    <span className="flex items-center gap-1 text-[10px] text-slate-400"><User size={9} />{item.owner}</span>
                    <span className="flex items-center gap-1 text-[10px] text-slate-400"><Clock size={9} />{item.deadline}</span>
                    <span className="text-[10px] text-indigo-600 font-medium">{item.action} →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="xl:col-span-2 space-y-3">
          <div className="flex items-center justify-between mb-3">
            <p className="section-header mb-0">Decisions Required</p>
            <Link to="/decisions" className="text-[10.5px] text-indigo-600 font-medium hover:underline">View all</Link>
          </div>
          {openDecs.length === 0 ? (
            <div className="card p-5 text-center">
              <CheckCircle2 size={22} className="text-emerald-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">All decisions handled</p>
            </div>
          ) : openDecs.map(dec => (
            <div key={dec.id} className="card p-4 border-l-[3px] border-l-orange-400">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <p className="text-[9.5px] font-semibold uppercase tracking-wider text-orange-600">
                  {dec.category} · Due {dec.deadline.slice(5).replace('-','/')}
                </p>
              </div>
              <p className="text-sm font-semibold text-slate-800 leading-snug">{dec.title}</p>
              <p className="text-xs text-slate-500 mt-1.5 leading-snug">{dec.whyNow}</p>
              <div className="mt-2 p-2.5 bg-indigo-50 rounded-lg border border-indigo-100">
                <p className="text-[9.5px] font-semibold text-indigo-600 uppercase tracking-wide">Recommendation</p>
                <p className="text-xs text-indigo-800 mt-0.5 leading-snug">{dec.recommendation}</p>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <button onClick={() => updateDec(dec.id, 'approved', `Decision approved — "${dec.title.slice(0,35)}…"`)} className="btn-success"><CheckCircle2 size={11} />Approve</button>
                <button onClick={() => updateDec(dec.id, 'pending-info', 'Info requested — owner notified.')} className="btn-secondary"><Info size={11} />Request Info</button>
                <button onClick={() => updateDec(dec.id, 'delegated', `Delegated to ${dec.owner}.`)} className="btn-secondary"><ArrowRight size={11} />Delegate</button>
                <button onClick={() => updateDec(dec.id, 'parked', 'Decision parked.')} className="btn-secondary"><XCircle size={11} />Park</button>
              </div>
            </div>
          ))}
          <Link to="/actions" className="card p-3.5 flex items-center gap-3 hover:bg-slate-50 transition-colors group">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-50 border border-red-200">
              <Clock size={14} className="text-red-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-700">{overdueActions.length} actions overdue</p>
              <p className="text-[10px] text-slate-400">Oldest due: {overdueActions[0]?.dueDate}</p>
            </div>
            <ChevronRight size={13} className="text-slate-300 group-hover:text-slate-500 shrink-0" />
          </Link>
        </section>
      </div>

      {/* Strategic Priorities */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <p className="section-header mb-0">Strategic Priorities</p>
          <Link to="/priorities" className="text-[10.5px] text-indigo-600 font-medium hover:underline">View all 6</Link>
        </div>
        <div className="card overflow-hidden">
          <div className="tbl-wrap">
            <table className="w-full min-w-[620px]">
              <thead>
                <tr>{['Priority','Owner','Progress','Status','Next Milestone','Days'].map(h => (
                  <th key={h} className="tbl-head first:pl-5 last:pr-5">{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {strategicPriorities.map(sp => (
                  <tr key={sp.id} className="tbl-row cursor-pointer" onClick={() => navigate('/priorities')}>
                    <td className="tbl-cell-wrap pl-5 min-w-[200px]">
                      <p className="text-sm font-medium text-slate-800 leading-snug">{sp.title}</p>
                      {sp.blocker && <p className="text-[10px] text-red-500 mt-0.5">⚠ {sp.blocker}</p>}
                    </td>
                    <td className="tbl-cell"><RecordLink type="person" id={PERSON_ID[sp.owner]} label={sp.owner} /></td>
                    <td className="tbl-cell min-w-[110px]">
                      <div className="flex items-center gap-2">
                        <div className="prog-bar w-16 h-1.5"><div className="prog-fill bg-indigo-500" style={{ width: `${sp.progress}%` }} /></div>
                        <span className="text-xs font-medium text-slate-600">{sp.progress}%</span>
                      </div>
                    </td>
                    <td className="tbl-cell"><StatusBadge status={sp.status} /></td>
                    <td className="tbl-cell min-w-[140px]">
                      <p className="text-xs text-slate-600">{sp.nextMilestone}</p>
                      <p className="text-[10px] text-slate-400">{sp.milestoneDate}</p>
                    </td>
                    <td className="tbl-cell pr-5">
                      <span className={cn('text-sm font-bold',
                        sp.daysToMilestone <= 7 ? 'text-red-500' : sp.daysToMilestone <= 21 ? 'text-amber-500' : 'text-slate-400')}>
                        {sp.daysToMilestone}d
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Markets + Meetings */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <section className="xl:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <p className="section-header mb-0">Global Operations Snapshot</p>
            <Link to="/markets" className="text-[10.5px] text-indigo-600 font-medium hover:underline">View all</Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {markets.map(m => (
              <Link key={m.id} to="/markets" className="card p-3.5 sm:p-4 hover:shadow-md active:scale-[0.98] transition-all">
                <div className="flex items-start justify-between gap-1 mb-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xl shrink-0">{m.flag}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-800 leading-none truncate">{m.name}</p>
                      <p className="text-[9.5px] text-slate-400 mt-0.5 truncate">{m.region}</p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 mb-2">
                  <div>
                    <p className="text-[9px] text-slate-400 uppercase tracking-wide font-semibold">Health</p>
                    <p className={cn('text-base font-bold',
                      m.healthScore >= 80 ? 'text-emerald-600' : m.healthScore >= 70 ? 'text-amber-600' : 'text-red-500')}>
                      {m.healthScore}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-400 uppercase tracking-wide font-semibold">NPS</p>
                    <div className="flex items-baseline gap-0.5">
                      <p className="text-base font-bold text-slate-800">{m.nps}</p>
                      <span className={cn('text-[10px] font-semibold', m.npsChange >= 0 ? 'text-emerald-600' : 'text-red-500')}>
                        {m.npsChange >= 0 ? '↑' : '↓'}{Math.abs(m.npsChange)}
                      </span>
                    </div>
                  </div>
                </div>
                <StatusBadge status={m.status} />
                {m.escalations > 0 && (
                  <div className="mt-1.5"><span className="badge badge-risk">{m.escalations} escalation{m.escalations > 1 ? 's' : ''}</span></div>
                )}
              </Link>
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-3">
            <p className="section-header mb-0">Meetings Today</p>
            <Link to="/meetings" className="text-[10.5px] text-indigo-600 font-medium hover:underline">View all</Link>
          </div>
          <div className="space-y-2.5">
            {todayMeetings.map(mtg => (
              <Link key={mtg.id} to="/meetings" className="card p-4 block hover:shadow-md active:scale-[0.98] transition-all">
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <span className="inline-flex items-center justify-center rounded-lg bg-slate-100 px-2 py-1 text-xs font-bold text-slate-700">{mtg.time}</span>
                  <span className={cn('badge',
                    mtg.type === 'ELT' ? 'badge-crit' :
                    mtg.type.includes('Integration') ? 'badge-open' :
                    mtg.type === 'Market' ? 'badge-new' : 'badge-parked')}>
                    {mtg.type.includes('Integration') ? 'Integration' : mtg.type}
                  </span>
                  <span className={cn('badge ml-auto',
                    mtg.prepStatus === 'complete' ? 'badge-done' :
                    mtg.prepStatus === 'incomplete' ? 'badge-watch' : 'badge-parked')}>
                    {mtg.prepStatus === 'complete' ? '✓ Ready' : mtg.prepStatus === 'incomplete' ? '⚠ Incomplete' : 'Not started'}
                  </span>
                </div>
                <p className="text-sm font-semibold text-slate-800 leading-snug">{mtg.title}</p>
                <div className="flex items-center gap-3 mt-1.5 text-[10.5px] text-slate-400">
                  <span className="flex items-center gap-1"><User size={9} />{mtg.participants.length}</span>
                  {mtg.decisionsExpected > 0 && <span className="font-medium text-orange-600">{mtg.decisionsExpected} decision{mtg.decisionsExpected > 1 ? 's' : ''}</span>}
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>

      {/* Projects + Budget */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">
        <section className="xl:col-span-3">
          <div className="flex items-center justify-between mb-3">
            <p className="section-header mb-0">Strategic Projects</p>
            <Link to="/projects" className="text-[10.5px] text-indigo-600 font-medium hover:underline">View all {projects.length}</Link>
          </div>
          <div className="card overflow-hidden">
            <div className="tbl-wrap">
              <table className="w-full min-w-[560px]">
                <thead>
                  <tr>{['Project','Lead','Progress','Health','Milestone'].map(h => (
                    <th key={h} className="tbl-head first:pl-5 last:pr-5">{h}</th>
                  ))}</tr>
                </thead>
                <tbody>
                  {projects.slice(0,5).map(p => (
                    <tr key={p.id} className="tbl-row cursor-pointer" onClick={() => navigate('/projects')}>
                      <td className="tbl-cell-wrap pl-5 min-w-[160px]">
                        <p className="text-sm font-medium text-slate-800 leading-snug">{p.name}</p>
                        {p.decisionNeeded && <span className="badge badge-open mt-1">Decision needed</span>}
                      </td>
                      <td className="tbl-cell"><RecordLink type="person" id={PERSON_ID[p.lead] ?? PERSON_ID[p.lead.replace(/\s*\(.*\)/,'').trim()]} label={p.lead.replace(/\s*\(.*\)/,'').trim()} /></td>
                      <td className="tbl-cell min-w-[100px]">
                        <div className="flex items-center gap-1.5">
                          <div className="prog-bar w-14 h-1.5">
                            <div className={cn('prog-fill', p.health === 'on-track' ? 'bg-emerald-500' : p.health === 'watch' ? 'bg-amber-400' : 'bg-red-400')}
                              style={{ width: `${p.progress}%` }} />
                          </div>
                          <span className="text-xs font-medium text-slate-600">{p.progress}%</span>
                        </div>
                      </td>
                      <td className="tbl-cell"><StatusBadge status={p.health} /></td>
                      <td className="tbl-cell pr-5">
                        <p className="text-xs text-slate-600 leading-snug">{p.nextMilestone}</p>
                        <p className="text-[10px] text-slate-400">{p.milestoneDate}</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="xl:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <p className="section-header mb-0">Budget Snapshot</p>
            <Link to="/budget" className="text-[10.5px] text-indigo-600 font-medium hover:underline">Full view</Link>
          </div>
          <div className="card p-4 sm:p-5">
            <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4">
              {[
                { label: 'Annual Budget', value: '€44.2M', sub: 'FY2026 plan' },
                { label: 'YTD Actual',    value: '€28.4M', sub: '64% consumed' },
                { label: 'FY Forecast',   value: '€46.1M', sub: <span className="text-red-500">+€1.9M over</span> },
                { label: 'Headcount',     value: '527/557', sub: '30 open roles' },
              ].map(item => (
                <div key={item.label}>
                  <p className="text-[9.5px] uppercase tracking-wider text-slate-400 font-semibold">{item.label}</p>
                  <p className="text-base sm:text-lg font-bold text-slate-800 mt-0.5">{item.value}</p>
                  <p className="text-[10px] text-slate-400">{item.sub}</p>
                </div>
              ))}
            </div>
            <div className="pt-3 border-t border-slate-100">
              <p className="text-[9.5px] font-semibold uppercase tracking-wider text-slate-400 mb-2">Monthly Spend vs. Budget</p>
              <ResponsiveContainer width="100%" height={90}>
                <AreaChart data={budgetData.monthlyTrend} margin={{ top: 0, right: 0, left: -38, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gActOv" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 9 }} stroke="#94a3b8" tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 9 }} stroke="#94a3b8" tickLine={false} axisLine={false} tickFormatter={v => `€${(v/1e6).toFixed(1)}M`} />
                  <Tooltip contentStyle={{ fontSize: 10, borderRadius: 8, border: '1px solid #e2e8f0' }} formatter={(v: number) => [`€${(v/1e6).toFixed(2)}M`]} />
                  <Area type="monotone" dataKey="budget" name="Budget" stroke="#6366F1" fill="none" strokeWidth={1.5} strokeDasharray="4 2" dot={false} />
                  <Area type="monotone" dataKey="actual" name="Actual" stroke="#F59E0B" fill="url(#gActOv)" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>
      </div>

      {/* Stakeholders + Signals */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <section>
          <div className="flex items-center justify-between mb-3">
            <p className="section-header mb-0">Stakeholder Radar</p>
            <Link to="/stakeholders" className="text-[10.5px] text-indigo-600 font-medium hover:underline">View all</Link>
          </div>
          <div className="card overflow-hidden divide-y divide-slate-50">
            {stakeholders.filter(s => s.health === 'needs-attention' || s.health === 'watch').slice(0, 4).map(s => (
              <Link key={s.id} to="/stakeholders"
                className="flex items-start gap-3 px-4 py-3.5 hover:bg-slate-50 transition-colors">
                <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                  s.health === 'needs-attention' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700')}>
                  {s.name.split(' ').map(n => n[0]).join('').slice(0,2)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <RecordLink type="person" id={PERSON_ID[s.name] ?? s.id} label={s.name} />
                      <p className="text-[10.5px] text-slate-400 mt-0.5">{s.role}</p>
                    </div>
                    <span className={cn('badge shrink-0', s.health === 'needs-attention' ? 'badge-risk' : 'badge-watch')}>
                      {s.health === 'needs-attention' ? 'Needs Attention' : 'Watch'}
                    </span>
                  </div>
                  {s.openIssue && <p className="text-[11px] text-slate-500 mt-1.5 leading-snug">{s.openIssue}</p>}
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-3">
            <p className="section-header mb-0">Emerging Signals</p>
            <Link to="/signals" className="text-[10.5px] text-indigo-600 font-medium hover:underline">View all {signals.length}</Link>
          </div>
          <div className="space-y-2.5">
            {signals.slice(0, 4).map(sig => (
              <Link key={sig.id} to="/signals" className="card p-4 block hover:shadow-sm active:scale-[0.99] transition-all">
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="badge badge-parked">{sig.category}</span>
                    <span className="badge badge-parked">{sig.market}</span>
                  </div>
                  <span className={cn('badge shrink-0',
                    sig.status === 'investigating' ? 'badge-risk' :
                    sig.status === 'monitoring'    ? 'badge-watch' : 'badge-new')}>
                    {sig.status === 'investigating' ? 'Investig.' : sig.status === 'monitoring' ? 'Monitoring' : 'New'}
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-800 leading-snug">{sig.signal}</p>
                <p className="text-[10.5px] text-slate-400 mt-1 leading-snug">{sig.suggestedResponse}</p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
