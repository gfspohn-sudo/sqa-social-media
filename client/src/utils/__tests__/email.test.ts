import { isEmailValid, getEmailValidationMessage } from "@/utils/email";

describe("isEmailValid", () => {
  it("aceita e-mail no formato usuario@dominio.ext", () => {
    expect(isEmailValid("aluno@fag.edu.br")).toBe(true);
  });

  it("ignora espaços nas pontas (usa trim)", () => {
    expect(isEmailValid("  aluno@fag.edu.br  ")).toBe(true);
  });

  it.each(["", "alunofag.edu.br", "aluno@fag", "aluno @fag.com", "@fag.com"])(
    "rejeita %p",
    (email) => {
      expect(isEmailValid(email)).toBe(false);
    }
  );
});

describe("getEmailValidationMessage", () => {
  it("pede o e-mail quando vazio", () => {
    expect(getEmailValidationMessage("")).toBe("Email é obrigatório");
  });

  it("avisa quando o formato é inválido", () => {
    expect(getEmailValidationMessage("aluno")).toBe("Email inválido");
  });

  it("devolve string vazia quando o e-mail é válido", () => {
    expect(getEmailValidationMessage("aluno@fag.edu.br")).toBe("");
  });
});
