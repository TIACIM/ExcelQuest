'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun, Monitor } from 'lucide-react';

type Theme = 'light' | 'dark' | 'system';
function applyTheme(theme: Theme) {
  const dark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.classList.toggle('dark', dark);
  document.documentElement.dataset.theme = theme;
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('system');
  useEffect(() => {
    const stored = localStorage.getItem('excelquest-theme');
    const next: Theme = stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'system';
    setTheme(next); applyTheme(next);
  }, []);
  function change(next: Theme) { setTheme(next); localStorage.setItem('excelquest-theme', next); applyTheme(next); }
  const Icon = theme === 'dark' ? Moon : theme === 'light' ? Sun : Monitor;
  return <label className="theme-toggle"><Icon size={16}/><span className="sr-only">Tema</span><select value={theme} onChange={(event) => change(event.target.value as Theme)} aria-label="Tema"><option value="system">Sistema</option><option value="light">Claro</option><option value="dark">Escuro</option></select></label>;
}
