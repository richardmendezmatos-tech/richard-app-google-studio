import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const generateBlogPostMock = vi.fn();

vi.mock('./geminiService', () => ({
  generateBlogPost: generateBlogPostMock
}));

const setViteEnv = (key: string, value: string) => {
  vi.stubEnv(key, value);
  (import.meta as ImportMeta & { env: Record<string, string> }).env[key] = value;
};

describe('emailService', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('uses simulation mode when Resend key is missing', async () => {
    setViteEnv('VITE_RESEND_API_KEY', '');
    setViteEnv('VITE_RESEND_FROM_EMAIL', 'hello@example.com');
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    vi.useFakeTimers();

    const { sendTransactionalEmail } = await import('./emailService');
    const promise = sendTransactionalEmail({
      to: 'test@example.com',
      subject: 'Hola',
      html: '<p>Test</p>'
    });

    await vi.advanceTimersByTimeAsync(350);
    const result = await promise;

    expect(result).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('sends through Resend API when key is configured', async () => {
    setViteEnv('VITE_RESEND_API_KEY', 're_test_123');
    setViteEnv('VITE_RESEND_FROM_EMAIL', 'Richard Auto <hola@richard-automotive.com>');
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({})
    });
    vi.stubGlobal('fetch', fetchMock);

    const { sendTransactionalEmail } = await import('./emailService');
    const result = await sendTransactionalEmail({
      to: 'client@example.com',
      subject: 'Asunto',
      html: '<p>Contenido</p>'
    });

    expect(result).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.resend.com/emails',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer re_test_123'
        })
      })
    );
  });

  it('builds newsletter and dispatches it via transactional pipeline', async () => {
    setViteEnv('VITE_RESEND_API_KEY', '');
    generateBlogPostMock.mockResolvedValue({
      id: 'post-1',
      title: 'Noticias Hyundai',
      excerpt: 'Resumen'
    });
    vi.useFakeTimers();

    const { sendAutoNewsletter } = await import('./emailService');
    const promise = sendAutoNewsletter('news@example.com');
    await vi.advanceTimersByTimeAsync(350);
    const result = await promise;

    expect(generateBlogPostMock).toHaveBeenCalledWith('Novedades Recientes de Hyundai', 'professional', 'news');
    expect(result).toEqual({
      success: true,
      message: 'Newsletter dispatched'
    });
  });
});
