import { Sun, Clock, AlertCircle, CheckCircle2 } from 'lucide-react'
import { cn } from '../lib/cn'
import { actions, meetings, signals, decisions } from '../data/mockData'

export default function MyDay() {
  const overdue  = actions.filter(a => a.status === 'overdue')
  const urgent   = actions.filter(a => a.status === 'open' && a.priority === 'critical').slice(0, 3)
  const todayMtgs = meetings.slice(0, 3)
  const openDecs = decisions.filter(d => d.status === 'open').slice(0, 3)
  const newSigs  = signals.filter(s => s.status === 'new' || s.status === 'investigating')

  const timeline = [
    { time: '09:00', label: 'ELT Weekly Sync', type: 'meeting', duration: '60m', prep: 'complete' },
    { time: '11:30', label: 'Italy Market Deep Dive', type: 'meeting', duration: '90m', prep: 'incomplete' },
    { time: '13:00', label: 'Lunch', type: 'break', duration: '60m', prep: null },
    { time: '14:30', label: 'Integration Steering Committee #1', type: 'integration', duration: '60m', prep: 'incomplete' },
    { time: '15:45', label: 'ODP Vendor Decision — sign-off needed', type: 'decision', duration: '', prep: null },
    { time: '16:30', label: '1:1 Sofia Martini — Italy recovery', type: 'meeting', duration: '30m', prep: 'not-started' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 border border-orange-200">
          <Sun size={20} className="text-orange-500" />
        </div>
        <div>
          <h1 className="page-title">My Day</h1>
          <p className="page-subtitle">Thursday, 28 August 2026 — Amanda's workbench</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2">
          <p className="section-header">Today's Calendar</p>
          <div className="card overflow-hidden">
            {timeline.map((item, i) => (
              <div key={i} className={cn('flex items-start gap-4 px-4 sm:px-5 py-4 border-b border-slate-50 last:border-0',
                item.type === 'break' && 'opacity-40')}>
                <div className="w-12 shrink-0">
                  <p className="text-xs font-bold text-slate-700">{item.time}</p>
                  {item.duration && <p className="text-[9px] text-slate-400">{item.duration}</p>}
                </div>
                <div className={cn('flex-1 flex items-center gap-3 pl-3 border-l-2',
                  item.type === 'meeting' ? 'border-indigo-300' :
                  item.type === 'integration' ? 'border-orange-400' :
                  item.type === 'decision' ? 'border-amber-400' : 'border-slate-200')}>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-0.5">
                      {item.type === 'integration' && <span className="badge badge-open">Integration</span>}
                      {item.type === 'decision' && <span className="badge badge-risk">Decision needed</span>}
                      {item.type === 'meeting' && item.prep && (
                        <span className={cn('badge',
                          item.prep === 'complete' ? 'badge-done' :
                          item.prep === 'incomplete' ? 'badge-watch' : 'badge-parked')}>
                          {item.prep === 'complete' ? '✓ Ready' : item.prep === 'incomplete' ? '⚠ Incomplete' : 'Not started'}
                        </span>
                      )}
                    </div>
                    <p className={cn('text-sm font-medium', item.type === 'break' ? 'text-slate-400' : 'text-slate-800')}>{item.label}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="card p-5">
            <p className="section-header">Daily Briefing</p>
            <div className="space-y-2.5">
              {[
                { icon: '🔴', text: `${overdue.length} actions overdue — oldest from Aug 15` },
                { icon: '⚡', text: 'ODP vendor decision deadline: tomorrow' },
                { icon: '🤝', text: 'Integration steering committee today at 14:30 — prep incomplete' },
                { icon: '🇮🇹', text: 'Italy recovery plan + budget decision at 11:30' },
                { icon: '📊', text: 'Budget +4.3% over FY forecast — T&E driver' },
                { icon: '👥', text: '28% of Product & Engineering showing transition anxiety — 3 at-risk leaders to brief' },
                { icon: '🟢', text: 'France NPS up 4pts — share with team' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-slate-600">
                  <span className="shrink-0">{item.icon}</span>
                  <span className="leading-snug">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-5">
            <p className="section-header">Priority Queue</p>
            <div className="space-y-2.5">
              {[...overdue, ...urgent].slice(0, 5).map(act => (
                <div key={act.id} className="flex items-start gap-2">
                  <div className={cn('w-1.5 h-1.5 rounded-full mt-1.5 shrink-0',
                    act.status === 'overdue' ? 'bg-red-400' : act.priority === 'critical' ? 'bg-purple-400' : 'bg-amber-400')} />
                  <p className="text-xs text-slate-700 leading-snug">{act.title}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-5">
            <p className="section-header">Decisions Awaiting</p>
            <div className="space-y-2.5">
              {openDecs.map(dec => (
                <div key={dec.id} className="p-3 bg-orange-50 rounded-lg border border-orange-100">
                  <p className="text-[11px] font-medium text-orange-800 leading-snug">{dec.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="badge badge-parked text-[9.5px]">{dec.category}</span>
                    <p className="text-[10px] text-orange-600">Due: {dec.deadline.slice(5).replace('-','/')}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
