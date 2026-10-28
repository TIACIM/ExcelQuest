import { spawn } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { access, mkdir } from 'node:fs/promises';

const connectionString = process.env.DATABASE_URL;
const outputArgument = process.argv[2];

if (!connectionString) throw new Error('Defina DATABASE_URL antes de executar o backup.');
if (!outputArgument) throw new Error('Uso: npm run db:backup -- <arquivo.dump>');

const outputPath = resolve(outputArgument);
await mkdir(dirname(outputPath), { recursive: true });
try {
  await access(outputPath);
  throw new Error(`O arquivo já existe; escolha outro caminho: ${outputPath}`);
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}

process.umask(0o077);
const child = spawn('pg_dump', ['--format=custom', '--no-owner', '--no-acl', '--file', outputPath], {
  env: { ...process.env, PGDATABASE: connectionString },
  stdio: 'inherit',
});

child.on('error', (error) => {
  if (error.code === 'ENOENT') {
    console.error('pg_dump não encontrado. Instale as ferramentas cliente do PostgreSQL.');
    process.exitCode = 1;
    return;
  }
  console.error(`Não foi possível iniciar o backup: ${error.message}`);
  process.exitCode = 1;
});

child.on('exit', (code, signal) => {
  if (signal) {
    console.error(`Backup interrompido pelo sinal ${signal}.`);
    process.exitCode = 1;
  } else if (code !== 0) {
    console.error(`pg_dump terminou com código ${code}.`);
    process.exitCode = code ?? 1;
  } else {
    console.log(`Backup criado em ${outputPath}`);
  }
});
