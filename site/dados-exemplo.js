// Dados FICTÍCIOS, só para visualizar o funcionamento do site.
// Os campos imitam o formato exportado pelo "Instagram Reel Scraper" do Apify.
window.DADOS_EXEMPLO = (function () {
  let semente = 42;
  const aleatorio = () => (semente = (semente * 16807) % 2147483647) / 2147483647;

  const hoje = Date.now();
  const reels = [];
  for (let i = 0; i < 40; i++) {
    const diasAtras = Math.round(i * 3 + aleatorio() * 2);
    const views = Math.round(300000 + Math.pow(aleatorio(), 3) * 9000000);
    reels.push({
      url: "https://www.instagram.com/reel/exemplo" + i + "/",
      caption: "Reel de exemplo nº " + (40 - i),
      timestamp: new Date(hoje - diasAtras * 86400000).toISOString(),
      videoPlayCount: views,
      likesCount: Math.round(views * (0.03 + aleatorio() * 0.07)),
      commentsCount: Math.round(views * (0.001 + aleatorio() * 0.004)),
      videoDuration: Math.round(15 + aleatorio() * 105)
    });
  }
  return { perfil: "@perfil_exemplo", seguidores: 2500000, reels };
})();
