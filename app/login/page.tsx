'use client';

import { type SyntheticEvent, useState } from 'react';
import { Eye, EyeOff, LockKeyhole, LogIn, ShieldCheck, UserRound } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ThemeToggle } from '@/app/theme-toggle';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  async function submit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!username.trim() || !password) { setError('Informe seu usuário e sua senha.'); return; }
    setPending(true); setError('');
    try {
      const response = await fetch('/api/auth/login', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ username, password }) });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) { setError(typeof payload.error === 'string' ? payload.error : 'Não foi possível entrar agora.'); return; }
      router.replace('/'); router.refresh();
    } catch { setError('Não foi possível conectar ao sistema. Verifique sua conexão e tente novamente.'); }
    finally { setPending(false); }
  }
  return <main className="login-page">
    <div className="login-theme"><ThemeToggle /></div>
    <section className="login-card" aria-labelledby="login-title">
      <div className="login-brand"><span className="brand-mark">X</span><span>Excel<span>Quest</span></span></div>
      <div className="login-heading"><span><ShieldCheck size={21}/></span><div><p>ACESSO SEGURO</p><h1 id="login-title">Boas-vindas</h1></div></div>
      <p className="login-copy">Entre para continuar sua jornada de aprendizagem em Excel.</p>
      <form onSubmit={submit} noValidate>
        <label htmlFor="username">Usuário</label>
        <div className="login-field"><UserRound size={18}/><input id="username" autoComplete="username" value={username} onChange={(event) => setUsername(event.target.value)} disabled={pending} maxLength={64} /></div>
        <label htmlFor="password">Senha</label>
        <div className="login-field"><LockKeyhole size={18}/><input id="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} disabled={pending} maxLength={256}/><button type="button" aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'} onClick={() => setShowPassword((value) => !value)}>{showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}</button></div>
        {error && <p className="login-error" role="alert">{error}</p>}
        <button className="primary login-submit" disabled={pending} type="submit">{pending ? <span className="login-spinner"/> : <LogIn size={18}/>} {pending ? 'Entrando...' : 'Entrar no sistema'}</button>
      </form>
      <p className="login-security"><LockKeyhole size={14}/> Sua sessão é protegida e encerrada com segurança ao sair.</p>
    </section>
  </main>;
}
