// Navbar: menu hambúrguer, barra de progresso de leitura e destaque da seção atual.
(function () {
  const cab = document.getElementById('cabecalho');
  const botao = document.getElementById('menuBotao');
  const menu = document.getElementById('menu');
  const links = [...menu.querySelectorAll('a')];

  function abrir(sim) {
    cab.classList.toggle('menu-aberto', sim);
    document.body.classList.toggle('sem-rolagem', sim);
    botao.setAttribute('aria-expanded', String(sim));
    botao.setAttribute('aria-label', sim ? 'Fechar menu' : 'Abrir menu');
    if (sim) setTimeout(() => links[0].focus(), 50); else botao.focus();
  }
  botao.addEventListener('click', () => abrir(!cab.classList.contains('menu-aberto')));
  links.forEach(a => a.addEventListener('click', () => { if (cab.classList.contains('menu-aberto')) abrir(false); }));
  document.addEventListener('keydown', e => {
    if (!cab.classList.contains('menu-aberto')) return;
    if (e.key === 'Escape') abrir(false);
    if (e.key === 'Tab') { // mantém o foco dentro do menu aberto
      const foco = [botao, ...links], i = foco.indexOf(document.activeElement);
      if (e.shiftKey && i <= 0) { e.preventDefault(); foco.at(-1).focus(); }
      else if (!e.shiftKey && i === foco.length - 1) { e.preventDefault(); foco[0].focus(); }
    }
  });

  // Âncoras dentro de blocos recolhidos (<details>): abre o bloco antes de rolar.
  const abrirAte = id => { let el = id && document.getElementById(id); for (let d = el && el.closest('details'); d; d = d.parentElement.closest('details')) d.open = true; };
  document.addEventListener('click', e => { const l = e.target.closest('a[href^="#"]'); if (l) abrirAte(l.getAttribute('href').slice(1)); });
  if (location.hash) abrirAte(location.hash.slice(1));

  // Barra de progresso de leitura.
  const barra = document.getElementById('progresso');
  let pendente = false;
  const atualizar = () => {
    pendente = false;
    const h = document.documentElement.scrollHeight - innerHeight;
    barra.style.setProperty('--p', h > 0 ? Math.min(1, scrollY / h) : 0);
  };
  addEventListener('scroll', () => { if (!pendente) { pendente = true; requestAnimationFrame(atualizar); } }, { passive: true });
  atualizar();

  // Scroll-spy: marca o link da seção que está no meio da tela.
  if (!('IntersectionObserver' in window)) return;
  const porId = new Map(links.map(a => [a.getAttribute('href').slice(1), a]));
  const io = new IntersectionObserver(es => {
    for (const e of es) if (e.isIntersecting) {
      links.forEach(a => a.classList.toggle('ativo', a === porId.get(e.target.id)));
    }
  }, { rootMargin: '-45% 0px -50% 0px' });
  // As seções de famosos são geradas pelo app.js; observa depois que a página monta.
  const observar = () => porId.forEach((a, id) => { const el = document.getElementById(id); if (el) io.observe(el); });
  if (document.readyState === 'complete') setTimeout(observar, 300); else addEventListener('load', () => setTimeout(observar, 300));
})();

// E-mail de correções montado no carregamento (dificulta a coleta por robôs de spam).
(function () {
  const a = document.getElementById('emailCorrecao');
  if (!a) return;
  const end = a.dataset.u + '@' + a.dataset.d;
  a.href = 'mailto:' + end;
  a.textContent = end;
})();
