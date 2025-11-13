import { useState } from 'react'

import type { ValidationResult } from '@/utils/team-validation'

type LocalKey = 'team-data' | 'active-team-id'

export interface LocalStorageResult<T> {
  value: T
  validationError: ValidationResult | null
}

export const useLocalStorage = <T>(
  key: LocalKey,
  initialValue: T,
  validator?: (data: unknown) => ValidationResult & { data?: T }
): [T, (value: T | ((val: T) => T)) => void, ValidationResult | null] => {
  const [result, setResult] = useState<LocalStorageResult<T>>(() => {
    if (typeof window === 'undefined') {
      return { value: initialValue, validationError: null }
    }

    try {
      const item = window.localStorage.getItem(key)
      if (!item) {
        return { value: initialValue, validationError: null }
      }

      const parsed = JSON.parse(item)

      // If validator is provided, validate the data
      if (validator) {
        const validation = validator(parsed)
        if (validation.isValid && validation.data !== undefined) {
          return { value: validation.data, validationError: null }
        } else {
          // Return initial value but keep validation error
          return { value: initialValue, validationError: validation }
        }
      }

      return { value: parsed, validationError: null }
    } catch (error) {
      console.error('Error loading from localStorage:', error)
      return { value: initialValue, validationError: null }
    }
  })

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore =
        value instanceof Function ? value(result.value) : value
      setResult({ value: valueToStore, validationError: null })
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error) {
      console.error('Error saving to localStorage:', error)
    }
  }

  return [result.value, setValue, result.validationError] as const
}
