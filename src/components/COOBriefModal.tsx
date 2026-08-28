import { useState } from 'react'
import { X, Download, Sparkles, Loader2 } from 'lucide-react'

interface Props { open: boolean; onClose: () => void }

export default function COOBriefModal({ open, onClose }: Props) {
  const [generating, setGenerating] = useState(false)
  const [generated,  setGenerated]  = useState(false)

  const handleGenerate = () => {
    setGenerating(true)
    setTimeout(() => { setGenerating(false); setGenerated(true) }, 1800)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[300] flex items-start justify-center bg-black/50 backdrop-blur-sm p-4 pt-6 sm:pt-10 overflow-y-auto">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-100 sticky top-0 bg-white rounded-t-2xl z-10">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-orange-400" />
            <h2 className="text-sm font-bold text-slate-900">COO Brief Generator</h2>
          </div>
          <div className="flex items-center gap-2">
            {generated && (
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors">
                <Download size={12} /> Export PDF
              </button>
            )}
            <button onClick={() => { onClose(); setGenerated(false) }} className="text-slate-400 hover:text-slate-700 p-1">
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="px-5 sm:px-6 py-5">
          {!generated ? (
            <div className="text-center py-10">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 border border-slate-200 mx-auto mb-4">
                <Sparkles size={24} className="text-orange-400" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">Generate COO Brief</h3>
              <p className="text-sm text-slate-500 mb-6 max-w-sm mx-auto leading-relaxed">
                Compiles decisions, priorities, market health, sales & payments KPIs, risks, stakeholder updates, and integration readiness into one executive-ready brief.
              </p>
              <button onClick={handleGenerate} disabled={generating}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 disabled:opacity-60 transition-colors">
                {generating ? <><Loader2 size={14} className="animate-spin" />Generating brief…</> : <><Sparkles size={14} />Generate COO Brief</>}
              </button>
            </div>
          ) : (
            <div className="space-y-5 text-sm">
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-[10.5px] text-amber-700 font-medium tracking-wide uppercase text-center">
                PROTOTYPE — ILLUSTRATIVE DATA ONLY · Monday 28 August 2026
              </div>

              {[
                {
                  title: '1. Executive Summary', icon: '⚡',
                  content: 'Operations health 87/100. Italy partner churn critical — recovery plan awaiting COO budget approval today. Two ODP and integration decisions are time-sensitive. T&E budget +4.3% over plan. Integration programme at 42% overall readiness with systems workstream at risk. Payments globally 97.2% success rate — below 98% target, Italy at 95.4%.',
                },
                {
                  title: '2. Decisions Required (2 today)', icon: '✅',
                  items: [
                    'ODP Technology Partner — deadline TOMORROW (Aug 29). Recommendation: TechVendor A. Blocks Q4 delivery.',
                    'Italy Re-engagement Budget €180k — deadline Aug 30. Recommendation: Approve €90k phased.',
                  ],
                },
                {
                  title: '3. Strategic Priorities', icon: '🎯',
                  items: [
                    '✓ On Track (3): Partner network growth, Loyalty revamp, PCI compliance',
                    '⚠ Watch (2): Dynamic pricing (Spain go-live pending), Payments improvement (Italy gap)',
                    '✗ At Risk (1): Operations Data Platform — vendor decision blocking Q4',
                  ],
                },
                {
                  title: '4. Operations', icon: '⚙️',
                  content: 'Global health 87/100. Italy critical — churn 6.9% vs 5.8% threshold, 3rd consecutive month declining NPS. UK & France NPS trending up. Booking conversion at 68.4% vs 72% target — watch.',
                },
                {
                  title: '5. Sales & Payments', icon: '💳',
                  items: [
                    'Partner acquisition: 1,193 new QTD vs 1,400 target (85%). Italy significantly behind (88 vs 180).',
                    'Global churn: 4.8% vs 4.5% threshold. Italy 6.9% critical.',
                    'Payments: 97.2% global success rate (target 98%). Italy 95.4% — below threshold, PSP fix in progress.',
                    'B2B (TheFork Manager): 88.8% adoption. UK upsell pipeline at 140% of target.',
                  ],
                },
                {
                  title: '6. Markets', icon: '🌍',
                  items: [
                    '🟢 On Track: France (91), UK & Ireland (82), Rest (77)',
                    '🟡 Watch: Spain & Iberia (79), DACH & Nordics (71) — works council active',
                    '🔴 At Risk: Italy (63) — churn crisis, 2 escalations, NPS −8',
                  ],
                },
                {
                  title: '7. Financials', icon: '💰',
                  content: 'FY forecast €46.1M (+€1.9M over plan, +4.3%). T&E +€2.3M over forecast. Integration programme €280k YTD of €850k budget. Headcount freeze decision pending.',
                },
                {
                  title: '8. Risks', icon: '⚠️',
                  items: [
                    'CRITICAL: Italy partner churn (recovery plan submitted, budget decision today)',
                    'HIGH: ODP vendor delay (decision deadline tomorrow)',
                    'HIGH: Italy payments below threshold (PSP escalation in progress)',
                    'HIGH: Senior talent retention during transition (3 at-risk leaders identified)',
                  ],
                },
                {
                  title: '9. Stakeholders', icon: '👥',
                  items: [
                    'David Kaye (Tripadvisor Board) — 41 days no interaction. Pre-Board meeting prep needed.',
                    'Sofia Martini — Italy crisis support needed. Budget decision awaited.',
                    'AmEx Integration Lead — Joint steering meeting not yet established. COO to own.',
                  ],
                },
                {
                  title: '10. Projects', icon: '🚀',
                  items: [
                    'AT RISK: Restaurant Onboarding 2.0 (scope 30% over, 2 FTE gap)',
                    'BEHIND: Operations Data Platform (vendor decision blocking)',
                    'ON TRACK: Dynamic Pricing, Loyalty Revamp, PCI Compliance (all within 30 days of milestones)',
                  ],
                },
                {
                  title: '11. Integration & Acquisition Readiness', icon: '🤝',
                  content: 'Overall progress 42%. Systems & data workstream at risk — sequencing decision needed by Sep 12. Partner communications timing decision urgent (top-50 partners asking questions). DACH works council consultation begins Sep 18. Day-1 readiness: 4/10 items complete or on track, 1 at risk (systems).',
                },
                {
                  title: '12. Next Week', icon: '📅',
                  items: [
                    'Aug 29 — ODP vendor decision deadline',
                    'Aug 30 — Italy recovery plan meeting + budget decision',
                    'Sep 1 — Headcount freeze decision deadline',
                    'Sep 5 — Partner communications decision (top-50 outreach)',
                    'Sep 7 — PCI-DSS v4 certification',
                    'Sep 12 — Integration systems sequencing decision',
                  ],
                },
              ].map(section => (
                <div key={section.title} className="border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span>{section.icon}</span>
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">{section.title}</h4>
                  </div>
                  {section.content && <p className="text-sm text-slate-600 leading-relaxed">{section.content}</p>}
                  {section.items && (
                    <ul className="space-y-1">
                      {section.items.map((item, i) => (
                        <li key={i} className="text-sm text-slate-600 leading-relaxed flex gap-2">
                          <span className="text-slate-300 shrink-0">·</span>{item}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
