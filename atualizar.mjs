// Atualiza os dados de reels via Apify e regenera a landing page.
// Uso:   node atualizar.mjs            (coleta nova no Apify; precisa de APIFY_TOKEN)
//        node atualizar.mjs --offline  (recalcula resumo e landing a partir de dados/*.json já salvos)
//        node atualizar.mjs --apenas=famosos [--teto=1]   (ou --apenas=nikolasferreiradm para um perfil só)
//            coleta só os grupos indicados (politicos, famosos_br, famosos_globais ou "famosos")
//            e junta aos dados já salvos dos outros grupos; --teto (US$) evita a 2ª busca se o custo passar do limite
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { frequencia, duracao, horario, legenda, temas, tom, TEMAS } from './analises.mjs';

// ===== Perfis analisados (edite aqui) =====
// Políticos: grupo "politicos", idioma "pt".
const PERFIS = [
  'nikolasferreiradm',
  'lulaoficial',
  'jairmessiasbolsonaro',
  'bolsonarosp',
  'tabataamaralsp',
  'guilhermeboulos.oficial',
  'erikakhilton',
  'pablomarcal1',
  'andrejanonesoficial',
];

// Outros grupos (vazio por enquanto). Cada item: { username, grupo, idioma }.
// grupo: "famosos_br" ou "famosos_globais"; idioma: código como "pt", "en", "es".
// Ex.: { username: 'anitta', grupo: 'famosos_br', idioma: 'pt' }
const PERFIS_FAMOSOS = [
  { username: 'neymarjr', grupo: 'famosos_br', idioma: 'pt' },
  { username: 'anitta', grupo: 'famosos_br', idioma: 'pt' },
  { username: 'virginia', grupo: 'famosos_br', idioma: 'pt' },
  { username: 'cristiano', grupo: 'famosos_globais', idioma: 'pt' },
  { username: 'leomessi', grupo: 'famosos_globais', idioma: 'es' },
];

const GRUPOS = { politicos: 'Políticos', famosos_br: 'Famosos brasileiros', famosos_globais: 'Famosos globais' };
const TODOS = [
  ...PERFIS.map(username => ({ username, grupo: 'politicos', idioma: 'pt' })),
  ...PERFIS_FAMOSOS,
].map(p => ({ ...p, username: p.username.toLowerCase() }));
for (const p of TODOS) if (!GRUPOS[p.grupo]) throw new Error(`Grupo desconhecido "${p.grupo}" em ${p.username}. Use: ${Object.keys(GRUPOS).join(', ')}`);

// Faixas de idade para o gráfico "Idade do post × views" (em dias).
const FAIXAS = [
  { rotulo: '0–1d', min: 0, max: 1 },
  { rotulo: '1–3d', min: 1, max: 3 },
  { rotulo: '3–7d', min: 3, max: 7 },
  { rotulo: '7–30d', min: 7, max: 30 },
  { rotulo: '30d+', min: 30, max: Infinity },
];

// ===== Parâmetros =====
const REELS_POR_PERFIL = 12;   // quantos reels entram na análise
const DIAS_MINIMOS = 3;        // ignora reels mais novos que isso
const LIMITE_INICIAL = 30;     // reels pedidos ao Apify na 1ª rodada
const LIMITE_EXTRA = 100;      // 2ª rodada, só para perfis que postam demais
const MINIMO_COMPARAVEL = 5;   // abaixo disso o perfil é marcado como amostra insuficiente
const DIAS_INATIVO = 60;       // reel mais recente mais velho que isso => aviso de perfil inativo

const RAIZ = path.dirname(fileURLToPath(import.meta.url));
const DADOS = path.join(RAIZ, 'dados');
const LANDING = path.join(RAIZ, 'landing');
const BASE = 'https://api.apify.com/v2';
const OFFLINE = process.argv.includes('--offline');
const arg = nome => process.argv.find(a => a.startsWith(`--${nome}=`))?.split('=')[1];
// --apenas aceita grupos (politicos, famosos_br, famosos_globais, famosos) ou nomes de usuário.
const APENAS = (arg('apenas')?.split(',') ?? []).flatMap(g => g === 'famosos' ? ['famosos_br', 'famosos_globais'] : [g.toLowerCase()]);
const TETO = arg('teto') ? +arg('teto') : Infinity;

const sleep = ms => new Promise(r => setTimeout(r, ms));
const lerJson = f => JSON.parse(fs.readFileSync(path.join(DADOS, f), 'utf8'));
const gravarJson = (f, v) => fs.writeFileSync(path.join(DADOS, f), JSON.stringify(v, null, 2));

// ===== Dados publicáveis =====
// dados/perfis.json e dados/reels.json vão para o repositório público: só ficam campos dos próprios
// perfis analisados (contagens, datas, legendas, links). Comentários, nomes de quem comentou,
// marcações e coautores de terceiros ficam de fora. O bruto completo vai para dados/brutos/ (fora do git).
const BRUTOS = path.join(DADOS, 'brutos');
const CAMPOS_PERFIL = ['inputUrl', 'id', 'username', 'url', 'fullName', 'biography', 'followersCount', 'followsCount', 'postsCount',
  'isBusinessAccount', 'businessCategoryName', 'private', 'verified', 'error', 'errorDescription', '_coletadoEm'];
const CAMPOS_REEL = ['id', 'type', 'productType', 'shortCode', 'url', 'inputUrl', 'timestamp', 'ownerUsername', 'ownerFullName', 'ownerId',
  'caption', 'hashtags', 'mentions', 'videoPlayCount', 'videoViewCount', 'likesCount', 'commentsCount', 'videoDuration',
  'isPinned', 'paidPartnership', 'isCommentsDisabled', '_coletadoEm'];
const escolher = (x, campos) => Object.fromEntries(campos.filter(k => x[k] !== undefined).map(k => [k, x[k]]));
const limparPerfil = p => escolher(p, CAMPOS_PERFIL);
const limparReel = x => {
  const r = escolher(x, CAMPOS_REEL);
  if (Array.isArray(x.coauthorProducers)) r.coautores = x.coauthorProducers.length; // só a quantidade
  else if (typeof x.coautores === 'number') r.coautores = x.coautores;
  if (x.musicInfo) r.audioOriginal = !!x.musicInfo.uses_original_audio;
  else if (typeof x.audioOriginal === 'boolean') r.audioOriginal = x.audioOriginal;
  return r;
};
function gravarDados(perfis, reels, brutos) {
  if (brutos) {
    fs.mkdirSync(BRUTOS, { recursive: true });
    fs.writeFileSync(path.join(BRUTOS, 'perfis.json'), JSON.stringify(brutos.perfis, null, 2));
    fs.writeFileSync(path.join(BRUTOS, 'reels.json'), JSON.stringify(brutos.reels, null, 2));
  }
  gravarJson('perfis.json', perfis.map(limparPerfil));
  gravarJson('reels.json', reels.map(limparReel));
}

let headers;
async function rodarAtor(ator, input) {
  const r = await fetch(`${BASE}/acts/${ator}/runs`, { method: 'POST', headers, body: JSON.stringify(input) });
  if (r.status === 401) throw new Error('O Apify recusou o token (401). Confira se APIFY_TOKEN está certo e não foi revogado.');
  if (!r.ok) throw new Error(`Falha ao iniciar ${ator}: HTTP ${r.status} ${await r.text()}`);
  let run = (await r.json()).data;
  process.stdout.write(`${ator}: rodando`);
  while (!['SUCCEEDED', 'FAILED', 'ABORTED', 'TIMED-OUT'].includes(run.status)) {
    await sleep(10000);
    run = (await (await fetch(`${BASE}/actor-runs/${run.id}`, { headers })).json()).data;
    process.stdout.write('.');
  }
  console.log(` ${run.status}`);
  if (run.status !== 'SUCCEEDED') throw new Error(`${ator} terminou com status ${run.status}`);
  const items = await (await fetch(`${BASE}/datasets/${run.defaultDatasetId}/items?clean=true&format=json`, { headers })).json();
  return { items, usd: run.usageTotalUsd ?? 0 };
}

// No modo offline o "agora" é a data da coleta salva, para o resultado ser reproduzível.
const resumoAnterior = fs.existsSync(path.join(DADOS, 'resumo.json')) ? lerJson('resumo.json') : null;
const AGORA = OFFLINE && resumoAnterior ? Date.parse(resumoAnterior.geradoEm) : Date.now();
const dono = x => (x.ownerUsername || '').toLowerCase();
// Cada reel guarda quando foi coletado (_coletadoEm), porque grupos podem ser coletados em momentos diferentes.
// Reels antigos sem a marca usam a data do resumo anterior.
const COLETA_ANTERIOR = resumoAnterior?.geradoEm ?? new Date(AGORA).toISOString();
const coletadoEm = x => Date.parse(x._coletadoEm || COLETA_ANTERIOR);
const maduro = x => coletadoEm(x) - Date.parse(x.timestamp) >= DIAS_MINIMOS * 86400e3;
// Reels válidos de um perfil: só do próprio dono (sem collabs), com >= DIAS_MINIMOS e views conhecidas.
const reelsValidos = (reels, u) => reels
  .filter(x => dono(x) === u && x.timestamp && maduro(x) && typeof x.videoPlayCount === 'number' && x.videoPlayCount > 0)
  .sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp))
  .slice(0, REELS_POR_PERFIL);

async function coletar() {
  const token = process.env.APIFY_TOKEN;
  if (!token) {
    console.error('Erro: a variável de ambiente APIFY_TOKEN não está definida.\n' +
      'Veja o LEIA-ME.md para salvar o token, ou rode com --offline para só recalcular com os dados já salvos.');
    process.exit(1);
  }
  headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
  const custo = { perfis: 0, reels: 0 };
  const alvo = APENAS.length ? TODOS.filter(p => APENAS.includes(p.grupo) || APENAS.includes(p.username)) : TODOS;
  if (!alvo.length) throw new Error(`Nenhum perfil nos grupos: ${APENAS.join(', ')}`);
  console.log(`Coletando ${alvo.length} perfis: ${alvo.map(p => p.username).join(', ')}`);
  const agora = new Date().toISOString();

  const perfis = await rodarAtor('apify~instagram-profile-scraper', { usernames: alvo.map(p => p.username) });
  custo.perfis += perfis.usd;
  const encontrados = perfis.items.filter(p => p.followersCount != null).map(p => p.username.toLowerCase());

  const r1 = await rodarAtor('apify~instagram-reel-scraper', { username: encontrados, resultsLimit: LIMITE_INICIAL });
  custo.reels += r1.usd;
  let reels = r1.items;

  // Perfis que postam muito não chegam a 12 reels com >= 3 dias na 1ª rodada: busca mais fundo.
  const faltando = encontrados.filter(u => reelsValidos(reels, u).length < REELS_POR_PERFIL &&
    reels.filter(x => dono(x) === u).length >= LIMITE_INICIAL - 2);
  if (faltando.length && custo.perfis + custo.reels > TETO * 0.5) {
    console.log(`Pulando 2ª busca (${faltando.join(', ')}): custo já em US$ ${(custo.perfis + custo.reels).toFixed(2)}, teto US$ ${TETO}.`);
  } else if (faltando.length) {
    console.log(`Buscando mais reels para: ${faltando.join(', ')}`);
    const r2 = await rodarAtor('apify~instagram-reel-scraper', { username: faltando, resultsLimit: LIMITE_EXTRA });
    custo.reels += r2.usd;
    const vistos = new Set();
    reels = [...reels, ...r2.items].filter(x => !x.id || (!vistos.has(x.id) && vistos.add(x.id)));
  }

  for (const x of [...perfis.items, ...reels]) x._coletadoEm = agora;
  let todosPerfis = perfis.items, todosReels = reels;
  if (APENAS.length) {
    // Junta com os dados já salvos dos outros grupos, marcando a data da coleta antiga.
    const novos = new Set(alvo.map(p => p.username));
    const marcar = x => ({ ...x, _coletadoEm: x._coletadoEm || COLETA_ANTERIOR });
    const lerBruto = f => fs.existsSync(path.join(BRUTOS, f)) ? JSON.parse(fs.readFileSync(path.join(BRUTOS, f), 'utf8')) : lerJson(f);
    const antigosPerfis = lerBruto('perfis.json').filter(p => !novos.has((p.username || '').toLowerCase())).map(marcar);
    const antigosReels = lerBruto('reels.json').filter(x => !novos.has(dono(x))).map(marcar);
    const ids = new Set(reels.map(x => x.id));
    todosPerfis = [...antigosPerfis, ...perfis.items];
    todosReels = [...antigosReels.filter(x => !ids.has(x.id)), ...reels];
    const anterior = resumoAnterior?.custoUsd ?? { perfis: 0, reels: 0 };
    custo.ultimaColeta = { grupos: APENAS, perfis: custo.perfis, reels: custo.reels, total: custo.perfis + custo.reels };
    custo.perfis += anterior.perfis;
    custo.reels += anterior.reels;
  }
  fs.mkdirSync(DADOS, { recursive: true });
  gravarDados(todosPerfis, todosReels, { perfis: todosPerfis, reels: todosReels });
  return { perfis: todosPerfis, reels: todosReels, custo };
}

const mediana = a => { if (!a.length) return null; const s = [...a].sort((x, y) => x - y); const m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
const media = a => a.length ? a.reduce((x, y) => x + y, 0) / a.length : null;
// Percentil com interpolação linear (p entre 0 e 1).
const percentil = (a, p) => { if (!a.length) return null; const s = [...a].sort((x, y) => x - y); const i = (s.length - 1) * p, b = Math.floor(i); return s[b] + (s[Math.min(b + 1, s.length - 1)] - s[b]) * (i - b); };
// Regularidade das views: coeficiente de variação (desvio padrão ÷ média) e razão p90/p10.
function regularidade(views) {
  if (views.length < 3) return null;
  const m = media(views);
  const dp = Math.sqrt(views.reduce((t, v) => t + (v - m) ** 2, 0) / (views.length - 1));
  return { n: views.length, cv: dp / m, p90p10: percentil(views, 0.9) / percentil(views, 0.1) };
}
const LIMIAR_FORA_DA_CURVA = 0.5; // interação < 50% da mediana do próprio perfil

// Reels com interação muito abaixo da mediana do próprio perfil (todos os reels >= 3 dias).
function foraDaCurva(reelsPerfil) {
  const rs = reelsPerfil.filter(x => x.likesCount >= 0); // curtidas ocultas (-1) ficam de fora
  if (rs.length < 5) return null;
  const cpv = x => x.likesCount / x.videoPlayCount, kpv = x => (x.commentsCount ?? 0) / x.videoPlayCount;
  const medC = mediana(rs.map(cpv)), medK = mediana(rs.map(kpv));
  const avaliados = rs.map(x => ({
    url: x.url, data: x.timestamp, views: x.videoPlayCount,
    curtidasPorView: cpv(x), razaoCurtidas: cpv(x) / medC,
    comentariosPorView: kpv(x), razaoComentarios: medK ? kpv(x) / medK : null,
  }));
  const marcados = avaliados.filter(r => r.razaoCurtidas < LIMIAR_FORA_DA_CURVA).sort((a, b) => a.razaoCurtidas - b.razaoCurtidas);
  return {
    avaliados: avaliados.length,
    medianaCurtidasPorView: medC,
    medianaComentariosPorView: medK,
    curtidasBaixas: marcados.length,
    comentariosBaixos: avaliados.filter(r => r.razaoComentarios != null && r.razaoComentarios < LIMIAR_FORA_DA_CURVA).length,
    reels: marcados.map(r => ({ ...r, curtidasPorView: +r.curtidasPorView.toFixed(5), razaoCurtidas: +r.razaoCurtidas.toFixed(3), comentariosPorView: +r.comentariosPorView.toFixed(6), razaoComentarios: r.razaoComentarios == null ? null : +r.razaoComentarios.toFixed(3) })),
  };
}

const idadeDias = x => Math.max(0.01, (coletadoEm(x) - Date.parse(x.timestamp)) / 86400e3);

function resumir(perfis, reels) {
  // Tom dos comentários: só com o bruto local (dados/brutos/). Sem ele (ex.: clone do repositório),
  // reaproveita os agregados do resumo anterior.
  const brutosReels = fs.existsSync(path.join(BRUTOS, 'reels.json')) ? JSON.parse(fs.readFileSync(path.join(BRUTOS, 'reels.json'), 'utf8')) : null;
  const tomAnterior = Object.fromEntries((resumoAnterior?.perfis || []).map(p => [p.perfil, p.pistas?.tom ?? null]));
  return TODOS.map(({ username: u, grupo, idioma }) => {
    const p = perfis.find(x => (x.username || '').toLowerCase() === u);
    const seg = p?.followersCount ?? null;
    const todos = reels.filter(x => dono(x) === u);
    const rs = reelsValidos(reels, u);
    const views = rs.map(x => x.videoPlayCount);
    const curt = rs.map(x => Math.max(0, x.likesCount ?? 0)); // -1 = curtidas ocultas
    const com = rs.map(x => x.commentsCount ?? 0);
    const medV = mediana(views);
    const encontrado = seg != null;
    const comparavel = encontrado && rs.length >= MINIMO_COMPARAVEL;

    let observacao;
    if (!encontrado) observacao = 'Handle não encontrado no Instagram.';
    else if (!comparavel) observacao = `Amostra insuficiente: ${rs.length} de ${todos.length} reels coletados com >= ${DIAS_MINIMOS} dias. Excluído da comparação.`;
    else if (rs.length < REELS_POR_PERFIL) {
      const doPerfil = reels.filter(x => (x.inputUrl || '').toLowerCase().replace(/\/$/, '').endsWith('/' + u));
      const deOutros = doPerfil.filter(x => dono(x) !== u).length;
      observacao = `Amostra menor: só ${rs.length} reels próprios com >= ${DIAS_MINIMOS} dias` +
        (deOutros ? `; ${deOutros} dos ${doPerfil.length} reels que aparecem no perfil são collabs publicados por outras contas (marcas, parceiros) e ficaram de fora.` : '.');
    } else {
      const maisRecente = Math.max(...todos.map(x => Date.parse(x.timestamp)).filter(Number.isFinite));
      if (AGORA - maisRecente > DIAS_INATIVO * 86400e3) {
        const quando = new Date(maisRecente).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
        observacao = `Perfil sem reels novos desde ${quando}; os reels analisados são antigos.`;
      }
    }

    // Todos os reels do próprio perfil (inclusive < 3 dias e além dos 12), por faixa de idade.
    const comViews = todos.filter(x => x.timestamp && x.videoPlayCount > 0);
    const maduros = comViews.filter(maduro); // todos os reels >= DIAS_MINIMOS
    const faixas = FAIXAS.map(f => {
      const vps = seg ? comViews.filter(x => { const d = idadeDias(x); return d >= f.min && d < f.max; }).map(x => x.videoPlayCount / seg) : [];
      return { faixa: f.rotulo, n: vps.length, medianaViewsPorSeguidor: mediana(vps) };
    });

    return {
      perfil: u,
      grupo,
      idioma,
      coletadoEm: p?._coletadoEm || COLETA_ANTERIOR, // data da coleta deste perfil
      encontrado,
      seguidores: seg,
      reelsColetados: todos.length,
      reels: rs.length,
      medianaViews: medV,
      mediaViews: media(views),
      medianaViewsPorSeguidor: seg && medV != null ? medV / seg : null,
      // Interação relativa à base de seguidores (mediana por reel). Reels com curtidas ocultas ficam fora das curtidas.
      medianaCurtidasPorSeguidor: seg && rs.length ? mediana(rs.filter(x => (x.likesCount ?? 0) >= 0).map(x => (x.likesCount ?? 0) / seg)) : null,
      medianaComentariosPorSeguidor: seg && rs.length ? mediana(com.map(c => c / seg)) : null,
      engajamentoMedio: rs.length ? media(rs.map((x, i) => (curt[i] + com[i]) / x.videoPlayCount)) : null,
      mediaCurtidas: media(curt),
      mediaComentarios: media(com),
      curtidasOcultas: rs.filter(x => (x.likesCount ?? 0) < 0).length,
      reelsAcimaSeguidores: seg ? rs.filter(x => x.videoPlayCount > seg).length : null, // vídeos com mais views que seguidores
      medianaComentariosPorCurtida: mediana(rs.filter(x => x.likesCount > 0).map(x => (x.commentsCount ?? 0) / x.likesCount)),
      regularidade: { amostra12: regularidade(views), todosMaduros: regularidade(maduros.map(x => x.videoPlayCount)) },
      foraDaCurva: foraDaCurva(maduros),
      // Pistas: frequência, duração, horário, legenda, temas (só políticos) e tom dos comentários (perfis em português).
      pistas: encontrado ? {
        frequencia: frequencia(todos, coletadoEm),
        duracao: duracao(maduros, seg),
        horario: horario(todos, maduros, seg),
        legenda: legenda(todos),
        temas: grupo === 'politicos' ? temas(maduros, seg, u) : null,
        tom: grupo === 'famosos_globais' ? null : (brutosReels ? tom(brutosReels.filter(x => dono(x) === u)) : (tomAnterior[u] ?? null)),
      } : null,
      comparavel,
      faixas,
      ...(observacao && { observacao }),
    };
  });
}

// Um ponto por reel: idade em dias × views ÷ seguidores (retrato de um único momento).
function pontos(perfis, reels) {
  const seg = Object.fromEntries(perfis.filter(p => p.followersCount).map(p => [p.username.toLowerCase(), p.followersCount]));
  const nossos = new Set(TODOS.map(p => p.username));
  return reels
    .filter(x => nossos.has(dono(x)) && seg[dono(x)] && x.timestamp && x.videoPlayCount > 0)
    .map(x => ({ perfil: dono(x), idadeDias: +idadeDias(x).toFixed(3), viewsPorSeguidor: +(x.videoPlayCount / seg[dono(x)]).toFixed(5) }));
}

function imprimir(resumo, custo) {
  const n = v => v == null ? '—' : Math.round(v).toLocaleString('pt-BR');
  console.table(resumo.map(r => ({
    perfil: r.perfil,
    grupo: r.grupo,
    seguidores: n(r.seguidores),
    reels: r.reels,
    'mediana views': n(r.medianaViews),
    'views/seg': r.medianaViewsPorSeguidor?.toFixed(3) ?? '—',
    engajamento: r.engajamentoMedio != null ? (r.engajamentoMedio * 100).toFixed(1) + '%' : '—',
    obs: r.observacao ?? '',
  })));
  if (custo) console.log(`Custo Apify acumulado: US$ ${custo.total.toFixed(2)}${custo.ultimaColeta ? ` (última coleta: US$ ${custo.ultimaColeta.total.toFixed(2)})` : ''} (perfis ${custo.perfis.toFixed(3)} + reels ${custo.reels.toFixed(3)})`);
}

let perfis, reels, custo;
if (OFFLINE) {
  perfis = lerJson('perfis.json');
  reels = lerJson('reels.json');
  gravarDados(perfis, reels);
  custo = resumoAnterior?.custoUsd;
  console.log(`Modo offline: usando ${perfis.length} perfis e ${reels.length} reels já salvos em dados/.`);
} else {
  ({ perfis, reels, custo } = await coletar());
  custo.total = custo.perfis + custo.reels;
}

const resumo = {
  geradoEm: new Date(AGORA).toISOString(),
  filtro: `até ${REELS_POR_PERFIL} reels mais recentes com >= ${DIAS_MINIMOS} dias, de autoria do próprio perfil (resultsLimit ${LIMITE_INICIAL}; ${LIMITE_EXTRA} para quem posta muito)`,
  ...(custo && { custoUsd: custo }),
  grupos: GRUPOS,
  faixasIdade: FAIXAS.map(f => f.rotulo),
  regrasTemas: TEMAS,
  perfis: resumir(perfis, reels),
  pontos: pontos(perfis, reels),
};
gravarJson('resumo.json', resumo);
fs.mkdirSync(LANDING, { recursive: true });
fs.writeFileSync(path.join(LANDING, 'dados.js'),
  '// Gerado por atualizar.mjs a partir de dados/resumo.json — dados fixos, sem chamadas externas.\nwindow.RESUMO = ' + JSON.stringify(resumo, null, 2) + ';\n');

imprimir(resumo.perfis, custo);
console.log(`Gravados: dados/perfis.json, dados/reels.json (versões limpas), ${OFFLINE ? '' : 'dados/brutos/ (completo, fora do git), '}dados/resumo.json, landing/dados.js`);
