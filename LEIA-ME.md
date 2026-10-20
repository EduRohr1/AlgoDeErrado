# Atualizar os dados dos reels

O `atualizar.mjs` coleta perfis e reels do Instagram pelo Apify e recalcula `dados/resumo.json`. Depois regenera `landing/dados.js`, de onde a landing page lê os números. Ele só precisa do Node.js e não tem dependências.

## 1. Gerar o token do Apify

1. Entre em https://console.apify.com e vá em **Settings → API & Integrations**.
2. Copie o **Personal API token**. Se precisar de um token novo, crie-o e apague o antigo.

## 2. Salvar o token no Windows (uma vez só)

No PowerShell, troque `SEU_TOKEN` pelo seu token:

```powershell
[Environment]::SetEnvironmentVariable('APIFY_TOKEN', 'SEU_TOKEN', 'User')
```

Feche e abra de novo o terminal (ou o Claude) para a variável valer. Não coloque o token em nenhum arquivo.

## 3. Rodar

Na pasta `AlgoDeErrado`:

```powershell
node atualizar.mjs
```

Leva alguns minutos e custa cerca de US$ 1 por rodada no Apify. No final aparecem a tabela-resumo e o custo.

Para recalcular o resumo e a landing sem fazer coleta nova (usando o que já está em `dados/`):

```powershell
node atualizar.mjs --offline
```

## Editar os perfis

Os perfis ficam na lista `PERFIS`, no topo do `atualizar.mjs`. Os parâmetros ficam logo abaixo dela: quantos reels entram na análise, dias mínimos, limites de coleta.
