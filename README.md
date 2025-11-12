# Como posso executar o projeto para desenvolvimento?
Para executar o projeto localmente, deve-se seguir os passos para executar um projeto [NextJS](https://nextjs.org/docs/app/getting-started/installation).
Além disso, deve-se configurar o ambiente local com um arquivo .env.local, contendo as seguintes informacoes:

DATABASE_URL="postgresql://[DB-USER].[PROJECT-REF]:[PRISMA-PASSWORD]@aws-1-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://[DB-USER].[PROJECT-REF]:[PRISMA-PASSWORD]@aws-1-us-east-2.pooler.supabase.com:5432/postgres"
NODE_ENV="development"

Contact the admin to get the values for DB-USER, PROJECT-REF and PRISMA-PASSWORD.
