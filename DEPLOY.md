# Deploy — Innexar Workspace App (Next.js)

## Projeto
- **Nome:** innexar-workspace-app
- **Repositório:** https://github.com/innexar-plat/innexar-workspace-app
- **Branch:** main
- **Server Coolify:** projetos-br (VM 102 · 10.10.10.102)
- **UUID da app:** _(preencher após criar no Coolify)_

## Domínio
- App: `https://app.innexar.com.br`
- API consumida: `https://api.innexar.com.br`

## Runtime
- Build pack: `dockerfile`
- Dockerfile: `Dockerfile` (target: `runner`)
- Porta interna: `3000`
- Tipo de build: **standalone** (`output: "standalone"` em `next.config.ts`)
- Start command:

```bash
node server.js
```

> Dev mode: usar `docker compose -f docker-compose.yml -f docker-compose.dev.yml up`
> Nunca usar `docker-compose.override.yml` (removido — causava crash em produção)

## Build Args (embutidos no build — obrigatórios)

```env
NEXT_PUBLIC_USE_WORKSPACE_API=true
NEXT_PUBLIC_WORKSPACE_API_URL=https://api.innexar.com.br
```

## Variáveis de runtime

```env
NODE_ENV=production
PORT=3000
NEXT_TELEMETRY_DISABLED=1
NEXT_PUBLIC_USE_WORKSPACE_API=true
NEXT_PUBLIC_WORKSPACE_API_URL=https://api.innexar.com.br
```

## Operação

Não requer migrations ou seed. Dependência de runtime: `api.innexar.com.br` disponível.

## Smoke Test

```bash
# Dashboard
curl -L https://app.innexar.com.br -o /dev/null -w "%{http_code}"

# Login (deve redirecionar para /login)
curl -I https://app.innexar.com.br/login

# Assets estáticos
curl -s -o /dev/null -w "%{http_code}" https://app.innexar.com.br/_next/static/chunks/main.js
```

## Rollback

```bash
IMAGE_TAG=sha-<commit-anterior> docker compose up -d innexar-workspace-app
```

## Riscos comuns

- `docker-compose.override.yml` auto-aplicado em produção → container sobe em dev mode (target: dev), esconde `server.js` → crash
  **Solução removida:** usar apenas `docker-compose.dev.yml` explicitamente para dev
- `next start` em build standalone (CMD correto é `node server.js`)
- `NEXT_PUBLIC_WORKSPACE_API_URL` errada no build → todas as chamadas falham no client
