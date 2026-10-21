# Alcance dos Reels

Análise independente de dados públicos do Instagram que compara o alcance dos reels de Nikolas Ferreira com outros políticos brasileiros e com celebridades (Cristiano Ronaldo, Messi, Neymar, Anitta, Virginia).

> **Análise independente, sem vínculo com o governo ou órgãos públicos.** Os números descrevem anomalias estatísticas e não indicam, por si só, a causa do alcance. A seção "Como interpretar" da página discute as explicações possíveis.

## Ver online

**https://edurohr1.github.io/AlgoDeErrado/** (redireciona para a página em `landing/`), publicada pelo GitHub Pages a partir da branch `main`.

## Abrir a página localmente

A landing fica em `landing/` e é estática (HTML, CSS e JS). O único recurso externo é o Chart.js (via cdnjs), e as fontes vêm do Google Fonts.

- Abra `landing/index.html` no navegador, ou
- sirva a pasta com qualquer servidor estático (por exemplo, `npx serve landing`).

## Atualizar os dados

Os dados são coletados pelo Apify com o script `atualizar.mjs` (Node.js, sem dependências). O passo a passo, com como gerar e salvar o token `APIFY_TOKEN`, está em [LEIA-ME.md](LEIA-ME.md).

```bash
node atualizar.mjs --offline   # recalcula resumo e landing com os dados salvos, sem custo
node atualizar.mjs             # coleta nova no Apify (custa créditos)
```

O token nunca deve ser gravado em arquivo.

## Fonte e método

- **Coleta:** atores `apify~instagram-profile-scraper` e `apify~instagram-reel-scraper`, em 20/10/2026.
- **Amostra:** até 12 reels mais recentes de cada perfil com pelo menos 3 dias de publicados. Só entram reels do próprio perfil; collabs publicados por outras contas ficam de fora.
- **Métricas:**
  - mediana de views ÷ seguidores;
  - engajamento: (curtidas + comentários) ÷ views;
  - curtidas e comentários ÷ seguidores;
  - regularidade (coeficiente de variação);
  - reels fora da curva.
- O resumo calculado está em `dados/resumo.json`. A metodologia completa está no fim da página.
- `IDEIAS.md` lista as análises futuras.

## Créditos das fotos

Todas as fotos vêm do Wikimedia Commons, com a licença conferida na página de cada arquivo:

| Pessoa | Autor | Licença | Arquivo |
|---|---|---|---|
| Nikolas Ferreira | Pablo Valadares/Câmara dos Deputados | CC BY 3.0 (imagem modificada: duotone) | [Commons](https://commons.wikimedia.org/wiki/File:Nikolas_Ferreira_in_2023_(cropped).jpg) |
| Cristiano Ronaldo | Bryan Berlin | CC BY-SA 4.0 | [Commons](https://commons.wikimedia.org/wiki/File:Cristiano_Ronaldo_Croatia_v_Portugal_2_July_2026-075_(cropped).jpg) |
| Lionel Messi | Bryan Berlin | CC BY-SA 4.0 | [Commons](https://commons.wikimedia.org/wiki/File:Lionel_Messi_Argentina_v_Egypt_7_July_2026-112(cropped).jpg) |
| Neymar Jr | Bryan Berlin | CC BY-SA 4.0 | [Commons](https://commons.wikimedia.org/wiki/File:Neymar_Junior_Brazil_V_Morocco_13_June_2026-40.jpg) |
| Anitta | Attractive Mindset | CC BY 3.0 | [Commons](https://commons.wikimedia.org/wiki/File:Anitta_for_Attractive_Mindset_podcast_02.jpg) |
| Virginia Fonseca | Andressa Anholete/Agência Senado | CC BY 2.0 | [Commons](https://commons.wikimedia.org/wiki/File:Virginia_Fonseca_na_CPI_das_BETS_02_(cropped).jpg) |

## Estrutura

- `landing/`: página principal.
- `dados/`: dados coletados e o resumo calculado.
- `atualizar.mjs`: coleta e recálculo.
- `analises.mjs`: análises extras ("pistas"): frequência, duração, horário, legenda, temas e tom dos comentários (este último usa comentários só localmente e publica apenas porcentagens).
- `site/`: primeira versão (app de coleta no navegador).
