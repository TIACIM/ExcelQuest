import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ExcelQuest | Aprenda Excel na prática',
  description: 'Uma trilha gamificada e prática para aprender Microsoft Excel.',
};

export const viewport: Viewport = { themeColor: '#0c8d68' };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body>
        <script dangerouslySetInnerHTML={{ __html: "try{var t=localStorage.getItem('excelquest-theme')||'system';var d=t==='dark'||(t==='system'&&matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',d);document.documentElement.dataset.theme=t}catch(e){}" }} />
        {children}
      </body>
    </html>
  );
}
