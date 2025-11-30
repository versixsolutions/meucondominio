import { describe, it, expect } from 'vitest'
import { useAuth } from '../hooks/useAuth'

describe('useAuth', () => {
  it('should be defined', () => {
    expect(useAuth).toBeDefined()
    expect(typeof useAuth).toBe('function')
  })

  it('should export useAuth hook', () => {
    // Test that hook exists and is importable
    expect(useAuth).toBeTruthy()
  })
})
