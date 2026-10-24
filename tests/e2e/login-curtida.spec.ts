import { test, expect, Page } from '@playwright/test';
import { createUser } from '../utils/data';

/** Preenche e envia o formulário da tela /signin. */
async function login(page: Page, email: string, password: string) {
  await page.goto('/signin');
  await page.getByPlaceholder('seu@email.com').fill(email);
  await page.locator('input[type="password"]').fill(password);
  await page.getByRole('main').getByRole('button', { name: 'Entrar' }).click();
}

/**
 * Fluxo E2E de login + curtida: o usuário entra, curte um post do feed
 * e encontra esse post na página "Posts Curtidos".
 */
test.describe('E2E - Login e curtida autenticada', () => {
  test('usuário faz login, curte um post e o vê em "Posts Curtidos"', async ({ page, request }) => {
    // Pré-condição: usuário já cadastrado (criado via API para o teste ser independente)
    const user = await createUser(request);

    await login(page, user.email, user.password);
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole('banner').getByRole('button', { name: 'Sair' })).toBeVisible();

    // Pega o primeiro post do feed e guarda o título para conferir depois
    const firstPost = page.getByRole('listitem').first();
    const title = await firstPost.getByRole('heading').innerText();

    await firstPost.getByRole('button', { name: /Curtir/ }).click();
    await expect(firstPost.getByRole('button', { name: /Curtido/ })).toBeVisible();

    // Navega pelo botão do cabeçalho (como um usuário faria)
    await page.getByRole('banner').getByRole('button', { name: 'Posts Curtidos' }).click();
    await expect(page).toHaveURL(/\/auth\/liked$/);
    await expect(page.getByRole('heading', { name: 'Posts Curtidos', level: 1 })).toBeVisible();

    const likedPosts = page.getByRole('listitem');
    await expect(likedPosts).toHaveCount(1);
    await expect(likedPosts.first().getByRole('heading')).toHaveText(title);
  });

  test('login com senha errada exibe "Credenciais inválidas"', async ({ page, request }) => {
    const user = await createUser(request);

    await login(page, user.email, 'Errada@9999');

    await expect(page.getByText('Credenciais inválidas')).toBeVisible();
    await expect(page).toHaveURL(/\/signin$/);
  });

  /**
   * Defeito encontrado: o front salva o usuário no localStorage com a chave "user",
   * mas lê da chave "sqa_social_user" (client/src/lib/localStorage.ts).
   * Resultado: ao recarregar a página o usuário é deslogado.
   * test.fail() documenta o bug: o teste "passa" enquanto o defeito existir
   * e vai acusar quando alguém corrigir o código.
   */
  test('BUG conhecido: sessão deveria continuar após recarregar a página', async ({ page, request }) => {
    test.fail();
    const user = await createUser(request);

    await login(page, user.email, user.password);
    await expect(page.getByRole('banner').getByRole('button', { name: 'Sair' })).toBeVisible();

    await page.reload();

    await expect(page.getByRole('banner').getByRole('button', { name: 'Sair' })).toBeVisible({
      timeout: 5_000,
    });
  });
});
