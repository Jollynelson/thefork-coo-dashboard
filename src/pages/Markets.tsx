import { useState } from 'react'
import { TrendingDown, TrendingUp, AlertTriangle, ChevronDown, ChevronUp, MessageCircle } from 'lucide-react'
import { cn } from '../lib/cn'
import { markets, marketEnrichment, CMs } from '../data/mockData'
import { useAutoExpand } from '../hooks/useAutoExpand'
import RecordLink from '../components/RecordLink'

export default function Markets() {
  const { expanded, setExpanded } = useAutoExpand()

  const toggle = (id: string) => setExpanded(prev => prev === id ? null : id)

  return (
    <div className="space-y-5">
      <div>
        <h1 className="page-title">Market Control Center</h1>
        <p className="page-subtitle">Operational health, KPIs, CM commentary, and signals across all {markets.length} markets.</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'On Track', value: markets.filter(m => m.status === 'on-track').length, cls: 'text-emerald-600' },
          { label: 'Watch',    value: markets.filter(m => m.status === 'watch').length,    cls: 'text-amber-600' },
          { label: 'At Risk',  value: markets.filter(m => m.status === 'at-risk').length,  cls: 'text-red-600' },
        ].map(m => (
          <div key={m.label} className="card p-4">
            <p className={cn('text-2xl font-bold', m.cls)}>{m.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{m.label}</p>
          </div>
        ))}
      </div>

      {/* Market cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {markets.map(m => {
          const isSelected  = expanded === m.id
          const borderColor = m.status === 'on-track' ? 'border-l-emerald-400' :
                              m.status === 'at-risk'  ? 'border-l-red-400' : 'border-l-amber-400'
          const enrichment  = marketEnrichment[m.id]
          const cm          = CMs[m.cmId as keyof typeof CMs]

          return (
            <div key={m.id} id={`record-${m.id}`}>
              <button
                onClick={() => toggle(m.id)}
                className={cn(
                  'card w-full text-left p-4 sm:p-5 border-l-4 hover:shadow-md active:scale-[0.99] transition-all',
                  borderColor, isSelected && 'ring-2 ring-indigo-400'
                )}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">{m.flag}</span>
                    <div>
                      <p className="text-base font-bold text-slate-900">{m.name}</p>
                      <p className="text-[10.5px] text-slate-400">{m.region}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={cn('badge',
                      m.status === 'on-track' ? 'badge-track' :
                      m.status === 'at-risk'  ? 'badge-risk'  : 'badge-watch')}>
                      {m.status === 'on-track' ? 'On Track' : m.status === 'at-risk' ? 'At Risk' : 'Watch'}
                    </span>
                    {isSelected ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="text-center">
                    <p className={cn('text-xl font-bold',
                      m.healthScore >= 80 ? 'text-emerald-600' :
                      m.healthScore >= 70 ? 'text-amber-600' : 'text-red-500')}>
                      {m.healthScore}
                    </p>
                    <p className="text-[9px] text-slate-400 uppercase tracking-wide font-semibold mt-0.5">Health</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <p className="text-xl font-bold text-slate-800">{m.nps}</p>
                      <span className={cn('text-sm', m.npsChange >= 0 ? 'text-emerald-500' : 'text-red-500')}>
                        {m.npsChange >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                      </span>
                    </div>
                    <p className="text-[9px] text-slate-400 uppercase tracking-wide font-semibold mt-0.5">NPS</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold text-slate-800">{m.keyMetricValue}</p>
                    <p className="text-[9px] text-slate-400 uppercase tracking-wide font-semibold mt-0.5">Bookings</p>
                  </div>
                </div>

                {/* Revenue row */}
                {enrichment && (
                  <div className="flex items-center justify-between text-xs mb-3 p-2 bg-slate-50 rounded-lg">
                    <span className="text-slate-500">Revenue QTD</span>
                    <span className="font-semibold text-slate-800">{enrichment.revenueQTD}</span>
                    <span className={cn('font-semibold', enrichment.revenueVariance.startsWith('+') ? 'text-emerald-600' : 'text-red-500')}>
                      {enrichment.revenueVariance} vs target
                    </span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-50 rounded-lg p-2.5">
                    <p className="text-[9px] text-slate-400 uppercase font-semibold mb-1">Restaurant Partners</p>
                    <p className="font-semibold text-slate-700">{m.restaurantPartners.toLocaleString()}</p>
                    <p className={cn('text-[10px] mt-0.5', m.restaurantChurn > 5 ? 'text-red-500' : 'text-slate-400')}>
                      {m.restaurantChurn}% churn
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-2.5">
                    <p className="text-[9px] text-slate-400 uppercase font-semibold mb-1">Monthly Diners</p>
                    <p className="font-semibold text-slate-700">{(m.diners / 1000).toFixed(0)}k</p>
                    <p className={cn('text-[10px] mt-0.5 font-medium', m.npsChange >= 0 ? 'text-emerald-500' : 'text-red-500')}>
                      NPS {m.npsChange >= 0 ? '+' : ''}{m.npsChange} MoM
                    </p>
                  </div>
                </div>

                {m.escalations > 0 && (
                  <div className="mt-3 flex items-center gap-1.5 pt-3 border-t border-slate-100">
                    <AlertTriangle size={12} className="text-red-400" />
                    <span className="text-xs text-red-600 font-medium">{m.escalations} escalation{m.escalations > 1 ? 's' : ''}</span>
                  </div>
                )}
              </button>

              {/* Expanded detail */}
              {isSelected && (
                <div className="card mt-2 p-4 sm:p-5 animate-fade-in space-y-4">
                  {/* CM header + commentary */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">{m.flag}</span>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{m.name} — Country Manager Update</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <MessageCircle size={10} className="text-slate-400" />
                          {cm ? (
                            <RecordLink type="person" id={cm.id} label={cm.name} />
                          ) : (
                            <span className="text-xs text-slate-500">{m.countryManager}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    {enrichment?.cmCommentary && (
                      <blockquote className="border-l-4 border-slate-300 pl-3 py-1 bg-slate-50 rounded-r-lg">
                        <p className="text-sm text-slate-700 italic leading-relaxed">"{enrichment.cmCommentary}"</p>
                        {cm && (
                          <p className="text-[10px] text-slate-400 mt-1">— {cm.name}, {m.name} CM — Aug 26</p>
                        )}
                      </blockquote>
                    )}
                  </div>

                  {/* Key metrics grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { label: 'Annual Budget',  value: `€${(m.budget.annual/1e6).toFixed(1)}M` },
                      { label: 'Actual YTD',     value: `€${(m.budget.actual/1e6).toFixed(1)}M` },
                      { label: 'Revenue QTD',    value: enrichment?.revenueQTD ?? m.commissionRevenue, sub: enrichment ? `Target: ${enrichment.revenueTarget} (${enrichment.revenueVariance})` : '' },
                      { label: 'Headcount',      value: `${m.headcount.current}/${m.headcount.planned}`, sub: `${m.headcount.open} open roles` },
                    ].map(item => (
                      <div key={item.label} className="bg-slate-50 rounded-xl p-3">
                        <p className="text-[9.5px] text-slate-400 uppercase tracking-wide font-semibold">{item.label}</p>
                        <p className="text-base font-bold text-slate-800 mt-1">{item.value}</p>
                        {(item as any).sub && <p className="text-[9px] text-slate-400">{(item as any).sub}</p>}
                      </div>
                    ))}
                  </div>

                  {/* Risks */}
                  {m.risks.length > 0 && (
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase tracking-wide font-semibold mb-2">Local Risks</p>
                      {m.risks.map((r, i) => (
                        <div key={i} className="flex items-start gap-2 p-2.5 bg-red-50 rounded-lg border border-red-100 mb-2">
                          <AlertTriangle size={12} className="text-red-400 mt-0.5 shrink-0" />
                          <p className="text-xs text-red-700 leading-snug">{r}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Active projects as clickable links */}
                  {m.projects.length > 0 && (
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase tracking-wide font-semibold mb-2">Active Projects</p>
                      <div className="flex flex-wrap gap-2">
                        {m.projects.map((proj: any, i: number) => {
                          const name      = typeof proj === 'string' ? proj : proj.name
                          const projectId = typeof proj === 'string' ? null : proj.projectId
                          return projectId
                            ? <RecordLink key={i} type="project" id={projectId} label={name} />
                            : <span key={i} className="badge badge-new">{name}</span>
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Cross-market comparison table */}
      <section>
        <p className="section-header">Cross-Market Comparison</p>
        <div className="card overflow-hidden">
          <div className="tbl-wrap">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr>
                  {['Market','Health','NPS (Δ)','Bookings','Revenue QTD','Churn','Payments','Status'].map(h => (
                    <th key={h} className="tbl-head first:pl-5 last:pr-5">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {markets.map(m => {
                  const enriched = marketEnrichment[m.id]
                  return (
                    <tr key={m.id} className="tbl-row cursor-pointer" onClick={() => toggle(m.id)}>
                      <td className="tbl-cell pl-5">
                        <div className="flex items-center gap-2">
                          <span>{m.flag}</span>
                          <span className="font-medium text-slate-800">{m.name}</span>
                        </div>
                      </td>
                      <td className="tbl-cell">
                        <span className={cn('text-sm font-bold',
                          m.healthScore >= 80 ? 'text-emerald-600' :
                          m.healthScore >= 70 ? 'text-amber-600' : 'text-red-500')}>
                          {m.healthScore}
                        </span>
                      </td>
                      <td className="tbl-cell">
                        <span className="font-medium">{m.nps}</span>
                        <span className={cn('ml-1 text-xs', m.npsChange >= 0 ? 'text-emerald-500' : 'text-red-500')}>
                          {m.npsChange >= 0 ? '+' : ''}{m.npsChange}
                        </span>
                      </td>
                      <td className="tbl-cell">{m.keyMetricValue} <span className={cn('text-xs', m.keyMetricChange.startsWith('+') ? 'text-emerald-500' : 'text-red-500')}>{m.keyMetricChange}</span></td>
                      <td className="tbl-cell">
                        <span className="font-medium">{enriched?.revenueQTD ?? m.commissionRevenue}</span>
                        {enriched && <span className={cn('ml-1 text-xs', enriched.revenueVariance.startsWith('+') ? 'text-emerald-500' : 'text-red-500')}>{enriched.revenueVariance}</span>}
                      </td>
                      <td className="tbl-cell">
                        <span className={cn('font-medium', m.restaurantChurn > 5 ? 'text-red-500' : 'text-slate-600')}>
                          {m.restaurantChurn}%
                        </span>
                      </td>
                      <td className="tbl-cell">{m.paymentsSuccessRate}</td>
                      <td className="tbl-cell pr-5">
                        <span className={cn('badge',
                          m.status === 'on-track' ? 'badge-track' :
                          m.status === 'at-risk'  ? 'badge-risk' : 'badge-watch')}>
                          {m.status === 'on-track' ? 'On Track' : m.status === 'at-risk' ? 'At Risk' : 'Watch'}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  )
}
