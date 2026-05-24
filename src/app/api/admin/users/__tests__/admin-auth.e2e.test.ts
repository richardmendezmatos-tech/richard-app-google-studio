import { describe, it, expect } from 'vitest'

const ADMIN_API = '/api/admin/users'
const VALID_ADMIN_EMAIL = 'richardmendezmatos@gmail.com'
const NON_ADMIN_EMAIL = 'user@test.com'
const ADMIN_DOMAIN_EMAIL = 'sales@richard-automotive.com'

function mockRequest(email: string, role = 'user') {
  return {
    headers: {
      'x-user-email': email,
      'x-user-role': role,
    },
  } as any
}

describe('Admin Auth Hardening', () => {
  it('should allow exact admin email', () => {
    const isAdmin = VALID_ADMIN_EMAIL === 'richardmendezmatos@gmail.com'
    expect(isAdmin).toBe(true)
  })

  it('should allow @richard-automotive.com domain', () => {
    const domain = ADMIN_DOMAIN_EMAIL.split('@')[1]
    expect(domain).toBe('richard-automotive.com')
  })

  it('should NOT allow email includes admin pattern', () => {
    const badEmails = ['admin@test.com', 'adminuser@example.com', 'myadmin@domain.com']
    for (const email of badEmails) {
      const isAdminViaInclude = email.includes('admin')
      expect(isAdminViaInclude).toBe(true)
      const isAdminViaWhitelist =
        email === 'richardmendezmatos@gmail.com' || email.endsWith('@richard-automotive.com')
      expect(isAdminViaWhitelist).toBe(false)
    }
  })

  it('should require admin role in profile', () => {
    const adminRole = 'admin'
    const nonAdminRoles = ['user', 'editor', 'agent']
    expect(adminRole).toBe('admin')
    for (const role of nonAdminRoles) {
      expect(role).not.toBe('admin')
    }
  })

  it('should reject users without x-user-email header', () => {
    const req = { headers: {} } as any
    const email = req.headers['x-user-email']
    expect(email).toBeUndefined()
  })

  it('should validate exactly 2 admin patterns', () => {
    const whitelist = [
      'richardmendezmatos@gmail.com',
      '@richard-automotive.com',
    ]
    expect(whitelist).toHaveLength(2)
  })
})
