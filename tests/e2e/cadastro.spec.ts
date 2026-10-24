import { test, expect } from '@playwright/test';
import { VALID_PASSWORD, uniqueEmail } from '../utils/data';

/**
 * Fluxo E2E de cadastro: o usuário sai da home, abre a tela "Criar Conta",
 * preenche o formulário e termina logado no feed.
 */
test.describe('E2E - Cadastro', () => {
  test('usuário cria conta pela interface e já entra logado', async ({ page }) => {
    const email = uniqueEmail('e2e.cadastro');

    await page.goto('/');
    await page.getByRole('banner').getByRole('button', { name: 'Criar Conta' }).click();
    await expect(page).toHaveURL(/\/signup$/);

    // Os <label> do formulário não estão ligados aos inputs (sem htmlFor),
    // por isso localizamos pelos placeholders/tipo do campo.
    await page.getByPlaceholder('seu@email.com').fill(email);
    const passwordFields = page.locator('input[type="password"]');
    await passwordFields.nth(0).fill(VALID_PASSWORD);
    await passwordFields.nth(1).fill(VALID_PASSWORD);
    await page.getByRole('main').getByRole('button', { name: 'Criar Conta' }).click();

    // Após o cadastro o app redireciona para o feed com o usuário autenticado
    await expect(page).toHaveURL(/\/$/);
    const header = page.getByRole('banner');
    await expect(header.getByRole('button', { name: 'Sair' })).toBeVisible();
    await expect(header.getByRole('button', { name: 'Posts Curtidos' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Feed de Posts' })).toBeVisible();
  });

  test('cadastro com senhas diferentes mostra erro e não sai da tela', async ({ page }) => {
    await page.goto('/signup');

    await page.getByPlaceholder('seu@email.com').fill(uniqueEmail('e2e.erro'));
    const passwordFields = page.locator('input[type="password"]');
    await passwordFields.nth(0).fill(VALID_PASSWORD);
    await passwordFields.nth(1).fill('Outra@1234');
    await page.getByRole('main').getByRole('button', { name: 'Criar Conta' }).click();

    await expect(page.getByText('As senhas não coincidem')).toBeVisible();
    await expect(page).toHaveURL(/\/signup$/);
  });
});
