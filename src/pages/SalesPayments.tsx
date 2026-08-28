import { TrendingUp, TrendingDown, CreditCard, Users, ShoppingCart, AlertTriangle } from 'lucide-react'
import { cn } from '../lib/cn'
import { salesPaymentsData } from '../data/mockData'
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts'

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    'on-track': 'badge-track', 'watch': 'badge-watch', 'at-risk': 'badge-risk',
  }
  const labels: Record<string, string> = {
    'on-track': 'On Track', 'watch': 'Watch', 'at-risk': 'At Risk',
  }
  return <span className={cn('badge', map[status] ?? 'badge-parked')}>{labels[status] ?? status}</span>
}

export default function SalesPayments() {
  const sp = salesPaymentsData

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title flex items-center gap-2">
          <CreditCard size={20} className="text-indigo-500" />
          Sales & Payments Operations
        </h1>
        <p className="page-subtitle">Restaurant partner acquisition, retention, commission revenue, and payments health. All figures illustrative.</p>
      </div>

      {/* Top-level metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'New Partners QTD',   value: sp.partnerAcquisition.totalNewQTD.toLocaleString(), sub: `vs ${sp.partnerAcquisition.targetQTD.toLocaleString()} target`, cls: 'text-slate-800' },
          { label: 'Global Churn Rate',  value: `${sp.partnerRetention.globalChurn}%`, sub: `threshold: ${sp.partnerRetention.threshold}%`, cls: sp.partnerRetention.globalChurn > sp.partnerRetention.threshold ? 'text-amber-600' : 'text-emerald-600' },
          { label: 'Commission Rev QTD', value: sp.revenue.totalCommissionQTD, sub: `${sp.revenue.variance} vs target`, cls: 'text-slate-800' },
          { label: 'Global Take Rate',   value: sp.revenue.globalTakeRate, sub: 'trend: stable', cls: 'text-slate-800' },
        ].map(m => (
          <div key={m.label} className="card p-4">
            <p className={cn('text-xl font-bold', m.cls)}>{m.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{m.label}</p>
            <p className="text-[10px] text-slate-400">{m.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* Partner acquisition by market */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Users size={15} className="text-slate-500" />
            <h3 className="text-sm font-semibold text-slate-800">Partner Acquisition by Market</h3>
            <span className="ml-auto badge badge-watch">{sp.partnerAcquisition.progress}% of QTD target</span>
          </div>
          <div className="space-y-3">
            {sp.partnerAcquisition.byMarket.map(m => {
              const pct = Math.round((m.new / m.target) * 100)
              return (
                <div key={m.market}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-700 w-10">{m.market}</span>
                      <StatusBadge status={m.status} />
                    </div>
                    <span className="text-xs text-slate-500">{m.new.toLocaleString()} / {m.target.toLocaleString()}</span>
                  </div>
                  <div className="prog-bar h-2">
                    <div className={cn('prog-fill',
                      m.status === 'on-track' ? 'bg-emerald-500' :
                      m.status === 'at-risk'  ? 'bg-red-400' : 'bg-amber-400'
                    )} style={{ width: `${Math.min(pct, 100)}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Payments success rate trend */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-1">
            <CreditCard size={15} className="text-slate-500" />
            <h3 className="text-sm font-semibold text-slate-800">Payments Success Rate Trend</h3>
            <span className="ml-auto badge badge-watch">Global avg {sp.payments.globalSuccessRate}%</span>
          </div>
          <p className="text-xs text-slate-400 mb-4">Target: {sp.payments.target}%</p>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={sp.payments.trend} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gPayRate" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366F1" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 10 }} stroke="#94a3b8" tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" tickLine={false} axisLine={false}
                domain={[94, 99]} tickFormatter={v => `${v}%`} />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #e2e8f0' }}
                formatter={(v: number) => [`${v}%`]} />
              <ReferenceLine y={sp.payments.target} stroke="#10B981" strokeDasharray="4 2" label={{ value: 'Target', position: 'right', fontSize: 9, fill: '#10B981' }} />
              <Area type="monotone" dataKey="rate" name="Success Rate" stroke="#6366F1" fill="url(#gPayRate)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Payments health by market */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <CreditCard size={15} className="text-slate-500" />
          <h3 className="text-sm font-semibold text-slate-800">Payments Health by Market</h3>
        </div>
        <div className="tbl-wrap">
          <table className="w-full min-w-[500px]">
            <thead>
              <tr>
                {['Market', 'Success Rate', 'vs Target', 'Chargeback Rate', 'vs Target', 'Status'].map(h => (
                  <th key={h} className="tbl-head first:pl-4 last:pr-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sp.payments.byMarket.map(m => (
                <tr key={m.market} className="tbl-row">
                  <td className="tbl-cell pl-4 font-semibold">{m.market}</td>
                  <td className="tbl-cell">
                    <span className={cn('font-semibold',
                      m.successRate >= 98 ? 'text-emerald-600' :
                      m.successRate >= 96 ? 'text-amber-600' : 'text-red-600')}>
                      {m.successRate}%
                    </span>
                  </td>
                  <td className="tbl-cell">
                    <span className={cn('text-xs font-medium',
                      m.successRate >= sp.payments.target ? 'text-emerald-600' : 'text-red-500')}>
                      {m.successRate >= sp.payments.target ? '✓' : `−${(sp.payments.target - m.successRate).toFixed(1)}%`}
                    </span>
                  </td>
                  <td className="tbl-cell">
                    <span className={cn('font-medium',
                      m.chargeback <= 0.15 ? 'text-emerald-600' :
                      m.chargeback <= 0.25 ? 'text-amber-600' : 'text-red-600')}>
                      {m.chargeback}%
                    </span>
                  </td>
                  <td className="tbl-cell">
                    <span className={cn('text-xs font-medium',
                      m.chargeback <= sp.payments.chargebackTarget ? 'text-emerald-600' : 'text-red-500')}>
                      {m.chargeback <= sp.payments.chargebackTarget ? '✓' : `+${(m.chargeback - sp.payments.chargebackTarget).toFixed(2)}%`}
                    </span>
                  </td>
                  <td className="tbl-cell pr-4"><StatusBadge status={m.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* Partner churn by market */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={15} className="text-slate-500" />
            <h3 className="text-sm font-semibold text-slate-800">Partner Churn by Market</h3>
            <span className="ml-auto text-xs text-slate-400">Threshold: {sp.partnerRetention.threshold}%</span>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={sp.partnerRetention.byMarket} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="market" tick={{ fontSize: 10 }} stroke="#94a3b8" tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" tickLine={false} axisLine={false} tickFormatter={v => `${v}%`} />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #e2e8f0' }} formatter={(v: number) => [`${v}%`, 'Churn']} />
              <ReferenceLine y={sp.partnerRetention.threshold} stroke="#F59E0B" strokeDasharray="4 2" />
              <Bar dataKey="churn" name="Churn Rate" radius={[4, 4, 0, 0]}
                fill="#6366F1"
                label={{ position: 'top', fontSize: 9, formatter: (v: number) => `${v}%` }} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Booking conversion + B2B */}
        <div className="space-y-4">
          <div className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-800">Booking → Seated Conversion</h3>
                <p className="text-xs text-slate-400 mt-0.5">Global rate vs {sp.bookingConversion.target}% target</p>
              </div>
              <StatusBadge status={sp.bookingConversion.status} />
            </div>
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-3xl font-bold text-slate-900">{sp.bookingConversion.globalRate}%</span>
              <span className={cn('text-sm font-medium', sp.bookingConversion.globalRate >= sp.bookingConversion.target ? 'text-emerald-600' : 'text-amber-600')}>
                {sp.bookingConversion.globalRate >= sp.bookingConversion.target ? '✓ On target' : `−${(sp.bookingConversion.target - sp.bookingConversion.globalRate).toFixed(1)}% below target`}
              </span>
            </div>
            <ResponsiveContainer width="100%" height={60}>
              <LineChart data={sp.bookingConversion.trend} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="month" tick={{ fontSize: 9 }} stroke="#94a3b8" tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ fontSize: 10, borderRadius: 6 }} formatter={(v: number) => [`${v}%`]} />
                <Line type="monotone" dataKey="rate" stroke="#6366F1" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <ShoppingCart size={15} className="text-slate-500" />
              <h3 className="text-sm font-semibold text-slate-800">TheFork Manager (B2B)</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Active Accounts', value: sp.b2bManager.totalActiveAccounts.toLocaleString(), sub: `vs ${sp.b2bManager.targetAccounts.toLocaleString()} target` },
                { label: 'Adoption Rate', value: sp.b2bManager.adoptionRate, sub: 'of partner portfolio' },
                { label: 'Upsell Pipeline', value: sp.b2bManager.upsellPipeline, sub: 'estimated ARR' },
                { label: 'B2B NPS', value: sp.b2bManager.npsB2B, sub: 'restaurant operators' },
              ].map(m => (
                <div key={m.label} className="bg-slate-50 rounded-xl p-3">
                  <p className="text-base font-bold text-slate-800">{m.value}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{m.label}</p>
                  <p className="text-[9.5px] text-slate-400">{m.sub}</p>
                </div>
              ))}
            </div>
            <div className="mt-3 p-2.5 bg-emerald-50 rounded-lg border border-emerald-100">
              <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wide mb-0.5">Expansion Opportunity</p>
              <p className="text-xs text-emerald-800">{sp.b2bManager.expansionOpportunity}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
