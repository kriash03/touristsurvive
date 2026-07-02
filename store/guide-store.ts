import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { TabKey, TabData } from '@/lib/types'

interface TabState {
  status: 'idle' | 'loading' | 'success' | 'error'
  data: TabData | null
  error?: string
}

const initialTabState = (): TabState => ({ status: 'idle', data: null })

const ALL_TABS: TabKey[] = ['language', 'customs', 'budget', 'food', 'learn']

interface GuideStore {
  country: string
  activeTab: TabKey
  tabs: Record<TabKey, TabState>
  setCountry: (country: string) => void
  setActiveTab: (tab: TabKey) => void
  setTabLoading: (tab: TabKey) => void
  setTabData: (tab: TabKey, data: TabData) => void
  setTabError: (tab: TabKey, error: string) => void
}

export const useGuideStore = create<GuideStore>()(
  persist(
    (set) => ({
      country: '',
      activeTab: 'language',
      tabs: {
        language: initialTabState(),
        customs: initialTabState(),
        budget: initialTabState(),
        food: initialTabState(),
        learn: initialTabState(),
      },

      setCountry: (country) =>
        set({
          country,
          activeTab: 'language',
          tabs: Object.fromEntries(
            ALL_TABS.map((t) => [t, initialTabState()])
          ) as Record<TabKey, TabState>,
        }),

      setActiveTab: (tab) => set({ activeTab: tab }),

      setTabLoading: (tab) =>
        set((s) => ({ tabs: { ...s.tabs, [tab]: { status: 'loading', data: null } } })),

      setTabData: (tab, data) =>
        set((s) => ({ tabs: { ...s.tabs, [tab]: { status: 'success', data } } })),

      setTabError: (tab, error) =>
        set((s) => ({ tabs: { ...s.tabs, [tab]: { status: 'error', data: null, error } } })),
    }),
    {
      name: 'tourist-survive-guide',
      storage: createJSONStorage(() => typeof window !== 'undefined' ? localStorage : {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {},
      } as unknown as Storage),
      partialize: (state) => ({
        country: state.country,
        activeTab: state.activeTab,
        tabs: state.tabs,
      }),
      // Rehydrated tabs with status 'loading' are reset to idle (page reload mid-fetch)
      onRehydrateStorage: () => (state) => {
        if (!state) return
        const fixed = { ...state.tabs }
        for (const key of ALL_TABS) {
          if (fixed[key].status === 'loading') {
            fixed[key] = initialTabState()
          }
        }
        state.tabs = fixed
      },
    }
  )
)
