'use client'

import { useState, useRef, useEffect } from 'react'
import { MagnifyingGlass, ArrowRight, Warning } from '@phosphor-icons/react'
import { useGuideStore } from '@/store/guide-store'
import { isValidCountry, searchCountries } from '@/lib/countries'

const QUICK_PICKS = ['Japan', 'Morocco', 'Italy', 'Thailand', 'Brazil', 'India', 'France', 'Mexico']

export function CountrySelector() {
  const [input, setInput] = useState('')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [error, setError] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const listboxId = 'country-suggestions'
  const country = useGuideStore((s) => s.country)
  const setCountry = useGuideStore((s) => s.setCountry)

  useEffect(() => {
    if (country) {
      setInput(country)
    }
  }, [country])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleInput(value: string) {
    setInput(value)
    setError('')
    const results = searchCountries(value)
    setSuggestions(results)
    setShowDropdown(results.length > 0)
  }

  function handleSubmit(country: string) {
    const trimmed = country.trim()
    if (!trimmed) return
    if (!isValidCountry(trimmed)) {
      setError(`"${trimmed}" isn't a recognized country. Try the autocomplete suggestions.`)
      return
    }
    setError('')
    setInput(trimmed)
    setSuggestions([])
    setShowDropdown(false)
    setCountry(trimmed)
    document.getElementById('guide-shell')?.scrollIntoView({ behavior: 'smooth' })
  }

  function handleQuickPick(country: string) {
    setInput(country)
    setError('')
    setSuggestions([])
    setShowDropdown(false)
    setCountry(country)
    document.getElementById('guide-shell')?.scrollIntoView({ behavior: 'smooth' })
  }

  function handleSuggestionClick(country: string) {
    handleSubmit(country)
  }

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h1 className="font-[family-name:var(--font-outfit)] text-[26px] font-extrabold leading-tight tracking-tight text-[var(--text-primary)]">
          Where are you headed?
        </h1>
        <p className="text-sm text-[var(--text-secondary)]">
          Get street-level survival knowledge for any country — language, customs, money, and food.
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex gap-2">
          <div ref={wrapperRef} className="relative flex-1">
            <MagnifyingGlass
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
            />
            <input
              type="text"
              value={input}
              onChange={(e) => handleInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSubmit(input)
                if (e.key === 'Escape') setShowDropdown(false)
              }}
              onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
              placeholder="Enter a country..."
              autoComplete="off"
              role="combobox"
              aria-label="Country search"
              aria-autocomplete="list"
              aria-expanded={showDropdown}
              aria-haspopup="listbox"
              aria-controls={listboxId}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-alt)] pl-9 pr-4 py-3 text-[15px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
            />
            {showDropdown && (
              <ul
                id={listboxId}
                role="listbox"
                className="absolute z-20 mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-lg overflow-hidden"
              >
                {suggestions.map((country) => (
                  <li key={country}>
                    <button
                      role="option"
                      aria-selected={false}
                      onMouseDown={(e) => { e.preventDefault(); handleSuggestionClick(country) }}
                      className="w-full px-4 py-2.5 text-left text-sm text-[var(--text-primary)] hover:bg-[var(--surface-alt)] transition-colors"
                    >
                      {country}
                    </button>
                  </li>
                ))}
              </ul>
            )}
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

        {error && (
          <p role="alert" className="flex items-center gap-1.5 text-xs text-[var(--red)]">
            <Warning size={14} weight="fill" />
            {error}
          </p>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {QUICK_PICKS.map((country) => (
          <button
            key={country}
            onClick={() => handleQuickPick(country)}
            className="rounded-full border border-[var(--border)] bg-[var(--surface-alt)] px-3 py-1 text-xs font-semibold text-[var(--text-secondary)] hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors focus-visible:ring-2 focus-visible:ring-[var(--primary)] outline-none"
          >
            {country}
          </button>
        ))}
      </div>
    </section>
  )
}
