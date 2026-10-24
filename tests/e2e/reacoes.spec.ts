import { test, expect } from '@playwright/test';
import { API_URL } from '../playwright.config';

/**
 * Feature "likes e dislikes": a Home deve exibir, em cada post,
 * o número de curtidas e descurtidas vindo do objeto reactions do DummyJSON.
 */
test.describe('E2E - Curtidas e descurtidas na Home', () => {
  test('cada post do feed mostra likes e dislikes iguais aos da API', async ({ page, request }) => {
    // Os mesmos 10 primeiros posts que a Home carrega
    const response = await request.get(`${API_URL}/posts`, { params: { limit: 10, skip: 0 } });
    const { posts } = await response.json();

    await page.goto('/');

    const cards = page.getByRole('listitem');
    await expect(cards).toHaveCount(posts.length);

    for (const [i, post] of posts.entries()) {
      const card = cards.nth(i);
      await expect(card.getByRole('heading')).toHaveText(post.title);
      await expect(card.getByTestId('post-likes')).toHaveText(`👍 ${post.reactions.likes} curtidas`);
      await expect(card.getByTestId('post-dislikes')).toHaveText(
        `👎 ${post.reactions.dislikes} descurtidas`,
      );
    }
  });

  test('"Carregar mais" também traz as reações dos novos posts', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('listitem')).toHaveCount(10);

    await page.getByRole('button', { name: 'Carregar mais' }).click();

    const cards = page.getByRole('listitem');
    await expect(cards).toHaveCount(20);
    await expect(cards.nth(15).getByTestId('post-likes')).toHaveText(/^👍 \d+ curtidas$/);
    await expect(cards.nth(15).getByTestId('post-dislikes')).toHaveText(/^👎 \d+ descurtidas$/);
  });
});
