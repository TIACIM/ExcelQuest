# ExcelQuest

Plataforma gamificada para aprender Excel em português. O curso combina aulas curtas, exercícios, simulador de fórmulas, avaliações por módulo e acompanhamento de progresso.

## Recursos

- Trilha de aulas organizada por módulos e níveis.
- Exercícios com explicações e simulador de fórmulas.
- Progresso, XP, sequência de estudos e conquistas associados à conta.
- Autenticação e gestão de usuários.
- Interface responsiva com opção de tema.

## Tecnologias

- Next.js, React e TypeScript
- PostgreSQL, acessado pelo Neon Serverless Driver
- Drizzle ORM e migrações SQL
- Tailwind CSS

## Requisitos

- Node.js 22.13 ou superior
- npm
- Uma instância PostgreSQL acessível pela aplicação, por exemplo no Neon

## Executar localmente

1. Clone o repositório e instale as dependências:

   ```bash
   npm ci
   ```

2. Crie `.env.local` na raiz do projeto. O arquivo é local e não deve ser enviado ao Git. Adicione a URL do seu banco:

   ```env
   DATABASE_URL=postgresql://USUARIO:SENHA@HOST/BANCO?sslmode=require
   SESSION_COOKIE_NAME=excelquest_session
   ```

   Substitua os valores de exemplo pelos dados fornecidos pelo seu provedor PostgreSQL. Não compartilhe nem versione credenciais reais.

3. Crie as tabelas do sistema:

   ```bash
   npm run db:migrate
   ```

4. Para criar a primeira conta administrativa, defina temporariamente uma senha com pelo menos 12 caracteres e execute o provisionamento:

   ```bash
   INITIAL_SUPERADMIN_USERNAME=TI INITIAL_SUPERADMIN_PASSWORD='SUA_SENHA_FORTE' npm run db:provision-superadmin
   ```

   O comando não altera uma conta que já exista. Remova a senha do ambiente depois do provisionamento. No primeiro acesso, troque a senha em **Perfil → Segurança da conta**.

5. Inicie a aplicação:

   ```bash
   npm run dev
   ```

   Abra [http://localhost:3000](http://localhost:3000).

Os comandos de banco carregam variáveis de `.env` e `.env.local`; valores definidos no ambiente do terminal prevalecem. O Next.js também carrega os arquivos de ambiente locais durante o desenvolvimento.

## Scripts disponíveis

| Comando | Descrição |
| --- | --- |
| `npm run dev` | Inicia o servidor de desenvolvimento. |
| `npm run build` | Gera a versão de produção. |
| `npm run start` | Inicia a versão já compilada. |
| `npm run lint` | Analisa o código com Oxlint. |
| `npm run typecheck` | Verifica os tipos TypeScript. |
| `npm run db:migrate` | Aplica as migrações do banco. |
| `npm run db:provision-superadmin` | Cria a primeira conta superadmin, se ainda não existir. |
| `npm run db:backup -- <arquivo.dump>` | Gera um backup PostgreSQL; requer `pg_dump`. |

## Banco e backups

As migrações SQL ficam em `db/migrations`. Crie novas migrações incrementais e não edite migrações que já foram aplicadas em um banco compartilhado.

Configure backups automáticos no provedor PostgreSQL. Para criar um backup manual, instale as ferramentas cliente do PostgreSQL e execute:

```bash
npm run db:backup -- ./backups/excelquest.dump
```

Guarde os backups fora da máquina de desenvolvimento, em armazenamento privado. Para restaurar um arquivo, use `pg_restore` em um banco de destino e valide os dados antes de apontar a aplicação para ele.

## Implantação

A aplicação pode ser implantada em plataformas compatíveis com Next.js, como a Vercel. Configure `DATABASE_URL` como variável de ambiente privada para cada ambiente (produção, prévia e desenvolvimento), aplique as migrações no banco correspondente e execute o build com:

```bash
npm run build
```

Não configure `INITIAL_SUPERADMIN_PASSWORD` como variável permanente da aplicação. Use-a apenas durante o provisionamento inicial.

## Segurança

- Senhas são armazenadas com hash bcrypt.
- Sessões usam cookies `HttpOnly` e tokens com hash no banco.
- Rotas protegidas verificam a sessão e a autorização no servidor.
- Tentativas de login são limitadas e eventos de autenticação são auditados.
- Arquivos de ambiente, credenciais e backups não devem ser enviados ao repositório.

## Contribuições

Abra uma issue para relatar problemas ou sugerir melhorias. Para propor uma alteração, crie uma branch, faça as mudanças e envie um pull request com uma descrição objetiva.
