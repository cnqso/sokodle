// lib/localStorageHelpers.ts
export function setLocalStorage<T>(key: string, value: T): void {
    localStorage.setItem(key, JSON.stringify(value))
  }
  
  export function getLocalStorage<T>(key: string, defaultValue: T): T {
    try {
      const raw = localStorage.getItem(key)
      return raw ? (JSON.parse(raw) as T) : defaultValue
    } catch {
      // In case JSON parse fails, return the default
      return defaultValue
    }
  }
  