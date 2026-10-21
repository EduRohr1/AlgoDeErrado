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
  const nomes = { cristiano: 'Cristiano Ronaldo', leomessi: 'Messi', neymarjr: 'Neymar', anitta: 'Anitta', virginia: 'Virginia' };

  document.getElementById('dvViews').textContent = milhoes(v.views);
  document.getElementById('dvTitulo').innerHTML = `Um único vídeo: <em>${vezes(v.vezesSeguidores)}</em> os seguidores dele.`;
  document.getElementById('dvLegenda').innerHTML =
    `“${esc(v.legenda || 'sem legenda')}” · publicado em ${data(v.data)}, às ${hora(v.data)} · <a href="${esc(v.url)}" target="_blank" rel="noopener">ver no Instagram ↗</a>`;
  const horas = v.viewsAnterior && v.coletaAnterior ? (Date.parse(v.coletadoEm) - Date.parse(v.coletaAnterior)) / 3600e3 : null;
  document.getElementById('dvCresc').innerHTML = [
    horas ? `Na nossa primeira coleta, às ${hora(v.coletaAnterior)}, tinha <strong>${mi(v.viewsAnterior)}</strong>; ${Math.round(horas)} horas depois, <strong>${mi(v.views)}</strong> (${vezes(v.views / v.viewsAnterior)}).` : '',
    famosos.length ? `Sozinho, passa do vídeo típico de ${famosos.map(p => `${nomes[p.perfil] || p.perfil} (${mi(p.medianaViews)})`).join(', ')}.` : '',
  ].filter(Boolean).join(' ');
  document.getElementById('dvNota').textContent =
    `Vídeo com menos de 3 dias na data da coleta (${data(v.coletadoEm)}, ${hora(v.coletadoEm)}): fica fora das médias da página, que usam só vídeos com 3 dias ou mais. Um vídeo isolado não representa o padrão do perfil.`;
  sec.hidden = false;
})();
