package com.demoapp.demo.controller;

import static org.hamcrest.Matchers.notNullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import com.demoapp.demo.repository.UserRepository;

/**
 * Testes de integração do AuthController: sobem o contexto Spring completo
 * (controller + service + repositório JPA) usando o H2 em memória definido em
 * src/test/resources/application.properties.
 */
@SpringBootTest
@AutoConfigureMockMvc
class AuthControllerIntegrationTest {

  private static final String EMAIL = "aluno@fag.edu.br";
  private static final String SENHA = "Teste@1234";

  @Autowired
  private MockMvc mvc;

  @Autowired
  private UserRepository userRepository;

  @BeforeEach
  void limparBanco() {
    userRepository.deleteAll();
  }

  private static String json(String email, String password) {
    return "{\"email\":\"" + email + "\",\"password\":\"" + password + "\"}";
  }

  private void cadastrar(String email, String password) throws Exception {
    mvc.perform(post("/auth/signup").contentType(MediaType.APPLICATION_JSON).content(json(email, password)))
        .andExpect(status().isOk());
  }

  @Test
  @DisplayName("signup válido devolve 200 com id gerado e persiste o usuário")
  void signupValido() throws Exception {
    mvc.perform(post("/auth/signup").contentType(MediaType.APPLICATION_JSON).content(json(EMAIL, SENHA)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.id", notNullValue()))
        .andExpect(jsonPath("$.email").value(EMAIL));

    org.junit.jupiter.api.Assertions.assertTrue(userRepository.findByEmail(EMAIL).isPresent());
  }

  @Test
  @DisplayName("signup com e-mail inválido devolve 422")
  void signupEmailInvalido() throws Exception {
    mvc.perform(post("/auth/signup").contentType(MediaType.APPLICATION_JSON).content(json("semarroba", SENHA)))
        .andExpect(status().is(422))
        .andExpect(jsonPath("$.message").value("E-mail inválido"));
  }

  @Test
  @DisplayName("signup com senha fraca devolve 422")
  void signupSenhaFraca() throws Exception {
    mvc.perform(post("/auth/signup").contentType(MediaType.APPLICATION_JSON).content(json(EMAIL, "123")))
        .andExpect(status().is(422))
        .andExpect(jsonPath("$.message").value("Senha inválida"));
  }

  @Test
  @DisplayName("signup com e-mail já cadastrado devolve 409")
  void signupDuplicado() throws Exception {
    cadastrar(EMAIL, SENHA);

    mvc.perform(post("/auth/signup").contentType(MediaType.APPLICATION_JSON).content(json(EMAIL, SENHA)))
        .andExpect(status().isConflict())
        .andExpect(jsonPath("$.message").value("E-mail já está em uso"));
  }

  @Test
  @DisplayName("signin com credenciais corretas devolve 200")
  void signinValido() throws Exception {
    cadastrar(EMAIL, SENHA);

    mvc.perform(post("/auth/signin").contentType(MediaType.APPLICATION_JSON).content(json(EMAIL, SENHA)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.email").value(EMAIL));
  }

  @Test
  @DisplayName("signin com senha errada devolve 401")
  void signinSenhaErrada() throws Exception {
    cadastrar(EMAIL, SENHA);

    mvc.perform(post("/auth/signin").contentType(MediaType.APPLICATION_JSON).content(json(EMAIL, "Errada@9999")))
        .andExpect(status().isUnauthorized())
        .andExpect(jsonPath("$.message").value("Credenciais inválidas"));
  }

  @Test
  @DisplayName("signin de usuário inexistente devolve 401")
  void signinUsuarioInexistente() throws Exception {
    mvc.perform(post("/auth/signin").contentType(MediaType.APPLICATION_JSON).content(json(EMAIL, SENHA)))
        .andExpect(status().isUnauthorized());
  }

  @Test
  @DisplayName("reset-password de e-mail cadastrado devolve 200")
  void resetPasswordExistente() throws Exception {
    cadastrar(EMAIL, SENHA);

    mvc.perform(post("/auth/reset-password").contentType(MediaType.APPLICATION_JSON).content("{\"email\":\"" + EMAIL + "\"}"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.message").value("Senha redefinida com sucesso (fake)"));
  }

  @Test
  @DisplayName("reset-password de e-mail não cadastrado devolve 404")
  void resetPasswordInexistente() throws Exception {
    mvc.perform(post("/auth/reset-password").contentType(MediaType.APPLICATION_JSON).content("{\"email\":\"" + EMAIL + "\"}"))
        .andExpect(status().isNotFound())
        .andExpect(jsonPath("$.message").value("Usuário não encontrado"));
  }
}
