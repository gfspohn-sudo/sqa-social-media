import { defineConfig, devices } from '@playwright/test';

/**
 * URLs do sistema em execução. Podem ser sobrescritas por variáveis de ambiente
 * caso a API ou o front rodem em outra porta/máquina.
 */
export const API_URL = process.env.API_URL ?? 'http://localhost:8080';
export const WEB_URL = process.env.WEB_URL ?? 'http://localhost:3000';

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  /* Raiz onde ficam as duas suítes: ./api e ./e2e */
  testDir: '.',
  /* Cada teste gera seus próprios dados (e-mail único), então podem rodar em paralelo */
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  /* 'list' mostra o resultado no terminal; 'html' gera o relatório navegável */
  reporter: [['list'], ['html', { open: 'never' }]],
  /* A API busca os posts no DummyJSON, então damos um pouco mais de folga */
  timeout: 60_000,
  expect: { timeout: 10_000 },
  use: {
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      /* Testes de API (caixa-preta): só fazem requisições HTTP, sem navegador */
      name: 'api',
      testDir: './api',
      use: {
        baseURL: API_URL,
        extraHTTPHeaders: { 'Content-Type': 'application/json' },
      },
    },
    {
      /* Testes E2E: simulam um usuário real no Chrome usando o front em execução */
      name: 'e2e',
      testDir: './e2e',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: WEB_URL,
      },
    },
  ],
});
