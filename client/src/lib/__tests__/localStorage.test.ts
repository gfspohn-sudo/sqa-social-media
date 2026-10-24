import {
  saveUser,
  getUser,
  removeUser,
  isAuthenticated,
} from "@/lib/localStorage";

const USER = { id: 1, email: "aluno@fag.edu.br" };

beforeEach(() => {
  localStorage.clear();
});

describe("localStorage do usuário", () => {
  it("getUser devolve null quando não há nada salvo", () => {
    expect(getUser()).toBeNull();
    expect(isAuthenticated()).toBe(false);
  });

  it("getUser devolve o usuário gravado na chave sqa_social_user", () => {
    localStorage.setItem("sqa_social_user", JSON.stringify(USER));

    expect(getUser()).toEqual(USER);
    expect(isAuthenticated()).toBe(true);
  });

  it("getUser devolve null quando o JSON salvo está corrompido", () => {
    localStorage.setItem("sqa_social_user", "{json inválido");

    expect(getUser()).toBeNull();
  });

  it("removeUser apaga o usuário salvo", () => {
    localStorage.setItem("sqa_social_user", JSON.stringify(USER));

    removeUser();

    expect(getUser()).toBeNull();
  });

  /**
   * Defeito conhecido (o mesmo achado pelo E2E da Atividade 3): saveUser grava
   * na chave "user", mas getUser lê de "sqa_social_user". it.failing documenta
   * o bug: o teste passa enquanto o defeito existir e quebra quando for corrigido.
   */
  it.failing("BUG conhecido: getUser deveria ler o que saveUser gravou", () => {
    saveUser(USER);

    expect(getUser()).toEqual(USER);
  });
});
