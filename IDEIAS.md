# Ideias de análises

Lista combinada com o Eduardo em 20/10/2026. As marcadas com ✅ já estão na landing.

## Já feitas

- ✅ **Regularidade das views.** Coeficiente de variação e razão p90/p10 das views (12 reels e todos os reels com ≥3 dias).
- ✅ **Reels fora da curva.** Curtidas ÷ views e comentários ÷ views de cada reel comparados com a mediana do próprio perfil; reels abaixo de 50% da mediana são marcados, com link.
- ✅ **Comentários ÷ curtidas por perfil.**
- ✅ **Famosos como referência:** Cristiano, Messi, Neymar, Anitta e Virginia (coleta de 20/10/2026, US$ 0,38), no carrossel e em seções próprias.
- ✅ **Vídeos com mais views que seguidores** ("11 de 12"), calculado no resumo.
- ✅ **Pistas nos dados** (seção "Por que tanto alcance?"): frequência de postagem, duração dos vídeos, horário, estilo de legenda, temas por palavras-chave e tom dos comentários de amostra (só agregados). Código em `analises.mjs`.

## Com os dados já salvos (sem custo)

7. **Collabs.** Alcance de reels solo comparado ao de reels em coautoria (campo `coautores`). O Lula tem 22 collabs em 64 reels; o Nikolas, nenhum.
8. **Consistência (complemento).** Razão média ÷ mediana. A regularidade e o % de vídeos acima de 1× os seguidores já estão feitos.
9. **Música e parcerias pagas.** Áudio original ou música em alta (`audioOriginal`) e marcação de parceria paga (`paidPartnership`).

## Precisam de coleta nova no Apify (custo; só com ok do Eduardo)

11. **Histórico mais longo:** os últimos 3 a 6 meses de cada perfil, para ver a evolução do alcance (antes e durante o período eleitoral).
12. **Comentários em volume:** centenas de comentários dos reels principais para análise de tom e de quem comenta (inclusive padrões típicos de contas automatizadas).

13. **Monitoramento das primeiras horas (30min, 1h, 3h, 6h, 12h, 24h):** não existe histórico público, então só dá para medir monitorando os reels enquanto são publicados, por exemplo com o ator "Instagram Reel Performance Tracker" do Apify (de US$ 0,002 a 0,0035 por leitura). Um piloto de 3 dias com Nikolas + 5 famosos sai por cerca de US$ 3 a 6. Por enquanto o Eduardo preferiu não seguir.
14. **Políticos estrangeiros com frequência de reels parecida:** realdonaldtrump, narendramodi, javiermilei, nayibbukele, giorgiameloni, emmanuelmacron, aoc, barackobama. Conferir antes a frequência de postagem de cada um. Custo de US$ 0,08 a 0,25 por perfil; só com ok do Eduardo.
15. **Conferir o vídeo de ~101 milhões de views** citado pelo Eduardo: coleta dos últimos reels do Nikolas (cerca de US$ 0,02) para confirmar o número e usar como destaque à parte, fora da média.
16. **Ampliar a comparação:** os 20 brasileiros mais seguidos e os políticos estrangeiros do item 14 (US$ 3 a 5), para poder afirmar algo como "um dos maiores alcances por seguidor do Instagram brasileiro".

## Sem coleta no Apify, mas fora dos dados salvos

17. **Biblioteca de Anúncios da Meta (grátis):** verificar se o Nikolas, ou páginas ligadas a ele, impulsionam vídeos e quanto gastam. É a pergunta "ele paga?".
