import { test, expect } from '@playwright/test';
import { VALID_PASSWORD, createUser, uniqueEmail } from '../utils/data';

/**
 * Testes de API (caixa-preta) dos endpoints de autenticação.
 * Não olhamos o código Java: enviamos uma entrada conhecida e validamos
 * apenas o contrato público — status HTTP e corpo da resposta.
 */
test.describe('API - Autenticação (/auth)', () => {
  test('POST /auth/signup cria usuário com dados válidos', async ({ request }) => {
    const email = uniqueEmail('signup');

    const response = await request.post('/auth/signup', {
      data: { email, password: VALID_PASSWORD },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.id).toEqual(expect.any(Number));
    expect(body.email).toBe(email);
  });

  test('POST /auth/signup com e-mail duplicado retorna 409', async ({ request }) => {
    const user = await createUser(request);

    const response = await request.post('/auth/signup', {
      data: { email: user.email, password: VALID_PASSWORD },
    });

    expect(response.status()).toBe(409);
    expect(await response.json()).toEqual({
      message: 'E-mail já está em uso',
      status: 409,
    });
  });

  test('POST /auth/signup com senha fraca retorna 422', async ({ request }) => {
    const response = await request.post('/auth/signup', {
      data: { email: uniqueEmail('fraca'), password: '12345678' },
    });

    expect(response.status()).toBe(422);
    const body = await response.json();
    expect(body.message).toBe('Senha inválida');
  });

  test('POST /auth/signin com credenciais corretas retorna o usuário', async ({ request }) => {
    const user = await createUser(request);

    const response = await request.post('/auth/signin', {
      data: { email: user.email, password: user.password },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.id).toBe(user.id);
    expect(body.email).toBe(user.email);
  });

  test('POST /auth/signin com senha errada retorna 401', async ({ request }) => {
    const user = await createUser(request);

    const response = await request.post('/auth/signin', {
      data: { email: user.email, password: 'Errada@9999' },
    });

    expect(response.status()).toBe(401);
    expect(await response.json()).toEqual({
      message: 'Credenciais inválidas',
      status: 401,
    });
  });

  test('POST /auth/reset-password com e-mail não cadastrado retorna 404', async ({ request }) => {
    const response = await request.post('/auth/reset-password', {
      data: { email: uniqueEmail('naoexiste') },
    });

    expect(response.status()).toBe(404);
    const body = await response.json();
    expect(body.message).toBe('Usuário não encontrado');
  });
});
