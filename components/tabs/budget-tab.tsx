'use client'

import { useEffect } from 'react'
import { Bank, ChartBar, CurrencyDollar, Warning, HandCoins, MaskHappy } from '@phosphor-icons/react'
import { useGuideStore } from '@/store/guide-store'
import { ErrorBanner } from '@/components/error-banner'
import { fetchTab } from '@/lib/fetch-tab'
import type { BudgetData } from '@/lib/types'

const TIER_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Budget: { bg: 'bg-[var(--green)]/10', text: 'text-[var(--green)]', border: 'border-[var(--green)]/25' },
  'Mid-range': { bg: 'bg-[var(--primary)]/10', text: 'text-[var(--primary)]', border: 'border-[var(--primary)]/25' },
  Comfort: { bg: 'bg-[var(--purple)]/10', text: 'text-[var(--purple)]', border: 'border-[var(--purple)]/25' },
}

function SectionHeader({ icon, label, color }: { icon: React.ReactNode; label: string; color: string }) {
  return (
    <div className={`flex items-center gap-2 text-sm font-bold ${color}`}>
      {icon}
      {label}
    </div>
  )
}

export function BudgetTab() {
  const country = useGuideStore((s) => s.country)
  const tabState = useGuideStore((s) => s.tabs.budget)
  const setTabLoading = useGuideStore((s) => s.setTabLoading)
  const setTabData = useGuideStore((s) => s.setTabData)
  const setTabError = useGuideStore((s) => s.setTabError)

  useEffect(() => {
    if (tabState.status !== 'idle') return
    setTabLoading('budget')
    fetchTab('budget', country)
      .then((data) => setTabData('budget', data as BudgetData))
      .catch((e: Error) => setTabError('budget', e.message))
  }, [country, tabState.status, setTabLoading, setTabData, setTabError])

  if (tabState.status === 'loading') return null
  if (tabState.status === 'error') {
    return (
      <ErrorBanner
        message={tabState.error ?? 'Failed to load budget guide'}
        onRetry={() => setTabError('budget', '')}
      />
    )
  }
  if (tabState.status !== 'success' || !tabState.data) return null

  const data = tabState.data as BudgetData

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-[var(--primary)]/30 bg-[var(--primary)]/10 p-5 space-y-1">
        <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide">
          {data.currency.code} &mdash; {data.currency.name}
        </p>
        <p className="text-2xl font-bold text-[var(--primary)]">1 USD = {data.currency.usdRate}</p>
        {data.currency.notes && (
          <p className="text-xs text-[var(--text-secondary)] mt-1">{data.currency.notes}</p>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3">
        {data.dailyTiers.map((tier) => {
          const c = TIER_COLORS[tier.tier] ?? TIER_COLORS['Mid-range']
          return (
            <div
              key={tier.tier}
              className={`rounded-xl border ${c.border} ${c.bg} p-3 space-y-1`}
            >
              <p className={`text-xs font-bold uppercase tracking-wide ${c.text}`}>{tier.tier}</p>
              <p className={`text-xl font-bold ${c.text}`}>${tier.usdPerDay}/day</p>
              <p className="text-xs text-[var(--text-muted)]">{tier.includes}</p>
            </div>
          )
        })}
      </div>

      <div className="space-y-2">
        <SectionHeader
          icon={<ChartBar size={16} weight="fill" />}
          label="Typical Costs"
          color="text-[var(--text-secondary)]"
        />
        <div className="rounded-xl border border-[var(--border)] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[var(--surface-alt)] border-b border-[var(--border)]">
                <th className="text-left px-4 py-2 text-xs font-semibold text-[var(--text-muted)]">Item</th>
                <th className="text-right px-3 py-2 text-xs font-semibold text-[var(--text-muted)]">Low</th>
                <th className="text-right px-3 py-2 text-xs font-semibold text-[var(--text-muted)]">High</th>
              </tr>
            </thead>
            <tbody>
              {data.typicalCosts.map((row, i) => (
                <tr
                  key={i}
                  className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--surface-alt)] transition-colors"
                >
                  <td className="px-4 py-2.5 text-[var(--text-primary)]">
                    <div>{row.item}</div>
                    {row.tip && <div className="text-xs text-[var(--amber)] mt-0.5">{row.tip}</div>}
                  </td>
                  <td className="px-3 py-2.5 text-right text-[var(--green)] font-medium">{row.low}</td>
                  <td className="px-3 py-2.5 text-right text-[var(--text-secondary)] font-medium">{row.high}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 space-y-2">
        <SectionHeader
          icon={<Bank size={16} weight="fill" />}
          label="ATM & Cash"
          color="text-[var(--amber)]"
        />
        <p className="text-sm text-[var(--text-secondary)]">{data.atmAdvice}</p>
      </div>

      {data.bargaining.applicable && (
        <div className="rounded-xl border border-[var(--green)]/25 bg-[var(--green)]/5 p-4 space-y-2">
          <SectionHeader
            icon={<HandCoins size={16} weight="fill" />}
            label="Bargaining"
            color="text-[var(--green)]"
          />
          <p className="text-sm text-[var(--text-secondary)]">
            <span className="font-semibold text-[var(--text-primary)]">Where: </span>
            {data.bargaining.where}
          </p>
          <p className="text-sm text-[var(--text-secondary)]">{data.bargaining.howTo}</p>
        </div>
      )}

      {data.scams.length > 0 && (
        <div className="space-y-2">
          <SectionHeader
            icon={<MaskHappy size={16} weight="fill" />}
            label="Common Scams"
            color="text-[var(--red)]"
          />
          {data.scams.map((s, i) => (
            <div
              key={i}
              className="rounded-xl border border-[var(--red)]/20 bg-[var(--red)]/5 p-4 space-y-1"
            >
              <p className="text-sm font-bold text-[var(--text-primary)]">{s.name}</p>
              <p className="text-xs text-[var(--text-muted)]">{s.howItWorks}</p>
              <p className="text-xs text-[var(--green)] font-medium mt-1">Avoid: {s.howToAvoid}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
