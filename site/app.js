const DIA = 86400000;
const RECENTE_DIAS = 7;

const el = (id) => document.getElementById(id);
const fmtNum = (n) => n == null || isNaN(n) ? "–" : n.toLocaleString("pt-BR");
const fmtCurto = (n) => n == null || isNaN(n) ? "–" : new Intl.NumberFormat("pt-BR", { notation: "compact", maximumFractionDigits: 1 }).format(n);
const fmtPct = (n) => n == null || isNaN(n) ? "–" : (n * 100).toLocaleString("pt-BR", { maximumFractionDigits: 1 }) + "%";
const fmtRazao = (n) => n == null || isNaN(n) ? "–" : n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

let reelsBrutos = [];
let ordem = { col: "data", asc: false };
let graficos = {};

// Aceita os nomes de campo do Apify, do Instaloader ou de uma planilha em português.
function pegar(obj, nomes) {
  for (const n of nomes) {
    if (obj[n] !== undefined && obj[n] !== "") return obj[n];
  }
  return undefined;
}

function numero(v) {
  if (v === undefined || v === null || v === "") return null;
  if (typeof v === "number") return v;
  const s = String(v).trim();
  // "1.234,5" (planilha BR) ou "1234.5" (export do Apify)
  const n = Number(s.includes(",") ? s.replace(/\./g, "").replace(",", ".") : s);
  return isNaN(n) ? null : n;
}

function data(v) {
  if (v === undefined || v === null || v === "") return null;
  if (typeof v === "number") return new Date(v < 1e12 ? v * 1000 : v);
  const br = String(v).match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (br) return new Date(+br[3], +br[2] - 1, +br[1]);
  const d = new Date(v);
  return isNaN(d) ? null : d;
}

function normalizar(r) {
  return {
    data: data(pegar(r, ["timestamp", "data", "date", "postado_em", "date_utc"])),
    views: numero(pegar(r, ["videoPlayCount", "videoViewCount", "views", "visualizacoes", "video_view_count"])),
    curtidas: numero(pegar(r, ["likesCount", "curtidas", "likes"])),
    comentarios: numero(pegar(r, ["commentsCount", "comentarios", "comments"])),
    duracao: numero(pegar(r, ["videoDuration", "duracao", "duration", "video_duration"])),
    seguidores: numero(pegar(r, ["seguidores", "followers"])),
    url: pegar(r, ["url", "link", "shortCode"]) || "",
    legenda: pegar(r, ["caption", "legenda", "texto"]) || ""
  };
}

function calcular() {
  const seguidoresAtuais = numero(el("seguidores").value);
  const agora = Date.now();
  return reelsBrutos
    .map(normalizar)
    .filter((r) => r.data && r.views != null)
    .map((r) => {
      const seg = r.seguidores || seguidoresAtuais;
      const interacoes = (r.curtidas || 0) + (r.comentarios || 0);
      return {
        ...r,
        idade: Math.floor((agora - r.data.getTime()) / DIA),
        razao: seg ? r.views / seg : null,
        engajamento: r.views ? interacoes / r.views : null
      };
    });
}

function mediana(arr) {
  const v = arr.filter((x) => x != null).sort((a, b) => a - b);
  if (!v.length) return null;
  const m = Math.floor(v.length / 2);
  return v.length % 2 ? v[m] : (v[m - 1] + v[m]) / 2;
}

function media(arr) {
  const v = arr.filter((x) => x != null);
  return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null;
}

function renderKpis(reels) {
  el("k-total").textContent = fmtNum(reels.length);
  el("k-media").textContent = fmtCurto(media(reels.map((r) => r.views)));
  el("k-razao").textContent = fmtRazao(mediana(reels.map((r) => r.razao)));
  el("k-eng").textContent = fmtPct(media(reels.map((r) => r.engajamento)));
}

function renderTabela(reels) {
  const { col, asc } = ordem;
  const ordenados = [...reels].sort((a, b) => {
    const va = a[col] ?? -Infinity, vb = b[col] ?? -Infinity;
    return (va > vb ? 1 : va < vb ? -1 : 0) * (asc ? 1 : -1);
  });

  document.querySelectorAll("th[data-col]").forEach((th) => {
    th.classList.toggle("ordenado", th.dataset.col === col);
    th.classList.toggle("asc", th.dataset.col === col && asc);
  });

  const tbody = document.querySelector("#tabela tbody");
  tbody.innerHTML = "";
  for (const r of ordenados) {
    const tr = document.createElement("tr");
    const celulas = [
      r.data.toLocaleDateString("pt-BR"),
      fmtNum(r.idade),
      fmtNum(r.views),
      fmtRazao(r.razao),
      fmtNum(r.curtidas),
      fmtNum(r.comentarios),
      fmtPct(r.engajamento),
      r.duracao != null ? Math.round(r.duracao) + "s" : "–"
    ];
    for (const c of celulas) {
      const td = document.createElement("td");
      td.textContent = c;
      tr.appendChild(td);
    }
    if (r.idade < RECENTE_DIAS) {
      const tag = document.createElement("span");
      tag.className = "tag";
      tag.textContent = "recente";
      tr.children[1].appendChild(tag);
    }
    const tdLeg = document.createElement("td");
    tdLeg.className = "legenda";
    const texto = r.legenda.slice(0, 80) || "(sem legenda)";
    if (r.url.startsWith("http")) {
      const a = document.createElement("a");
      a.href = r.url; a.target = "_blank"; a.rel = "noopener";
      a.textContent = texto;
      tdLeg.appendChild(a);
    } else {
      tdLeg.textContent = texto;
    }
    tdLeg.title = r.legenda;
    tr.appendChild(tdLeg);
    tbody.appendChild(tr);
  }
}

function cores() {
  const css = getComputedStyle(document.documentElement);
  return {
    accent: css.getPropertyValue("--accent").trim(),
    muted: css.getPropertyValue("--muted").trim(),
    border: css.getPropertyValue("--border").trim()
  };
}

function renderGraficos(reels) {
  const c = cores();
  Chart.defaults.color = c.muted;
  Chart.defaults.borderColor = c.border;
  Object.values(graficos).forEach((g) => g.destroy());

  const porData = [...reels].sort((a, b) => a.data - b.data);
  graficos.tempo = new Chart(el("g-tempo"), {
    type: "bar",
    data: {
      labels: porData.map((r) => r.data.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })),
      datasets: [
        { label: "Views", data: porData.map((r) => r.views), backgroundColor: c.accent, yAxisID: "y" },
        { label: "Views ÷ seguidores", data: porData.map((r) => r.razao), type: "line", borderColor: c.muted, backgroundColor: c.muted, pointRadius: 2, yAxisID: "y2" }
      ]
    },
    options: {
      maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      scales: {
        y: { beginAtZero: true, ticks: { callback: fmtCurto } },
        y2: { beginAtZero: true, position: "right", grid: { drawOnChartArea: false } }
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: (ctx) => ctx.dataset.yAxisID === "y2" ? "Views ÷ seguidores: " + fmtRazao(ctx.raw) : "Views: " + fmtNum(ctx.raw)
          }
        }
      }
    }
  });

  const comDuracao = reels.filter((r) => r.duracao != null);
  graficos.duracao = new Chart(el("g-duracao"), {
    type: "scatter",
    data: {
      datasets: [{ label: "Reel", data: comDuracao.map((r) => ({ x: r.duracao, y: r.views })), backgroundColor: c.accent }]
    },
    options: {
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: (ctx) => `${Math.round(ctx.raw.x)}s · ${fmtNum(ctx.raw.y)} views` } }
      },
      scales: {
        x: { title: { display: true, text: "Duração (s)" } },
        y: { beginAtZero: true, title: { display: true, text: "Views" }, ticks: { callback: fmtCurto } }
      }
    }
  });
}

function render() {
  const reels = calcular();
  const aviso = [];
  if (reelsBrutos.length && !reels.length) aviso.push("Nenhum reel com data e views foi encontrado no arquivo. Confira os nomes das colunas.");
  if (!numero(el("seguidores").value)) aviso.push("Informe o número de seguidores para calcular views ÷ seguidores.");
  if (reelsBrutos === window.DADOS_EXEMPLO.reels) aviso.unshift("Você está vendo dados fictícios de exemplo.");
  el("aviso").textContent = aviso.join(" ");

  renderKpis(reels);
  renderTabela(reels);
  renderGraficos(reels);
}

// CSV simples com suporte a aspas; detecta separador ";" (Excel BR) ou ",".
function lerCsv(texto) {
  const primeira = texto.split(/\r?\n/)[0];
  const sep = (primeira.match(/;/g) || []).length > (primeira.match(/,/g) || []).length ? ";" : ",";
  const linhas = [];
  let linha = [], campo = "", aspas = false;
  for (let i = 0; i < texto.length; i++) {
    const ch = texto[i];
    if (aspas) {
      if (ch === '"' && texto[i + 1] === '"') { campo += '"'; i++; }
      else if (ch === '"') aspas = false;
      else campo += ch;
    } else if (ch === '"') aspas = true;
    else if (ch === sep) { linha.push(campo); campo = ""; }
    else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && texto[i + 1] === "\n") i++;
      linha.push(campo); linhas.push(linha); linha = []; campo = "";
    } else campo += ch;
  }
  if (campo || linha.length) { linha.push(campo); linhas.push(linha); }
  const [cab, ...resto] = linhas.filter((l) => l.some((c) => c.trim()));
  return resto.map((l) => Object.fromEntries(cab.map((h, i) => [h.trim(), l[i]])));
}

function carregarExemplo() {
  const ex = window.DADOS_EXEMPLO;
  reelsBrutos = ex.reels;
  el("perfil").value = ex.perfil;
  el("seguidores").value = ex.seguidores;
  el("sem-dados").hidden = true;
  render();
}

el("arquivo").addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const texto = await file.text();
  try {
    if (file.name.toLowerCase().endsWith(".csv")) {
      reelsBrutos = lerCsv(texto);
    } else {
      const json = JSON.parse(texto);
      reelsBrutos = Array.isArray(json) ? json : json.reels || [];
    }
    // Só reels (vídeos), caso o export traga posts de foto também.
    reelsBrutos = reelsBrutos.filter((r) => !r.type || /video|reel|clip/i.test(r.type) || r.productType === "clips");
    const dono = reelsBrutos.find((r) => r.ownerUsername)?.ownerUsername;
    if (dono) el("perfil").value = "@" + dono;
    el("sem-dados").hidden = true;
    render();
  } catch (err) {
    el("aviso").textContent = "Não consegui ler o arquivo: " + err.message;
  }
});

el("seguidores").addEventListener("input", render);
el("exemplo").addEventListener("click", carregarExemplo);
document.querySelectorAll("th[data-col]").forEach((th) => {
  th.addEventListener("click", () => {
    const col = th.dataset.col;
    ordem = { col, asc: ordem.col === col ? !ordem.asc : false };
    renderTabela(calcular());
  });
});

// ---------- Coleta automática via API do Apify ----------
const PERFIL = "nikolasferreiradm";
const APIFY = "https://api.apify.com/v2";
const ATOR_REELS = "apify~instagram-reel-scraper";
const ATOR_PERFIL = "apify~instagram-profile-scraper";
const VALIDADE_HORAS = 12;

const guardar = {
  ler(chave) {
    try { return JSON.parse(localStorage.getItem(chave)); } catch { return null; }
  },
  salvar(chave, valor) {
    try { localStorage.setItem(chave, JSON.stringify(valor)); } catch { /* sem storage */ }
  }
};

const status = (txt) => { el("status").textContent = txt; };
const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

async function apify(token, caminho, opcoes = {}) {
  const resp = await fetch(APIFY + caminho, {
    ...opcoes,
    headers: { "Authorization": "Bearer " + token, "Content-Type": "application/json" }
  });
  if (!resp.ok) {
    const corpo = await resp.json().catch(() => ({}));
    throw new Error(corpo.error?.message || "HTTP " + resp.status);
  }
  return resp.json();
}

// Inicia o ator, espera terminar e devolve os itens do dataset.
async function rodarAtor(token, ator, entrada, nome) {
  const { data: run } = await apify(token, `/acts/${ator}/runs`, { method: "POST", body: JSON.stringify(entrada) });
  let atual = run;
  const inicio = Date.now();
  while (["READY", "RUNNING"].includes(atual.status)) {
    status(`Buscando ${nome}… ${Math.round((Date.now() - inicio) / 1000)}s`);
    await esperar(5000);
    atual = (await apify(token, `/actor-runs/${run.id}`)).data;
  }
  if (atual.status !== "SUCCEEDED") throw new Error(`${nome}: execução terminou como ${atual.status}`);
  return apify(token, `/datasets/${atual.defaultDatasetId}/items?clean=true`);
}

async function atualizar() {
  const token = el("token").value.trim();
  if (!token) { status("Cole o token do Apify para buscar os dados."); return; }
  guardar.salvar("apifyToken", token);

  const botao = el("atualizar");
  botao.disabled = true;
  try {
    const limite = Math.max(1, Number(el("limite").value) || 50);
    const [reels, perfis] = await Promise.all([
      rodarAtor(token, ATOR_REELS, { username: [PERFIL], resultsLimit: limite }, "reels"),
      rodarAtor(token, ATOR_PERFIL, { usernames: [PERFIL] }, "seguidores")
    ]);
    const seguidores = perfis[0]?.followersCount ?? null;

    // Guarda um histórico de seguidores: cada coleta vira um ponto.
    const historico = guardar.ler("historicoSeguidores") || [];
    if (seguidores) historico.push({ data: new Date().toISOString(), seguidores });
    guardar.salvar("historicoSeguidores", historico);

    const dados = { perfil: "@" + PERFIL, seguidores, coletadoEm: new Date().toISOString(), reels };
    guardar.salvar("dadosApify", dados);
    aplicar(dados);
    status(`Atualizado em ${new Date().toLocaleString("pt-BR")}: ${reels.length} reels.`);
  } catch (err) {
    status("Erro ao buscar no Apify: " + err.message);
  } finally {
    botao.disabled = false;
  }
}

function aplicar(dados) {
  el("perfil").value = dados.perfil || "@" + PERFIL;
  if (dados.seguidores) el("seguidores").value = dados.seguidores;
  reelsBrutos = dados.reels || [];
  el("sem-dados").hidden = reelsBrutos.length > 0;
  render();
}

// Ao abrir: mostra a última coleta (navegador ou dados.js) e atualiza se estiver velha.
function iniciar() {
  const salvo = guardar.ler("dadosApify");
  const dados = [salvo, window.DADOS_REAIS]
    .filter((d) => d && d.reels)
    .sort((a, b) => new Date(b.coletadoEm || 0) - new Date(a.coletadoEm || 0))[0];
  aplicar(dados || { perfil: "@" + PERFIL, reels: [] });

  const token = guardar.ler("apifyToken");
  if (token) el("token").value = token;

  const idadeHoras = dados?.coletadoEm ? (Date.now() - new Date(dados.coletadoEm)) / 3600000 : Infinity;
  if (dados?.coletadoEm) status(`Dados de ${new Date(dados.coletadoEm).toLocaleString("pt-BR")}.`);
  if (token && idadeHoras > VALIDADE_HORAS) atualizar();
}

el("atualizar").addEventListener("click", atualizar);
iniciar();
