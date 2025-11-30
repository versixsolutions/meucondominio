import { describe, it, expect } from 'vitest'
import { logger } from './logger'

describe('Logger', () => {
  it('should have debug method', () => {
    expect(logger.debug).toBeDefined()
    expect(typeof logger.debug).toBe('function')
  })

  it('should have info method', () => {
    expect(logger.info).toBeDefined()
    expect(typeof logger.info).toBe('function')
  })

  it('should have warn method', () => {
    expect(logger.warn).toBeDefined()
    expect(typeof logger.warn).toBe('function')
  })

  it('should have error method', () => {
    expect(logger.error).toBeDefined()
    expect(typeof logger.error).toBe('function')
  })

  it('should have performance method', () => {
    expect(logger.performance).toBeDefined()
    expect(typeof logger.performance).toBe('function')
  })

  it('should not throw when calling methods', () => {
    expect(() => {
      logger.debug('Debug message', { key: 'value' })
      logger.info('Info message')
      logger.warn('Warning message')
      logger.error('Error message', new Error('Test error'))
      logger.performance('Test operation', 1250)
    }).not.toThrow()
  })
})
