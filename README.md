# SQA Social Media

Projeto educacional com uma API Spring Boot e um frontend Next.js.

## Visão Geral

- `api/`: backend Java 17 com Spring Boot, autenticação, usuários, posts e curtidas.
- `client/`: frontend Next.js/React que consome a API.

Principais rotas da aplicação:

- Frontend: `http://localhost:3000`
- API: `http://localhost:8080`

## Como Rodar

Pré-requisitos:

- Java 17+
- Node.js 18+
- npm
- MySQL configurado para o ambiente de desenvolvimento

API:

```bash
cd api
./mvnw spring-boot:run
```

Frontend:

```bash
cd client
npm install
npm run dev
```

O frontend usa `NEXT_PUBLIC_BASE_URL` para definir a URL da API. Exemplo de `.env` em `client/`:

```env
NEXT_PUBLIC_BASE_URL=http://localhost:8080
```

## Testes automatizados

| Tipo | Ferramenta | Onde | Como rodar |
|---|---|---|---|
| Caixa-branca da API (unidade e integração) | JUnit 5, Mockito, MockMvc, H2 | `api/src/test` | `cd api && ./mvnw test` |
| Caixa-branca do front (unidade e componente) | Jest, Testing Library | `client/src/**/__tests__` | `cd client && npm test` |
| Caixa-preta (API e E2E) | Playwright | `tests/` | com API e site rodando: `cd tests && npx playwright test` |

## Integração Contínua (GitHub Actions)

O workflow [`.github/workflows/ci.yml`](.github/workflows/ci.yml) é disparado sempre que um Pull Request para a `main` é aberto ou atualizado. Ele executa:

1. **API - JUnit**: configura o Java 17 e roda `./mvnw test`.
2. **Client - Jest**: configura o Node.js 20, roda `npm ci` e `npm test`.
3. **Caixa-preta - Playwright**: sobe um MySQL 8 como serviço, compila e inicia a API (porta 8080), gera o build e inicia o client (porta 3000), instala o Chromium e roda toda a suíte de API e E2E.

Os relatórios do JUnit, a cobertura do Jest e o relatório HTML do Playwright ficam disponíveis como artefatos de cada execução.

## Documentações

- [README da API](api/README.md)
- [README do Frontend](client/README.md)
- [DummyJSON API Docs](https://dummyjson.com/docs)
