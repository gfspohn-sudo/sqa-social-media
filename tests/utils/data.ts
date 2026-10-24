import { APIRequestContext, expect } from '@playwright/test';
import { API_URL } from '../playwright.config';

/**
 * Senha que atende às regras do front (mais de 8 caracteres) e da API
 * (maiúscula, minúscula, número e caractere especial entre @$!%*?&).
 */
export const VALID_PASSWORD = 'Teste@1234';

/**
 * Gera um e-mail diferente a cada chamada. Assim os testes não dependem
 * do estado do banco e podem ser executados várias vezes seguidas.
 */
export function uniqueEmail(prefix = 'user'): string {
  const random = Math.random().toString(36).slice(2, 8);
  return `${prefix}.${Date.now()}.${random}@teste.com`;
}

/**
 * Cria um usuário direto pela API (pré-condição dos testes),
 * sem precisar passar pela tela de cadastro.
 */
export async function createUser(
  request: APIRequestContext,
  email = uniqueEmail(),
  password = VALID_PASSWORD,
) {
  const response = await request.post(`${API_URL}/auth/signup`, {
    data: { email, password },
  });
  expect(response.ok()).toBeTruthy();
  const user = await response.json();
  return { id: user.id as number, email, password };
}
