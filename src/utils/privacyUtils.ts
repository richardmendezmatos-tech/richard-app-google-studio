/**
 * PII Masking Utilities
 * Designed for Richard Automotive - Exit Readiness Hardening
 */

export type UserRole = 'admin' | 'user' | 'auditor' | 'sales';

/**
 * Masks an email address: richard@gmail.com -> r******@gmail.com
 */
export const maskEmail = (email: string, role: UserRole): string => {
    if (role === 'admin') return email;
    if (!email || !email.includes('@')) return email;

    const [user, domain] = email.split('@');
    if (user.length <= 2) return `${user[0]}***@${domain}`;
    return `${user[0]}${'*'.repeat(user.length - 2)}${user[user.length - 1]}@${domain}`;
};

/**
 * Masks a phone number: 787-555-1234 -> 787-***-**34
 */
export const maskPhone = (phone: string, role: UserRole): string => {
    if (role === 'admin') return phone;
    if (!phone) return '***-***-****';

    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length < 10) return phone;

    return `${cleaned.slice(0, 3)}-***-**${cleaned.slice(-2)}`;
};

/**
 * Masks a full name: Richard Mendez -> R******* M*****
 */
export const maskName = (name: string, role: UserRole): string => {
    if (role === 'admin' || !name) return name;

    return name.split(' ').map(part => {
        if (part.length <= 1) return part;
        return `${part[0]}${'*'.repeat(part.length - 1)}`;
    }).join(' ');
};

/**
 * Enterprise Privacy Policy Check
 * Determines if the current user has clearance for Full PII
 */
export const hasPIIClearance = (role: UserRole): boolean => {
    return role === 'admin';
};
