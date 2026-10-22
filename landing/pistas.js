// "Por que tanto alcance? Pistas nos dados": frequência, duração, horário, legenda, temas e tom.
// Lê os agregados de window.RESUMO.pistas (gerados por atualizar.mjs). Textos gerados dos dados.
(function () {
  const R = window.RESUMO;
  const NIK = 'nikolasferreiradm';
  const NOMES = { renansantosmbl: 'Renan Santos', kimkataguiri: 'Kim Kataguiri', kimkardashian: 'Kim Kardashian', nikolasferreiradm: 'Nikolas Ferreira', lulaoficial: 'Lula', jairmessiasbolsonaro: 'Jair Bolsonaro', bolsonarosp: 'Eduardo Bolsonaro', tabataamaralsp: 'Tabata Amaral', 'guilhermeboulos.oficial': 'Guilherme Boulos', neymarjr: 'Neymar Jr', anitta: 'Anitta', virginia: 'Virginia', cristiano: 'Cristiano Ronaldo', leomessi: 'Lionel Messi' };
  const nome = p => NOMES[p] || '@' + p;
  const grupo = p => p.grupo || 'politicos';
  const comp = R.perfis.filter(p => p.comparavel && p.pistas);
  const nik = comp.find(p => p.perfil === NIK);
  if (!nik) return;
  const pol = comp.filter(p => grupo(p) === 'politicos');
  const outrosPol = pol.filter(p => p.perfil !== NIK);
  const dec = (n, d = 1) => n == null ? '—' : n.toLocaleString('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d });
  const pct = n => n == null ? '—' : Math.round(n * 100) + '%';
  const vps = n => n == null ? '—' : Math.round(n * 100) + '%'; // visualizações ÷ seguidores, em %
  const mediana = a => { const s = a.filter(v => v != null).sort((x, y) => x - y); if (!s.length) return null; const m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
  const cel = p => `<td>${nome(p.perfil)}</td>`;
  const linhaCls = p => p.perfil === NIK ? ' class="nikolas"' : '';
  const set = (id, html) => { const el = document.getElementById(id); if (el) el.innerHTML = html; };
  const cor = v => getComputedStyle(document.documentElement).getPropertyValue(v).trim();

  // ===== 1. Frequência =====
  const fN = nik.pistas.frequencia;
  const ativos = comp.filter(p => p.pistas.frequencia && p.pistas.frequencia.reelsPorDia > 0);
  const maisFrequentes = ativos.filter(p => p.pistas.frequencia.reelsPorDia > fN.reelsPorDia * 3).sort((a, b) => b.pistas.frequencia.reelsPorDia - a.pistas.frequencia.reelsPorDia);
  const inativo = comp.find(p => p.pistas.frequencia && p.pistas.frequencia.reelsPorDia === 0);
  set('txtFrequencia', `Vídeos por dia nos 30 dias antes da coleta (ou no período coberto, para quem posta muito) e visualizações de um vídeo comum em % dos seguidores. ` +
    `O Nikolas posta cerca de <strong>${dec(fN.reelsPorDia)} vídeo por dia</strong>. ` +
    (maisFrequentes.length ? `${maisFrequentes.map(p => `${nome(p.perfil)} posta ${dec(p.pistas.frequencia.reelsPorDia)}`).join(', ')} por dia, e ${maisFrequentes.length > 1 ? 'nenhum deles' : 'não'} chega perto do alcance por seguidor de Nikolas. ` : '') +
    `As celebridades postam bem menos vídeos (de ${dec(Math.min(...ativos.filter(p => grupo(p) !== 'politicos').map(p => p.pistas.frequencia.reelsPorDia)), 2)} a ${dec(Math.max(...ativos.filter(p => grupo(p) !== 'politicos').map(p => p.pistas.frequencia.reelsPorDia)), 2)} por dia) e também ficam muito abaixo. ` +
    `Ou seja, postar pouco ou muito, sozinho, não explica a diferença: há perfis dos dois lados com alcance baixo.` +
    (inativo ? ` (${nome(inativo.perfil)} não publicou vídeos nos 30 dias antes da coleta e ficou fora do gráfico.)` : ''));

  // ===== 2. Duração =====
  const dN = nik.pistas.duracao;
  const durOrd = [...comp].filter(p => p.pistas.duracao).sort((a, b) => b.pistas.duracao.medianaSegundos - a.pistas.duracao.medianaSegundos);
  const posDur = durOrd.findIndex(p => p.perfil === NIK) + 1;
  const fmtSeg = s => s >= 60 ? `${Math.floor(s / 60)}min${String(Math.round(s % 60)).padStart(2, '0')}s` : `${Math.round(s)}s`;
  const efeito = dN.vpsLongos != null && dN.vpsCurtos != null ? dN.vpsLongos / dN.vpsCurtos : null;
  set('txtDuracao', `Duração típica dos vídeos com 3 dias ou mais. Os do Nikolas têm <strong>${fmtSeg(dN.medianaSegundos)}</strong>, ` +
    `${posDur === 1 ? 'os mais longos' : `o ${posDur}º mais longo`} entre os ${durOrd.length} perfis (${durOrd.slice(0, 3).filter(p => p.perfil !== NIK).map(p => `${nome(p.perfil)}: ${fmtSeg(p.pistas.duracao.medianaSegundos)}`).join('; ')}). ` +
    (efeito ? `Dentro do próprio perfil, os vídeos mais longos de Nikolas têm ${vps(dN.vpsLongos)} de visualizações por seguidor, contra ${vps(dN.vpsCurtos)} dos mais <span class="cola">curtos${window.infoBtn ?' ' + window.infoBtn(`A correlação entre duração e visualizações por seguidor nos vídeos de Nikolas é ${dec(dN.correlacao, 2)}. Ela vai de -1 a 1: perto de 0 quer dizer pouca relação entre as duas coisas.`, 'O que é correlação?') : ''}</span>. ` +
      (Math.abs(efeito - 1) < 0.15 ? 'A diferença é pequena: a duração não parece explicar sozinha o alcance de Nikolas.' : efeito > 1 ? 'Vídeos mais longos vão um pouco melhor para ele.' : 'Vídeos mais curtos vão um pouco melhor para ele.') : ''));

  // ===== 3. Horário =====
  const per = ['madrugada', 'manhã', 'tarde', 'noite'];
  const hN = nik.pistas.horario;
  const topPer = [...hN.periodos].sort((a, b) => b.pctPosts - a.pctPosts)[0];
  // Só períodos com 3+ vídeos maduros entram nas comparações de alcance.
  const piorNik = Math.min(...hN.periodos.filter(p => p.n >= 3).map(p => p.medianaVps));
  const melhorOutros = Math.max(...comp.filter(p => p.perfil !== NIK).flatMap(p => p.pistas.horario.periodos.filter(q => q.n >= 3).map(q => q.medianaVps)));
  const melhorPer = [...hN.periodos].filter(p => p.n >= 3).sort((a, b) => b.medianaVps - a.medianaVps)[0];
  set('txtHorario', `Horário de Brasília. O Nikolas publica principalmente à <strong>${topPer.periodo}</strong> (${pct(topPer.pctPosts)} dos vídeos; hora típica ${Math.round(hN.horaMediana)}h). ` +
    (melhorPer ? `Entre os vídeos de Nikolas com 3 dias ou mais, os da ${melhorPer.periodo} tiveram o maior alcance típico (${vps(melhorPer.medianaVps)} dos seguidores, ${melhorPer.n} vídeos). ` : '') +
    (piorNik != null && melhorOutros != null && piorNik > melhorOutros
      ? `Mesmo no período mais fraco de Nikolas (${vps(piorNik)}), o alcance por seguidor fica acima do melhor período de qualquer outro perfil (${vps(melhorOutros)}): o horário não explica a diferença.`
      : 'Os horários mudam o alcance de todos, mas não o suficiente para explicar sozinhos a diferença entre ele e os outros perfis.'));
  set('tabelaHorario', '<thead><tr><th>Perfil</th>' + per.map(p => `<th>${p}</th>`).join('') + '<th>Hora típica</th></tr></thead><tbody>' +
    comp.map(p => `<tr${linhaCls(p)}>${cel(p)}${per.map(nm => { const x = p.pistas.horario.periodos.find(q => q.periodo === nm); return `<td>${pct(x.pctPosts)}${x.n ? ` <span class="n">(${vps(x.medianaVps)})</span>` : ''}</td>`; }).join('')}<td>${Math.round(p.pistas.horario.horaMediana)}h</td></tr>`).join('') + '</tbody>');

  // ===== 4. Legenda =====
  const lN = nik.pistas.legenda;
  const legPol = outrosPol.map(p => p.pistas.legenda.medianaCaracteres);
  set('txtLegenda', `Legendas dos vídeos do próprio perfil (sem o texto legal de propaganda eleitoral). As do Nikolas têm, tipicamente, <strong>${Math.round(lN.medianaCaracteres)} caracteres</strong>, ` +
    `contra ${Math.round(Math.min(...legPol))} a ${Math.round(Math.max(...legPol))} dos outros políticos: frases curtas, de efeito, quase sem hashtags e emojis. ` +
    `As palavras mais frequentes nas legendas de Nikolas: ${lN.palavras.slice(0, 5).map(w => `“${w.p}”`).join(', ')}.`);
  set('tabelaLegenda', '<thead><tr><th>Perfil</th><th>Caracteres</th><th>Emojis</th><th>Hashtags</th><th>Com menção</th><th>Palavras mais usadas</th></tr></thead><tbody>' +
    comp.map(p => { const l = p.pistas.legenda; return `<tr${linhaCls(p)}>${cel(p)}<td>${Math.round(l.medianaCaracteres)}</td><td>${dec(l.medianaEmojis, 0)}</td><td>${dec(l.medianaHashtags, 0)}</td><td>${pct(l.pctComMencao)}</td><td class="obs">${l.palavras.slice(0, 5).map(w => w.p).join(', ')}</td></tr>`; }).join('') + '</tbody>');

  // ===== 5. Temas =====
  const temasNomes = Object.keys(R.regrasTemas || {}).concat('sem tema identificado');
  const tN = nik.pistas.temas;
  const comTema = tN.temas.filter(t => t.tema !== 'sem tema identificado' && t.n >= 3).sort((a, b) => b.n - a.n);
  const semTema = tN.temas.find(t => t.tema === 'sem tema identificado');
  set('txtTemas', `Classificação aproximada por palavras-chave nas legendas (um vídeo pode ter mais de um tema). ` +
    `Como as legendas do Nikolas são muito curtas, <strong>${pct(semTema.pct)}</strong> dos vídeos de Nikolas não têm tema identificável pela legenda. ` +
    (comTema.length ? `Entre os que têm, o tema mais frequente é “${comTema[0].tema}” (${comTema[0].n} vídeos), com alcance típico de ${vps(comTema[0].medianaVps)} dos seguidores, contra ${vps(semTema.medianaVps)} nos vídeos sem tema identificado. ` : '') +
    `Com tão poucos vídeos por tema, isso é uma pista, não uma conclusão. Entre parênteses: visualizações de um vídeo comum em % dos seguidores.`);
  set('tabelaTemas', '<thead><tr><th>Perfil</th>' + temasNomes.map(t => `<th>${t}</th>`).join('') + '</tr></thead><tbody>' +
    pol.map(p => `<tr${linhaCls(p)}>${cel(p)}${temasNomes.map(tm => { const x = p.pistas.temas.temas.find(q => q.tema === tm); return x && x.n ? `<td>${pct(x.pct)} <span class="n">(${vps(x.medianaVps)})</span></td>` : '<td class="vazio">—</td>'; }).join('')}</tr>`).join('') + '</tbody>');
  set('regrasTemas', Object.entries(R.regrasTemas || {}).map(([t, ps]) => `<li><strong>${t}:</strong> ${ps.join(', ')}</li>`).join('') +
    '<li>O nome do próprio dono do perfil não conta (por exemplo, “Lula” nas legendas do Lula). O texto legal de propaganda eleitoral é ignorado.</li>');

  // ===== 6. Tom =====
  const CATS = [['apoio', 'apoio'], ['neutro', 'neutro'], ['pergunta', 'pergunta'], ['crítica', 'critica'], ['repetitivo', 'repetitivo']];
  const comTom = comp.filter(p => p.pistas.tom);
  const tomN = nik.pistas.tom;
  const repOutros = comTom.filter(p => grupo(p) === 'politicos' && p.perfil !== NIK).map(p => p.pistas.tom.pct['repetitivo']);
  const maxRep = [...comTom].sort((a, b) => b.pistas.tom.pct['repetitivo'] - a.pistas.tom.pct['repetitivo'])[0];
  if (tomN) {
    set('txtTom', `Amostra dos comentários mais recentes de cada vídeo (${tomN.n} comentários no perfil do Nikolas). ` +
      `No Nikolas, <strong>${pct(tomN.pct.apoio)}</strong> são de apoio, ${pct(tomN.pct['crítica'])} têm linguagem crítica e <strong>${pct(tomN.pct['repetitivo'])}</strong> são textos repetidos (copia-e-cola), ` +
      `${tomN.pct['repetitivo'] < mediana(repOutros) / 2 ? 'abaixo do' : 'perto do'} típico dos outros políticos (${pct(mediana(repOutros))}). O maior índice de repetição é de ${nome(maxRep.perfil)} (${pct(maxRep.pistas.tom.pct['repetitivo'])}). ` +
      `Nesta amostra, o perfil de comentários do Nikolas não destoa dos demais.`);
  }
  set('tomLista', comTom.map(p => `<div class="tom-linha${p.perfil === NIK ? ' nik' : ''}"><span class="tom-nome">${nome(p.perfil)} <small>${p.pistas.tom.n}</small></span><span class="tom-barra">${CATS.map(([k, c]) => `<i class="t-${c}" style="width:${(p.pistas.tom.pct[k] * 100).toFixed(1)}%" title="${k}: ${pct(p.pistas.tom.pct[k])}"></i>`).join('')}</span></div>`).join(''));
  set('tomLegenda', CATS.map(([k, c]) => `<span><i class="t-${c}"></i>${k}</span>`).join(''));

  // ===== Gráficos =====
  const criar = () => {
    if (!window.Chart) return;
    const vermelho = cor('--accent') || '#e3121b', cinza = cor('--bar') || '#a3a3a3';
    const pts = ativos.map(p => ({ x: p.pistas.frequencia.reelsPorDia, y: p.medianaViewsPorSeguidor * 100, p }));
    new Chart(document.getElementById('gFrequencia'), {
      type: 'scatter',
      data: { datasets: [{ data: pts, pointRadius: pts.map(d => d.p.perfil === NIK ? 9 : 6), pointBackgroundColor: pts.map(d => d.p.perfil === NIK ? vermelho : cinza), pointBorderColor: pts.map(d => d.p.perfil === NIK ? vermelho : cinza) }] },
      options: {
        maintainAspectRatio: false,
        layout: { padding: { right: 70 } },
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => ` ${nome(c.raw.p.perfil)}: ${dec(c.raw.x, 2)} vídeos/dia, ${Math.round(c.raw.y)}% dos seguidores` } } },
        scales: {
          x: { type: 'logarithmic', title: { display: true, text: 'Vídeos por dia (escala log)' }, ticks: { callback: v => [0.03, 0.1, 0.3, 1, 3, 10].includes(+v.toFixed(2)) ? dec(v, v < 1 ? 2 : 0) : '' } },
          y: { title: { display: true, text: 'Visualizações de um vídeo comum (% dos seguidores)' }, beginAtZero: true, ticks: { callback: v => v + '%' } },
        },
      },
      plugins: [{ id: 'rotulos', afterDatasetsDraw(ch) { const { ctx } = ch; ctx.save(); ctx.font = '600 11px ' + (cor('--fonte') || 'sans-serif'); ch.getDatasetMeta(0).data.forEach((pt, i) => { const d = pts[i]; ctx.fillStyle = d.p.perfil === NIK ? vermelho : cor('--muted') || '#666'; ctx.fillText(nome(d.p.perfil).split(' ')[0], pt.x + 9, pt.y + 4); }); ctx.restore(); } }],
    });
    new Chart(document.getElementById('gDuracao'), {
      type: 'bar',
      data: { labels: durOrd.map(p => nome(p.perfil)), datasets: [{ data: durOrd.map(p => p.pistas.duracao.medianaSegundos), backgroundColor: durOrd.map(p => p.perfil === NIK ? vermelho : cinza), borderRadius: 4, maxBarThickness: 30 }] },
      options: { indexAxis: 'y', maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => ' ' + fmtSeg(c.raw) } } }, scales: { x: { title: { display: true, text: 'Duração mediana (segundos)' } }, y: { grid: { display: false } } } },
    });
  };
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(criar);
  // ===== Resumo em 3 padrões ("Então, por que tanto alcance?") =====
  {
    const itens = [], ch = [];
    if (posDur === 1) { itens.push('Os vídeos de Nikolas são os mais longos entre os perfis analisados.'); ch.push([fmtSeg(dN.medianaSegundos), 'duração típica, a maior']); }
    if (legPol.length && lN.medianaCaracteres < Math.min(...legPol)) { itens.push(`As legendas são as mais curtas: os outros políticos usam de ${Math.round(Math.min(...legPol))} a ${Math.round(Math.max(...legPol))} caracteres.`); ch.push([String(Math.round(lN.medianaCaracteres)), 'caracteres na legenda']); }
    if (comTema.length && semTema) { itens.push(`Vídeos sobre ${comTema[0].tema.replace('governo', 'Governo')} foram melhor que os sem tema identificado, que ficaram em ${vps(semTema.medianaVps)}. São poucos vídeos: é só uma pista.`); ch.push([vps(comTema[0].medianaVps), `alcance em vídeos sobre ${comTema[0].tema.replace('governo', 'Governo')}`]); }
    const NUM = ['', 'um padrão', 'dois padrões', 'três padrões'];
    set('respPorque', `Os dados não mostram a causa, mas mostram ${NUM[itens.length] || 'alguns padrões'}.`);
    set('pistasResumo', itens.map(t => `<li>${t}</li>`).join(''));
    set('chipsPistas', ch.map(([n, t], k) => `<div class="chip${k === 0 ? ' nik' : ''}"><b>${n}</b><span>${t}</span></div>`).join(''));
  }
})();
