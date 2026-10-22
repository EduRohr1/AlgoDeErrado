// Botão "Compartilhar" no topo: WhatsApp, stories do Instagram (imagem pronta), X, Facebook, copiar link
// e, no celular, o menu de compartilhar do próprio aparelho.
(function () {
  const caixa = document.getElementById('compartilhar');
  if (!caixa) return;
  const botao = document.getElementById('compBotao');
  const menu = document.getElementById('compMenu');
  const dica = document.getElementById('compDica');
  const URL_SITE = 'https://comoeleconsegue.pages.dev/';
  const TEXTO = 'O alcance de Nikolas Ferreira é orgânico? Veja os dados:';
  const IMG_STORY = 'img/story.jpg?v=1';
  const enc = encodeURIComponent;
  const links = {
    whatsapp: `https://wa.me/?text=${enc(TEXTO + ' ' + URL_SITE)}`,
    x: `https://twitter.com/intent/tweet?text=${enc(TEXTO)}&url=${enc(URL_SITE + '?x=1')}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${enc(URL_SITE)}`,
  };
  menu.querySelectorAll('a[data-rede]').forEach(a => { a.href = links[a.dataset.rede]; });
  const celular = matchMedia('(pointer: coarse)').matches;
  const mais = menu.querySelector('[data-rede="mais"]');
  if (navigator.share && celular) mais.hidden = false;

  const abrir = sim => { menu.hidden = !sim; botao.setAttribute('aria-expanded', String(sim)); if (!sim) dica.hidden = true; };
  const mostrarDica = t => { dica.textContent = t; dica.hidden = false; };
  const copiarLink = async () => { try { await navigator.clipboard.writeText(URL_SITE); return true; } catch { return false; } };
  botao.addEventListener('click', () => abrir(menu.hidden));

  // A imagem é baixada quando o menu abre: o celular só aceita abrir o compartilhamento logo após o toque.
  let arqStory = null;
  const prepararStory = () => { if (!arqStory) fetch(IMG_STORY).then(r => r.blob()).then(b => { arqStory = new File([b], 'alcance-nikolas-story.jpg', { type: 'image/jpeg' }); }).catch(() => {}); };
  botao.addEventListener('pointerdown', prepararStory);
  botao.addEventListener('focus', prepararStory);

  async function stories() {
    const copia = navigator.clipboard ? navigator.clipboard.writeText(URL_SITE).then(() => true, () => false) : Promise.resolve(false);
    const passo = ok => ok ? 'O link já foi copiado: no story, toque no adesivo “Link” e cole.' : `No story, use o adesivo “Link” com ${URL_SITE}`;
    if (!arqStory) { mostrarDica('Preparando a imagem… toque de novo em “Instagram (stories)”.'); prepararStory(); return; }
    try {
      if (celular && navigator.canShare && navigator.canShare({ files: [arqStory] })) {
        const comp = navigator.share({ files: [arqStory] });
        mostrarDica('Escolha Instagram › Stories. ' + passo(await copia));
        await comp;
        return;
      }
      const a = document.createElement('a');
      a.href = URL.createObjectURL(arqStory); a.download = arqStory.name; a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 2000);
      mostrarDica('Imagem baixada. Poste nos stories pelo celular. ' + passo(await copia));
    } catch (e) {
      if (e.name !== 'AbortError') mostrarDica('Não deu para abrir o compartilhamento. ' + passo(await copia));
    }
  }

  menu.addEventListener('click', async e => {
    const b = e.target.closest('[data-rede]');
    if (!b) return;
    const rede = b.dataset.rede;
    if (rede === 'stories') return stories();
    if (rede === 'mais') {
      try { await navigator.share({ title: document.title, text: TEXTO, url: URL_SITE }); } catch {}
      return abrir(false);
    }
    if (rede === 'copiar') {
      if (await copiarLink()) b.textContent = 'Link copiado!'; else prompt('Copie o link:', URL_SITE);
      return setTimeout(() => { b.textContent = 'Copiar link'; abrir(false); }, 1500);
    }
    abrir(false);
  });
  document.addEventListener('click', e => { if (!caixa.contains(e.target)) abrir(false); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !menu.hidden) { abrir(false); botao.focus(); } });
})();
