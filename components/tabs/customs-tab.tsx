'use client'

import { useEffect } from 'react'
import { CheckCircle, XCircle, Tote, Money, Eye, Warning } from '@phosphor-icons/react'
import { useGuideStore } from '@/store/guide-store'
import { ErrorBanner } from '@/components/error-banner'
import { fetchTab } from '@/lib/fetch-tab'
import type { CustomsData } from '@/lib/types'

function SectionHeader({ icon, label, color }: { icon: React.ReactNode; label: string; color: string }) {
  return (
    <div className={`flex items-center gap-2 text-sm font-bold ${color}`}>
      {icon}
      {label}
    </div>
  )
}

export function CustomsTab() {
  const country = useGuideStore((s) => s.country)
  const tabState = useGuideStore((s) => s.tabs.customs)
  const setTabLoading = useGuideStore((s) => s.setTabLoading)
  const setTabData = useGuideStore((s) => s.setTabData)
  const setTabError = useGuideStore((s) => s.setTabError)

  useEffect(() => {
    if (tabState.status !== 'idle') return
    setTabLoading('customs')
    fetchTab('customs', country)
      .then((data) => setTabData('customs', data as CustomsData))
      .catch((e: Error) => setTabError('customs', e.message))
  }, [country, tabState.status, setTabLoading, setTabData, setTabError])

  if (tabState.status === 'loading') return null
  if (tabState.status === 'error') {
    return (
      <ErrorBanner
        message={tabState.error ?? 'Failed to load customs guide'}
        onRetry={() => setTabError('customs', '')}
      />
    )
  }
  if (tabState.status !== 'success' || !tabState.data) return null

  const data = tabState.data as CustomsData

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <SectionHeader
            icon={<CheckCircle size={16} weight="fill" />}
            label="Do"
            color="text-[var(--green)]"
          />
          {data.dos.map((d, i) => (
            <div
              key={i}
              className="rounded-xl border border-[var(--green)]/20 bg-[var(--green)]/5 p-3 space-y-1"
            >
              <p className="text-sm font-semibold text-[var(--text-primary)]">{d.action}</p>
              <p className="text-xs text-[var(--text-muted)]">{d.why}</p>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <SectionHeader
            icon={<XCircle size={16} weight="fill" />}
            label="Don't"
            color="text-[var(--red)]"
          />
          {data.donts.map((d, i) => (
            <div
              key={i}
              className="rounded-xl border border-[var(--red)]/20 bg-[var(--red)]/5 p-3 space-y-1"
            >
              <p className="text-sm font-semibold text-[var(--text-primary)]">{d.action}</p>
              <p className="text-xs text-[var(--text-muted)]">{d.consequence}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <SectionHeader
          icon={<Tote size={16} weight="fill" />}
          label="Dress Code"
          color="text-[var(--purple)]"
        />
        {data.dresscode.map((d, i) => (
          <div
            key={i}
            className="flex justify-between items-start rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 gap-4"
          >
            <p className="text-sm font-semibold text-[var(--text-primary)] shrink-0">{d.venue}</p>
            <p className="text-sm text-[var(--text-secondary)] text-right">{d.rule}</p>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <SectionHeader
          icon={<Money size={16} weight="fill" />}
          label="Tipping"
          color="text-[var(--amber)]"
        />
        {data.tipping.map((t, i) => (
          <div
            key={i}
            className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 flex items-start justify-between gap-4"
          >
            <div className="space-y-0.5">
              <p className="text-sm font-semibold text-[var(--text-primary)]">{t.context}</p>
              {t.note && <p className="text-xs text-[var(--text-muted)]">{t.note}</p>}
            </div>
            <span className="shrink-0 rounded-full bg-[var(--amber)]/15 px-2.5 py-0.5 text-xs font-bold text-[var(--amber)]">
              {t.amount}
            </span>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <SectionHeader
          icon={<Eye size={16} weight="fill" />}
          label="Hidden Rules"
          color="text-[var(--orange)]"
        />
        {data.hiddenRules.map((r, i) => (
          <div
            key={i}
            className="rounded-xl border border-[var(--orange)]/20 bg-[var(--orange)]/5 px-4 py-3 space-y-1"
          >
            <p className="text-sm font-semibold text-[var(--text-primary)]">{r.rule}</p>
            <p className="text-xs text-[var(--text-muted)]">{r.detail}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
