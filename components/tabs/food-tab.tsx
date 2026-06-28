'use client'

import { useEffect } from 'react'
import { ForkKnife, Handshake, ChatText, Leaf, ShoppingCart, Warning } from '@phosphor-icons/react'
import { useGuideStore } from '@/store/guide-store'
import { ErrorBanner } from '@/components/error-banner'
import { fetchTab } from '@/lib/fetch-tab'
import type { FoodData } from '@/lib/types'

const DIFFICULTY_COLORS: Record<string, { text: string; bg: string }> = {
  easy: { text: 'text-[var(--green)]', bg: 'bg-[var(--green)]/10' },
  moderate: { text: 'text-[var(--amber)]', bg: 'bg-[var(--amber)]/10' },
  hard: { text: 'text-[var(--red)]', bg: 'bg-[var(--red)]/10' },
}

function SectionHeader({ icon, label, color }: { icon: React.ReactNode; label: string; color: string }) {
  return (
    <div className={`flex items-center gap-2 text-sm font-bold ${color}`}>
      {icon}
      {label}
    </div>
  )
}

export function FoodTab() {
  const country = useGuideStore((s) => s.country)
  const tabState = useGuideStore((s) => s.tabs.food)
  const setTabLoading = useGuideStore((s) => s.setTabLoading)
  const setTabData = useGuideStore((s) => s.setTabData)
  const setTabError = useGuideStore((s) => s.setTabError)

  useEffect(() => {
    if (tabState.status !== 'idle') return
    setTabLoading('food')
    fetchTab('food', country)
      .then((data) => setTabData('food', data as FoodData))
      .catch((e: Error) => setTabError('food', e.message))
  }, [country, tabState.status, setTabLoading, setTabData, setTabError])

  if (tabState.status === 'loading') return null
  if (tabState.status === 'error') {
    return (
      <ErrorBanner
        message={tabState.error ?? 'Failed to load food guide'}
        onRetry={() => setTabError('food', '')}
      />
    )
  }
  if (tabState.status !== 'success' || !tabState.data) return null

  const data = tabState.data as FoodData

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <SectionHeader
          icon={<ForkKnife size={16} weight="fill" />}
          label="Must Try"
          color="text-[var(--orange)]"
        />
        <div className="grid grid-cols-2 gap-3">
          {data.mustTry.map((dish, i) => (
            <div
              key={i}
              className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 space-y-1"
            >
              <p className="text-sm font-bold text-[var(--text-primary)]">{dish.name}</p>
              <p className="text-xs text-[var(--text-secondary)]">{dish.description}</p>
              <p className="text-xs text-[var(--text-muted)]">
                <span className="font-medium">Find: </span>{dish.whereToFind}
              </p>
              {dish.orderingTip && (
                <p className="text-xs text-[var(--amber)] mt-1">{dish.orderingTip}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <SectionHeader
          icon={<Handshake size={16} weight="fill" />}
          label="Dining Customs"
          color="text-[var(--purple)]"
        />
        {data.diningCustoms.map((c, i) => (
          <div
            key={i}
            className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 flex gap-3"
          >
            <div className="space-y-0.5">
              <p className="text-sm font-semibold text-[var(--text-primary)]">{c.custom}</p>
              <p className="text-xs text-[var(--text-muted)]">{c.why}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <SectionHeader
          icon={<ChatText size={16} weight="fill" />}
          label="How to Order"
          color="text-[var(--primary)]"
        />
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 space-y-3">
          <ol className="space-y-1.5 list-none">
            {data.howToOrder.steps.map((step, i) => (
              <li key={i} className="flex gap-2.5 text-sm text-[var(--text-secondary)]">
                <span className="shrink-0 w-5 h-5 rounded-full bg-[var(--primary)]/15 text-[var(--primary)] text-xs font-bold flex items-center justify-center">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
          {data.howToOrder.phrases.length > 0 && (
            <div className="space-y-2 border-t border-[var(--border)] pt-3">
              <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide">Useful phrases</p>
              {data.howToOrder.phrases.map((p, i) => (
                <div key={i} className="flex justify-between text-sm gap-2">
                  <span className="text-[var(--text-secondary)]">{p.english}</span>
                  <span className="text-[var(--primary)] font-medium">{p.local}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <SectionHeader
          icon={<Leaf size={16} weight="fill" />}
          label="Dietary"
          color="text-[var(--green)]"
        />
        {data.dietary.map((d, i) => {
          const c = DIFFICULTY_COLORS[d.difficulty] ?? DIFFICULTY_COLORS.moderate
          return (
            <div
              key={i}
              className="flex items-start justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3"
            >
              <div className="space-y-0.5">
                <p className="text-sm font-semibold text-[var(--text-primary)]">{d.type}</p>
                <p className="text-xs text-[var(--text-muted)]">{d.watchFor}</p>
              </div>
              <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold ${c.text} ${c.bg}`}>
                {d.difficulty}
              </span>
            </div>
          )
        })}
      </div>

      <div className="space-y-2">
        <SectionHeader
          icon={<ShoppingCart size={16} weight="fill" />}
          label="Street Food"
          color="text-[var(--amber)]"
        />
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 space-y-3">
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide">Safety tips</p>
            {data.streetFood.safetyTips.map((tip, i) => (
              <p key={i} className="text-sm text-[var(--text-secondary)] flex gap-2">
                <span className="text-[var(--green)] mt-0.5">✓</span>
                {tip}
              </p>
            ))}
          </div>
          <div className="space-y-1.5 border-t border-[var(--border)] pt-3">
            <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide">Must try street bites</p>
            <div className="flex flex-wrap gap-2">
              {data.streetFood.mustTry.map((item, i) => (
                <span
                  key={i}
                  className="rounded-full border border-[var(--amber)]/30 bg-[var(--amber)]/10 px-3 py-1 text-xs font-medium text-[var(--amber)]"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {data.avoid.length > 0 && (
        <div className="space-y-2">
          <SectionHeader
            icon={<Warning size={16} weight="fill" />}
            label="Avoid"
            color="text-[var(--red)]"
          />
          {data.avoid.map((a, i) => (
            <div
              key={i}
              className="rounded-xl border border-[var(--red)]/20 bg-[var(--red)]/5 px-4 py-3 flex gap-3"
            >
              <div className="space-y-0.5">
                <p className="text-sm font-semibold text-[var(--text-primary)]">{a.item}</p>
                <p className="text-xs text-[var(--text-muted)]">{a.reason}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
