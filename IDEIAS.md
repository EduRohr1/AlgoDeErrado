# Ideias de análises

Lista combinada com o Eduardo em 20/10/2026. As marcadas com ✅ já estão na landing.

## Já feitas

- ✅ **Regularidade das views.** Coeficiente de variação e razão p90/p10 das views (12 reels e todos os reels com ≥3 dias).
- ✅ **Reels fora da curva.** Curtidas ÷ views e comentários ÷ views de cada reel comparados com a mediana do próprio perfil; reels abaixo de 50% da mediana são marcados, com link.
- ✅ **Comentários ÷ curtidas por perfil.**

## Com os dados já salvos (sem custo)

1. **Frequência × alcance.** Reels por dia de cada perfil comparados com a mediana de views ÷ seguidores. Pergunta: "postar menos e concentrar" aparece nos dados?
2. **Duração dos vídeos.** Duração (`videoDuration`) cruzada com views ÷ seguidores, por perfil e por reel.
3. **Horário e dia da semana.** Em que período do dia cada perfil posta (horário de Brasília) e quais períodos rendem mais views ÷ seguidores. A amostra de dias da semana é curta para quem posta muito.
4. **Estilo de legenda.** Tamanho da legenda, palavras mais usadas, hashtags e menções (`caption`, `hashtags`, `mentions`).
5. **Temas.** Classificar cada reel por assunto a partir da legenda (economia, religião, segurança, ataque a adversário, eleição etc.) e comparar o alcance por tema. É uma classificação aproximada.
6. **Tom dos comentários de amostra** (`latestComments`): apoio, crítica ou pergunta. A razão comentários ÷ curtidas já está na landing.
7. **Collabs.** Alcance de reels solo comparado ao de reels em coautoria (`coauthorProducers`). O Lula tem 22 collabs em 64 reels; o Nikolas, nenhum.
8. **Consistência (complemento).** % de reels acima de 1× os seguidores e razão média ÷ mediana. A regularidade básica já está feita.
9. **Música e parcerias pagas.** Áudio original ou música em alta (`musicInfo`) e marcação de parceria paga (`paidPartnership`).

## Precisam de coleta nova no Apify (custo; só com ok do Eduardo)

10. **Famosos como referência:** neymarjr, anitta, virginia (famosos_br), cristiano, leomessi (famosos_globais). Estimativa: US$ 0,40 a 0,60. O script já aceita a lista `PERFIS_FAMOSOS`.
11. **Histórico mais longo:** os últimos 3 a 6 meses de cada perfil, para ver a evolução do alcance (antes e durante o período eleitoral).
12. **Comentários em volume:** centenas de comentários dos reels principais para análise de tom e de quem comenta (inclusive padrões típicos de contas automatizadas).

13. **Monitoramento das primeiras horas (30min, 1h, 3h, 6h, 12h, 24h):** não existe histórico público, então só dá para medir monitorando os reels enquanto são publicados, por exemplo com o ator "Instagram Reel Performance Tracker" do Apify (de US$ 0,002 a 0,0035 por leitura). Um piloto de 3 dias com Nikolas + 5 famosos sai por cerca de US$ 3 a 6. Por enquanto o Eduardo preferiu não seguir.
14. **Políticos estrangeiros com frequência de reels parecida:** realdonaldtrump, narendramodi, javiermilei, nayibbukele, giorgiameloni, emmanuelmacron, aoc, barackobama. Conferir antes a frequência de postagem de cada um. Custo de US$ 0,08 a 0,25 por perfil; só com ok do Eduardo.
