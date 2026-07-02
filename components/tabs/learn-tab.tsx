'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'motion/react'
import { CaretDown, CaretUp, SpeakerHigh } from '@phosphor-icons/react'
import { useGuideStore } from '@/store/guide-store'
import { ErrorBanner } from '@/components/error-banner'
import { LearnSkeleton } from '@/components/skeletons/learn-skeleton'
import { fetchTab } from '@/lib/fetch-tab'
import { getLocaleForCountry, speak } from '@/lib/tts-locale'
import type { LearnResponse, LearnTip } from '@/lib/types'

const CATEGORY_COLORS: Record<LearnTip['category'], string> = {
  Slang: 'bg-[var(--purple)]/15 text-[var(--purple)]',
  Verbs: 'bg-[var(--primary)]/15 text-[var(--primary)]',
  Nouns: 'bg-[var(--green)]/15 text-[var(--green)]',
  Etiquette: 'bg-[var(--amber)]/15 text-[var(--amber)]',
  Sentences: 'bg-[var(--orange)]/15 text-[var(--orange)]',
  Numbers: 'bg-[var(--red)]/15 text-[var(--red)]',
}

function TipCard({ tip, locale, index }: { tip: LearnTip; locale: string; index: number }) {
  const [open, setOpen] = useState(false)
  const shouldReduce = useReducedMotion()

  return (
    <motion.div
      initial={shouldReduce ? false : { opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.25, delay: index * 0.04 }}
      className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 space-y-2"
    >
      <div className="flex items-start gap-3">
        <div className="flex-1 space-y-1">
          <span className={`inline-block text-[11px] font-semibold rounded-[6px] px-2 py-0.5 ${CATEGORY_COLORS[tip.category]}`}>
            {tip.category}
          </span>
          <p className="font-[family-name:var(--font-outfit)] text-[17px] font-semibold text-[var(--text-primary)] leading-snug">
            {tip.headline}
          </p>
          {tip.pronunciation && (
            <p className="text-xs italic text-[var(--text-muted)]">{tip.pronunciation}</p>
          )}
        </div>
        <button
          onClick={() => speak(tip.headline, locale)}
          aria-label="Pronounce tip"
          className="shrink-0 rounded-full p-1.5 text-[var(--text-muted)] hover:text-[var(--primary)] hover:bg-[var(--primary)]/10 transition-colors focus-visible:ring-2 focus-visible:ring-[var(--primary)] outline-none"
        >
          <SpeakerHigh size={16} />
        </button>
      </div>

      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 text-xs font-medium text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors focus-visible:ring-2 focus-visible:ring-[var(--primary)] outline-none rounded"
        aria-expanded={open}
      >
        {open ? <CaretUp size={12} /> : <CaretDown size={12} />}
        {open ? 'Show less' : 'Dive deeper'}
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="expanded"
            initial={shouldReduce ? {} : { opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={shouldReduce ? {} : { opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="pt-1 space-y-3">
              <p className="text-sm text-[var(--text-secondary)]">{tip.detail}</p>
              <ul className="space-y-2 border-l-2 border-[var(--border)] pl-3">
                {tip.examples.map((ex, i) => (
                  <li key={i} className="flex items-center justify-between gap-2">
                    <span className="text-sm text-[var(--text-primary)]">{ex}</span>
                    <button
                      onClick={() => speak(ex, locale)}
                      aria-label="Pronounce example"
                      className="shrink-0 rounded-full p-1 text-[var(--text-muted)] hover:text-[var(--primary)] hover:bg-[var(--primary)]/10 transition-colors focus-visible:ring-2 focus-visible:ring-[var(--primary)] outline-none"
                    >
                      <SpeakerHigh size={14} />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export function LearnTab() {
  const country = useGuideStore((s) => s.country)
  const tabState = useGuideStore((s) => s.tabs['learn'])
  const setTabLoading = useGuideStore((s) => s.setTabLoading)
  const setTabData = useGuideStore((s) => s.setTabData)
  const setTabError = useGuideStore((s) => s.setTabError)
  const locale = getLocaleForCountry(country)

  const load = async () => {
    setTabLoading('learn')
    try {
      const data = await fetchTab('learn', country)
      setTabData('learn', data as LearnResponse)
    } catch (err) {
      setTabError('learn', err instanceof Error ? err.message : 'Something went wrong.')
    }
  }

  useEffect(() => {
    if (tabState.status === 'idle') load()
    // load is intentionally excluded — it's recreated each render and would cause infinite loops;
    // country is the true trigger for re-fetching
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [country, tabState.status])

  if (tabState.status === 'idle' || tabState.status === 'loading') {
    return <LearnSkeleton />
  }

  if (tabState.status === 'error') {
    return <ErrorBanner message={tabState.error ?? 'Something went wrong.'} onRetry={load} />
  }

  const { tips } = tabState.data as LearnResponse

  return (
    <div className="space-y-3">
      {tips.map((tip, i) => (
        <TipCard key={i} tip={tip} locale={locale} index={i} />
      ))}
    </div>
  )
}
