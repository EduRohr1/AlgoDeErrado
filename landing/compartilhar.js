// Botão "Compartilhar" no topo: menu nativo do aparelho no celular; no computador, WhatsApp, X, Facebook e copiar link.
(function () {
  const caixa = document.getElementById('compartilhar');
  if (!caixa) return;
  const botao = document.getElementById('compBotao');
  const menu = document.getElementById('compMenu');
  const URL_SITE = 'https://comoeleconsegue.pages.dev/';
  const TEXTO = 'O alcance de Nikolas Ferreira é orgânico? Veja os dados:';
  const enc = encodeURIComponent;
  const links = {
    whatsapp: `https://wa.me/?text=${enc(TEXTO + ' ' + URL_SITE)}`,
    x: `https://twitter.com/intent/tweet?text=${enc(TEXTO)}&url=${enc(URL_SITE + '?x=1')}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${enc(URL_SITE)}`,
  };
  menu.querySelectorAll('a[data-rede]').forEach(a => { a.href = links[a.dataset.rede]; });

  const abrir = sim => { menu.hidden = !sim; botao.setAttribute('aria-expanded', String(sim)); };
  const nativo = navigator.share && matchMedia('(pointer: coarse)').matches;
  botao.addEventListener('click', async () => {
    if (nativo) {
      try { await navigator.share({ title: document.title, text: TEXTO, url: URL_SITE }); return; }
      catch (e) { if (e.name === 'AbortError') return; }
    }
    abrir(menu.hidden);
  });
  menu.addEventListener('click', async e => {
    const b = e.target.closest('[data-rede="copiar"]');
    if (b) {
      try { await navigator.clipboard.writeText(URL_SITE); b.textContent = 'Link copiado!'; }
      catch { prompt('Copie o link:', URL_SITE); }
      setTimeout(() => { b.textContent = 'Copiar link'; abrir(false); }, 1500);
    } else if (e.target.closest('a')) abrir(false);
  });
  document.addEventListener('click', e => { if (!caixa.contains(e.target)) abrir(false); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !menu.hidden) { abrir(false); botao.focus(); } });
})();
