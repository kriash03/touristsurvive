'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { CaretLeft, CaretRight, SpeakerHigh } from '@phosphor-icons/react'
import { useGuideStore } from '@/store/guide-store'
import { ErrorBanner } from '@/components/error-banner'
import { fetchTab } from '@/lib/fetch-tab'
import { getLocaleForCountry, resolveVoice, speak } from '@/lib/tts-locale'
import type { LanguageData } from '@/lib/types'

type SubTab = 'situations' | 'numbers' | 'greetings' | 'shopqa' | 'flashcards'

const SUB_TABS: { key: SubTab; label: string }[] = [
  { key: 'situations', label: 'Situations' },
  { key: 'numbers', label: 'Numbers' },
  { key: 'greetings', label: 'Greetings' },
  { key: 'shopqa', label: 'Shop Q&A' },
  { key: 'flashcards', label: 'Flashcards' },
]

const SITUATION_LABELS: Record<string, string> = {
  restaurant: 'Restaurant',
  shopping: 'Shopping',
  transport: 'Transport',
}

function SpeakButton({ text, locale, showNoVoice }: { text: string; locale: string; showNoVoice?: boolean }) {
  const [noVoice, setNoVoice] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return
    const check = () => {
      const voice = resolveVoice(locale)
      setNoVoice(!voice && locale !== 'en-US')
    }
    check()
    window.speechSynthesis.addEventListener('voiceschanged', check)
    return () => window.speechSynthesis.removeEventListener('voiceschanged', check)
  }, [locale])

  return (
    <span className="relative inline-flex flex-col items-center">
      <button
        onClick={(e) => { e.stopPropagation(); speak(text, locale) }}
        aria-label="Pronounce phrase"
        className="ml-auto shrink-0 rounded-full p-1.5 text-[var(--text-muted)] hover:text-[var(--primary)] hover:bg-[var(--primary)]/10 transition-colors focus-visible:ring-2 focus-visible:ring-[var(--primary)] outline-none"
      >
        <SpeakerHigh size={14} weight="fill" />
      </button>
      {showNoVoice && noVoice && (
        <span className="absolute top-full mt-1 whitespace-nowrap text-[10px] text-[var(--text-muted)] bg-[var(--surface)] border border-[var(--border)] rounded px-1.5 py-0.5 z-10">
          No voice available on this device
        </span>
      )}
    </span>
  )
}

function PhraseCard({ phrase, locale }: { phrase: LanguageData['situations']['restaurant'][number]; locale: string }) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 space-y-1">
      <div className="flex items-start gap-2">
        <p className="text-lg font-bold text-[var(--text-primary)] flex-1">{phrase.local}</p>
        <SpeakButton text={phrase.local} locale={locale} showNoVoice />
      </div>
      <p className="text-sm text-[var(--primary)]">{phrase.romanized}</p>
      <p className="text-xs text-[var(--text-muted)] italic">{phrase.pronunciation}</p>
      <p className="text-sm text-[var(--text-secondary)] mt-1">{phrase.meaning}</p>
      {phrase.tip && (
        <p className="text-xs text-[var(--amber)] mt-1">Tip: {phrase.tip}</p>
      )}
    </div>
  )
}

export function LanguageTab() {
  const country = useGuideStore((s) => s.country)
  const tabState = useGuideStore((s) => s.tabs.language)
  const setTabLoading = useGuideStore((s) => s.setTabLoading)
  const setTabData = useGuideStore((s) => s.setTabData)
  const setTabError = useGuideStore((s) => s.setTabError)
  const shouldReduce = useReducedMotion()
  const locale = getLocaleForCountry(country)

  const [subTab, setSubTab] = useState<SubTab>('situations')
  const [situation, setSituation] = useState<'restaurant' | 'shopping' | 'transport'>('restaurant')
  const [cardIndex, setCardIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)

  useEffect(() => {
    if (tabState.status !== 'idle') return
    setTabLoading('language')
    fetchTab('language', country)
      .then((data) => setTabData('language', data as LanguageData))
      .catch((e: Error) => setTabError('language', e.message))
  }, [country, tabState.status, setTabLoading, setTabData, setTabError])

  const retry = useCallback(() => setTabError('language', ''), [setTabError])

  if (tabState.status === 'loading') return null
  if (tabState.status === 'error') {
    return <ErrorBanner message={tabState.error ?? 'Failed to load language guide'} onRetry={retry} />
  }
  if (tabState.status !== 'success' || !tabState.data) return null

  const data = tabState.data as LanguageData
  const flashcard = data.flashcards[cardIndex]

  return (
    <div className="space-y-4">
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {SUB_TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setSubTab(key)}
            className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-[var(--primary)] outline-none ${
              subTab === key
                ? 'border-[var(--primary)] bg-[var(--primary)] text-white'
                : 'border-[var(--border)] bg-[var(--surface-alt)] text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {subTab === 'situations' && (
        <div className="space-y-4">
          <div className="flex gap-2">
            {(['restaurant', 'shopping', 'transport'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSituation(s)}
                className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                  situation === s
                    ? 'border-[var(--purple)] bg-[var(--purple)]/20 text-[var(--purple)]'
                    : 'border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                }`}
              >
                {SITUATION_LABELS[s]}
              </button>
            ))}
          </div>
          <div className="space-y-3">
            {data.situations[situation].map((phrase, i) => (
              <motion.div
                key={i}
                initial={shouldReduce ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <PhraseCard phrase={phrase} locale={locale} />
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {subTab === 'numbers' && (
        <div className="grid grid-cols-2 gap-3">
          {data.numbers.map((n, i) => (
            <div
              key={i}
              className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 space-y-0.5"
            >
              <div className="flex items-center gap-1">
                <p className="text-2xl font-bold text-[var(--primary)] flex-1">{n.numeral}</p>
                <SpeakButton text={n.local} locale={locale} showNoVoice />
              </div>
              <p className="text-sm text-[var(--text-primary)]">{n.local}</p>
              <p className="text-xs text-[var(--text-muted)] italic">{n.pronunciation}</p>
            </div>
          ))}
        </div>
      )}

      {subTab === 'greetings' && (
        <div className="space-y-3">
          {data.greetings.map((g, i) => (
            <div
              key={i}
              className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 space-y-1"
            >
              <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide">
                {g.context}
              </p>
              <div className="flex items-start gap-2">
                <p className="text-lg font-bold text-[var(--text-primary)] flex-1">{g.phrase}</p>
                <SpeakButton text={g.phrase} locale={locale} showNoVoice />
              </div>
              <p className="text-xs text-[var(--text-muted)] italic">{g.pronunciation}</p>
              {g.note && <p className="text-xs text-[var(--amber)]">{g.note}</p>}
            </div>
          ))}
        </div>
      )}

      {subTab === 'shopqa' && (
        <div className="space-y-3">
          {data.shopQA.map((qa, i) => (
            <div
              key={i}
              className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 space-y-1"
            >
              <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide">Q</p>
              <p className="text-sm text-[var(--text-primary)]">{qa.question}</p>
              <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mt-2">A</p>
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-[var(--primary)] flex-1">{qa.answer}</p>
                <SpeakButton text={qa.answer} locale={locale} showNoVoice />
              </div>
              <p className="text-xs text-[var(--text-muted)] italic">{qa.pronunciation}</p>
            </div>
          ))}
        </div>
      )}

      {subTab === 'flashcards' && flashcard && (
        <div className="space-y-4">
          <div className="text-xs text-[var(--text-muted)] text-center">
            {cardIndex + 1} / {data.flashcards.length}
          </div>
          <button
            onClick={() => setFlipped((f) => !f)}
            className="w-full min-h-[160px] rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-[var(--primary)] transition-colors focus-visible:ring-2 focus-visible:ring-[var(--primary)] outline-none"
            aria-label={flipped ? 'Show English' : 'Reveal local phrase'}
          >
            {flipped ? (
              <>
                <p className="text-2xl font-bold text-[var(--primary)]">{flashcard.local}</p>
                <p className="text-sm text-[var(--text-muted)] italic">{flashcard.pronunciation}</p>
              </>
            ) : (
              <p className="text-xl font-semibold text-[var(--text-primary)]">{flashcard.english}</p>
            )}
            <p className="text-xs text-[var(--text-muted)] mt-2">
              {flipped ? 'Tap to see English' : 'Tap to reveal'}
            </p>
          </button>
          {flipped && (
            <div className="flex justify-center">
              <button
                onClick={() => speak(flashcard.local, locale)}
                className="flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface-alt)] px-4 py-2 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--primary)] hover:border-[var(--primary)] transition-colors"
              >
                <SpeakerHigh size={14} weight="fill" />
                Hear pronunciation
              </button>
            </div>
          )}
          <div className="flex gap-3">
            <button
              onClick={() => { setCardIndex((i) => Math.max(0, i - 1)); setFlipped(false) }}
              disabled={cardIndex === 0}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-alt)] py-2.5 text-sm font-medium text-[var(--text-secondary)] disabled:opacity-40 hover:text-[var(--text-primary)] transition-colors focus-visible:ring-2 focus-visible:ring-[var(--primary)] outline-none"
            >
              <CaretLeft size={16} />
              Prev
            </button>
            <button
              onClick={() => { setCardIndex((i) => Math.min(data.flashcards.length - 1, i + 1)); setFlipped(false) }}
              disabled={cardIndex === data.flashcards.length - 1}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-alt)] py-2.5 text-sm font-medium text-[var(--text-secondary)] disabled:opacity-40 hover:text-[var(--text-primary)] transition-colors focus-visible:ring-2 focus-visible:ring-[var(--primary)] outline-none"
            >
              Next
              <CaretRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
