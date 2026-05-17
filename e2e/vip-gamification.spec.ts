import { test, expect } from '@playwright/test';

test.describe('VIP Recompensas Gamification Flow', () => {
    test.beforeEach(async ({ page }) => {
        // Enforce a generous 90-second timeout to allow the local Webpack dev server to compile Next.js pages fully on the first run.
        test.setTimeout(90000);
        // Clear session storage before each test to reset Zustand persistence
        await page.goto('/precualificacion');
        await page.evaluate(() => {
            sessionStorage.clear();
        });
        // Reload to get a clean state
        await page.reload();
    });

    test('should guide the user through selecting rewards, spinning the Golden Key, and completing pre-qualification', async ({ page }) => {
        page.on('console', msg => console.log(`[PAGE ${msg.type().toUpperCase()}]`, msg.text()));
        // 1. Verify we are on the VIP rewards page
        await expect(page.locator('h2', { hasText: 'Tus Regalos Exclusivos' })).toBeVisible();

        // 2. Select up to 2 rewards
        const gasolinaGift = page.locator('h4', { hasText: 'Gasolina Gratis (Tanque Lleno)' });
        const asistenciaGift = page.locator('h4', { hasText: 'Asistencia en Carretera 24/7 (1er Año)' });
        const lavadoGift = page.locator('h4', { hasText: 'Lavado de Autos Full Detail Premium' });

        await expect(gasolinaGift).toBeVisible();
        await gasolinaGift.click();
        
        await expect(asistenciaGift).toBeVisible();
        await asistenciaGift.click();

        // Verify next button is disabled because we haven't spun the key yet
        const nextStepBtn = page.getByRole('button', { name: /Gira la Llave para Continuar|Confirmar Recompensas VIP/i });
        await expect(nextStepBtn).toBeDisabled();

        // 3. Spin the Golden Key
        const spinBtn = page.getByRole('button', { name: /Girar Llave de Oro/i });
        await expect(spinBtn).toBeVisible();
        await spinBtn.click();

        // Wait for the prize modal to appear and close it
        const claimBtn = page.getByRole('button', { name: /Excelente, Continuar/i });
        await expect(claimBtn).toBeVisible({ timeout: 10000 });
        await claimBtn.click();

        // Verify the modal is closed and the next button is now enabled
        await expect(claimBtn).not.toBeVisible();
        await expect(nextStepBtn).toBeEnabled();

        // 4. Click Confirmar Recompensas VIP to proceed to Step 2
        await nextStepBtn.click();

        // --- STEP 2: Consulta Rápida ---
        await expect(page.locator('h2', { hasText: 'Consulta Rápida' })).toBeVisible();
        await page.locator('input[name="firstName"]').fill('Juan');
        await page.locator('input[name="phone"]').fill('(787) 555-1234');
        
        const step2Next = page.getByRole('button', { name: /Ver Mi Pre-Calificación/i });
        await expect(step2Next).toBeEnabled();
        await step2Next.click();

        // --- STEP 3: Un poco más sobre ti ---
        await expect(page.locator('h2', { hasText: 'Un poco más sobre ti' })).toBeVisible();
        await page.locator('input[name="lastName"]').fill('Del Pueblo');
        await page.locator('input[name="email"]').fill('juan.delpueblo@example.com');
        
        const step3Next = page.getByRole('button', { name: /Siguiente/i });
        await expect(step3Next).toBeEnabled();
        await step3Next.click();

        // --- STEP 4: Simula tu Pago ---
        await expect(page.locator('h2', { hasText: 'Simula tu Pago' })).toBeVisible();
        // The pronto bonus is displayed
        await expect(page.getByText(/Bono de Pronto de/i)).toBeVisible();
        
        const step4Next = page.getByRole('button', { name: /Siguiente/i });
        await expect(step4Next).toBeEnabled();
        await step4Next.click();

        // --- STEP 5: Perfil Financiero ---
        await expect(page.locator('h2', { hasText: 'Perfil Financiero' })).toBeVisible();
        await page.locator('input[name="address"]').fill('Calle Principal 123');
        await page.locator('input[name="city"]').fill('San Juan');
        await page.locator('input[name="zip"]').fill('00901');
        await page.locator('input[name="employer"]').fill('Richard Automotive');
        await page.locator('input[name="jobTitle"]').fill('Analista de Ventas');
        await page.locator('input[name="monthlyIncome"]').fill('3500');
        
        const step5Next = page.getByRole('button', { name: /Siguiente/i });
        await expect(step5Next).toBeEnabled();
        await step5Next.click();

        // --- STEP 6: Seguridad Legal ---
        await expect(page.locator('h2', { hasText: 'Seguridad Legal' })).toBeVisible();
        await page.locator('input[name="dob"]').fill('1990-01-01');
        await page.locator('input[name="ssn"]').fill('123456789');
        
        // Click the checkbox for credit authorization
        const authCheckbox = page.locator('p', { hasText: 'Autorizo a Richard Automotive a consultar mi reporte de crédito real' });
        await authCheckbox.click();

        const submitBtn = page.getByRole('button', { name: /Enviar Solicitud Segura/i });
        await expect(submitBtn).toBeEnabled();
        await submitBtn.click();

        // --- SUCCESS SCREEN ---
        await expect(page.locator('h2', { hasText: 'En Revisión por Expertos' })).toBeVisible({ timeout: 15000 });
        await expect(page.locator('text=/CASE-\\d+/')).toBeVisible();
    });
});
