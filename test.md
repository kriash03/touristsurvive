# TouristSurvive — Testing & Issues Tracker

This tracker documents bugs found during recent testing of the new implementations. **Claude Code** and **Antigravity** will maintain this file to resolve these issues.

---

## 🐛 Active Bugs & Issues

- [x] **[BUG] Next.js 500 Compilation/Asset Errors due to localStorage Reference**
  - **Problem Faced:** Wrapping the Zustand store in `persist` with `storage: createJSONStorage(() => localStorage)` directly triggers compilation and runtime errors on the Node.js server side during Next.js pre-rendering. This crashes the webpack compiler, causing Next.js to serve client static assets (like `main-app.js`, `react-refresh.js`, etc.) as **500 Internal Server Errors**. The client-side page loads the initial HTML but remains completely dead and non-interactive.
  - **Proposed Fix:** Check if the browser environment exists before initializing `localStorage` in `store/guide-store.ts`, or wrap it safely:
    ```ts
    storage: typeof window !== 'undefined' ? createJSONStorage(() => localStorage) : undefined,
    ```
  - **Resolution:** `store/guide-store.ts` now uses `typeof window !== 'undefined' ? localStorage : no-op fallback` — SSR never touches localStorage. Build confirmed clean.

- [x] **[BUG] Next.js Hydration Mismatch on Cached Guides**
  - **Problem Faced:** Rehydrating the cached country data from `localStorage` directly during client-side hydration causes a mismatch with the server-rendered HTML (which is built using the initial empty state). This results in React hydration mismatch errors.
  - **Proposed Fix:** Add a client-side mounting/hydration check (`mounted` state set to `true` in `useEffect`) inside `components/guide-shell.tsx` to delay rendering cached elements until the client is fully ready.
  - **Resolution:** `guide-shell.tsx` now has `const [mounted, setMounted] = useState(false)` + `useEffect(() => setMounted(true), [])`. Returns `null` until mounted, eliminating the server/client HTML mismatch.

- [x] **[BUG] Empty Search Input Field on Cached Reload**
  - **Problem Faced:** When a cached guide is successfully reloaded on page refresh, the search input field remains empty, creating a visual discrepancy where a country's guide is shown but the search bar doesn't reflect the active country.
  - **Proposed Fix:** Synchronize the search input field state with the store's active `country` value on mount/hydration inside `components/country-selector.tsx`.
  - **Resolution:** `country-selector.tsx` reads `country` from the store and syncs it to the input via `useEffect(() => { if (country) setInput(country) }, [country])`.
