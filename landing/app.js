// Espera as fontes web carregarem para o Chart.js desenhar com a tipografia certa.
(document.fonts ? document.fonts.ready : Promise.resolve()).then(function () {
  const R = window.RESUMO;
  const NIK = 'nikolasferreiradm';
  const NOMES = {
    nikolasferreiradm: 'Nikolas Ferreira',
    lulaoficial: 'Lula',
    jairmessiasbolsonaro: 'Jair Bolsonaro',
    bolsonarosp: 'Eduardo Bolsonaro',
    tabataamaralsp: 'Tabata Amaral',
    'guilhermeboulos.oficial': 'Guilherme Boulos',
    erikakhilton: 'Erika Hilton',
    pablomarcal1: 'Pablo Marçal',
    andrejanonesoficial: 'André Janones',
    neymarjr: 'Neymar Jr',
    anitta: 'Anitta',
    virginia: 'Virginia',
    cristiano: 'Cristiano Ronaldo',
    leomessi: 'Lionel Messi',
  };
  const GRUPOS = R.grupos || { politicos: 'Políticos' };
  const nome = p => NOMES[p] || '@' + p;
  const grupoDe = p => p.grupo || 'politicos';

  const fmtInt = n => n == null ? '—' : Math.round(n).toLocaleString('pt-BR');
  const fmtMi = n => n == null ? '—' : n >= 1e6 ? (n / 1e6).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + ' mi' : (n / 1e3).toLocaleString('pt-BR', { maximumFractionDigits: 0 }) + ' mil';
  const fmtDec = (n, d = 2) => n == null ? '—' : n.toLocaleString('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d });
  const fmtPct = n => n == null ? '—' : (n * 100).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + '%';
  const fmtX = n => n.toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + '×';
  const fmtLog = v => v >= 1 ? v.toLocaleString('pt-BR', { maximumFractionDigits: 0 }) : v.toLocaleString('pt-BR', { maximumSignificantDigits: 1 });

  const politicos = R.perfis.filter(p => grupoDe(p) === 'politicos');
  const comp = politicos.filter(p => p.comparavel);
  const nik = comp.find(p => p.perfil === NIK);
  const outros = comp.filter(p => p.perfil !== NIK);
  const media = (arr, k) => arr.reduce((s, p) => s + p[k], 0) / arr.length;
  const mediana = a => { if (!a.length) return null; const s = [...a].sort((x, y) => x - y), m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };

  // ===== Destaque (grupo políticos) =====
  const mediaOutrosVps = media(outros, 'medianaViewsPorSeguidor');
  const razaoVps = nik.medianaViewsPorSeguidor / mediaOutrosVps;
  const segundoViews = [...outros].sort((a, b) => b.medianaViews - a.medianaViews)[0];
  const razaoViews = nik.medianaViews / segundoViews.medianaViews;
  const porEng = [...comp].sort((a, b) => b.engajamentoMedio - a.engajamentoMedio);
  const rankEng = porEng.findIndex(p => p.perfil === NIK) + 1;
  const lider = porEng[0];

  // ===== Topo: manchete, linha fina, barras e 3 cards (tudo calculado dos dados) =====
  const cr7 = R.perfis.find(p => p.perfil === 'cristiano' && p.comparavel);
  const milhoesTxt = n => { const v = n / 1e6; return (v >= 100 ? Math.round(v) : Math.round(v * 10) / 10).toLocaleString('pt-BR') + ' milhões'; };
  const milhoesRedondo = n => Math.round(n / 1e6).toLocaleString('pt-BR') + ' milhões';
  const i = (t, r) => window.infoBtn ? window.infoBtn(t, r) : '';
  const vpsTxt = n => fmtDec(n) + (n >= 1.995 ? ' visualizações' : ' visualização');
  if (cr7) {
    const vezesCr7 = Math.floor(nik.medianaViewsPorSeguidor / cr7.medianaViewsPorSeguidor);
    document.getElementById('heroLinha').innerHTML =
      `Ele tem <em class="titulo-x">${vezesCr7}×</em> mais visualizações por seguidor que a maior conta pessoal do Instagram.`;
    const c108 = window.comparacao108;
    const milhoes108 = nik.maiorReel ? `${Math.floor(nik.maiorReel.views / 1e6)} milhões` : '';
    document.getElementById('heroSub').innerHTML =
      `Cristiano Ronaldo tem ${milhoesRedondo(cr7.seguidores)} de seguidores, e o vídeo típico dele chega a ${milhoesRedondo(cr7.medianaViews)} de visualizações. ` +
      `Nikolas tem ${milhoesTxt(nik.seguidores)}: o vídeo típico dele chega a ${milhoesRedondo(nik.medianaViews)}` +
      (nik.maiorReel
        ? (c108 && c108.ok
          ? `, e um deles passou de <strong>${milhoes108} em menos de 10 horas</strong>, o equivalente a metade da população do Brasil`
          : `, e um deles passou de ${milhoes108}`) +
          // Só compara com o recorde do Cristiano se o vídeo do Nikolas for maior que ele na nossa amostra.
          (cr7.maiorReel && cr7.maiorReel.views < nik.maiorReel.views ? ` (mais que o vídeo mais visto de Cristiano na nossa amostra, ${fmtMi(cr7.maiorReel.views)})` : '')
        : '') + '.' + (nik.maiorReel && c108 && c108.ok ? ' ' + i(c108.info, 'De onde vem essa comparação?') : '');
    const maxB = Math.max(nik.medianaViewsPorSeguidor, cr7.medianaViewsPorSeguidor);
    const textoBarra = p => p.perfil === NIK
      ? `Em média, cada vídeo do Nikolas tem ${vpsTxt(p.medianaViewsPorSeguidor)} para cada seguidor do perfil. Ou seja, um vídeo típico chega a ${milhoesRedondo(p.medianaViews)} de visualizações com ${milhoesTxt(p.seguidores)} de seguidores. Como o número passa de 1, o conteúdo costuma alcançar também quem não segue a conta (uma mesma pessoa assistir mais de uma vez também conta).`
      : `Um vídeo típico de Cristiano Ronaldo tem ${vpsTxt(p.medianaViewsPorSeguidor)} para cada seguidor: ${milhoesRedondo(p.medianaViews)} de visualizações para ${milhoesRedondo(p.seguidores)} de seguidores. É como se o vídeo fosse visto por uma quantidade equivalente a cerca de ${Math.round(p.medianaViewsPorSeguidor * 100)}% da base de seguidores dele.`;
    document.getElementById('heroBarras').innerHTML = [nik, cr7].map(p => `<div class="hi-barra${p.perfil === NIK ? ' nik' : ''}">
        <span class="hi-nome">${nome(p.perfil)}</span>
        <span class="hi-trilho"><i style="--w:${Math.max(2, p.medianaViewsPorSeguidor / maxB * 100).toFixed(1)}%"></i><b>${fmtDec(p.medianaViewsPorSeguidor)}</b>${i(textoBarra(p), `O que significa ${fmtDec(p.medianaViewsPorSeguidor)}?`)}</span>
      </div>`).join('');
    document.querySelector('.hi-titulo')?.insertAdjacentHTML('beforeend', ' ' + i('“Vídeo típico” é a mediana: ordenamos os 12 vídeos mais recentes com pelo menos 3 dias pelo número de visualizações e pegamos o valor do meio. Assim, um único vídeo que viralizou muito (ou que foi muito mal) não distorce o resultado.', 'O que é vídeo típico?'));
  }
  // Gancho e frase das barras: só aparecem se os dados sustentarem o texto.
  if (cr7) {
    const menosSeg = Math.floor(cr7.seguidores / nik.seguidores), fracao = nik.medianaViews / cr7.medianaViews;
    document.getElementById('heroGancho').textContent = fracao >= 0.45 && fracao <= 0.55
      ? `Com ${menosSeg} vezes menos seguidores, ele chega à metade das visualizações de Cristiano Ronaldo.`
      : `${nik.reelsAcimaSeguidores} de cada ${nik.reels} vídeos dele passam do número de seguidores que ele tem.`;
  }
  {
    const outrosPerfis = R.perfis.filter(p => p.comparavel && p.perfil !== NIK);
    const todosAbaixo = outrosPerfis.every(p => p.medianaViewsPorSeguidor < 1);
    const excesso = Math.round((nik.medianaViewsPorSeguidor - 1) * 100);
    document.getElementById('heroFrase').textContent = nik.medianaViewsPorSeguidor > 1 && todosAbaixo
      ? `Com ${fmtDec(nik.medianaViewsPorSeguidor)} visualização por seguidor, Nikolas passa em ${excesso}% o tamanho da própria base de seguidores no vídeo típico, enquanto todos os outros ${outrosPerfis.length} perfis comparados ficam abaixo de 100%.`
      : '';
  }
  const dataColetaCurta = new Date(R.geradoEm).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo', day: '2-digit', month: '2-digit', year: 'numeric' });
  document.getElementById('heroNota').textContent =
    `Vídeo típico = mediana dos 12 vídeos mais recentes com 3+ dias. Fonte: dados públicos do Instagram coletados em ${dataColetaCurta}. Conta pessoal = exclui o perfil oficial @instagram.`;
  {
    const acimaOutros = outros.reduce((s, p) => s + (p.reelsAcimaSeguidores || 0), 0);
    const totalOutros = outros.reduce((s, p) => s + (p.reels || 0), 0);
    const comAcima = outros.filter(p => p.reelsAcimaSeguidores > 0);
    const mr = nik.maiorReel;
    const cards = [
      { n: `${nik.reelsAcimaSeguidores} de ${nik.reels}`, t: `vídeos dele passaram do número de seguidores (os outros políticos somados: ${acimaOutros} de ${totalOutros})`,
        i: `Dos ${nik.reels} vídeos analisados do Nikolas (os mais recentes com pelo menos 3 dias), ${nik.reelsAcimaSeguidores} tiveram mais visualizações do que ele tem de seguidores (${milhoesTxt(nik.seguidores)}). Entre os outros ${outros.length} políticos, isso aconteceu em ${acimaOutros} de ${totalOutros} vídeos${comAcima.length ? `, ${comAcima.length === 1 ? 'todos' : 'somando'} de ${comAcima.map(p => nome(p.perfil)).join(' e ')}` : ''}.` },
      { n: fmtX(razaoVps), t: 'mais alcance por seguidor que a média dos outros políticos analisados',
        i: `Média dos outros ${outros.length} políticos analisados: ${vpsTxt(mediaOutrosVps)} por seguidor. Nikolas: ${fmtDec(nik.medianaViewsPorSeguidor)}. Dividindo um pelo outro, dá ${fmtX(razaoVps)}. Exemplo: se todos tivessem 1 milhão de seguidores, o vídeo típico dos outros teria cerca de ${Math.round(mediaOutrosVps * 1000)} mil visualizações, e o do Nikolas, cerca de ${fmtDec(nik.medianaViewsPorSeguidor)} milhão.` },
      mr && { n: `${Math.round(mr.views / 1e6)} mi`, t: `visualizações do vídeo “${(mr.legenda || '').replace(/[.!]$/, '')}”, ${mr.vezesSeguidores.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}× os seguidores dele`,
        i: `É o vídeo com mais visualizações entre os coletados do Nikolas: ${milhoesTxt(mr.views)}. Dividido pelos ${milhoesTxt(nik.seguidores)} de seguidores, dá ${mr.vezesSeguidores.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} visualizações por seguidor. Como tinha menos de 3 dias na coleta, ele não entra nas médias da página.` },
    ].filter(Boolean);
    document.getElementById('heroCards').innerHTML = cards.map(c => `<li><span class="hc-num">${c.n}${i(c.i, `O que significa ${c.n}?`)}</span><span class="hc-txt">${c.t}</span></li>`).join('');
  }
  const credito = document.getElementById('creditoFoto');
  if (credito) credito.innerHTML =
    'Foto: Pablo Valadares/Câmara dos Deputados, via Wikimedia Commons, <a href="https://creativecommons.org/licenses/by/3.0/deed.pt-br" target="_blank" rel="noopener">CC BY 3.0</a> ' +
    '(<a href="https://commons.wikimedia.org/wiki/File:Nikolas_Ferreira_in_2023_(cropped).jpg" target="_blank" rel="noopener">link</a>) · imagem modificada (duotone)';
  document.getElementById('lede').textContent =
    `Um vídeo típico de Nikolas Ferreira tem ${fmtMi(nik.medianaViews)} de visualizações, mais do que seus ${fmtMi(nik.seguidores)} de seguidores. ` +
    `É ${fmtX(razaoViews)} a mediana do segundo colocado (${nome(segundoViews.perfil)}), que tem mais seguidores que ele. ` +
    `No engajamento por visualização, porém, ele fica em ${rankEng}º de ${comp.length}.`;

  const famososComp = R.perfis.filter(p => grupoDe(p) !== 'politicos' && p.comparavel);
  const famososAbaixo = famososComp.filter(p => p.medianaViewsPorSeguidor < nik.medianaViewsPorSeguidor);

  document.getElementById('posEng').textContent = `fica em ${rankEng}º de ${comp.length}`;
  // Datas de coleta por perfil, no horário de Brasília (o Nikolas pode ter sido recoletado depois dos demais).
  const TZ = { timeZone: 'America/Sao_Paulo' };
  const diaBr = d => new Date(d).toLocaleDateString('pt-BR', { ...TZ, day: 'numeric', month: 'long', year: 'numeric' });
  const horaBr = d => new Date(d).toLocaleTimeString('pt-BR', { ...TZ, hour: '2-digit', minute: '2-digit' }).replace(':', 'h');
  const coletaNik = nik.coletadoEm, coletasOutros = R.perfis.filter(p => p.encontrado && p.perfil !== NIK && p.coletadoEm).map(p => Date.parse(p.coletadoEm));
  const minOutros = Math.min(...coletasOutros), maxOutros = Math.max(...coletasOutros);
  const separado = coletaNik && Math.abs(Date.parse(coletaNik) - maxOutros) > 3600e3;
  document.getElementById('dataColeta').textContent = separado
    ? `${diaBr(minOutros)} (demais perfis, entre ${horaBr(minOutros)} e ${horaBr(maxOutros)}). O perfil do Nikolas Ferreira foi recoletado em ${diaBr(coletaNik)}, às ${horaBr(coletaNik)} (horário de Brasília)`
    : `${diaBr(R.geradoEm)} (horário de Brasília)`;

  // ===== Tabelas =====
  const cabecalho = '<thead><tr><th>Perfil</th><th>Seguidores</th><th>Vídeos</th><th>Mediana de visualizações</th><th>Média de visualizações</th>' +
    '<th>Visualizações ÷ seguidores</th><th>Engajamento</th><th>Curtidas (média)</th><th>Comentários (média)</th></tr></thead>';
  const celulaPerfil = p => `<td>${nome(p.perfil)}<small>@${p.perfil}${p.idioma && p.idioma !== 'pt' ? ' · ' + p.idioma : ''}</small></td>`;

  function tabelaPerfis(el, lista) {
    const ordem = [...lista].sort((a, b) => (b.comparavel - a.comparavel) || ((b.medianaViewsPorSeguidor ?? -1) - (a.medianaViewsPorSeguidor ?? -1)));
    el.innerHTML = cabecalho + '<tbody>' + ordem.map(p => {
      const cls = p.perfil === NIK ? 'nikolas' : (!p.comparavel ? 'fora' : '');
      if (!p.comparavel) {
        return `<tr class="${cls}">${celulaPerfil(p)}<td>${fmtInt(p.seguidores)}</td><td colspan="7" class="obs">${p.observacao || 'Sem dados suficientes'}</td></tr>`;
      }
      return `<tr class="${cls}">${celulaPerfil(p)}` +
        `<td>${fmtInt(p.seguidores)}</td><td>${p.reels}</td><td>${fmtInt(p.medianaViews)}</td><td>${fmtInt(p.mediaViews)}</td>` +
        `<td>${fmtDec(p.medianaViewsPorSeguidor, 3)}</td><td>${fmtPct(p.engajamentoMedio)}</td>` +
        `<td>${fmtInt(p.mediaCurtidas)}</td><td>${fmtInt(p.mediaComentarios)}</td></tr>`;
    }).join('') + '</tbody>';
  }
  const notas = lista => lista.filter(p => p.observacao && p.comparavel)
    .map(p => `<li><strong>${nome(p.perfil)}:</strong> ${p.observacao}</li>`).join('');

  // Interação por seguidor (políticos comparáveis).
  const porCurt = [...comp].sort((a, b) => b.medianaCurtidasPorSeguidor - a.medianaCurtidasPorSeguidor);
  const porCom = [...comp].sort((a, b) => b.medianaComentariosPorSeguidor - a.medianaComentariosPorSeguidor);
  const rankCurt = porCurt.findIndex(p => p.perfil === NIK) + 1;
  const rankCom = porCom.findIndex(p => p.perfil === NIK) + 1;
  const segCurt = porCurt.find(p => p.perfil !== NIK);
  const pct = (n, d = 2) => n == null ? '—' : (n * 100).toLocaleString('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d }) + '%';
  if (nik.medianaCurtidasPorSeguidor != null) {
    document.getElementById('txtInteracao').textContent =
      `Resultado: em curtidas ÷ seguidores, o Nikolas fica em ${rankCurt}º de ${comp.length} (${pct(nik.medianaCurtidasPorSeguidor)}` +
      (rankCurt === 1 ? `, ${fmtX(nik.medianaCurtidasPorSeguidor / segCurt.medianaCurtidasPorSeguidor)} o 2º colocado, ${nome(segCurt.perfil)})` : ')') +
      `; em comentários ÷ seguidores, fica em ${rankCom}º (${pct(nik.medianaComentariosPorSeguidor, 3)}; ${nome(porCom[0].perfil)} lidera com ${pct(porCom[0].medianaComentariosPorSeguidor, 3)}). ` +
      (rankCurt === 1 ? `Ou seja, a interação relativa à base de seguidores também é alta, embora por visualização (engajamento) ela fique abaixo da maioria.` : `Ou seja, a interação relativa à base de seguidores não acompanha o alcance na mesma proporção.`);
  }
  document.getElementById('tabelaInteracao').innerHTML =
    '<thead><tr><th>Perfil</th><th>Visualizações ÷ seg.</th><th>Curtidas ÷ seg.</th><th>Comentários ÷ seg.</th><th>Engajamento por visualização</th></tr></thead><tbody>' +
    [...comp].sort((a, b) => b.medianaViewsPorSeguidor - a.medianaViewsPorSeguidor).map(p =>
      `<tr class="${p.perfil === NIK ? 'nikolas' : ''}">${celulaPerfil(p)}<td>${fmtDec(p.medianaViewsPorSeguidor, 3)}</td>` +
      `<td>${pct(p.medianaCurtidasPorSeguidor)}</td><td>${pct(p.medianaComentariosPorSeguidor, 3)}</td><td>${fmtPct(p.engajamentoMedio)}</td></tr>`).join('') + '</tbody>';

  // ===== Regularidade, vídeos fora da curva e comentários por curtida =====
  const fmtData = d => new Date(d).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo', day: '2-digit', month: '2-digit' });
  for (const p of R.perfis) {
    p._cv = p.regularidade?.amostra12?.cv ?? null;
    p._ccRatio = p.medianaComentariosPorCurtida ?? null;
  }
  const compReg = comp.filter(p => p._cv != null);
  const porCv = [...compReg].sort((a, b) => a._cv - b._cv);
  const rankCv = porCv.findIndex(p => p.perfil === NIK) + 1;
  const regN = nik.regularidade?.amostra12;
  if (regN) {
    document.getElementById('txtRegularidade').textContent =
      `Resultado: o Nikolas tem o ${rankCv === 1 ? 'menor' : rankCv + 'º menor'} coeficiente de variação entre ${compReg.length} perfis (${fmtDec(regN.cv)}; ` +
      `o maior é ${nome(porCv.at(-1).perfil)}, com ${fmtDec(porCv.at(-1)._cv)}). Nos 12 vídeos dele, um vídeo “bom” tem ${fmtDec(regN.p90p10, 1)}× as visualizações de um “fraco”. ` +
      (rankCv === 1 ? 'Ou seja, o alcance alto dele é constante de vídeo para vídeo, não depende de poucos virais.' : '');
  }
  const linhaReg = r => r ? `<td>${fmtDec(r.cv)}</td><td>${fmtDec(r.p90p10, 1)}×</td><td>${r.n}</td>` : '<td class="vazio">—</td><td class="vazio">—</td><td class="vazio">—</td>';
  document.getElementById('tabelaRegularidade').innerHTML =
    '<thead><tr><th>Perfil</th><th>CV (12 vídeos)</th><th>p90/p10 (12)</th><th>n</th><th>CV (todos ≥3 dias)</th><th>p90/p10 (todos)</th><th>n</th></tr></thead><tbody>' +
    porCv.map(p => `<tr class="${p.perfil === NIK ? 'nikolas' : ''}">${celulaPerfil(p)}${linhaReg(p.regularidade.amostra12)}${linhaReg(p.regularidade.todosMaduros)}</tr>`).join('') + '</tbody>';

  const compFora = comp.filter(p => p.foraDaCurva);
  const fN = nik.foraDaCurva;
  const outrosComMarcados = compFora.filter(p => p.perfil !== NIK && p.foraDaCurva.curtidasBaixas > 0);
  if (fN) {
    const el = document.getElementById('txtForaDaCurva');
    el.textContent = fN.curtidasBaixas === 0
      ? `Resultado: nenhum dos ${fN.avaliados} vídeos do Nikolas com 3 dias ou mais ficou abaixo de 50% da mediana de curtidas ÷ visualizações do próprio perfil (${pct(fN.medianaCurtidasPorView)}). Nesta métrica, os vídeos dele não mostram anomalia: a interação acompanha as visualizações de forma consistente.`
      : `Resultado: ${fN.curtidasBaixas} de ${fN.avaliados} vídeos do Nikolas ficaram abaixo de 50% da mediana de curtidas ÷ visualizações do próprio perfil (${pct(fN.medianaCurtidasPorView)}). Eles estão listados abaixo.`;
    el.textContent += outrosComMarcados.length
      ? ` Entre os outros perfis, ${outrosComMarcados.map(p => `${nome(p.perfil)} tem ${p.foraDaCurva.curtidasBaixas}`).join(', ')}. Interação baixa num vídeo específico pode ter várias causas, como distribuição para públicos de fora da base, compartilhamentos ou impulsionamento (veja “Como interpretar”).`
      : ' Nenhum outro perfil teve vídeos marcados.';
  }
  document.getElementById('tabelaForaDaCurva').innerHTML =
    '<thead><tr><th>Perfil</th><th>Vídeos avaliados</th><th>Mediana curtidas ÷ visualizações</th><th>Curtidas &lt; 50% da mediana</th><th>Comentários &lt; 50% da mediana</th></tr></thead><tbody>' +
    [...compFora].sort((a, b) => b.foraDaCurva.curtidasBaixas / b.foraDaCurva.avaliados - a.foraDaCurva.curtidasBaixas / a.foraDaCurva.avaliados).map(p => {
      const f = p.foraDaCurva;
      return `<tr class="${p.perfil === NIK ? 'nikolas' : ''}">${celulaPerfil(p)}<td>${f.avaliados}</td><td>${pct(f.medianaCurtidasPorView)}</td>` +
        `<td>${f.curtidasBaixas} <span class="n">(${fmtPct(f.curtidasBaixas / f.avaliados)})</span></td><td>${f.comentariosBaixos} <span class="n">(${fmtPct(f.comentariosBaixos / f.avaliados)})</span></td></tr>`;
    }).join('') + '</tbody>';
  document.getElementById('listaForaDaCurva').innerHTML = '<div class="vídeos-marcados">' +
    compFora.filter(p => p.foraDaCurva.reels.length).map(p => `<details><summary>${nome(p.perfil)}: ${p.foraDaCurva.reels.length} vídeo(s) marcado(s)</summary><ul>` +
      p.foraDaCurva.reels.map(r => `<li><a href="${r.url}" target="_blank" rel="noopener">${fmtData(r.data)}</a>: ${fmtInt(r.views)} visualizações, ` +
        `${pct(r.curtidasPorView)} de curtidas por visualização (${fmtDec(r.razaoCurtidas * 100, 0)}% da mediana do perfil)</li>`).join('') + '</ul></details>').join('') + '</div>';

  const compCC = comp.filter(p => p._ccRatio != null);
  const porCC = [...compCC].sort((a, b) => b._ccRatio - a._ccRatio);
  const rankCC = porCC.findIndex(p => p.perfil === NIK) + 1;
  const medOutrosCC = mediana(compCC.filter(p => p.perfil !== NIK).map(p => p._ccRatio));
  document.getElementById('txtComentarios').textContent =
    `Resultado: o Nikolas tem ${fmtDec(nik._ccRatio, 3)} comentário por curtida (${rankCC}º de ${compCC.length}; a mediana dos outros é ${fmtDec(medOutrosCC, 3)}). ` +
    `${nome(porCC[0].perfil)} lidera com ${fmtDec(porCC[0]._ccRatio, 3)}, ou cerca de 1 comentário a cada ${Math.round(1 / porCC[0]._ccRatio)} curtidas, contra 1 a cada ${Math.round(1 / nik._ccRatio)} no Nikolas.`;

  tabelaPerfis(document.getElementById('tabela'), politicos);
  document.getElementById('notas').innerHTML = notas(politicos);

  // Outros grupos (famosos_br, famosos_globais): só aparecem se houver perfis.
  const outrosGrupos = Object.keys(GRUPOS).filter(g => g !== 'politicos' && R.perfis.some(p => grupoDe(p) === g));
  // Comparação direta Nikolas × famosos (quando houver famosos com amostra suficiente).
  const famosos = R.perfis.filter(p => grupoDe(p) !== 'politicos' && p.comparavel);
  let htmlFamosos = '';
  if (famosos.length) {
    const acima = famosos.filter(p => p.medianaViewsPorSeguidor > nik.medianaViewsPorSeguidor);
    const top = [...famosos].sort((a, b) => b.medianaViewsPorSeguidor - a.medianaViewsPorSeguidor)[0];
    const medFam = mediana(famosos.map(p => p.medianaViewsPorSeguidor));
    const maiorViews = [...famosos].sort((a, b) => b.medianaViews - a.medianaViews)[0];
    htmlFamosos = '<h2 class="grupo-titulo" id="famosos">Nikolas × famosos</h2><section class="painel">' +
      `<h2>Visualizações por seguidor: Nikolas e celebridades ${i('Cada barra é o vídeo típico do perfil dividido pelo número de seguidores. Celebridades globais têm bases enormes, espalhadas pelo mundo, e por isso a razão tende a ser menor; os famosos brasileiros são a comparação mais próxima.', 'Como ler este gráfico')}</h2>` +
      `<p class="sub">Mesma métrica do topo da página (mediana de visualizações ÷ seguidores dos 12 vídeos mais recentes com 3 dias ou mais), agora com celebridades brasileiras e globais como referência. ` +
      (acima.length
        ? `Resultado: ${acima.map(p => nome(p.perfil)).join(', ')} ${acima.length > 1 ? 'superam' : 'supera'} o Nikolas nesta métrica. `
        : `Resultado: o Nikolas (${fmtDec(nik.medianaViewsPorSeguidor)}) fica acima de todos os ${famosos.length} famosos; o mais próximo é ${nome(top.perfil)}, com ${fmtDec(top.medianaViewsPorSeguidor)}, e a mediana dos famosos é ${fmtDec(medFam)}. `) +
      `Em visualizações absolutas, o maior é ${nome(maiorViews.perfil)}, com ${fmtMi(maiorViews.medianaViews)} por vídeo, contra ${fmtMi(nik.medianaViews)} do Nikolas.</p>` +
      '<div class="grafico"><canvas id="gFamosos" aria-label="Gráfico de barras: visualizações por seguidor do Nikolas e de famosos"></canvas></div>' +
      '<p class="sub nota-comparacao"><strong>Atenção ao comparar:</strong> Cristiano Ronaldo e Messi têm centenas de milhões de seguidores espalhados pelo mundo, e com bases tão grandes a razão visualizações ÷ seguidores tende a ser naturalmente menor (boa parte dos seguidores fica inativa ou não vê cada publicação). O Nikolas fala para um público em português, concentrado no Brasil. Os famosos brasileiros (Neymar, Anitta, Virginia) são a referência mais próxima em idioma e público, embora também tenham bases bem maiores. Celebridades postam com outro objetivo (entretenimento, publicidade), então a comparação mostra uma ordem de grandeza, não um “jogo justo”.</p>' +
      '</section>';
  }
  document.getElementById('outrosGrupos').innerHTML = htmlFamosos + outrosGrupos.map(g =>
    `<h2 class="grupo-titulo">${GRUPOS[g]}</h2>` +
    `<section class="painel"><h2>Visualizações por seguidor</h2><p class="sub">Mediana de visualizações ÷ seguidores, comparando só dentro deste grupo.</p>` +
    `<div class="grafico"><canvas id="gViews_${g}"></canvas></div></section>` +
    `<section class="painel"><h2>Todos os perfis</h2><div class="tabela-wrap"><table class="tabela" id="tabela_${g}"></table></div>` +
    `<ul class="notas" id="notas_${g}"></ul></section>`).join('');
  for (const g of outrosGrupos) {
    const lista = R.perfis.filter(p => grupoDe(p) === g);
    tabelaPerfis(document.getElementById('tabela_' + g), lista);
    document.getElementById('notas_' + g).innerHTML = notas(lista);
  }
  if (outrosGrupos.length) document.getElementById('tituloPoliticos').hidden = false;
  else document.getElementById('tituloPoliticos').hidden = true;

  // Tabela de faixas de idade.
  const faixas = R.faixasIdade || [];
  // Linha da introdução: só aparece se, na faixa com mais vídeos do Nikolas, ele ficar acima de todos os outros perfis com 2+ vídeos nela.
  if (nik.faixas) {
    const k = nik.faixas.reduce((m, f, j) => (f.n || 0) > (nik.faixas[m].n || 0) ? j : m, 0);
    const fNik = nik.faixas[k];
    const rivais = R.perfis.filter(p => p.encontrado && p.perfil !== NIK && p.faixas && p.faixas[k] && p.faixas[k].n >= 2)
      .sort((x, y) => y.faixas[k].medianaViewsPorSeguidor - x.faixas[k].medianaViewsPorSeguidor);
    if (fNik.n >= 5 && rivais.length >= 3 && fNik.medianaViewsPorSeguidor > rivais[0].faixas[k].medianaViewsPorSeguidor) {
      const el = document.getElementById('idadeFato');
      el.innerHTML = `Entre os vídeos com ${faixas[k].endsWith('+') ? 'mais de ' + faixas[k].replace('d+', ' dias') : faixas[k].replace('–', ' a ').replace('d', ' dias')} de idade, faixa onde estão mais vídeos dele (${fNik.n}), a mediana do Nikolas é de <strong>${fmtDec(fNik.medianaViewsPorSeguidor, 2)} visualização por seguidor</strong>; o maior valor entre os outros ${rivais.length} perfis com vídeos dessa idade é ${fmtDec(rivais[0].faixas[k].medianaViewsPorSeguidor, 2)} (${nome(rivais[0].perfil)}).`;
      el.hidden = false;
    }
  }
  function tabelaFaixas(grupo) {
    const lista = R.perfis.filter(p => p.encontrado && p.faixas && (grupo === 'todos' || grupoDe(p) === grupo));
    document.getElementById('tabelaFaixas').innerHTML =
      '<thead><tr><th>Perfil</th>' + faixas.map(f => `<th>${f}</th>`).join('') + '</tr></thead><tbody>' +
      lista.map(p => `<tr class="${p.perfil === NIK ? 'nikolas' : ''}">${celulaPerfil(p)}` +
        p.faixas.map(f => f.n ? `<td>${fmtDec(f.medianaViewsPorSeguidor, 2)} <span class="n">(${f.n})</span></td>` : '<td class="vazio">—</td>').join('') +
        '</tr>').join('') + '</tbody>';
  }

  // ===== Gráficos =====
  // ===== Achados numerados =====
  const duelo = famososComp.filter(p => p.seguidores > nik.seguidores * 3)
    .sort((a, b) => Math.abs(Math.log(a.medianaViews / nik.medianaViews)) - Math.abs(Math.log(b.medianaViews / nik.medianaViews)))[0];
  const faixaSeg = famososComp.map(p => p.seguidores / nik.seguidores);
  const CURTO_NOME = { cristiano: 'Cristiano', leomessi: 'Messi', neymarjr: 'Neymar', anitta: 'Anitta', virginia: 'Virginia' };
  const curtoNome = p => CURTO_NOME[p.perfil] || nome(p.perfil);
  const nomesPol = outros.map(p => nome(p.perfil)).join(', ').replace(/, ([^,]*)$/, ' e $1');
  const segFam = famososComp.map(p => p.seguidores / nik.seguidores), vpsFam = famososComp.map(p => p.medianaViewsPorSeguidor);
  const achados = [
    famososComp.length && famososAbaixo.length === famososComp.length && {
      n: `${famososAbaixo.length} de ${famososComp.length}`,
      t: `Nikolas supera as ${famososComp.length} celebridades analisadas em visualizações por seguidor`,
      d: `${famososComp.map(p => curtoNome(p)).join(', ').replace(/, ([^,]*)$/, ' e $1')} têm de ${fmtX(Math.min(...segFam))} a ${fmtX(Math.max(...segFam))} mais seguidores, e mesmo assim ficam atrás (de ${fmtDec(Math.min(...vpsFam))} a ${fmtDec(Math.max(...vpsFam))} contra ${fmtDec(nik.medianaViewsPorSeguidor)})`,
      i: 'Visualizações por seguidor = visualizações do vídeo típico ÷ número de seguidores. Mesmo com bases muito maiores, nenhuma das celebridades chega perto do valor do Nikolas.' },
    duelo && {
      n: fmtX(duelo.seguidores / nik.seguidores),
      t: `${curtoNome(duelo)} tem ${fmtX(duelo.seguidores / nik.seguidores)} mais seguidores, mas ${duelo.medianaViews < nik.medianaViews ? 'menos' : 'mais'} visualizações por vídeo que Nikolas`,
      d: `Vídeo típico: ${curtoNome(duelo)} ${fmtMi(duelo.medianaViews)}, Nikolas ${fmtMi(nik.medianaViews)}`,
      i: `${curtoNome(duelo)} tem ${fmtMi(duelo.seguidores)} de seguidores; Nikolas, ${fmtMi(nik.seguidores)}. Mesmo assim, o vídeo típico (a mediana dos vídeos analisados) dos dois tem um número parecido de visualizações.` },
    regN && rankCv === 1 && {
      n: fmtDec(regN.cv),
      t: 'O alcance do Nikolas é o mais constante entre os políticos: os vídeos variam pouco entre si',
      d: `Um vídeo “bom” dele tem ${fmtDec(regN.p90p10, 1)}× as visualizações de um “fraco”; nos outros políticos, de ${fmtDec(Math.min(...outros.map(p => p.regularidade?.amostra12?.p90p10).filter(Boolean)), 1)}× a ${fmtDec(Math.max(...outros.map(p => p.regularidade?.amostra12?.p90p10).filter(Boolean)), 1)}×`,
      i: `O número ${fmtDec(regN.cv)} é o coeficiente de variação: o desvio padrão das visualizações dividido pela média. Quanto mais perto de 0, mais parecidos são os vídeos entre si. O vídeo “bom” é o percentil 90 (melhor que 90% dos outros) e o “fraco”, o percentil 10.` },
    fN && {
      n: `${fN.curtidasBaixas} de ${fN.avaliados}`,
      t: fN.curtidasBaixas === 0 ? `Nenhum dos ${fN.avaliados} vídeos tem curtidas fora do padrão para as visualizações que teve` : `${fN.curtidasBaixas} dos ${fN.avaliados} vídeos têm curtidas abaixo do padrão para as visualizações que tiveram`,
      d: `Curtidas por visualização típicas do perfil: ${(fN.medianaCurtidasPorView * 100).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`,
      i: 'Para cada vídeo com pelo menos 3 dias, comparamos curtidas ÷ visualizações com a mediana do próprio perfil. Um vídeo seria marcado se ficasse abaixo da metade dessa mediana (muitas visualizações para poucas curtidas).' },
    {
      n: `${rankEng}º de ${comp.length}`,
      t: `Em engajamento por visualização, Nikolas fica em ${rankEng}º de ${comp.length} políticos`,
      d: `${fmtPct(nik.engajamentoMedio)} contra ${fmtPct(lider.engajamentoMedio)} de ${nome(lider.perfil)}, o 1º`,
      i: 'Engajamento = (curtidas + comentários) ÷ visualizações. Os vídeos do Nikolas alcançam muita gente, mas proporcionalmente menos pessoas curtem ou comentam do que nos outros políticos.' },
  ].filter(Boolean);
  document.getElementById('achados').innerHTML = achados.map((x, k) =>
    `<li class="achado revelar" style="--i:${k % 3}"><span class="achado-n">${String(k + 1).padStart(2, '0')}</span><div><p class="achado-num">${x.n}${i(x.i, `O que significa ${x.n}?`)}</p><p class="achado-txt">${x.t}</p><p class="achado-det">${x.d}</p></div></li>`).join('');

  // ===== Em perspectiva =====
  if (duelo) {
    const maxSeg = Math.max(duelo.seguidores, nik.seguidores), maxV = Math.max(duelo.medianaViews, nik.medianaViews);
    const circulo = (p, ehNik) => `<div class="duelo-col${ehNik ? ' nik' : ''}">
      <p class="duelo-nome">${nome(p.perfil)}</p>
      <div class="duelo-circulo-area"><span class="duelo-circulo" style="--d:${Math.sqrt(p.seguidores / maxSeg).toFixed(3)}"></span></div>
      <p class="duelo-rot"><strong>${fmtMi(p.seguidores)}</strong> de seguidores</p></div>`;
    const barraV = (p, ehNik) => `<div class="vb-col${ehNik ? ' nik' : ''}">
      <span class="vb-valor">${fmtMi(p.medianaViews)}</span>
      <span class="vb-trilho"><i style="--h:${(p.medianaViews / maxV * 100).toFixed(1)}%"></i></span>
      <span class="vb-nome">${ehNik ? 'Nikolas' : curtoNome(p)}</span></div>`;
    document.getElementById('duelo').innerHTML =
      `<h2>Alcance parecido, ${fmtX(duelo.seguidores / nik.seguidores)} menos seguidores</h2>` +
      '<p class="sub">A área de cada círculo é proporcional ao número de seguidores. No meio, as barras mostram as visualizações de um vídeo típico (mediana) de cada um.</p>' +
      `<div class="duelo-grid duelo-3">${circulo(nik, true)}
        <div class="duelo-barras" role="img" aria-label="Visualizações no vídeo típico: Nikolas ${fmtMi(nik.medianaViews)}, ${curtoNome(duelo)} ${fmtMi(duelo.medianaViews)}">
          <p class="vb-tit">Visualizações no vídeo típico</p>
          <div class="vb-par">${barraV(nik, true)}${barraV(duelo, false)}</div>
        </div>
        ${circulo(duelo, false)}</div>`;
  } else document.getElementById('duelo').remove();

  document.getElementById('taxaNik').textContent = fmtDec(nik.medianaViewsPorSeguidor);
  const contra = outros.map(p => ({ p, real: p.medianaViews, hip: p.seguidores * nik.medianaViewsPorSeguidor })).sort((a, b) => b.hip - a.hip);
  const maxHip = Math.max(...contra.map(c => c.hip));
  document.getElementById('contraLista').innerHTML = contra.map(c => `<div class="contra-linha">
      <p class="contra-nome">${nome(c.p.perfil)} <span>${fmtMi(c.p.seguidores)} de seguidores</span></p>
      <div class="contra-barra real"><span style="--w:${(c.real / maxHip * 100).toFixed(1)}%"></span><em>${fmtMi(c.real)} hoje</em></div>
      <div class="contra-barra hip"><span style="--w:${(c.hip / maxHip * 100).toFixed(1)}%"></span><em>${fmtMi(c.hip)} com a taxa do Nikolas (${fmtX(c.hip / c.real)})</em></div>
    </div>`).join('');

  // ===== Fotos (Wikimedia Commons, licenças conferidas nas páginas dos arquivos) =====
  const FOTOS = {
    nikolasferreiradm: { arq: 'nikolas.jpg', autor: 'Pablo Valadares/Câmara dos Deputados', lic: 'CC BY 3.0', licUrl: 'https://creativecommons.org/licenses/by/3.0/deed.pt-br', pag: 'https://commons.wikimedia.org/wiki/File:Nikolas_Ferreira_in_2023_(cropped).jpg', mod: 'imagem modificada (duotone)' },
    cristiano: { arq: 'cristiano.jpg', autor: 'Bryan Berlin', lic: 'CC BY-SA 4.0', licUrl: 'https://creativecommons.org/licenses/by-sa/4.0/deed.pt-br', pag: 'https://commons.wikimedia.org/wiki/File:Cristiano_Ronaldo_Croatia_v_Portugal_2_July_2026-075_(cropped).jpg' },
    leomessi: { arq: 'leomessi.jpg', autor: 'Bryan Berlin', lic: 'CC BY-SA 4.0', licUrl: 'https://creativecommons.org/licenses/by-sa/4.0/deed.pt-br', pag: 'https://commons.wikimedia.org/wiki/File:Lionel_Messi_Argentina_v_Egypt_7_July_2026-112(cropped).jpg' },
    neymarjr: { arq: 'neymarjr.jpg', autor: 'Bryan Berlin', lic: 'CC BY-SA 4.0', licUrl: 'https://creativecommons.org/licenses/by-sa/4.0/deed.pt-br', pag: 'https://commons.wikimedia.org/wiki/File:Neymar_Junior_Brazil_V_Morocco_13_June_2026-40.jpg' },
    anitta: { arq: 'anitta.jpg', autor: 'Attractive Mindset', lic: 'CC BY 3.0', licUrl: 'https://creativecommons.org/licenses/by/3.0/deed.pt-br', pag: 'https://commons.wikimedia.org/wiki/File:Anitta_for_Attractive_Mindset_podcast_02.jpg' },
    virginia: { arq: 'virginia.jpg', autor: 'Andressa Anholete/Agência Senado', lic: 'CC BY 2.0', licUrl: 'https://creativecommons.org/licenses/by/2.0/deed.pt-br', pag: 'https://commons.wikimedia.org/wiki/File:Virginia_Fonseca_na_CPI_das_BETS_02_(cropped).jpg' },
  };
  const creditoCurto = p => { const f = FOTOS[p]; return f ? `Foto: ${f.autor}, <a href="${f.licUrl}" target="_blank" rel="noopener">${f.lic}</a> (<a href="${f.pag}" target="_blank" rel="noopener">link</a>)${f.mod ? ' · ' + f.mod : ''}` : ''; };
  document.getElementById('creditosFotos').innerHTML = Object.entries(FOTOS)
    .map(([p]) => `<li>${nome(p)}: ${creditoCurto(p).replace('Foto: ', '')}</li>`).join('');
  const iniciais = p => nome(p).split(' ').map(s => s[0]).slice(0, 2).join('');
  // Aceita o objeto do perfil ou o nome de usuário; sem foto livre, mostra as iniciais.
  const foto = q => { const p = q.perfil || q; return FOTOS[p]
    ? `<img src="img/${FOTOS[p].arq}" alt="${nome(p)}" loading="lazy">`
    : `<span class="avatar-iniciais" aria-hidden="true">${iniciais(p)}</span>`; };

  // ===== Carrossel de comparações (famosos primeiro, depois resumo dos políticos) =====
  const trilho = document.getElementById('carrTrilho');
  const fmtPctInt = n => Math.round(n * 100) + '%';
  const famososOrd = [...famososComp].sort((x, y) => y.seguidores - x.seguidores);
  // Cada slide: frase curta, três números grandes (o alcance por seguidor é o maior destaque)
  // e barras comparando seguidores e visualizações, com as fotos como rótulo das linhas.
  const pron = p => ['virginia', 'anitta'].includes(p) ? 'dela' : 'dele';
  const linhaBarra = (p, valor, max, fmt) => `<div class="cmp-linha${p.perfil === NIK ? ' nik' : ''}">
      <span class="cmp-mini${p.perfil === NIK ? ' duotone' : ''}">${foto(p)}</span>
      <span class="cmp-linha-nome">${p.perfil === NIK ? 'Nikolas' : nome(p.perfil)}</span>
      <span class="cmp-trilho"><i style="--w:${Math.max(1.5, valor / max * 100).toFixed(1)}%"></i></span>
      <span class="cmp-linha-valor">${fmt(valor)}</span></div>`;
  const grupoBarras = (titulo, f, chave, fmt) => {
    const max = Math.max(nik[chave], f[chave]);
    return `<div class="cmp-grupo"><p class="cmp-grupo-titulo">${titulo}</p>${linhaBarra(nik, nik[chave], max, fmt)}${linhaBarra(f, f[chave], max, fmt)}</div>`;
  };
  // Cartões com cabeçalho, número grande, frase completa e "i"; o 3º (alcance por seguidor) é o destaque.
  const stat = (num, rot, cls = '', cabeca = '', ajuda = '') => `<div class="big-stat ${cls}">${cabeca ? `<span class="big-cabeca">${cabeca}</span>` : ''}<span class="big-num">${num}${ajuda ? i(ajuda, `O que significa ${num}?`) : ''}</span><span class="big-rot">${rot}</span></div>`;
  const curto = curtoNome;
  const dec2 = n => fmtDec(n, 2);
  const nVideos = p => `${p.reels} vídeo${p.reels === 1 ? '' : 's'}`;
  const slides = famososOrd.map(f => {
    const rSeg = f.seguidores / nik.seguidores, rV = nik.medianaViews / f.medianaViews;
    const rVps = nik.medianaViewsPorSeguidor / f.medianaViewsPorSeguidor;
    const quem = curto(f), deQuem = pron(f.perfil);
    const segTxt = rSeg >= 3 ? `${fmtX(rSeg)} mais seguidores` : rSeg >= 2 ? 'mais que o dobro de seguidores' : 'mais seguidores';
    const absTipico = `(vídeo típico: Nikolas ${fmtMi(nik.medianaViews)}, ${quem} ${fmtMi(f.medianaViews)} de visualizações)`;
    const resumo = rV >= 1.1
      ? `${quem} tem ${segTxt}, mas o vídeo típico do Nikolas tem mais visualizações ${absTipico}.`
      : rV > 0.9
        ? `${quem} tem ${segTxt}, mas os vídeos típicos dos dois têm praticamente as mesmas visualizações ${absTipico}.`
        : `${quem} tem ${segTxt} e o vídeo típico ${deQuem} tem mais visualizações ${absTipico}. Por seguidor, porém, o Nikolas alcança ${fmtX(rVps)} mais.`;
    const somas = f.reels === nik.reels
      ? `Somando os ${nik.reels} vídeos analisados de cada um: Nikolas ${fmtMi(nik.somaViews)}, ${quem} ${fmtMi(f.somaViews)} de visualizações.`
      : `Somando os vídeos analisados (${nVideos(nik)} do Nikolas, ${nVideos(f)} ${deQuem === 'dela' ? 'da' : 'do'} ${quem}): Nikolas ${fmtMi(nik.somaViews)}, ${quem} ${fmtMi(f.somaViews)} de visualizações.`;
    const cardViews = rV >= 1
      ? stat(fmtX(rV), `O vídeo típico do Nikolas tem ${fmtX(rV)} mais visualizações que o ${deQuem} (${fmtMi(nik.medianaViews)} contra ${fmtMi(f.medianaViews)})`, '', 'Visualizações por vídeo',
          `Comparação em números absolutos, sem levar em conta o tamanho de cada base. Vídeo típico (mediana dos vídeos analisados): Nikolas ${fmtMi(nik.medianaViews)}, ${quem} ${fmtMi(f.medianaViews)}.`)
      : stat(fmtX(1 / rV), `O vídeo típico de ${quem} tem ${fmtX(1 / rV)} mais visualizações (${fmtMi(f.medianaViews)} contra ${fmtMi(nik.medianaViews)})`, 'cinza', 'Visualizações por vídeo',
          `Comparação em números absolutos, sem levar em conta o tamanho de cada base. Vídeo típico (mediana dos vídeos analisados): ${quem} ${fmtMi(f.medianaViews)}, Nikolas ${fmtMi(nik.medianaViews)}. Em números absolutos, o vídeo ${deQuem} tem mais visualizações.`);
    return { rotulo: nome(f.perfil), html: `<p class="cmp-frase">Nikolas × <em>${nome(f.perfil)}</em></p>
      <p class="cmp-resumo">${resumo}</p>
      <div class="big-stats">
        ${stat(fmtX(rSeg), `${quem} tem ${fmtX(rSeg)} mais seguidores que Nikolas (${fmtMi(f.seguidores)} contra ${fmtMi(nik.seguidores)})`, 'cinza', 'Seguidores',
          `Seguidores são o tamanho da base: quantas contas acompanham o perfil. ${quem}: ${fmtMi(f.seguidores)}. Nikolas: ${fmtMi(nik.seguidores)}. Dividindo um pelo outro, dá ${fmtX(rSeg)}.`)}
        ${cardViews}
        ${stat(fmtX(rVps), `Para cada seguidor, Nikolas tem ${fmtX(rVps)} mais visualizações que ${quem} (${dec2(nik.medianaViewsPorSeguidor)} contra ${dec2(f.medianaViewsPorSeguidor)} por seguidor)`, 'destaque', 'Alcance por seguidor',
          `Visualizações por seguidor = visualizações do vídeo típico ÷ seguidores. Nikolas: ${fmtMi(nik.medianaViews)} ÷ ${fmtMi(nik.seguidores)} = ${dec2(nik.medianaViewsPorSeguidor)}. ${quem}: ${fmtMi(f.medianaViews)} ÷ ${fmtMi(f.seguidores)} = ${dec2(f.medianaViewsPorSeguidor)}. Dividindo um pelo outro, dá ${fmtX(rVps)}: é quantas vezes mais o vídeo do Nikolas alcança em relação ao tamanho da própria base.`)}
      </div>
      <div class="cmp-grupos">
        ${grupoBarras('Seguidores', f, 'seguidores', fmtMi)}
        ${grupoBarras('Visualizações no vídeo típico', f, 'medianaViews', fmtMi)}
      </div>
      <p class="cmp-somas">${somas}</p>` };
  });
  const maxVps = Math.max(...comp.map(p => p.medianaViewsPorSeguidor));
  const nomesOutros = outros.map(p => nome(p.perfil)).join(', ').replace(/, ([^,]*)$/, ' e $1');
  slides.push({ rotulo: 'Políticos', html: `<p class="cmp-frase">Nikolas × <em>outros políticos</em></p>
    <p class="cmp-resumo">Comparado à média dos outros ${outros.length} políticos analisados (${nomesOutros}), o Nikolas alcança ${fmtX(razaoVps)} mais visualizações por seguidor.</p>
    <div class="big-stats">
      ${stat(dec2(nik.medianaViewsPorSeguidor), `Visualizações por seguidor do Nikolas (${fmtMi(nik.medianaViews)} no vídeo típico ÷ ${fmtMi(nik.seguidores)} de seguidores)`, '', 'Nikolas',
        `Um vídeo típico do Nikolas tem ${fmtMi(nik.medianaViews)} de visualizações. Dividido pelos ${fmtMi(nik.seguidores)} de seguidores, dá ${dec2(nik.medianaViewsPorSeguidor)} visualização por seguidor.`)}
      ${stat(dec2(mediaOutrosVps), `Visualizações por seguidor, média dos outros ${outros.length} políticos`, 'cinza', 'Outros políticos',
        `Média simples das visualizações por seguidor de ${nomesOutros}: ${outros.map(p => `${curto(p)} ${dec2(p.medianaViewsPorSeguidor)}`).join('; ')}.`)}
      ${stat(fmtX(razaoVps), `Para cada seguidor, Nikolas tem ${fmtX(razaoVps)} mais visualizações que a média dos outros políticos (${dec2(nik.medianaViewsPorSeguidor)} contra ${dec2(mediaOutrosVps)} por seguidor)`, 'destaque', 'Alcance por seguidor',
        `${dec2(nik.medianaViewsPorSeguidor)} ÷ ${dec2(mediaOutrosVps)} = ${fmtX(razaoVps)}. Exemplo: com 1 milhão de seguidores, o vídeo típico dos outros teria cerca de ${Math.round(mediaOutrosVps * 1000)} mil visualizações, e o do Nikolas, cerca de ${fmtDec(nik.medianaViewsPorSeguidor)} milhão.`)}
    </div>
    <p class="cmp-grupo-titulo">Visualizações por seguidor e visualizações do vídeo típico</p>
    <ol class="cmp-barras">${[...comp].sort((x, y) => y.medianaViewsPorSeguidor - x.medianaViewsPorSeguidor).map(p => `<li class="${p.perfil === NIK ? 'nik' : ''}"><span class="cmp-barra-nome">${nome(p.perfil)}<small>${fmtMi(p.medianaViews)} por vídeo</small></span><span class="cmp-barra"><i style="--w:${(p.medianaViewsPorSeguidor / maxVps * 100).toFixed(1)}%"></i></span><span class="cmp-barra-valor">${dec2(p.medianaViewsPorSeguidor)}</span></li>`).join('')}</ol>` });
  trilho.innerHTML = slides.map((s, i) => `<article class="slide" role="group" aria-roledescription="slide" aria-label="${i + 1} de ${slides.length}: ${s.rotulo}">${s.html}</article>`).join('');
  const pontosCarr = document.getElementById('carrPontos');
  pontosCarr.innerHTML = slides.map((s, i) => `<button type="button" role="tab" aria-label="${s.rotulo}" aria-selected="${i === 0}"><span>${s.rotulo}</span></button>`).join('');
  const reduzirCarr = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let atual = 0, pausado = reduzirCarr, timer = null;
  const irPara = (i, foco) => {
    atual = (i + slides.length) % slides.length;
    trilho.scrollTo({ left: trilho.children[atual].offsetLeft - trilho.offsetLeft, behavior: reduzirCarr ? 'auto' : 'smooth' });
    [...pontosCarr.children].forEach((b, k) => b.setAttribute('aria-selected', String(k === atual)));
    if (foco) pontosCarr.children[atual].focus();
  };
  // Sincroniza o ponto ativo quando o usuário arrasta (swipe) o trilho.
  let rolando;
  trilho.addEventListener('scroll', () => {
    clearTimeout(rolando);
    rolando = setTimeout(() => {
      const i = Math.round(trilho.scrollLeft / trilho.clientWidth);
      if (i !== atual) { atual = i; [...pontosCarr.children].forEach((b, k) => b.setAttribute('aria-selected', String(k === atual))); }
    }, 120);
  }, { passive: true });
  document.getElementById('carrAnterior').addEventListener('click', () => { irPara(atual - 1); reiniciar(); });
  document.getElementById('carrProximo').addEventListener('click', () => { irPara(atual + 1); reiniciar(); });
  pontosCarr.addEventListener('click', e => { const b = e.target.closest('button'); if (b) { irPara([...pontosCarr.children].indexOf(b)); reiniciar(); } });
  const carrossel = document.getElementById('carrossel');
  carrossel.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') { irPara(atual + 1, e.target.closest('[role=tablist]')); reiniciar(); e.preventDefault(); }
    if (e.key === 'ArrowLeft') { irPara(atual - 1, e.target.closest('[role=tablist]')); reiniciar(); e.preventDefault(); }
  });
  // Troca automática suave: pausa com mouse em cima, foco dentro, aba oculta ou botão de pausa.
  const botaoPausa = document.getElementById('carrPausa');
  let emCima = false;
  const parar = () => { clearInterval(timer); timer = null; };
  function reiniciar() {
    parar();
    if (!pausado && !emCima && !carrossel.contains(document.activeElement) && !document.hidden) timer = setInterval(() => irPara(atual + 1), 6500);
  }
  carrossel.addEventListener('mouseenter', () => { emCima = true; parar(); });
  carrossel.addEventListener('mouseleave', () => { emCima = false; reiniciar(); });
  carrossel.addEventListener('focusin', parar);
  carrossel.addEventListener('focusout', () => setTimeout(reiniciar, 0));
  document.addEventListener('visibilitychange', reiniciar);
  const marcarPausa = () => { botaoPausa.setAttribute('aria-pressed', String(pausado)); botaoPausa.setAttribute('aria-label', pausado ? 'Retomar troca automática' : 'Pausar troca automática'); botaoPausa.textContent = pausado ? '▶' : '❚❚'; };
  botaoPausa.addEventListener('click', () => { pausado = !pausado; marcarPausa(); reiniciar(); });
  marcarPausa();
  reiniciar();

  // ===== Efeitos ao rolar =====
  const reduzir = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.querySelectorAll('main .painel, main .grupo-titulo').forEach(el => el.classList.add('revelar'));
  const quandoVisivel = (el, fn) => {
    if (reduzir || !('IntersectionObserver' in window)) return fn();
    const io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { io.disconnect(); fn(); } }, { rootMargin: '0px 0px -8% 0px' });
    io.observe(el);
  };
  document.querySelectorAll('.revelar').forEach(el => quandoVisivel(el, () => el.classList.add('visivel')));

  if (!window.Chart) { tabelaFaixas('politicos'); return; }
  const css = getComputedStyle(document.documentElement);
  const cor = v => css.getPropertyValue(v).trim();
  Chart.defaults.color = cor('--muted');
  Chart.defaults.font.family = cor('--fonte');
  Chart.defaults.scale.title.color = cor('--heading');
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) Chart.defaults.animation = false;
  Chart.defaults.scale.title.font = { weight: '600' };

  // Escreve o valor na ponta de cada barra (usado no gráfico do topo).
  const rotulosBarras = fmt => ({
    id: 'rotulos',
    afterDatasetsDraw(chart) {
      const { ctx } = chart;
      ctx.save();
      ctx.font = '700 13px ' + cor('--fonte');
      ctx.textBaseline = 'middle';
      chart.getDatasetMeta(0).data.forEach((bar, i) => {
        const v = chart.data.datasets[0].data[i];
        ctx.fillStyle = chart.data.datasets[0].backgroundColor[i] === cor('--accent') ? cor('--accent') : cor('--heading');
        ctx.fillText(fmt(v), bar.x + 6, bar.y);
      });
      ctx.restore();
    },
  });

  function barras(id, lista, chave, fmt, destaque, crescente) {
    const dados = lista.filter(p => p.comparavel).sort((a, b) => crescente ? a[chave] - b[chave] : b[chave] - a[chave]);
    const canvas = document.getElementById(id);
    quandoVisivel(canvas, () => new Chart(canvas, {
      type: 'bar',
      data: {
        labels: dados.map(p => nome(p.perfil)),
        datasets: [{
          data: dados.map(p => p[chave]),
          backgroundColor: dados.map(p => p.perfil === NIK ? cor('--accent') : cor('--bar')),
          borderRadius: 4,
          maxBarThickness: destaque ? 44 : 34,
        }],
      },
      plugins: destaque ? [rotulosBarras(fmt)] : [],
      options: {
        indexAxis: 'y',
        maintainAspectRatio: false,
        layout: destaque ? { padding: { right: 48 } } : {},
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => ' ' + fmt(c.raw) } } },
        scales: {
          x: { grid: { color: cor('--line') }, border: { display: false }, ticks: { callback: v => fmt(v) } },
          y: { grid: { display: false }, border: { display: false }, ticks: { color: cor('--heading'), font: { size: destaque && innerWidth >= 500 ? 15 : 13, weight: destaque ? '600' : '400' } } },
        },
      },
    }));
  }
  barras('gViews', politicos, 'medianaViewsPorSeguidor', v => fmtDec(v), true);
  barras('gEng', politicos, 'engajamentoMedio', v => fmtPct(v));
  barras('gCurt', politicos, 'medianaCurtidasPorSeguidor', v => pct(v, 0));
  barras('gRegularidade', politicos.filter(p => p._cv != null), '_cv', v => fmtDec(v), false, true);
  barras('gComentarios', politicos.filter(p => p._ccRatio != null), '_ccRatio', v => fmtDec(v, 2));
  if (famosos.length) barras('gFamosos', [nik, ...famosos], 'medianaViewsPorSeguidor', v => fmtDec(v));
  for (const g of outrosGrupos) barras('gViews_' + g, R.perfis.filter(p => grupoDe(p) === g), 'medianaViewsPorSeguidor', v => fmtDec(v));

  // Dispersão idade × visualizações ÷ seguidores, uma série por perfil.
  // Demais perfis em tons de cinza, diferenciados também pelo formato do ponto.
  const PALETA = ['#1a1a1a', '#5c5c5c', '#8c8c8c', '#3d3d3d', '#a8a8a8', '#707070', '#2b2b2b', '#999999', '#4d4d4d', '#b8b8b8', '#636363', '#262626'];
  const FORMAS = ['circle', 'rect', 'triangle', 'rectRot', 'crossRot', 'star', 'rectRounded', 'cross', 'triangle', 'rect', 'rectRot', 'circle'];
  const pontos = R.pontos || [];
  const grupoPerfil = Object.fromEntries(R.perfis.map(p => [p.perfil, grupoDe(p)]));
  const potencia10 = v => Math.abs(Math.log10(v) - Math.round(Math.log10(v))) < 1e-9;
  let grafIdade;

  function desenharIdade(grupo) {
    const perfisG = R.perfis.filter(p => (grupo === 'todos' || grupoDe(p) === grupo) && pontos.some(x => x.perfil === p.perfil));
    let i = 0;
    const datasets = perfisG.map(p => {
      const ehNik = p.perfil === NIK;
      const k = ehNik ? 0 : i++;
      const c = ehNik ? cor('--accent') : PALETA[k % PALETA.length];
      return {
        label: nome(p.perfil),
        data: pontos.filter(x => x.perfil === p.perfil).map(x => ({ x: x.idadeDias, y: x.viewsPorSeguidor })),
        backgroundColor: c + (ehNik ? '' : 'b3'),
        borderColor: c,
        pointStyle: ehNik ? 'circle' : FORMAS[k % FORMAS.length],
        pointRadius: ehNik ? 5 : 4,
        pointHoverRadius: 7,
        order: ehNik ? 0 : 1,
      };
    });
    if (grafIdade) grafIdade.destroy();
    grafIdade = new Chart(document.getElementById('gIdade'), {
      type: 'scatter',
      data: { datasets },
      options: {
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: innerWidth < 600 ? 6 : 8, padding: innerWidth < 600 ? 8 : 12, font: { size: innerWidth < 600 ? 10 : 12 }, color: cor('--text') } },
          tooltip: { callbacks: { label: c => ` ${c.dataset.label}: ${fmtDec(c.raw.x, 1)} dias, ${fmtDec(c.raw.y, 2)} visualizações/seguidor` } },
        },
        scales: {
          x: {
            type: 'logarithmic',
            title: { display: true, text: 'Idade do vídeo no momento da coleta (dias)' },
            grid: { color: cor('--line') },
            ticks: { callback: v => (potencia10(v) || [3, 7, 30].includes(v)) ? fmtLog(v) : '' },
          },
          y: {
            type: 'logarithmic',
            title: { display: true, text: 'Visualizações ÷ seguidores' },
            grid: { color: cor('--line') },
            ticks: { callback: v => potencia10(v) ? fmtLog(v) : '' },
          },
        },
      },
    });
    tabelaFaixas(grupo);
  }

  // Filtro por grupo só aparece quando há mais de um grupo com dados.
  const gruposComPontos = Object.keys(GRUPOS).filter(g => pontos.some(x => grupoPerfil[x.perfil] === g));
  if (gruposComPontos.length > 1) {
    const box = document.getElementById('filtrosIdade');
    box.hidden = false;
    // 'Todos' vem primeiro e começa selecionado.
    box.innerHTML = ['todos', ...gruposComPontos].map((g, k) => `<button type="button" data-g="${g}" aria-pressed="${k === 0}">${g === 'todos' ? 'Todos' : GRUPOS[g]}</button>`).join('');
    box.addEventListener('click', e => {
      const b = e.target.closest('button');
      if (!b) return;
      box.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', x === b));
      desenharIdade(b.dataset.g);
    });
  }
  quandoVisivel(document.getElementById('gIdade'), () => desenharIdade(gruposComPontos.length > 1 ? 'todos' : (gruposComPontos[0] || 'politicos')));
});
