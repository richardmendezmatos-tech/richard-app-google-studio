import { describe, it, expect } from 'vitest';
import { leadSchema } from '../lib/schemas/leadSchema';

describe('Lead Zod Schema Validation', () => {
  it('should validate a correct lead payload', () => {
    const validLead = {
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '1234567890',
      type: 'trade-in',
      tradeInDetails: '2015 Toyota Camry',
    };

    const result = leadSchema.safeParse(validLead);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe('John Doe');
      expect(result.data.type).toBe('trade-in');
      expect(result.data.status).toBe('new'); // tests the default value
    }
  });

  it('should reject invalid email formats', () => {
    const invalidLead = {
      name: 'Jane Doe',
      email: 'jane.doe-at-example.com', // invalid
    };

    const result = leadSchema.safeParse(invalidLead);
    expect(result.success).toBe(false);
  });

  it('should reject names exceeding max length', () => {
    const invalidLead = {
      name: 'A'.repeat(101), // max is 100
      email: 'test@example.com',
    };

    const result = leadSchema.safeParse(invalidLead);
    expect(result.success).toBe(false);
  });

  it('should strip unknown fields', () => {
    const maliciousLead = {
      name: 'Hacker',
      email: 'hacker@example.com',
      isAdmin: true, // Should be stripped
      hiddenConfig: { dbUrl: '...' }, // Should be stripped
    };

    const result = leadSchema.safeParse(maliciousLead);
    expect(result.success).toBe(true);
    if (result.success) {
      // @ts-expect-error - testing stripped unknown fields
      expect(result.data.isAdmin).toBeUndefined();
      // @ts-expect-error - testing stripped unknown fields
      expect(result.data.hiddenConfig).toBeUndefined();
    }
  });
});
