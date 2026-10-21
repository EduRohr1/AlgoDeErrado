// Botões "i" com explicação em linguagem simples.
// Abre ao passar o mouse (em telas com mouse) e ao tocar/clicar; fecha com Esc, com toque fora
// ou clicando de novo. O balão fica sempre dentro da tela.
(function () {
  const esc = t => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  // Usado pelos outros scripts para criar o botão ao lado de um número ou título.
  window.infoBtn = (texto, rotulo = 'O que significa este número?') =>
    `<button type="button" class="info" aria-label="${esc(rotulo)}" aria-expanded="false" data-info="${esc(texto)}">i</button>`;

  const balao = document.createElement('div');
  balao.className = 'info-balao';
  balao.id = 'infoBalao';
  balao.setAttribute('role', 'tooltip');
  balao.hidden = true;
  document.addEventListener('DOMContentLoaded', () => document.body.appendChild(balao));

  let atual = null, fixo = false;
  function posicionar(btn) {
    const r = btn.getBoundingClientRect(), m = 8;
    balao.style.maxWidth = Math.min(340, innerWidth - 2 * m) + 'px';
    balao.style.left = '0px'; balao.style.top = '0px';
    const b = balao.getBoundingClientRect();
    let left = r.left + r.width / 2 - b.width / 2;
    left = Math.max(m, Math.min(left, innerWidth - b.width - m));
    let top = r.bottom + 8;
    if (top + b.height > innerHeight - m && r.top - b.height - 8 > m) top = r.top - b.height - 8;
    balao.style.left = left + 'px';
    balao.style.top = top + 'px';
  }
  function abrir(btn, porClique) {
    if (atual && atual !== btn) fechar();
    atual = btn; fixo = porClique;
    balao.textContent = btn.dataset.info;
    balao.hidden = false;
    btn.setAttribute('aria-expanded', 'true');
    btn.setAttribute('aria-describedby', 'infoBalao');
    posicionar(btn);
  }
  function fechar() {
    if (!atual) return;
    atual.setAttribute('aria-expanded', 'false');
    atual.removeAttribute('aria-describedby');
    atual = null; fixo = false;
    balao.hidden = true;
  }
  const temMouse = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  document.addEventListener('click', e => {
    const btn = e.target.closest('button.info');
    if (btn) { e.preventDefault(); e.stopPropagation(); if (atual === btn && fixo) fechar(); else abrir(btn, true); return; }
    if (atual && !balao.contains(e.target)) fechar();
  }, true);
  if (temMouse) {
    document.addEventListener('mouseover', e => { const btn = e.target.closest('button.info'); if (btn && !fixo) abrir(btn, false); });
    document.addEventListener('mouseout', e => { const btn = e.target.closest('button.info'); if (btn && btn === atual && !fixo) fechar(); });
  }
  document.addEventListener('focusin', e => { const btn = e.target.closest && e.target.closest('button.info'); if (btn && !fixo) abrir(btn, false); });
  document.addEventListener('focusout', e => { if (e.target === atual && !fixo) fechar(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && atual) { const b = atual; fechar(); b.focus(); } });
  addEventListener('scroll', () => { if (atual) posicionar(atual); }, { passive: true });
  addEventListener('resize', () => { if (atual) posicionar(atual); });

  // Botões nos títulos dos gráficos principais (textos fixos, com exemplo).
  const TITULOS = {
    politicosGrafico: 'Vídeo típico é a mediana: o vídeo do meio entre os 12 mais recentes com 3 dias ou mais. Cada barra é o vídeo típico do perfil dividido pelo número de seguidores. Acima de 1, o vídeo típico tem mais visualizações do que o perfil tem de seguidores. Exemplo: 1,55 quer dizer 155 visualizações para cada 100 seguidores.',
    interacao: 'Curtidas (ou comentários) de um vídeo típico divididas pelo número de seguidores. Exemplo: 12% quer dizer que um vídeo típico recebe curtidas em quantidade equivalente a 12% da base de seguidores.',
    regularidade: 'O índice é o coeficiente de variação: o desvio padrão das visualizações dividido pela média. Perto de 0, os vídeos têm alcance parecido; acima de 1, poucos vídeos concentram a maior parte das visualizações. “Bom ÷ fraco” é a razão p90/p10: um vídeo melhor que 90% dos outros (percentil 90) dividido por um melhor que só 10% (percentil 10).',
    foraDaCurva: 'Para cada vídeo, comparamos curtidas ÷ visualizações com a mediana do próprio perfil (o padrão do perfil). Um vídeo é marcado quando essa taxa fica abaixo da metade da mediana. Exemplo: se o perfil costuma ter 8% de curtidas por visualização, um vídeo com menos de 4% é marcado.',
    comentarios: 'Mediana de comentários ÷ curtidas nos 12 vídeos analisados (o valor do vídeo do meio). Exemplo: 0,05 é cerca de 1 comentário a cada 20 curtidas.',
    secIdade: 'Os eixos estão em escala logarítmica. Cada ponto é um vídeo. No eixo horizontal, quantos dias ele tinha quando coletamos; no vertical, visualizações ÷ seguidores. Os mais novos (à esquerda) ainda estavam ganhando visualizações, então não é o mesmo vídeo crescendo, e sim vídeos diferentes medidos no mesmo momento.',
    pFrequencia: 'Vídeos publicados por dia nos 30 dias antes da coleta. Para quem publica dezenas por dia, usamos o período coberto pelos vídeos coletados.',
    pDuracao: 'Duração mediana dos vídeos com pelo menos 3 dias: metade dos vídeos é mais curta e metade é mais longa do que esse valor.',
  };
  document.addEventListener('DOMContentLoaded', () => {
    for (const [id, txt] of Object.entries(TITULOS)) {
      const h = document.querySelector(`#${id} > h2`);
      if (h && !h.querySelector('.info')) h.insertAdjacentHTML('beforeend', ' ' + window.infoBtn(txt, `Como ler “${h.textContent.trim()}”`));
    }
    // O primeiro painel sem id do bloco de políticos é o de engajamento.
    const eng = document.getElementById('gEng')?.closest('.painel')?.querySelector('h2');
    if (eng && !eng.querySelector('.info')) eng.insertAdjacentHTML('beforeend', ' ' + window.infoBtn('Também chamado de engajamento: (curtidas + comentários) ÷ visualizações, calculado vídeo a vídeo e depois em média. Exemplo: um vídeo com 1 milhão de visualizações e 80 mil curtidas e comentários tem engajamento de 8%.', 'Como ler “Curtidas e comentários por visualização”'));
  });
})();
