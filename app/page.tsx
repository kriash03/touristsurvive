import { CountrySelector } from '@/components/country-selector'
import { ThemeToggle } from '@/components/theme-toggle'

export default function Home() {
  return (
    <main className="min-h-[100dvh] px-4 py-8 max-w-[700px] mx-auto space-y-10">
      <nav className="flex justify-end">
        <ThemeToggle />
      </nav>
      <CountrySelector />
    </main>
  )
}
