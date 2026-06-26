'use client'

import { useState } from 'react'
import { MagnifyingGlass, ArrowRight } from '@phosphor-icons/react'
import { useGuideStore } from '@/store/guide-store'

const QUICK_PICKS = ['Japan', 'Morocco', 'Italy', 'Thailand', 'Brazil', 'India', 'France', 'Mexico']

export function CountrySelector() {
  const [input, setInput] = useState('')
  const setCountry = useGuideStore((s) => s.setCountry)

  function handleSubmit(country: string) {
    const trimmed = country.trim()
    if (!trimmed) return
    setInput(trimmed)
    setCountry(trimmed)
    document.getElementById('guide-shell')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h1 className="font-[family-name:var(--font-outfit)] text-[26px] font-extrabold leading-tight tracking-tight text-[var(--text-primary)]">
          Where are you headed?
        </h1>
        <p className="text-sm text-[var(--text-secondary)]">
          Get street-level survival knowledge for any country - language, customs, money, and food.
        </p>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <MagnifyingGlass
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
          />
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit(input)}
            placeholder="Enter a country..."
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-alt)] pl-9 pr-4 py-3 text-[15px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
          />
        </div>
        <button
          onClick={() => handleSubmit(input)}
          disabled={!input.trim()}
          className="flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-white bg-gradient-to-br from-[#4f8ef7] to-[#7c3aed] disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity focus-visible:ring-2 focus-visible:ring-[var(--primary)] outline-none"
        >
          Explore
          <ArrowRight size={16} />
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {QUICK_PICKS.map((country) => (
          <button
            key={country}
            onClick={() => handleSubmit(country)}
            className="rounded-full border border-[var(--border)] bg-[var(--surface-alt)] px-3 py-1 text-xs font-semibold text-[var(--text-secondary)] hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors focus-visible:ring-2 focus-visible:ring-[var(--primary)] outline-none"
          >
            {country}
          </button>
        ))}
      </div>
    </section>
  )
}
