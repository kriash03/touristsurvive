export interface Phrase {
  local: string
  romanized: string
  pronunciation: string
  meaning: string
  tip: string
}

export interface LanguageData {
  situations: {
    restaurant: Phrase[]
    shopping: Phrase[]
    transport: Phrase[]
  }
  numbers: { numeral: string; local: string; pronunciation: string }[]
  greetings: { context: string; phrase: string; pronunciation: string; note: string }[]
  shopQA: { question: string; answer: string; pronunciation: string }[]
  flashcards: { english: string; local: string; pronunciation: string }[]
}

export interface CustomsData {
  dos: { action: string; why: string }[]
  donts: { action: string; consequence: string }[]
  dresscode: { venue: string; rule: string }[]
  tipping: { context: string; amount: string; note: string }[]
  hiddenRules: { rule: string; detail: string }[]
}

export interface BudgetData {
  currency: { name: string; code: string; usdRate: string; notes: string }
  dailyTiers: { tier: 'Budget' | 'Mid-range' | 'Comfort'; usdPerDay: number; includes: string }[]
  typicalCosts: { item: string; low: string; high: string; tip: string }[]
  atmAdvice: string
  bargaining: { applicable: boolean; howTo: string; where: string }
  scams: { name: string; howItWorks: string; howToAvoid: string }[]
}

export interface FoodData {
  mustTry: { name: string; description: string; whereToFind: string; orderingTip: string }[]
  diningCustoms: { custom: string; why: string }[]
  howToOrder: {
    steps: string[]
    phrases: { english: string; local: string; pronunciation: string }[]
  }
  dietary: { type: string; difficulty: 'easy' | 'moderate' | 'hard'; watchFor: string }[]
  streetFood: { safetyTips: string[]; mustTry: string[] }
  avoid: { item: string; reason: string }[]
}

export interface LearnTip {
  category: 'Slang' | 'Verbs' | 'Nouns' | 'Etiquette' | 'Sentences' | 'Numbers'
  headline: string
  detail: string
  examples: string[]
  pronunciation?: string
}

export interface LearnResponse {
  tips: LearnTip[]
}

export type TabKey = 'language' | 'customs' | 'budget' | 'food' | 'learn'
export type TabData = LanguageData | CustomsData | BudgetData | FoodData | LearnResponse
