package com.demoapp.demo.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.NullSource;
import org.junit.jupiter.params.provider.ValueSource;

import com.demoapp.demo.model.User;
import com.demoapp.demo.repository.UserRepository;

/**
 * Testes de unidade (caixa-branca) do UserService.
 * O repositório é substituído por um mock, então nenhum banco é usado.
 */
class UserServiceTest {

  private UserRepository userRepository;
  private UserService userService;

  @BeforeEach
  void setUp() {
    userRepository = mock(UserRepository.class);
    userService = new UserService(userRepository);
  }

  @Test
  @DisplayName("isEmailValid aceita e-mail que contém @")
  void emailComArrobaEhValido() {
    assertTrue(userService.isEmailValid("aluno@fag.edu.br"));
  }

  @ParameterizedTest
  @NullSource
  @ValueSource(strings = { "", "alunofag.edu.br" })
  @DisplayName("isEmailValid rejeita e-mail nulo, vazio ou sem @")
  void emailSemArrobaEhInvalido(String email) {
    assertFalse(userService.isEmailValid(email));
  }

  @Test
  @DisplayName("isPasswordValid aceita senha com maiúscula, minúscula, número e especial")
  void senhaForteEhValida() {
    assertTrue(userService.isPasswordValid("Teste@1234"));
  }

  @ParameterizedTest
  @ValueSource(strings = {
      "Te@1",        // menos de 8 caracteres
      "teste@1234",  // sem maiúscula
      "TESTE@1234",  // sem minúscula
      "Teste@abcd",  // sem número
      "Teste12345"   // sem caractere especial
  })
  @DisplayName("isPasswordValid rejeita senha que não cumpre cada regra")
  void senhaFracaEhInvalida(String password) {
    assertFalse(userService.isPasswordValid(password));
  }

  @Test
  @DisplayName("createUser monta o usuário e delega o save ao repositório")
  void createUserSalvaNoRepositorio() {
    when(userRepository.save(any(User.class))).thenAnswer(inv -> {
      User u = inv.getArgument(0);
      u.setId(1L);
      return u;
    });

    User created = userService.createUser("aluno@fag.edu.br", "Teste@1234");

    assertEquals(1L, created.getId());
    assertEquals("aluno@fag.edu.br", created.getEmail());
    assertEquals("Teste@1234", created.getPassword());
    verify(userRepository).save(any(User.class));
  }

  @Test
  @DisplayName("findByEmail devolve o usuário quando ele existe")
  void findByEmailEncontrado() {
    User user = new User();
    user.setEmail("aluno@fag.edu.br");
    when(userRepository.findByEmail("aluno@fag.edu.br")).thenReturn(Optional.of(user));

    assertSame(user, userService.findByEmail("aluno@fag.edu.br"));
  }

  @Test
  @DisplayName("findByEmail devolve null quando o usuário não existe")
  void findByEmailNaoEncontrado() {
    when(userRepository.findByEmail(any())).thenReturn(Optional.empty());

    assertNull(userService.findByEmail("ninguem@fag.edu.br"));
  }
}
