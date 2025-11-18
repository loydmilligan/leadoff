import { describe, it, expect } from 'vitest'

describe('Sample Unit Test', () => {
  it('should pass basic assertions', () => {
    expect(true).toBe(true)
    expect(1 + 1).toBe(2)
  })

  it('should test string operations', () => {
    const message = 'LeadOff CRM'
    expect(message).toContain('LeadOff')
    expect(message.toLowerCase()).toBe('leadoff crm')
  })
})
