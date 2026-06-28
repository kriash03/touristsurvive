'use client'

import { lazy, Suspense, useId, useState, useEffect } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { useGuideStore } from '@/store/guide-store'
import type { TabKey } from '@/lib/types'
import { LanguageSkeleton } from '@/components/skeletons/language-skeleton'
import { CustomsSkeleton } from '@/components/skeletons/customs-skeleton'
import { BudgetSkeleton } from '@/components/skeletons/budget-skeleton'
import { FoodSkeleton } from '@/components/skeletons/food-skeleton'

const LanguageTab = lazy(() =>
  import('@/components/tabs/language-tab').then((m) => ({ default: m.LanguageTab }))
)
const CustomsTab = lazy(() =>
  import('@/components/tabs/customs-tab').then((m) => ({ default: m.CustomsTab }))
)
const BudgetTab = lazy(() =>
  import('@/components/tabs/budget-tab').then((m) => ({ default: m.BudgetTab }))
)
const FoodTab = lazy(() =>
  import('@/components/tabs/food-tab').then((m) => ({ default: m.FoodTab }))
)

const TABS: { key: TabKey; label: string }[] = [
  { key: 'language', label: 'Language' },
  { key: 'customs', label: 'Customs' },
  { key: 'budget', label: 'Budget' },
  { key: 'food', label: 'Food' },
]

const SKELETONS: Record<TabKey, React.ReactNode> = {
  language: <LanguageSkeleton />,
  customs: <CustomsSkeleton />,
  budget: <BudgetSkeleton />,
  food: <FoodSkeleton />,
}

const PANELS: Record<TabKey, React.ReactNode> = {
  language: <LanguageTab />,
  customs: <CustomsTab />,
  budget: <BudgetTab />,
  food: <FoodTab />,
}

export function GuideShell() {
  const country = useGuideStore((s) => s.country)
  const activeTab = useGuideStore((s) => s.activeTab)
  const tabs = useGuideStore((s) => s.tabs)
  const setActiveTab = useGuideStore((s) => s.setActiveTab)
  const shouldReduce = useReducedMotion()
  const tablistId = useId()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || !country) return null

  return (
    <section id="guide-shell" className="space-y-4">
      <h2 className="font-[family-name:var(--font-outfit)] text-lg font-bold text-[var(--text-primary)]">
        {country}
      </h2>

      <div
        role="tablist"
        aria-label="Guide sections"
        id={tablistId}
        className="flex gap-2 overflow-x-auto pb-1 scrollbar-none"
      >
        {TABS.map(({ key, label }) => {
          const isActive = activeTab === key
          const isDone = tabs[key].status === 'success'
          return (
            <button
              key={key}
              role="tab"
              id={`tab-${key}`}
              aria-selected={isActive}
              aria-controls={`panel-${key}`}
              onClick={() => setActiveTab(key)}
              className={`relative flex items-center gap-1.5 shrink-0 rounded-[10px] border px-4 py-2 text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-[var(--primary)] outline-none ${
                isActive
                  ? 'border-[var(--primary)] bg-[#1a2d6e] text-[var(--primary)]'
                  : 'border-[var(--border)] bg-[var(--surface-alt)] text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
              }`}
            >
              {isActive && !shouldReduce && (
                <motion.span
                  layoutId="tab-pill"
                  className="absolute inset-0 rounded-[10px] bg-[#1a2d6e]"
                  style={{ zIndex: -1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              {label}
              {isDone && (
                <span
                  className="w-1.5 h-1.5 rounded-full bg-[var(--green)]"
                  aria-hidden="true"
                />
              )}
            </button>
          )
        })}
      </div>

      {TABS.map(({ key }) => (
        <div
          key={key}
          role="tabpanel"
          id={`panel-${key}`}
          aria-labelledby={`tab-${key}`}
          hidden={activeTab !== key}
        >
          {activeTab === key && (
            <motion.div
              key={key}
              initial={shouldReduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              <Suspense fallback={SKELETONS[key]}>{PANELS[key]}</Suspense>
            </motion.div>
          )}
        </div>
      ))}
    </section>
  )
}
