import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import PostCard from "@/components/PostCard";
import { Post } from "@/service/types";

const POST: Post = {
  id: 1,
  title: "Título do post",
  body: "Corpo do post",
  liked: false,
  reactions: { likes: 192, dislikes: 25 },
};

describe("PostCard", () => {
  let alertSpy: jest.SpyInstance;

  beforeEach(() => {
    alertSpy = jest.spyOn(window, "alert").mockImplementation(() => {});
  });

  afterEach(() => {
    alertSpy.mockRestore();
  });

  it("exibe título, corpo e botão Curtir", () => {
    render(<PostCard post={POST} isAuthenticated={false} onLike={jest.fn()} />);

    expect(screen.getByRole("heading", { name: "Título do post" })).toBeInTheDocument();
    expect(screen.getByText("Corpo do post")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Curtir/ })).toBeInTheDocument();
  });

  it("exibe o número de curtidas e descurtidas vindo de reactions", () => {
    render(<PostCard post={POST} isAuthenticated={false} onLike={jest.fn()} />);

    expect(screen.getByTestId("post-likes")).toHaveTextContent("192 curtidas");
    expect(screen.getByTestId("post-dislikes")).toHaveTextContent("25 descurtidas");
  });

  it("curtir o post não altera os contadores do DummyJSON", async () => {
    const onLike = jest.fn().mockResolvedValue(undefined);
    render(<PostCard post={POST} isAuthenticated onLike={onLike} />);

    fireEvent.click(screen.getByRole("button", { name: /Curtir/ }));
    await screen.findByRole("button", { name: /Curtido/ });

    expect(screen.getByTestId("post-likes")).toHaveTextContent("192 curtidas");
    expect(screen.getByTestId("post-dislikes")).toHaveTextContent("25 descurtidas");
  });

  it("mostra Curtido quando o post já vem curtido", () => {
    render(
      <PostCard post={{ ...POST, liked: true }} isAuthenticated onLike={jest.fn()} />
    );

    expect(screen.getByRole("button", { name: /Curtido/ })).toBeInTheDocument();
  });

  it("visitante sem login recebe alerta e onLike não é chamado", () => {
    const onLike = jest.fn();
    render(<PostCard post={POST} isAuthenticated={false} onLike={onLike} />);

    fireEvent.click(screen.getByRole("button", { name: /Curtir/ }));

    expect(alertSpy).toHaveBeenCalledWith(
      "Você precisa estar autenticado para curtir posts!"
    );
    expect(onLike).not.toHaveBeenCalled();
  });

  it("usuário logado curte: chama onLike com o id e o botão vira Curtido", async () => {
    const onLike = jest.fn().mockResolvedValue(undefined);
    render(<PostCard post={POST} isAuthenticated onLike={onLike} />);

    fireEvent.click(screen.getByRole("button", { name: /Curtir/ }));

    expect(onLike).toHaveBeenCalledWith(1);
    expect(await screen.findByRole("button", { name: /Curtido/ })).toBeInTheDocument();
  });

  it("se onLike falhar, desfaz a curtida e mostra alerta de erro", async () => {
    const onLike = jest.fn().mockRejectedValue(new Error("falhou"));
    render(<PostCard post={POST} isAuthenticated onLike={onLike} />);

    fireEvent.click(screen.getByRole("button", { name: /Curtir/ }));

    await waitFor(() =>
      expect(alertSpy).toHaveBeenCalledWith("Erro ao curtir post. Tente novamente.")
    );
    expect(screen.getByRole("button", { name: /Curtir/ })).toBeInTheDocument();
  });
});
