import { test, expect } from '@playwright/test';
import { createUser } from '../utils/data';

/**
 * Testes de API (caixa-preta) dos endpoints de posts e curtidas.
 */
test.describe('API - Posts (/posts)', () => {
  test('GET /posts respeita o parâmetro limit e devolve o formato esperado', async ({ request }) => {
    const response = await request.get('/posts', { params: { limit: 5, skip: 0 } });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.posts).toHaveLength(5);
    expect(body.limit).toBe(5);
    expect(body.skip).toBe(0);

    // Sem userId ninguém curtiu nada, então todo post vem com liked = false
    for (const post of body.posts) {
      expect(post).toEqual({
        id: expect.any(Number),
        title: expect.any(String),
        body: expect.any(String),
        liked: false,
      });
    }
  });

  test('POST /posts/{id}/like curte e descurte (toggle) e reflete em /posts/liked', async ({ request }) => {
    const user = await createUser(request);
    const postId = 1;

    // 1ª chamada: curte o post
    const like = await request.post(`/posts/${postId}/like`, { params: { userId: user.id } });
    expect(like.status()).toBe(200);
    expect(await like.json()).toEqual({ postId, liked: true });

    // O post aparece na lista de curtidos do usuário
    const liked = await request.get('/posts/liked', { params: { userId: user.id } });
    expect(liked.status()).toBe(200);
    const likedBody = await liked.json();
    expect(likedBody.total).toBe(1);
    expect(likedBody.posts[0]).toMatchObject({ id: postId, liked: true });

    // 2ª chamada no mesmo post: descurte
    const unlike = await request.post(`/posts/${postId}/like`, { params: { userId: user.id } });
    expect(await unlike.json()).toEqual({ postId, liked: false });

    const afterUnlike = await request.get('/posts/liked', { params: { userId: user.id } });
    expect((await afterUnlike.json()).total).toBe(0);
  });

  test('POST /posts/{id}/like sem userId retorna 400', async ({ request }) => {
    const response = await request.post('/posts/1/like');

    expect(response.status()).toBe(400);
  });
});
