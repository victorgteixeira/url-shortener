# URL Shortener (Nest.js + Prisma)

Encurtador de URL minimalista, com **Nest.js**, **Prisma** e **SQLite** por padrão. Inclui **validação**, **rate limit**, **QR Code**, **estatísticas básicas** e estrutura pronta para evoluir (JWT, Postgres, CI/CD, etc.).

&#x20;

---

## ✨ Features

- Criar link curto com alias customizado (ou gerado por **nanoid**)
- Redirecionamento `/:code`
- Estatísticas básicas (`clicks`, `lastAccess`)
- Data de expiração opcional (`expiresAt`)
- **Rate limit** por IP (Throttler)
- **QR Code** para cada link (`/api/qr/:code`)
- Código pronto para trocar SQLite → Postgres

---

## 🧱 Stack

- **Nest.js** (REST)
- **Prisma ORM** + **SQLite** (dev) / Postgres (prod)
- **class-validator** / **class-transformer**
- **@nestjs/throttler** (rate limit)
- **nanoid** (código curto)
- **qrcode** (QR PNG)

---

## 🚀 Como rodar local

### 1) Pré‑requisitos

- Node 18+ (recomendado 20)
- npm

### 2) Clone e instale

```bash
git clone https://github.com/victorgteixeira/url-shortener
cd url-shortener
npm ci
```

### 3) Configure o `.env`

```bash
cp .env.example .env
```

Abra `.env` e ajuste se necessário:

```env
BASE_URL=http://localhost:3000
DATABASE_URL="file:./dev.db"
```

### 4) Prisma (gerar cliente e migrar)

```bash
npx prisma generate
npx prisma migrate dev -n init
```

### 5) Subir o servidor

```bash
npm run start:dev
```

> App em: `http://localhost:3000`.

---

## 📚 API

Base URL: `http://localhost:3000`

### POST `/api/shorten`

Cria um link curto.

**Body (JSON)**

```json
{
  "original": "https://example.com/artigo?utm_source=github",
  "alias": "meulink",
  "expiresAt": "2025-12-31T23:59:59.000Z"
}
```

`alias` e `expiresAt` são opcionais.

**Response 201**

```json
{
  "code": "meulink",
  "shortUrl": "http://localhost:3000/meulink"
}
```

**Erros**

- `409` → alias já em uso
- `400` → payload inválido

---

### GET `/:code`

Redireciona para a URL original.

- `404` se não existir ou expirado.

---

### GET `/api/stats/:code`

Retorna o registro com métricas.

**Response 200**

```json
{
  "id": "clx123...",
  "code": "meulink",
  "original": "https://example.com/artigo?utm_source=github",
  "createdAt": "2025-08-16T13:00:00.000Z",
  "expiresAt": null,
  "clicks": 3,
  "lastAccess": "2025-08-16T13:22:10.000Z",
  "owner": null
}
```

---

### GET `/api/urls`

Lista todos os links, mais recentes primeiro.

---

### GET `/api/qr/:code`

Retorna um **PNG** com QR Code do link curto.

**Exemplo (salvar local)**

```bash
curl http://localhost:3000/api/qr/meulink --output qr.png
```

---

## 🧩 Estrutura

```
src/
  app.module.ts
  main.ts
  prisma/
    prisma.module.ts
    prisma.service.ts
  short-url/
    dto/create-short-url.dto.ts
    short-url.controller.ts
    short-url.module.ts
    short-url.service.ts
prisma/
  schema.prisma
```

---

## ⚙️ Configuração

### `.env.example`

```env
# URL base usada ao montar o shortUrl nas respostas
BASE_URL=http://localhost:3000

# SQLite (dev)
DATABASE_URL="file:./dev.db"

# Postgres (exemplo)
# DATABASE_URL="postgresql://user:pass@localhost:5432/url_shortener?schema=public"
```

### `prisma/schema.prisma` (SQLite)

```prisma
datasource db { provider = "sqlite"; url = env("DATABASE_URL") }

generator client { provider = "prisma-client-js" }

model ShortUrl {
  id         String   @id @default(cuid())
  code       String   @unique
  original   String
  createdAt  DateTime @default(now())
  expiresAt  DateTime?
  clicks     Int      @default(0)
  lastAccess DateTime?
  owner      String?
}
```

> Para Postgres: altere `provider` para `postgresql` e ajuste `DATABASE_URL`. Depois rode novas migrações.

---

## 🧪 Testes rápidos (curl)

```bash
# criar link
curl -X POST http://localhost:3000/api/shorten \
  -H "Content-Type: application/json" \
  -d '{"original":"https://example.com","alias":"meulink"}'

# abrir no navegador
# http://localhost:3000/meulink

# stats
curl http://localhost:3000/api/stats/meulink

# lista
curl http://localhost:3000/api/urls
```

---

## 🧯 Troubleshooting

- \*\*P1012 / URL deve começar com \*\*`` → Confira `DATABASE_URL="file:./dev.db"` e remova variáveis `DATABASE_URL` da sessão do shell.
- **Erro no Throttle** → Use `@Throttle({ default: { limit: X, ttl: MS } })` e TTL em **ms**. No módulo: `ThrottlerModule.forRoot({ throttlers: [{ limit: 60, ttl: 60_000 }] })`.
- \*\*TS1272 com \*\*`` → use `import type { Response } from 'express'`.

---

## 🐳 Docker (opcional)

`Dockerfile` simples (SQLite para demo):

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
RUN npx prisma generate && npm run build
EXPOSE 3000
CMD ["node","dist/main.js"]
```

> Em produção prefira Postgres em vez de SQLite dentro do container.

---

## 🔐 Roadmap (ideias de evolução)

- Autenticação JWT ("minhas URLs")
- Event table para `userAgent`/`ip`
- UI web (React/Tailwind) consumindo a API
- CI (GitHub Actions) rodando build e lint
- Deploy (Railway, Render, Fly.io, Docker + VPS)

---

## 📄 Licença

MIT — fique à vontade para usar/alterar.


