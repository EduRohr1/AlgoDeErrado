// Uso: node converter.js export-apify.json 15000000
// Gera dados.js, que o index.html carrega automaticamente ao abrir.
const fs = require("fs");
const path = require("path");

const [arquivo, seguidores] = process.argv.slice(2);
if (!arquivo) {
  console.error("Uso: node converter.js <export.json> [seguidores]");
  process.exit(1);
}

const json = JSON.parse(fs.readFileSync(arquivo, "utf8"));
const reels = Array.isArray(json) ? json : json.reels || [];
const dados = {
  perfil: "@nikolasferreiradm",
  seguidores: seguidores ? Number(seguidores) : null,
  coletadoEm: new Date().toISOString(),
  reels
};

const destino = path.join(__dirname, "dados.js");
fs.writeFileSync(destino, "window.DADOS_REAIS = " + JSON.stringify(dados, null, 2) + ";\n");
console.log(`${reels.length} reels salvos em ${destino}`);
