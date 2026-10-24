package com.demoapp.demo.controller;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.demoapp.demo.service.PostService;

/**
 * Testes da camada web do PostController (só o controller é carregado,
 * o PostService é um mock). Validam parâmetros, status HTTP e tratamento de erro.
 */
@WebMvcTest(PostController.class)
class PostControllerTest {

  @Autowired
  private MockMvc mvc;

  @MockitoBean
  private PostService postService;

  @Test
  @DisplayName("GET /posts repassa limit, skip e userId para o service")
  void getPostsRepassaParametros() throws Exception {
    when(postService.getPosts(5, 10, 7L)).thenReturn(Map.of("posts", List.of(), "total", 0));

    mvc.perform(get("/posts").param("limit", "5").param("skip", "10").param("userId", "7"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.total").value(0));

    verify(postService).getPosts(5, 10, 7L);
  }

  @Test
  @DisplayName("GET /posts devolve 500 com mensagem quando o service falha")
  void getPostsErro() throws Exception {
    when(postService.getPosts(null, null, null)).thenThrow(new RuntimeException("DummyJSON fora do ar"));

    mvc.perform(get("/posts"))
        .andExpect(status().isInternalServerError())
        .andExpect(jsonPath("$.status").value(500))
        .andExpect(jsonPath("$.message").value("Erro ao buscar posts: DummyJSON fora do ar"));
  }

  @Test
  @DisplayName("GET /posts/liked sem userId devolve 400")
  void getLikedSemUserId() throws Exception {
    mvc.perform(get("/posts/liked")).andExpect(status().isBadRequest());

    verifyNoInteractions(postService);
  }

  @Test
  @DisplayName("POST /posts/{id}/like devolve o resultado do toggle")
  void toggleLike() throws Exception {
    when(postService.toggleLike(1L, 7L)).thenReturn(Map.of("postId", 1L, "liked", true));

    mvc.perform(post("/posts/1/like").param("userId", "7"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.postId").value(1))
        .andExpect(jsonPath("$.liked").value(true));
  }

  @Test
  @DisplayName("POST /posts/{id}/like sem userId devolve 400")
  void toggleLikeSemUserId() throws Exception {
    mvc.perform(post("/posts/1/like")).andExpect(status().isBadRequest());

    verifyNoInteractions(postService);
  }
}
