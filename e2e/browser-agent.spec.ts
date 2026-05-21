import { test, expect } from '@playwright/test';

test.describe('Fase 2: Browser Agent API', () => {
  test('/api/ai/browse debe validar instrucción requerida', async ({ request }) => {
    const response = await request.post('/api/ai/browse', {
      data: {},
    });
    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toContain('instrucción');
  });

  test('/api/ai/browse debe aceptar instrucción de navegación', async ({ request }) => {
    const response = await request.post('/api/ai/browse', {
      data: {
        instruction: 'Busca el precio de una Ford Explorer 2025',
        url: 'https://www.richard-automotive.com/inventario',
      },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty('success');
    expect(body).toHaveProperty('pagesVisited');
    expect(body).toHaveProperty('actions');
    expect(body).toHaveProperty('summary');
  });

  test('/api/ai/browse debe navegar a la página de inicio', async ({ request }) => {
    const response = await request.post('/api/ai/browse', {
      data: {
        instruction: 'Describe brevemente el contenido de la página',
        url: 'https://www.richard-automotive.com',
      },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.pagesVisited.length).toBeGreaterThanOrEqual(1);
    expect(body.pagesVisited[0]).toContain('richard-automotive.com');
  });

  test('/api/ai/browse debe manejar URLs inválidas gracefulmente', async ({ request }) => {
    const response = await request.post('/api/ai/browse', {
      data: {
        instruction: 'Visita esta página',
        url: 'https://sitiowebquenoexiste123456.com',
      },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty('success');
  });
});
