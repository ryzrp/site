/* 00-config.js (dono: Fundação). Configuração global do site. Troque os PLACEHOLDERS aqui. */
window.RYZ = {
  discord: 'https://discord.gg/jogueryz',
  server: '', /* PLACEHOLDER: código cfx.re/join (ex.: abc123) ou IP:PORTA */
  maxPlayers: 100,
  rodaApi: '', /* endereço da API da roda (Cloudflare Worker em roda-api/, ex.: https://ryz-roda.SEU.workers.dev). Vazio = roda vitrine */
  video: '', /* PLACEHOLDER: link do vídeo "Conheça a cidade" (ex.: https://youtu.be/...). Vazio = "Vídeo em breve" */
  playersEndpoint: '', /* GitHub Pages não roda a função api/players.js: o contador busca direto na API pública do FiveM (precisa de `server` com o código cfx) */
  social: { instagram: '', tiktok: '', youtube: '', twitch: '' } /* PLACEHOLDER: URLs completas das redes */
};
