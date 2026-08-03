import { describe, expect, it } from 'vitest'
import { isAdminUser } from '@/entities/lawet-user'

describe('Lawet Hub admin authorization', () => {
  it('recognizes Superadmin even when the Lawet Hub response omits a numeric level', () => {
    expect(isAdminUser({ role: { id: '1', name: 'Superadmin', level: 0 } })).toBe(true)
  })

  it('recognizes a configured high-level role without relying on its name', () => {
    expect(isAdminUser({ role: { id: '2', name: 'Operator', level: 3 } }, 3)).toBe(true)
  })

  it('does not grant dashboard access to an ordinary role', () => {
    expect(isAdminUser({ role: { id: '3', name: 'Operator', level: 1 } })).toBe(false)
  })
})
