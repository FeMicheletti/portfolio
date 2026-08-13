# Felipe Micheletti — Portfolio

Portfólio bilíngue em Next.js com CMS administrativo, projetos, carreira, stacks, mídia no OneDrive, currículo, analytics próprio e SEO.

## Stack

Next.js 16, React 19, TypeScript, Tailwind CSS 4, Prisma 7, MySQL/MariaDB, Shadcn/Radix, Recharts e Vitest.

## Desenvolvimento

```bash
cp .env.example .env
npm ci
npm run db:generate
npm run db:deploy
npm run db:seed
npm run dev
```

Variáveis: `DATABASE_URL`; `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`; `ONEDRIVE_API_URL`, `ONEDRIVE_API_TOKEN`; `NEXT_PUBLIC_SITE_URL`; `LOGIN_RATE_LIMIT_SECRET`; `CRON_SECRET`; e `ANALYTICS_RETENTION_DAYS` (padrão 180, mínimo 30).

## Qualidade e CI

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

O workflow `.github/workflows/ci.yml` executa tudo em PRs e pushes na `main`. Configure a proteção da branch exigindo o job `validate` antes do merge.

## Deploy no Coolify

1. Configure as variáveis de produção.
2. Execute `npm run db:deploy` antes de publicar migrations.
3. Use `npm run build` e `npm start`.
4. Configure o health check em `GET /api/health`.
5. Agende diariamente:

```bash
curl -X POST -H "Authorization: Bearer $CRON_SECRET" https://felipemicheletti.com/api/cron/cleanup
```

O job apaga analytics além da retenção, sessões vencidas e rate limits antigos. Faça backup do MySQL antes de migrations.

## OneDrive

O admin envia imagens e PDFs à API configurada. O banco guarda metadados; `/api/media/[id]` transmite os arquivos com cache e nome seguro. Teste upload, visualização e download do currículo após o deploy.

## Privacidade e segurança

Analytics não armazena IP, usa identificadores aleatórios e oferece opt-out em `/privacidade`. O admin utiliza cookie HTTP-only, rate limit persistente, headers de segurança e limpeza de sessões.
