# ExcelQuest

Plataforma gamificada de aprendizagem de Excel, construída com Next.js, rotas de API no servidor e PostgreSQL. O conteúdo didático e a interface existente foram preservados; progresso, contas e sessões são persistidos em banco de dados gerenciado.

## Arquitetura de acesso

- Senhas: hash `bcrypt` com custo 12; a senha nunca sai do servidor nem é registrada.
- Sessões: token aleatório opaco, armazenado somente em cookie `HttpOnly`, `SameSite=Lax`, com `Secure` em produção. O banco guarda apenas SHA-256 do token, expira em oito horas e permite revogação no logout.
- Autorização: toda API protegida consulta a sessão no servidor. A administração de usuários exige o perfil `superadmin` tanto na interface quanto nas rotas da API.
- Proteções: limitação de cinco tentativas por usuário/IP em 15 minutos, verificação de origem nas mutações autenticadas, consultas parametrizadas, cabeçalhos de segurança e log de auditoria sem segredos.

## Desenvolvimento local

1. Instale Node.js 22.13 ou superior e execute `npm ci`.
2. Copie `.env.example` para `.env.local` e configure `DATABASE_URL` com uma URL Postgres de desenvolvimento.
3. Execute `npm run db:migrate`.
4. Em um terminal seguro, defina `INITIAL_SUPERADMIN_PASSWORD` e execute `npm run db:provision-superadmin`. O usuário inicial é `TI`; esse comando só insere a conta caso ela ainda não exista e jamais a redefine.
5. Remova a senha de provisionamento do ambiente e inicie com `npm run dev`.

No primeiro acesso, altere a senha inicial em **Perfil → Segurança da conta**. A troca encerra todas as sessões.

### Migração de progresso do D1 legado

Exporte a tabela `user_progress` do D1 para um JSON (array de registros, ou `{ "rows": [...] }`) e crie, fora do repositório, um mapa explícito `mapa-usuario.json`, por exemplo `{ "id-antigo": "novo-usuario" }`. Depois de criar os novos usuários, execute `npm run db:import-d1-progress -- ./progresso-d1.json ./mapa-usuario.json`. O importador só insere progresso quando o usuário de destino existe e usa `ON CONFLICT DO NOTHING`: progresso já registrado no PostgreSQL nunca é substituído. Guarde o export original até a conferência final.

## Implantação na Vercel

1. Crie um banco PostgreSQL gerenciado compatível (Neon é uma opção integrada à Vercel) e obtenha `DATABASE_URL`.
2. No diretório seguro que contém as variáveis, execute uma vez `npm run db:migrate` e `npm run db:provision-superadmin` contra o banco de produção. Não use a senha inicial em arquivos versionados.
3. Envie o repositório para GitHub, GitLab ou Bitbucket. No painel Vercel, importe-o: o framework será detectado como Next.js. Build: `npm run build`; saída: padrão do Next.js. Não é necessário `vercel.json`.
4. Em **Settings → Environment Variables**, cadastre `DATABASE_URL` em Production, Preview e Development conforme os bancos de cada ambiente. Cadastre a senha de provisionamento apenas para o procedimento pontual, nunca como variável permanente de runtime.
5. Faça o deploy e valide login, persistência de progresso, logout e gestão de usuários pela URL de produção antes de liberar o acesso.

Para um domínio próprio, adicione-o em **Settings → Domains** no projeto Vercel e aplique os registros DNS indicados pelo painel. O HTTPS é emitido e renovado pela Vercel depois da validação do DNS.

## Atualizações, rollback, backup e recuperação

- Mantenha migrações SQL novas e incrementais em `db/migrations`. Nunca altere uma migração já aplicada.
- Faça backup/PITR pelo provedor Postgres antes de migrações relevantes. Para restaurar, siga o procedimento do provedor em outro banco e altere `DATABASE_URL` somente após validar a restauração.
- Para reverter uma versão da aplicação, promova um deployment anterior no painel Vercel. Migrações são compatíveis apenas para frente; prepare uma migração corretiva caso um rollback de código dependa de alteração de esquema.
- A desativação de usuários preserva auditoria e dados; ela também revoga sessões ativas. Há suporte pronto para os perfis `admin`, `manager` e `collaborator`; hoje as ações administrativas ficam exclusivamente com `superadmin`.

## Variáveis de ambiente

| Variável | Uso |
| --- | --- |
| `DATABASE_URL` | URL privada de conexão PostgreSQL; obrigatória em execução e migrações. |
| `INITIAL_SUPERADMIN_USERNAME` | Opcional, padrão `TI`; somente no provisionamento inicial. |
| `INITIAL_SUPERADMIN_PASSWORD` | Obrigatória somente no provisionamento inicial; nunca versionar ou manter no runtime. |
| `SESSION_COOKIE_NAME` | Opcional; nome do cookie de sessão. |
