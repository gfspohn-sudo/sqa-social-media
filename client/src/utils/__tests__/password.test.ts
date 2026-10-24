import {
  isPasswordValid,
  getPasswordValidationMessage,
} from "@/utils/password";

describe("isPasswordValid", () => {
  it("aceita senha com mais de 8 caracteres e todos os tipos exigidos", () => {
    expect(isPasswordValid("Teste@1234")).toBe(true);
  });

  it("exige MAIS de 8 caracteres (8 exatos é inválido)", () => {
    expect(isPasswordValid("Test@123")).toBe(false);
    expect(isPasswordValid("Teste@123")).toBe(true);
  });

  it.each([
    ["sem maiúscula", "teste@1234"],
    ["sem minúscula", "TESTE@1234"],
    ["sem número", "Teste@abcd"],
    ["sem caractere especial", "Teste12345"],
    ["vazia", ""],
  ])("rejeita senha %s", (_caso, senha) => {
    expect(isPasswordValid(senha)).toBe(false);
  });
});

describe("getPasswordValidationMessage", () => {
  it("pede a senha quando vazia", () => {
    expect(getPasswordValidationMessage("")).toBe("Senha é obrigatória");
  });

  it("lista todas as regras que faltam", () => {
    expect(getPasswordValidationMessage("abc")).toBe(
      "A senha deve conter: mínimo de 8 caracteres, uma letra maiúscula, um número, um caractere especial"
    );
  });

  it("devolve string vazia quando a senha é válida", () => {
    expect(getPasswordValidationMessage("Teste@1234")).toBe("");
  });
});
