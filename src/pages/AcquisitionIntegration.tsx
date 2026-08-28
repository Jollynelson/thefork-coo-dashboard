import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Handshake, AlertTriangle, CheckCircle2, Clock, User,
  ChevronDown, ChevronUp, Info, FolderKanban, ListTodo, Plus, ExternalLink,
} from 'lucide-react'
import { cn } from '../lib/cn'
import { integrationWorkstreams, day1Checklist, risks, decisions, stakeholders, actions, projects, PERSON_ID } from '../data/mockData'
import { useToast, ToastContainer } from '../components/Toast'
import QuickAddModal from '../components/QuickAddModal'
import RecordLink from '../components/RecordLink'
import { useAutoExpand } from '../hooks/useAutoExpand'

const statusConfig: Record<string, { label: string; cls: string; bar: string; border: string }> = {
  'on-track':    { label: 'On Track',    cls: 'badge-track', bar: 'bg-emerald-500', border: 'border-l-emerald-400' },
  'watch':       { label: 'Watch',       cls: 'badge-watch', bar: 'bg-amber-400',   border: 'border-l-amber-400' },
  'at-risk':     { label: 'At Risk',     cls: 'badge-risk',  bar: 'bg-red-400',     border: 'border-l-red-400' },
  'in-progress': { label: 'In Progress', cls: 'badge-new',   bar: 'bg-blue-400',    border: 'border-l-blue-400' },
  'done':        { label: 'Complete',    cls: 'badge-done',  bar: 'bg-emerald-600', border: 'border-l-emerald-500' },
  'open':        { label: 'Not Started', cls: 'badge-parked',bar: 'bg-slate-300',   border: 'border-l-slate-300' },
}

const statusBg: Record<string, string> = {
  'on-track': 'bg-emerald-50', 'watch': 'bg-amber-50', 'at-risk': 'bg-red-50',
  'in-progress': 'bg-blue-50', 'done': 'bg-green-50', 'open': 'bg-slate-50',
}

export default function AcquisitionIntegration() {
  const navigate  = useNavigate()
  const { expanded, setExpanded } = useAutoExpand()
  const [addOpen,  setAddOpen]  = useState(false)
  const [addType,  setAddType]  = useState<'Action' | 'Risk' | 'Decision'>('Action')
  const { toasts, toast, remove } = useToast()

  const intRisks       = risks.filter(r => r.category === 'Integration')
  const intDecisions   = decisions.filter(d => d.category === 'Integration')
  const intStakeholders= stakeholders.filter(s => s.function === 'Integration' || s.function === 'Labor Relations')
  const intProject     = projects.find(p => p.id === 'proj-007')
  const intActions     = actions.filter(a => a.relatedProject === 'proj-007')

  const overallProgress = Math.round(
    integrationWorkstreams.reduce((a, w) => a + w.progress, 0) / integrationWorkstreams.length
  )
  const atRiskCount  = integrationWorkstreams.filter(w => w.status === 'at-risk').length
  const watchCount   = integrationWorkstreams.filter(w => w.status === 'watch').length
  const onTrackCount = integrationWorkstreams.filter(w => w.status === 'on-track').length
  const d1Complete   = day1Checklist.filter(i => i.status === 'done' || i.status === 'on-track').length
  const d1AtRisk     = day1Checklist.filter(i => i.status === 'at-risk').length

  const openAdd = (type: 'Action' | 'Risk' | 'Decision') => { setAddType(type); setAddOpen(true) }

  return (
    <div className="space-y-6">
      <ToastContainer toasts={toasts} remove={remove} />
      <QuickAddModal open={addOpen} itemType={addType}
        onClose={() => { setAddOpen(false); toast(`${addType} added to integration programme.`) }} />

      {/* Disclaimer */}
      <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
        <div className="flex items-start gap-3">
          <Info size={16} className="text-amber-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-bold text-amber-800">Illustrative Scenario — Publicly Announced Information Only</p>
            <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
              Built on publicly announced facts (AmEx acquisition of TheFork, June 2026, ~$700M, expected close before end 2026).
              All workstreams, milestones, statuses, and data are fictional. No internal integration plans or confidential information represented.
            </p>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Handshake size={20} className="text-orange-400" />
            Acquisition & Integration Readiness
          </h1>
          <p className="page-subtitle mt-1">AmEx acquisition of TheFork — integration programme overview. <span className="text-amber-600 font-medium">All data illustrative.</span></p>
        </div>
        <div className="flex flex-wrap gap-2 shrink-0">
          <button onClick={() => openAdd('Action')} className="btn-secondary text-xs">
            <Plus size={12} /> Add Action
          </button>
          <button onClick={() => openAdd('Risk')} className="btn-secondary text-xs">
            <Plus size={12} /> Add Risk
          </button>
          <button onClick={() => openAdd('Decision')} className="btn-secondary text-xs">
            <Plus size={12} /> Add Decision
          </button>
        </div>
      </div>

      {/* Deal facts strip */}
      <div className="card p-5 border-l-4 border-l-indigo-400">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Deal Facts</span>
          <span className="badge badge-new">Public Information Only</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Acquirer',       value: 'American Express', sub: 'Proposed acquirer' },
            { label: 'Price',          value: '~$700M',           sub: 'Cash consideration' },
            { label: 'Expected Close', value: 'Before end 2026',  sub: 'Subject to conditions' },
            { label: 'Leadership',     value: 'Continuing',       sub: 'Existing team stays' },
          ].map(f => (
            <div key={f.label}>
              <p className="text-[9.5px] text-slate-400 uppercase tracking-wide font-semibold">{f.label}</p>
              <p className="text-base font-bold text-slate-900 mt-0.5">{f.value}</p>
              <p className="text-[10px] text-slate-400">{f.sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Summary + link to project */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Overall Progress', value: `${overallProgress}%`,  cls: 'text-slate-800' },
          { label: 'On Track',         value: onTrackCount,           cls: 'text-emerald-600' },
          { label: 'Watch',            value: watchCount,             cls: 'text-amber-600' },
          { label: 'At Risk',          value: atRiskCount,            cls: 'text-red-600' },
          { label: 'Day-1 Readiness',  value: `${d1Complete}/${day1Checklist.length}`, cls: d1AtRisk > 0 ? 'text-amber-600' : 'text-emerald-600' },
          { label: 'Open Actions',     value: intActions.filter(a => a.status !== 'done').length, cls: 'text-orange-600' },
        ].map(m => (
          <div key={m.label} className="card p-4">
            <p className={cn('text-2xl font-bold', m.cls)}>{m.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{m.label}</p>
          </div>
        ))}
      </div>

      {/* ── BUSINESS CONTINUITY MONITOR ── */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <p className="section-header mb-0">Business Continuity Monitor</p>
          <span className="badge badge-new">vs. Pre-announcement Baseline (Jun 2026)</span>
        </div>
        <p className="text-xs text-slate-400 mb-3 -mt-1">Is the core business holding during the transition period?</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          {[
            { label: 'Weekly Bookings', value: '1,338k', change: '+8.2% vs baseline', good: true },
            { label: 'Partner Churn', value: '4.8%', change: '↑ +0.3pp since announcement', good: false },
            { label: 'Employee Retention', value: '93.2%', change: '↓ -0.8pp vs baseline', good: false },
            { label: 'Diner NPS', value: '48', change: '→ flat vs baseline', good: true },
          ].map(m => (
            <div key={m.label} className={cn('card p-4 border-l-4',
              m.good ? 'border-l-emerald-400' : 'border-l-amber-400')}>
              <p className="text-xl font-bold text-slate-900">{m.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{m.label}</p>
              <p className={cn('text-[10px] mt-1 font-medium', m.good ? 'text-emerald-600' : 'text-amber-600')}>
                {m.change}
              </p>
            </div>
          ))}
        </div>

        {/* Comms tracker */}
        <div className="card overflow-hidden">
          <div className="px-4 sm:px-5 py-3 border-b border-slate-100 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700">Communications Tracker</span>
            <span className="badge badge-watch">In progress</span>
          </div>
          <div className="tbl-wrap">
            <table className="w-full min-w-[500px]">
              <thead>
                <tr>
                  {['Audience','Message Status','Markets Done','Response'].map(h => (
                    <th key={h} className="tbl-head first:pl-5 last:pr-5">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { audience: 'Employees', status: 'Approved, scheduled', marketsDone: '0/6', response: 'Pending send', cls: 'badge-watch' },
                  { audience: 'Restaurant partners (top 20)', status: 'In legal review', marketsDone: '0/6', response: '—', cls: 'badge-watch' },
                  { audience: 'Diners', status: 'Draft in review', marketsDone: '0/6', response: '—', cls: 'badge-parked' },
                  { audience: 'Press', status: 'Hold', marketsDone: '—', response: '—', cls: 'badge-parked' },
                  { audience: 'Regulators / Works Councils', status: 'Per market — in progress', marketsDone: '2/6', response: 'DACH meeting Sep 18', cls: 'badge-new' },
                ].map(row => (
                  <tr key={row.audience} className="tbl-row">
                    <td className="tbl-cell pl-5 font-medium text-slate-800">{row.audience}</td>
                    <td className="tbl-cell"><span className={cn('badge', row.cls)}>{row.status}</span></td>
                    <td className="tbl-cell">{row.marketsDone}</td>
                    <td className="tbl-cell pr-5 text-slate-500">{row.response}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Link to integration project */}
      {intProject && (
        <div className="card p-4 flex flex-col sm:flex-row sm:items-center gap-4"
          style={{ borderLeft: '4px solid #00856F' }}>
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
              style={{ background: 'rgba(0,133,111,0.1)' }}>
              <FolderKanban size={16} style={{ color: '#00856F' }} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-900">{intProject.name}</p>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <div className="prog-bar w-24 h-1.5">
                  <div className="prog-fill" style={{ width: `${intProject.progress}%`, background: '#00856F' }} />
                </div>
                <span className="text-xs text-slate-500">{intProject.progress}% complete</span>
                <span className="badge badge-watch">{intProject.health}</span>
                {intProject.decisionNeeded && <span className="badge badge-open">Decision needed</span>}
              </div>
            </div>
          </div>
          <button onClick={() => navigate('/projects')}
            className="btn-primary shrink-0 self-start sm:self-center"
            style={{ background: '#00856F' }}>
            View in Projects <ExternalLink size={12} />
          </button>
        </div>
      )}

      {/* Integration actions */}
      {intActions.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <p className="section-header mb-0">Integration Actions ({intActions.length})</p>
            <div className="flex gap-2">
              <button onClick={() => navigate('/actions')}
                className="text-[10.5px] font-medium hover:underline flex items-center gap-1"
                style={{ color: '#00856F' }}>
                View all actions <ExternalLink size={10} />
              </button>
              <button onClick={() => openAdd('Action')} className="btn-secondary text-[11px]">
                <Plus size={11} /> Add
              </button>
            </div>
          </div>
          <div className="card overflow-hidden divide-y divide-slate-50">
            {intActions.map(act => (
              <div key={act.id} className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50/50 transition-colors">
                <ListTodo size={13} className="text-slate-400 mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 leading-snug">{act.title}</p>
                  <div className="flex flex-wrap items-center gap-3 mt-1 text-[10.5px] text-slate-400">
                    <span className="flex items-center gap-1"><User size={9} />{act.owner}</span>
                    <span className={cn('flex items-center gap-1', act.status === 'overdue' && 'text-red-500 font-medium')}>
                      <Clock size={9} />{act.dueDate.slice(5).replace('-','/')}
                      {act.status === 'overdue' && ' · OVERDUE'}
                    </span>
                  </div>
                </div>
                <span className={cn('badge shrink-0',
                  act.status === 'overdue' ? 'badge-risk' : 'badge-watch')}>
                  {act.status === 'overdue' ? 'Overdue' : 'Open'}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Integration workstreams */}
      <section>
        <p className="section-header">Integration Workstreams</p>
        <div className="space-y-3">
          {integrationWorkstreams.map(ws => {
            const scfg  = statusConfig[ws.status] ?? statusConfig['watch']
            const isOpen = expanded === ws.id

            return (
              <div key={ws.id} className={cn('card overflow-hidden border-l-4', scfg.border)}>
                <button
                  onClick={() => setExpanded(isOpen ? null : ws.id)}
                  className="w-full flex items-start gap-3 sm:gap-4 px-4 sm:px-5 py-4 text-left hover:bg-slate-50/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className={cn('badge', scfg.cls)}>{scfg.label}</span>
                      {ws.decisionNeeded && <span className="badge badge-open">Decision needed</span>}
                      <span className="text-[10.5px] text-slate-400">{ws.daysToMilestone}d to milestone</span>
                    </div>
                    <p className="text-sm font-bold text-slate-900 leading-snug">{ws.name}</p>
                    {!isOpen && <p className="text-xs text-slate-500 mt-1 leading-snug line-clamp-1">{ws.description}</p>}
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right hidden sm:block">
                      <p className="text-lg font-bold text-slate-800">{ws.progress}%</p>
                      <p className="text-[9px] text-slate-400">complete</p>
                    </div>
                    {isOpen ? <ChevronUp size={15} className="text-slate-400" /> : <ChevronDown size={15} className="text-slate-400" />}
                  </div>
                </button>

                <div className="px-4 sm:px-5 pb-3">
                  <div className="prog-bar h-1.5">
                    <div className={cn('prog-fill', scfg.bar)} style={{ width: `${ws.progress}%` }} />
                  </div>
                </div>

                {isOpen && (
                  <div className="px-4 sm:px-5 pb-5 border-t border-slate-100 pt-4 space-y-4">
                    <p className="text-sm text-slate-600 leading-relaxed">{ws.description}</p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1">Owner</p>
                        <RecordLink type="person" id={PERSON_ID[ws.owner] ?? PERSON_ID[ws.owner.replace(/\s*\(.*\)/,'').trim()]} label={ws.owner.replace(/\s*\(.*\)/,'').trim()} />
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1">Next Milestone</p>
                        <p className="text-sm font-medium text-slate-700">{ws.nextMilestone}</p>
                        <p className="text-xs text-slate-400">{ws.milestoneDate} · {ws.daysToMilestone}d away</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1">Key Contacts</p>
                        <div className="flex flex-wrap gap-1.5">
                          {ws.keyContacts.map((c, i) => {
                            const cleanName = c.replace(/\s*\(.*\)/,'').trim()
                            const pid = PERSON_ID[c] ?? PERSON_ID[cleanName]
                            return pid
                              ? <RecordLink key={i} type="person" id={pid} label={cleanName} />
                              : <span key={i} className="badge badge-parked text-[10px]">{c}</span>
                          })}
                        </div>
                      </div>
                    </div>

                    <div className={cn('p-3 rounded-lg border', statusBg[ws.status])}>
                      <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-0.5">Status Narrative</p>
                      <p className="text-xs text-slate-700 leading-relaxed font-medium">{ws.ragNarrative}</p>
                    </div>

                    {ws.risks.length > 0 && (
                      <div>
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-2">Risks</p>
                        {ws.risks.map((r, i) => (
                          <div key={i} className="flex gap-2 items-start mb-1.5">
                            <AlertTriangle size={11} className="text-amber-400 mt-0.5 shrink-0" />
                            <p className="text-xs text-slate-600 leading-snug">{r}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Actions</p>
                        <button onClick={() => openAdd('Action')}
                          className="flex items-center gap-1 text-[10.5px] font-medium hover:underline"
                          style={{ color: '#00856F' }}>
                          <Plus size={10} /> Add Action
                        </button>
                      </div>
                      {ws.actions.map((a, i) => (
                        <div key={i} className="flex gap-2 items-start mb-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                          <p className="text-xs text-slate-600 leading-snug">{a}</p>
                        </div>
                      ))}
                    </div>

                    {ws.decisionNeeded && ws.decisionNote && (
                      <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-[10px] font-semibold text-orange-600 uppercase tracking-wide mb-0.5">Decision Required</p>
                            <p className="text-xs text-orange-800">{ws.decisionNote}</p>
                          </div>
                          <button onClick={() => navigate('/decisions')}
                            className="text-orange-400 hover:text-orange-600 shrink-0">
                            <ExternalLink size={13} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </section>

      {/* Day-1 readiness + Risks/Decisions/Stakeholders */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <section>
          <p className="section-header">Day-1 Readiness Checklist</p>
          <p className="text-xs text-slate-400 mb-3 -mt-2">Illustrative categories only. No real completion data.</p>
          <div className="card overflow-hidden divide-y divide-slate-50">
            {day1Checklist.map(item => {
              const scfg = statusConfig[item.status] ?? statusConfig['open']
              return (
                <div key={item.id} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50/50 transition-colors">
                  <span className={cn('badge shrink-0 text-[10px]', scfg.cls)}>{scfg.label}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-700 leading-snug">{item.item}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{item.category}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        <div className="space-y-5">
          <section>
            <div className="flex items-center justify-between mb-3">
              <p className="section-header mb-0">Integration Risks ({intRisks.length})</p>
              <button onClick={() => openAdd('Risk')} className="btn-secondary text-[11px]"><Plus size={11} /></button>
            </div>
            <div className="space-y-2.5">
              {intRisks.map(r => {
                const ecfgMap: Record<string, { cls: string; bg: string }> = {
                  'critical': { cls: 'badge-crit', bg: 'bg-purple-50 border-purple-200' },
                  'at-risk':  { cls: 'badge-risk',  bg: 'bg-red-50 border-red-200' },
                  'watch':    { cls: 'badge-watch', bg: 'bg-amber-50 border-amber-200' },
                }
                const ecfg = ecfgMap[r.exposure] ?? { cls: 'badge-watch', bg: 'bg-amber-50 border-amber-200' }
                return (
                  <div key={r.id} className={cn('card p-4 border', ecfg.bg)}>
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <p className="text-sm font-semibold text-slate-900 leading-snug flex-1">{r.title}</p>
                      <span className={cn('badge shrink-0', ecfg.cls)}>
                        {r.exposure === 'critical' ? 'Critical' : r.exposure === 'at-risk' ? 'High' : 'Medium'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 leading-snug mb-2">{r.description}</p>
                    <div className="flex flex-wrap items-center gap-2 text-[10.5px] text-slate-400">
                      <RecordLink type="person" id={PERSON_ID[r.owner] ?? PERSON_ID[r.owner.replace(/\s*\(.*\)/,'').trim()]} label={r.owner.replace(/\s*\(.*\)/,'').trim()} />
                      <span className="flex items-center gap-1"><Clock size={9} />{r.dueDate.slice(5).replace('-','/')}</span>
                      <RecordLink type="risk" id={r.id} label="View risk →" />
                    </div>
                  </div>
                )
              })}
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-3">
              <p className="section-header mb-0">Integration Decisions ({intDecisions.length})</p>
              <button onClick={() => openAdd('Decision')} className="btn-secondary text-[11px]"><Plus size={11} /></button>
            </div>
            <div className="space-y-2.5">
              {intDecisions.map(d => (
                <div key={d.id} className="card p-4 border-l-4 border-l-orange-400">
                  <p className="text-[9.5px] font-semibold text-orange-600 mb-1">
                    Due {d.deadline.slice(5).replace('-','/')} · {d.daysOpen}d open
                  </p>
                  <p className="text-sm font-semibold text-slate-900 leading-snug mb-1.5">{d.title}</p>
                  <p className="text-xs text-slate-500 leading-snug mb-2">{d.whyNow}</p>
                  <div className="flex items-center gap-2">
                    <button onClick={() => toast(`Decision approved: "${d.title.slice(0,35)}…"`)} className="btn-success text-[11px]">
                      <CheckCircle2 size={11} /> Approve
                    </button>
                    <button onClick={() => navigate('/decisions')}
                      className="btn-secondary text-[11px]">
                      Full Detail <ExternalLink size={10} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <p className="section-header">Integration Stakeholders</p>
            <div className="card overflow-hidden divide-y divide-slate-50">
              {intStakeholders.map(s => (
                <div key={s.id} className="flex items-start gap-3 px-4 py-3.5 hover:bg-slate-50 transition-colors">
                  <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                    s.health === 'needs-attention' ? 'bg-red-100 text-red-700' :
                    s.health === 'watch' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700')}>
                    {s.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <RecordLink type="person" id={PERSON_ID[s.name] ?? s.id} label={s.name} />
                        <p className="text-[10.5px] text-slate-400 mt-0.5">{s.role}</p>
                      </div>
                      <span className={cn('badge shrink-0',
                        s.health === 'needs-attention' ? 'badge-risk' :
                        s.health === 'watch' ? 'badge-watch' : 'badge-new')}>
                        {s.health === 'needs-attention' ? 'Needs Attention' : s.health === 'watch' ? 'Watch' : 'Active'}
                      </span>
                    </div>
                    {s.openIssue && <p className="text-[11px] text-slate-500 mt-1 leading-snug">{s.openIssue}</p>}
                    <p className="text-[10px] text-slate-400 mt-1">Next: {s.nextInteraction.slice(5).replace('-','/')}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
