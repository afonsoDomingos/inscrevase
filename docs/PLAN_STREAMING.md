# Planejamento: Transmissão Ao Vivo Nativa (Streaming)

## 1. Opção Imediata: Embed Inteligente (Youtube/Vimeo/Twitch)
Atualmente, o Hub apenas exibe um botão "Acessar Link". Podemos melhorar isso imediatamente.
*   **Como funciona:** Se o sistema detectar que o link é do Youtube, Vimeo ou Twitch, ele exibe o player de vídeo diretamente no Hub, em destaque.
*   **Vantagem:** Custo zero, implementação rápida (Frontend only).
*   **Contras:** Depende de plataformas de terceiros, anúncios (se não for conta premium), usuário pode clicar para sair.

## 2. Opção Profissional: Streaming White-label (Mux / Cloudinary / AWS IVS)
Para uma experiência **"Netflix/Hotmart"**, onde o mentor transmite e o vídeo roda nativamente no seu player, sem marcas do Youtube.
*   **Tecnologia:** [Mux Video API](https://www.mux.com/) ou [AWS IVS](https://aws.amazon.com/ivs/).
*   **Fluxo:**
    1.  Mentor clica em "Iniciar Transmissão" no painel.
    2.  Sistema gera uma **Stream Key** e **RTMP URL**.
    3.  Mentor coloca esses dados no OBS Studio (ou StreamYard).
    4.  O player no Hub recebe o sinal e transmite com qualidade adaptativa.
*   **Custo:** Geralmente cobrado por minuto de vídeo streamado/armazenado.
*   **Desenvolvimento:** Requer Backend (Node.js) para gerenciar chaves e Webhooks.

## 3. Opção Interativa: Videoconferência (LiveKit / Daily.co)
Se o objetivo é permitir que alunos falem (áudio/vídeo) tipo Zoom.
*   **Tecnologia:** [LiveKit](https://livekit.io/) (Open Source/Cloud).
*   **Complexidade:** Alta. Requer gerenciamento de salas, permissões de microfone/câmera no navegador.

## Minha Recomendação (Roadmap)
1.  **Hoje:** Implementar o **Embed Inteligente**. Se o mentor colocar link do Youtube, já aparece o vídeo grande no topo do Hub.
2.  **Futuro:** Implementar integração com **Mux** para eventos "Premium" onde o mentor quer controle total e proteção de conteúdo (DRM).
