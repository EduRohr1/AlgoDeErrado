// Análises extras ("pistas nos dados") usadas por atualizar.mjs.
// Tudo é calculado a partir dos reels já coletados; nada aqui faz chamadas externas.
// Classificações de tema e de tom são por palavras-chave: aproximadas e documentadas abaixo.

const DIA = 86400e3;
const FUSO_BRASILIA = -3; // horas; o Brasil não tem horário de verão desde 2019

export const mediana = a => { if (!a.length) return null; const s = [...a].sort((x, y) => x - y); const m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };

// Correlação de Spearman (postos), robusta a valores extremos.
function postos(a) {
  const idx = a.map((v, i) => [v, i]).sort((x, y) => x[0] - y[0]);
  const r = new Array(a.length);
  for (let i = 0; i < idx.length;) {
    let j = i; while (j + 1 < idx.length && idx[j + 1][0] === idx[i][0]) j++;
    for (let k = i; k <= j; k++) r[idx[k][1]] = (i + j) / 2 + 1;
    i = j + 1;
  }
  return r;
}
export function spearman(x, y) {
  if (x.length < 5) return null;
  const rx = postos(x), ry = postos(y), n = x.length;
  const mx = rx.reduce((a, b) => a + b) / n, my = ry.reduce((a, b) => a + b) / n;
  let s = 0, sx = 0, sy = 0;
  for (let i = 0; i < n; i++) { s += (rx[i] - mx) * (ry[i] - my); sx += (rx[i] - mx) ** 2; sy += (ry[i] - my) ** 2; }
  return sx && sy ? s / Math.sqrt(sx * sy) : null;
}

// ===== 1. Frequência de postagem =====
// Reels por dia nos últimos 30 dias antes da coleta. Se a coleta não alcançou 30 dias
// (perfis que postam dezenas por dia), usa o período coberto pelos reels coletados.
export function frequencia(todos, coletadoEm) {
  const comData = todos.filter(x => x.timestamp);
  if (!comData.length) return null;
  const idade = x => (coletadoEm(x) - Date.parse(x.timestamp)) / DIA;
  const janela = comData.filter(x => idade(x) <= 30);
  if (!janela.length) {
    const ultimo = Math.min(...comData.map(idade));
    return { reelsPorDia: 0, dias: 30, reels: 0, inativoHaDias: Math.round(ultimo) };
  }
  const maisAntigo = Math.max(...janela.map(idade));
  const cobreTudo = janela.length === comData.length && comData.length >= 25; // provável corte pelo limite de coleta
  const dias = Math.max(1, cobreTudo ? maisAntigo : 30);
  return { reelsPorDia: +(janela.length / dias).toFixed(2), dias: +dias.toFixed(1), reels: janela.length };
}

// ===== 2. Duração =====
export function duracao(maduros, seguidores) {
  const rs = maduros.filter(x => x.videoDuration > 0 && x.videoPlayCount > 0);
  if (!rs.length || !seguidores) return null;
  const dur = rs.map(x => x.videoDuration), vps = rs.map(x => x.videoPlayCount / seguidores);
  const medDur = mediana(dur);
  const longos = rs.filter(x => x.videoDuration >= medDur), curtos = rs.filter(x => x.videoDuration < medDur);
  return {
    n: rs.length,
    medianaSegundos: Math.round(medDur),
    acima60s: +(rs.filter(x => x.videoDuration > 60).length / rs.length).toFixed(3),
    correlacao: spearman(dur, vps) == null ? null : +spearman(dur, vps).toFixed(2),
    vpsLongos: mediana(longos.map(x => x.videoPlayCount / seguidores)),
    vpsCurtos: mediana(curtos.map(x => x.videoPlayCount / seguidores)),
    pontos: rs.map(x => ({ s: Math.round(x.videoDuration), v: +(x.videoPlayCount / seguidores).toFixed(4) })),
  };
}

// ===== 3. Horário e dia da semana (Brasília) =====
const PERIODOS = [['madrugada', 0, 6], ['manhã', 6, 12], ['tarde', 12, 18], ['noite', 18, 24]];
const DIAS_SEMANA = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
const horaBr = x => { const d = new Date(Date.parse(x.timestamp) + FUSO_BRASILIA * 3600e3); return { h: d.getUTCHours(), dia: d.getUTCDay() }; };
export function horario(todos, maduros, seguidores) {
  const rs = todos.filter(x => x.timestamp);
  if (!rs.length) return null;
  const mad = maduros.filter(x => x.timestamp && x.videoPlayCount > 0);
  const periodos = PERIODOS.map(([nome, a, b]) => {
    const dentro = x => { const { h } = horaBr(x); return h >= a && h < b; };
    const vps = seguidores ? mad.filter(dentro).map(x => x.videoPlayCount / seguidores) : [];
    return { periodo: nome, pctPosts: +(rs.filter(dentro).length / rs.length).toFixed(3), n: vps.length, medianaVps: mediana(vps) };
  });
  const dias = DIAS_SEMANA.map((nome, i) => ({ dia: nome, pctPosts: +(rs.filter(x => horaBr(x).dia === i).length / rs.length).toFixed(3) }));
  const horas = rs.map(x => horaBr(x).h);
  return { periodos, dias, horaMediana: mediana(horas) };
}

// Remove o rodapé legal de propaganda eleitoral ("Propaganda eleitoral - Coligação ... CNPJ ...").
export const limparLegenda = t => (t || '').split(/\s*-?\s*propaganda eleitoral/i)[0].trim();

// ===== 4. Estilo de legenda =====
const STOP = new Set(('a o e é de da do das dos que em um uma para por com não no na nos nas se os as ao à às mais mas como foi ser são tem já ou eu você vc ele ela isso esse essa este esta aqui lá só sua seu meu minha nosso nossa eles elas nós quem quando onde porque pra pro tá está estão vai vou hoje sobre até sem também muito bem todo toda todos todas ainda agora então aí pelo pela pelos pelas me te lhe nem há era foram sido tudo nada cada mesmo outra outro dia ano anos vez the and of to in for on is it with you this that from are at be your our my el la los las del en y es un una por con para que se lo le su sus al').split(' '));
const RE_EMOJI = /\p{Extended_Pictographic}/gu;
const palavras = t => (t || '').toLowerCase()
  .replace(/https?:\/\/\S+/g, ' ').replace(/[@#][\p{L}\p{N}_.]+/gu, ' ')
  .normalize('NFC').match(/\p{L}[\p{L}'-]+/gu) || [];
export function legenda(todos) {
  const rs = todos.filter(x => x.timestamp);
  if (!rs.length) return null;
  const caps = rs.map(x => limparLegenda(x.caption));
  const cont = new Map();
  for (const c of caps) for (const w of new Set(palavras(c))) if (w.length >= 3 && !STOP.has(w)) cont.set(w, (cont.get(w) || 0) + 1);
  return {
    n: rs.length,
    medianaCaracteres: mediana(caps.map(c => c.length)),
    medianaHashtags: mediana(rs.map(x => (x.hashtags || []).length)),
    pctComMencao: +(rs.filter(x => (x.mentions || []).length).length / rs.length).toFixed(3),
    medianaEmojis: mediana(caps.map(c => (c.match(RE_EMOJI) || []).length)),
    palavras: [...cont].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 8).map(([p, n]) => ({ p, n })),
  };
}

// ===== 5. Temas por legenda =====
// Regras transparentes: um reel recebe todos os temas cujas palavras aparecem na legenda.
export const TEMAS = {
  'economia': ['economia', 'imposto', 'impostos', 'taxa', 'taxação', 'pix', 'inflação', 'preço', 'preços', 'dinheiro', 'emprego', 'empregos', 'desempregados', 'desemprego', 'salário', 'gasolina', 'juros', 'fiscal', 'bolsa família', 'tesouraço', 'aposentado', 'aposentados', 'inss', 'renda'],
  'religião e família': ['deus', 'jesus', 'cristo', 'igreja', 'fé', 'cristão', 'cristãos', 'família', 'famílias', 'aborto', 'oração', 'bíblia', 'amém', 'senhor', 'livrai'],
  'segurança': ['bandido', 'bandidos', 'crime', 'crimes', 'polícia', 'policial', 'segurança', 'preso', 'presos', 'prisão', 'facção', 'facções', 'violência', 'droga', 'drogas', 'tráfico', 'traficante'],
  'corrupção': ['corrupção', 'corrupto', 'corruptos', 'roubo', 'roubar', 'roubaram', 'desvio', 'propina', 'escândalo', 'cpi', 'vorcaro', 'sigilo', 'investigação'],
  'adversários e governo': ['lula', 'pt', 'petista', 'bolsonaro', 'flávio', 'stf', 'moraes', 'governo', 'esquerda', 'direita', 'ministro', 'ministra', 'oposição', 'janja', 'haddad'],
  'eleição e voto': ['eleição', 'eleições', 'voto', 'votos', 'votar', 'vote', 'urna', 'urnas', 'campanha', 'candidato', 'candidata', 'turno', 'debate', 'pesquisa'],
};
const normalizar = t => ` ${(t || '').toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, ' ').replace(/\s+/g, ' ')} `;
// O próprio nome do dono do perfil não conta como "adversário" (ex.: "Lula" nas legendas do Lula).
const PROPRIO_NOME = { lulaoficial: ['lula', 'pt'], jairmessiasbolsonaro: ['bolsonaro'], bolsonarosp: ['bolsonaro'], 'guilhermeboulos.oficial': ['boulos'], tabataamaralsp: ['tabata'], nikolasferreiradm: ['nikolas'] };
export const temasDe = (legendaTxt, perfil) => {
  const t = normalizar(limparLegenda(legendaTxt));
  const ignorar = new Set(PROPRIO_NOME[perfil] || []);
  return Object.entries(TEMAS).filter(([, ps]) => ps.some(p => !ignorar.has(p) && t.includes(` ${p} `))).map(([tema]) => tema);
};
export function temas(maduros, seguidores, perfil) {
  const rs = maduros.filter(x => x.videoPlayCount > 0);
  if (!rs.length || !seguidores) return null;
  const marcados = rs.map(x => ({ t: temasDe(x.caption, perfil), v: x.videoPlayCount / seguidores }));
  const linhas = [...Object.keys(TEMAS), 'sem tema identificado'].map(tema => {
    const dentro = marcados.filter(m => tema === 'sem tema identificado' ? !m.t.length : m.t.includes(tema));
    return { tema, n: dentro.length, pct: +(dentro.length / rs.length).toFixed(3), medianaVps: mediana(dentro.map(m => m.v)) };
  });
  return { n: rs.length, temas: linhas };
}

// ===== 6. Tom dos comentários (amostra) =====
// Só agregados saem daqui: nenhum nome de usuário nem texto de comentário é devolvido.
// "Crítica" = linguagem negativa ou ofensiva no comentário (nem sempre dirigida ao dono do perfil).
// Prioridade: crítica > apoio > pergunta > neutro; comentários idênticos repetidos viram "repetitivo".
const CRITICA = ['lixo', 'mentiroso', 'mentirosa', 'mentira', 'mentindo', 'vergonha', 'ridículo', 'ridícula', 'palhaço', 'palhaçada', 'canalha', 'vagabundo', 'vagabunda', 'ladrão', 'ladra', 'ladrões', 'bandido', 'corrupto', 'fascista', 'nojo', 'nojento', 'hipócrita', 'idiota', 'burro', 'cadeia', 'genocida', 'traidor', 'golpista', 'safado', 'safada', 'covarde', 'desonesto', 'fake', 'piada', 'patético', 'fora', 'mentiu', 'mente', 'desgraça', 'merda', 'porra', 'vergonhoso', 'pior', 'ódio', 'petralha', 'bolsominion', 'gado', 'miliciano', 'descondenado', 'cachaceiro', 'quadrilha', 'lixo', 'imbecil', 'otário', 'vagabundagem'];
const APOIO = ['parabéns', 'orgulho', 'abençoe', 'abençoado', 'amém', 'mito', 'junto', 'tamo', 'presidente', 'perfeito', 'perfeita', 'verdade', 'excelente', 'sensacional', 'maravilhoso', 'maravilhosa', 'lindo', 'linda', 'amo', 'ídolo', 'gigante', 'brabo', 'top', 'demais', 'apoio', 'voto', 'coragem', 'obrigado', 'obrigada', 'deus', 'show', 'arrasou', 'incrível', 'goat', 'love', 'best', 'great', 'king', 'crack', 'campeão'];
const EMOJI_APOIO = /[🙏👏❤️💚💛🔥💪🇧🇷😍🥰👑🐐♥️💙✨🙌👍]/u;
const EMOJI_CRITICA = /[🤡💩🤮👎🖕]/u;
const temPalavra = (t, lista) => { const n = normalizar(t); return lista.some(p => n.includes(` ${p} `)); };
export function classificarComentario(texto) {
  const t = (texto || '').trim();
  if (!t) return 'neutro';
  if (temPalavra(t, CRITICA) || EMOJI_CRITICA.test(t)) return 'crítica';
  if (temPalavra(t, APOIO) || EMOJI_APOIO.test(t)) return 'apoio';
  if (t.includes('?')) return 'pergunta';
  return 'neutro';
}
export function tom(reelsBrutosDoPerfil) {
  const textos = reelsBrutosDoPerfil.flatMap(x => (x.latestComments || []).map(c => (c.text || '').trim()));
  if (textos.length < 20) return null;
  // Repetidos: textos idênticos (com 20+ caracteres) que aparecem 2+ vezes na amostra do perfil.
  const vezes = new Map();
  for (const t of textos) if (t.length >= 20) vezes.set(t, (vezes.get(t) || 0) + 1);
  const repetidos = new Set([...vezes].filter(([, n]) => n >= 2).map(([t]) => t));
  const cont = { apoio: 0, 'crítica': 0, pergunta: 0, neutro: 0, 'repetitivo': 0 };
  for (const t of textos) cont[repetidos.has(t) ? 'repetitivo' : classificarComentario(t)]++;
  const n = textos.length;
  return {
    n,
    pct: Object.fromEntries(Object.entries(cont).map(([k, v]) => [k, +(v / n).toFixed(3)])),
    textosRepetidos: repetidos.size,
    comentariosRepetidos: cont['repetitivo'],
  };
}
