import { test, expect } from '@playwright/test';

/**
 * Fluxo E2E de curtida sem autenticação: um visitante tenta curtir um post
 * e o sistema bloqueia a ação com um alerta.
 */
test.describe('E2E - Curtida sem autenticação', () => {
  test('visitante não consegue curtir e recebe alerta pedindo login', async ({ page }) => {
    await page.goto('/');

    // O feed é público: o visitante vê os posts e os botões de entrar/criar conta
    await expect(page.getByRole('banner').getByRole('button', { name: 'Entrar' })).toBeVisible();
    const firstPost = page.getByRole('listitem').first();
    await expect(firstPost).toBeVisible();

    // O app usa window.alert(), que trava a página até alguém clicar em "OK".
    // Registramos o handler ANTES do clique: ele guarda os dados do alerta e o fecha.
    let dialogType = '';
    let dialogMessage = '';
    page.once('dialog', async (dialog) => {
      dialogType = dialog.type();
      dialogMessage = dialog.message();
      await dialog.accept();
    });

    await firstPost.getByRole('button', { name: /Curtir/ }).click();

    await expect.poll(() => dialogMessage).toBe('Você precisa estar autenticado para curtir posts!');
    expect(dialogType).toBe('alert');

    // O post continua sem curtida
    await expect(firstPost.getByRole('button', { name: /Curtir/ })).toBeVisible();
    await expect(firstPost.getByRole('button', { name: /Curtido/ })).toHaveCount(0);
  });

  test('visitante que acessa "/auth/liked" é redirecionado para o login', async ({ page }) => {
    await page.goto('/auth/liked');

    await expect(page).toHaveURL(/\/signin$/);
    await expect(page.getByRole('heading', { name: 'Entrar' })).toBeVisible();
  });
});
