## WrateBot

### Dating bot written in TypeScript

#### How to run

- Fill `.env` file in project root with following environment variables:

```
DATABASE_URL=<POSTRESQL_DATABASE_URL>
BOT_TOKEN=<TELEGRAM_BOT_API_TOKEN>
DOMAIN=<DOMAIN_FOR_WEBHOOK>
PORT=<PORT_FOR_WEBHOOK>

```

- Build project `pnpm build`
- Run bot `pnpm start`
