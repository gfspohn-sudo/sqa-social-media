package com.demoapp.demo.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.*;
import static org.springframework.test.web.client.response.MockRestResponseCreators.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestTemplate;

import com.demoapp.demo.model.UserPostReaction;
import com.demoapp.demo.repository.UserPostReactionRepository;

/**
 * Testes de unidade (caixa-branca) do PostService.
 * O DummyJSON é simulado com MockRestServiceServer e o repositório com Mockito,
 * então os testes não dependem de internet nem de banco.
 */
class PostServiceTest {

  private static final String DUMMY_POSTS = """
      {
        "posts": [
          { "id": 1, "title": "Post 1", "body": "Corpo 1", "reactions": { "likes": 192, "dislikes": 25 } },
          { "id": 2, "title": "Post 2", "body": "Corpo 2", "reactions": { "likes": 859, "dislikes": 32 } }
        ],
        "total": 251, "skip": 0, "limit": 2
      }
      """;

  private UserPostReactionRepository reactionRepository;
  private MockRestServiceServer dummyJson;
  private PostService postService;

  @BeforeEach
  void setUp() {
    reactionRepository = mock(UserPostReactionRepository.class);
    RestTemplate restTemplate = new RestTemplate();
    dummyJson = MockRestServiceServer.bindTo(restTemplate).build();
    postService = new PostService(reactionRepository, restTemplate);
  }

  private static UserPostReaction reaction(Long userId, Long postId) {
    UserPostReaction r = new UserPostReaction();
    r.setUserId(userId);
    r.setPostId(postId);
    return r;
  }

  @Test
  @DisplayName("getPosts repassa limit/skip ao DummyJSON e mapeia os campos do post")
  @SuppressWarnings("unchecked")
  void getPostsMapeiaResposta() {
    dummyJson.expect(requestTo("https://dummyjson.com/posts?limit=2&skip=0"))
        .andRespond(withSuccess(DUMMY_POSTS, MediaType.APPLICATION_JSON));

    Map<String, Object> result = postService.getPosts(2, 0, null);

    List<Map<String, Object>> posts = (List<Map<String, Object>>) result.get("posts");
    assertEquals(2, posts.size());
    assertEquals(1L, posts.get(0).get("id"));
    assertEquals("Post 1", posts.get(0).get("title"));
    assertEquals("Corpo 1", posts.get(0).get("body"));
    assertEquals(251, result.get("total"));
    assertEquals(0, result.get("skip"));
    assertEquals(2, result.get("limit"));
    // Sem userId o repositório nem é consultado
    verifyNoInteractions(reactionRepository);
    dummyJson.verify();
  }

  @Test
  @DisplayName("getPosts sem parâmetros chama o DummyJSON sem query string")
  void getPostsSemParametros() {
    dummyJson.expect(requestTo("https://dummyjson.com/posts"))
        .andRespond(withSuccess(DUMMY_POSTS, MediaType.APPLICATION_JSON));

    postService.getPosts(null, null, null);

    dummyJson.verify();
  }

  @Test
  @DisplayName("getPosts marca liked=true apenas nos posts curtidos pelo usuário")
  @SuppressWarnings("unchecked")
  void getPostsMarcaCurtidos() {
    dummyJson.expect(requestTo("https://dummyjson.com/posts?limit=2&skip=0"))
        .andRespond(withSuccess(DUMMY_POSTS, MediaType.APPLICATION_JSON));
    when(reactionRepository.findByUserId(7L)).thenReturn(List.of(reaction(7L, 2L)));

    Map<String, Object> result = postService.getPosts(2, 0, 7L);

    List<Map<String, Object>> posts = (List<Map<String, Object>>) result.get("posts");
    assertEquals(false, posts.get(0).get("liked"));
    assertEquals(true, posts.get(1).get("liked"));
  }

  @Test
  @DisplayName("getPosts transforma falha do DummyJSON em RuntimeException")
  void getPostsErroExterno() {
    dummyJson.expect(requestTo("https://dummyjson.com/posts"))
        .andRespond(withServerError());

    RuntimeException ex = assertThrows(RuntimeException.class,
        () -> postService.getPosts(null, null, null));
    assertTrue(ex.getMessage().startsWith("Erro ao buscar posts"));
  }

  @Test
  @DisplayName("getLikedPosts aplica limit/skip padrão (5/0) e busca cada post curtido")
  @SuppressWarnings("unchecked")
  void getLikedPostsPaginacaoPadrao() {
    when(reactionRepository.findByUserId(7L)).thenReturn(List.of(reaction(7L, 3L)));
    dummyJson.expect(requestTo("https://dummyjson.com/posts/3"))
        .andRespond(withSuccess(
            "{ \"id\": 3, \"title\": \"Post 3\", \"body\": \"Corpo 3\", \"reactions\": { \"likes\": 10, \"dislikes\": 1 } }",
            MediaType.APPLICATION_JSON));

    Map<String, Object> result = postService.getLikedPosts(7L, null, null);

    List<Map<String, Object>> posts = (List<Map<String, Object>>) result.get("posts");
    assertEquals(1, posts.size());
    assertEquals(3L, posts.get(0).get("id"));
    assertEquals(true, posts.get(0).get("liked"));
    assertEquals(1, result.get("total"));
    assertEquals(5, result.get("limit"));
    assertEquals(0, result.get("skip"));
    dummyJson.verify();
  }

  @Test
  @DisplayName("getLikedPosts com skip além do total devolve lista vazia sem chamar o DummyJSON")
  @SuppressWarnings("unchecked")
  void getLikedPostsSkipAlemDoTotal() {
    when(reactionRepository.findByUserId(7L)).thenReturn(List.of(reaction(7L, 3L)));

    Map<String, Object> result = postService.getLikedPosts(7L, 5, 10);

    assertTrue(((List<Map<String, Object>>) result.get("posts")).isEmpty());
    assertEquals(1, result.get("total"));
    dummyJson.verify();
  }

  @Test
  @DisplayName("toggleLike cria a reação quando o post ainda não foi curtido")
  void toggleLikeCurte() {
    when(reactionRepository.findByUserIdAndPostId(7L, 1L)).thenReturn(Optional.empty());

    Map<String, Object> result = postService.toggleLike(1L, 7L);

    assertEquals(Map.of("postId", 1L, "liked", true), result);
    verify(reactionRepository).save(any(UserPostReaction.class));
    verify(reactionRepository, never()).delete(any());
  }

  @Test
  @DisplayName("toggleLike remove a reação quando o post já estava curtido")
  void toggleLikeDescurte() {
    UserPostReaction existing = reaction(7L, 1L);
    when(reactionRepository.findByUserIdAndPostId(7L, 1L)).thenReturn(Optional.of(existing));

    Map<String, Object> result = postService.toggleLike(1L, 7L);

    assertEquals(Map.of("postId", 1L, "liked", false), result);
    verify(reactionRepository).delete(existing);
    verify(reactionRepository, never()).save(any());
  }
}
