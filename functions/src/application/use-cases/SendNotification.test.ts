import { describe, it, expect, vi } from 'vitest';
import { SendNotification } from './SendNotification';
import { EmailRepository, EmailOptions } from '../../domain/repositories/EmailRepository';

class MockEmailRepository implements EmailRepository {
    async send(options: EmailOptions): Promise<void> { }
}

describe('SendNotification', () => {
    it('should use the provided "from" address', async () => {
        const repo = new MockEmailRepository();
        const sendSpy = vi.spyOn(repo, 'send');
        const useCase = new SendNotification(repo);

        const options: EmailOptions = {
            to: 'test@example.com',
            subject: 'Test Subject',
            html: '<p>Test</p>',
            from: 'custom@example.com'
        };

        await useCase.execute(options);

        expect(sendSpy).toHaveBeenCalledWith(expect.objectContaining({
            from: 'custom@example.com'
        }));
    });

    it('should fall back to default brand email if "from" is missing', async () => {
        const repo = new MockEmailRepository();
        const sendSpy = vi.spyOn(repo, 'send');
        const useCase = new SendNotification(repo);

        const options: EmailOptions = {
            to: 'test@example.com',
            subject: 'Test Subject',
            html: '<p>Test</p>'
        };

        await useCase.execute(options);

        expect(sendSpy).toHaveBeenCalledWith(expect.objectContaining({
            from: 'contacto@richardmendezmatos.tech'
        }));
    });
});
