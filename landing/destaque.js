// Destaque à parte: o maior vídeo recente do Nikolas (pode ter menos de 3 dias; fica fora das médias).
(function () {
  const R = window.RESUMO;
  const nik = R && R.perfis.find(p => p.perfil === 'nikolasferreiradm');
  const v = nik && nik.maiorReel;
  const sec = document.getElementById('destaqueVideo');
  if (!v || !sec) return;
  const mi = n => (n / 1e6).toLocaleString('pt-BR', { maximumFractionDigits: n >= 1e8 ? 0 : 1 }) + ' mi';
  const milhoes = n => Math.round(n / 1e6).toLocaleString('pt-BR') + ' milhões';
  const TZ = { timeZone: 'America/Sao_Paulo' };
  const data = d => new Date(d).toLocaleDateString('pt-BR', { ...TZ, day: '2-digit', month: '2-digit', year: 'numeric' });
  const hora = d => new Date(d).toLocaleTimeString('pt-BR', { ...TZ, hour: '2-digit', minute: '2-digit' }).replace(':', 'h');
  const vezes = n => n.toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + '×';
  const esc = t => t.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  // Comparação com o vídeo típico dos famosos que ele supera com um vídeo só.
  const famosos = R.perfis.filter(p => (p.grupo || 'politicos') !== 'politicos' && p.comparavel && p.medianaViews < v.views)
    .sort((a, b) => b.medianaViews - a.medianaViews);
  const nomes = { cristiano: 'Cristiano Ronaldo', leomessi: 'Messi', neymarjr: 'Neymar', anitta: 'Anitta', virginia: 'Virginia', kimkardashian: 'Kim Kardashian' };

  document.getElementById('dvViews').innerHTML = milhoes(v.views) + (window.infoBtn ? window.infoBtn(`É o vídeo com mais visualizações entre os coletados do Nikolas: ${milhoes(v.views)} de visualizações. Dividido pelo número de seguidores dele, dá ${vezes(v.vezesSeguidores)}. Ou seja, o vídeo foi visto mais vezes do que ele tem de seguidores (uma mesma pessoa assistir mais de uma vez também conta). Como tinha menos de 3 dias na coleta, ele fica fora das médias da página.`, 'O que significa este número?') : '');
  // Comparação com a população do Brasil (IBGE, estimativa 2025: 213,4 milhões), só se os números sustentarem a frase.
  // Também usada no topo (app.js), por isso fica em window.comparacao108.
  const POP_BR = 213.4e6;
  const horasDesdePub = (Date.parse(v.coletadoEm) - Date.parse(v.data)) / 3600e3;
  const fracaoPop = v.views / POP_BR;
  const horaTxt = h => `${Math.floor(h)}h${String(Math.round((h % 1) * 60 / 10) * 10).padStart(2, '0')}`;
  const duracao = h => `${Math.floor(h)}h${String(Math.round((h % 1) * 60)).padStart(2, '0')}`;
  window.comparacao108 = {
    ok: horasDesdePub < 10 && fracaoPop >= 0.45 && fracaoPop <= 0.55,
    info: `${(v.views / 1e6).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} milhões de visualizações em cerca de ${horaTxt(horasDesdePub)} (publicado às ${hora(v.data)} de ${data(v.data).slice(0, 5)}, contado às ${hora(v.coletadoEm)}). A população do Brasil é de cerca de 213 milhões (IBGE, estimativa 2025: 213,4 milhões). Visualização não é pessoa única: quem assiste de novo conta outra vez.`,
  };
  // Linha principal complementar ao topo: o crescimento entre as duas leituras.
  const hPrimeira = v.viewsAnterior && v.coletaAnterior ? (Date.parse(v.coletaAnterior) - Date.parse(v.data)) / 3600e3 : null;
  document.getElementById('dvTitulo').innerHTML = hPrimeira && hPrimeira > 0
    ? `Foram <em>${mi(v.viewsAnterior).replace(' mi', ' milhões')}</em> nas primeiras ~${horaTxt(hPrimeira)} e <em>${(v.views / 1e6).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} milhões</em> em ${duracao(horasDesdePub)}.` +
      (window.infoBtn ? window.infoBtn(`Horários de Brasília. Publicado às ${hora(v.data)} de ${data(v.data).slice(0, 5)}. Primeira leitura às ${hora(v.coletaAnterior)} (${mi(v.viewsAnterior)}), segunda às ${hora(v.coletadoEm)} (${mi(v.views)}). Visualização não é pessoa única: quem assiste de novo conta outra vez.`, 'Como foram feitas as leituras?') : '')
    : `Um único vídeo: <em>${vezes(v.vezesSeguidores)}</em> os seguidores dele.`;
  document.getElementById('dvLegenda').innerHTML =
    `“${esc(v.legenda || 'sem legenda')}” · publicado em ${data(v.data)}, às ${hora(v.data)} · <a href="${esc(v.url)}" target="_blank" rel="noopener">ver no Instagram ↗</a>`;
  document.getElementById('dvCresc').innerHTML = [
    famosos.length ? (() => {
      const alvo = famosos.length === 1 ? nomes[famosos[0].perfil] : `todas as ${famosos.length} celebridades analisadas`;
      const ult = alvo.split(' ').pop(), resto = alvo.slice(0, -ult.length);
      const btn = window.infoBtn ? ' ' + window.infoBtn(`Vídeo típico de cada celebridade: ${famosos.map(p => `${nomes[p.perfil] || p.perfil}, ${mi(p.medianaViews)}`).join('; ')}.`, 'Quais são os números?') : '';
      return `Sozinho, teve mais visualizações que o vídeo típico de ${resto}<span class="cola">${ult}.${btn}</span>`;
    })() : '',
  ].filter(Boolean).join(' ');
  document.getElementById('dvNota').textContent =
    `Vídeo com menos de 3 dias na data da coleta (${data(v.coletadoEm)}, ${hora(v.coletadoEm)}): fica fora das médias da página, que usam só vídeos com 3 dias ou mais. Um vídeo isolado não representa o padrão do perfil.`;
  sec.hidden = false;
})();
