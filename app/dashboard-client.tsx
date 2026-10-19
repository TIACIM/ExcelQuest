'use client';

import { useEffect, useRef, useState } from 'react';
import { BookOpen, Check, ChevronLeft, ChevronRight, CircleHelp, Clock3, Flame, Grid2X2, Home, Lock, LogOut, Medal, Play, Settings, Sparkles, Target, Trophy, UserRound, X, Zap } from 'lucide-react';
import { lessons, moduleAssessments, modules, simulatorHelp, type Lesson } from './data';
import { ThemeToggle } from './theme-toggle';

type View = 'home' | 'map' | 'lesson' | 'assessment' | 'review' | 'achievements' | 'profile' | 'admin';
type Saved = { completed: number[]; flawless: number[]; moduleTests: number[]; xp: number; studyDates: string[]; bestStreak: number; mistakes: number[] };
type WebMCPContext = {
  registerTool: (
    tool: {
      name: string;
      title: string;
      description: string;
      inputSchema: object;
      annotations?: { readOnlyHint?: boolean; untrustedContentHint?: boolean };
      execute: (input: unknown) => unknown;
    },
    options?: { signal?: AbortSignal },
  ) => void | Promise<void>;
};
const empty: Saved = { completed: [], flawless: [], moduleTests: [], xp: 0, studyDates: [], bestStreak: 0, mistakes: [] };
const initialCells: Record<string, string> = { A1:'Produto',B1:'Janeiro',C1:'Fevereiro',D1:'Meta',A2:'Notebook',B2:'1200',C2:'1350',D2:'1300',A3:'Mouse',B3:'340',C3:'290',D3:'300',A4:'Teclado',B4:'480',C4:'520',D4:'500',A5:'Monitor',B5:'900',C5:'980',D5:'950' };
const today = () => { const d = new Date(); return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0,10); };
function streakFor(dates: string[]) { let count = 0; const set = new Set(dates); const date = new Date(`${today()}T12:00:00`); while (set.has(date.toISOString().slice(0,10))) { count++; date.setDate(date.getDate()-1); } return count; }
function nextLessonId(completed: number[], moduleTests: number[]) {
  const next = lessons.find((lesson) => !completed.includes(lesson.id));
  if (!next) return null;
  return next.module === 1 || moduleTests.includes(next.module - 1) ? next.id : null;
}

function splitArgs(source: string) {
  const result: string[] = []; let start=0, depth=0, quoted=false;
  for(let i=0;i<source.length;i++){ const c=source[i]; if(c==='"') quoted=!quoted; if(!quoted&&c==='(')depth++; if(!quoted&&c===')')depth--; if(!quoted&&depth===0&&(c===';'||c===',')){result.push(source.slice(start,i).trim());start=i+1;} }
  result.push(source.slice(start).trim()); return result.filter(Boolean);
}
function rangeValues(range: string, cells: Record<string,string>) {
  const split=range.toUpperCase().split(':'); const parse=(v:string)=>v.replace(/\$/g,'').match(/^([A-Z])(\d+)$/);
  const a=parse(split[0]), b=parse(split[1]||split[0]); if(!a||!b)return [];
  const result: string[]=[]; for(let c=a[1].charCodeAt(0);c<=b[1].charCodeAt(0);c++)for(let r=Number(a[2]);r<=Number(b[2]);r++)result.push(cells[`${String.fromCharCode(c)}${r}`]||''); return result;
}
function calculate(input:string,cells:Record<string,string>) {
  if(!input.trim().startsWith('=')) return input;
  const cell=(ref:string):string|number=>{const v=cells[ref.replace(/\$/g,'').toUpperCase()]||'';const n=Number(v.replace(',','.'));return v!==''&&Number.isFinite(n)?n:v;};
  const condition=(text:string)=>{
    const comparison=text.trim().match(/^(.+?)(>=|<=|<>|!=|=|>|<)(.+)$/);
    if(!comparison) return false;
    const parseValue=(part:string):string|number=>{
      const value=part.trim();
      if(/^".*"$/.test(value)) return value.slice(1,-1);
      if(/^[A-Z]\d+$/i.test(value)) return cell(value);
      const numeric=Number(value.replace(',', '.'));
      return Number.isFinite(numeric) ? numeric : value;
    };
    const left=parseValue(comparison[1]),right=parseValue(comparison[3]);
    const [a,b]=typeof left==='number'&&typeof right==='number'?[left,right]:[String(left),String(right)];
    switch(comparison[2]) { case '=': return a===b; case '<>': case '!=': return a!==b; case '>': return a>b; case '<': return a<b; case '>=': return a>=b; case '<=': return a<=b; default:return false; }
  };
  const run=(term:string):unknown=>{
    const t=term.trim(); if(/^".*"$/.test(t))return t.slice(1,-1); if(/^[A-Z]\d+:[A-Z]\d+$/i.test(t))return rangeValues(t,cells); if(/^[A-Z]\d+$/i.test(t))return cell(t);
    const match=t.match(/^([A-ZÇÃÉÚ.]+)\(([\s\S]*)\)$/i);
    if(match){const fn=match[1].toUpperCase(),args=splitArgs(match[2]),arg=(i:number)=>run(args[i]||''),all=args.flatMap(a=>{const x=run(a);return Array.isArray(x)?x:[x]}),nums=all.map(Number).filter(Number.isFinite);
      if(fn==='SOMA'||fn==='SUM')return nums.reduce((a,b)=>a+b,0);
      if(fn==='MÉDIA'||fn==='MEDIA'||fn==='AVERAGE')return nums.length?nums.reduce((a,b)=>a+b,0)/nums.length:0;
      if(fn==='MÁXIMO'||fn==='MAXIMO'||fn==='MAX')return Math.max(...nums);
      if(fn==='MÍNIMO'||fn==='MINIMO'||fn==='MIN')return Math.min(...nums);
      if(fn==='CONT.NÚM'||fn==='CONT.NUM'||fn==='COUNT')return nums.length;
      if(fn==='CONCAT'||fn==='CONCATENAR')return all.join('');
      if(fn==='ESQUERDA'||fn==='LEFT')return String(arg(0)).slice(0,Number(arg(1))||1);
      if(fn==='DIREITA'||fn==='RIGHT')return String(arg(0)).slice(-(Number(arg(1))||1));
      if(fn==='EXT.TEXTO'||fn==='MID')return String(arg(0)).slice((Number(arg(1))||1)-1,(Number(arg(1))||1)-1+(Number(arg(2))||0));
      if(fn==='ARRUMAR'||fn==='TRIM')return String(arg(0)).trim().replace(/\s+/g,' ');
      if(fn==='SUBSTITUIR'||fn==='SUBSTITUTE')return String(arg(0)).split(String(arg(1))).join(String(arg(2)));
      if(fn==='HOJE'||fn==='TODAY')return new Intl.DateTimeFormat('pt-BR').format(new Date());
      if(fn==='AGORA'||fn==='NOW')return new Intl.DateTimeFormat('pt-BR',{dateStyle:'short',timeStyle:'short'}).format(new Date());
      if(fn==='E'||fn==='AND')return args.every(condition); if(fn==='OU'||fn==='OR')return args.some(condition);
      if(fn==='SE'||fn==='IF')return condition(args[0])?arg(1):arg(2);
      if(fn==='CONT.SE'||fn==='COUNTIF'){const values:unknown[]=Array.isArray(arg(0))?arg(0) as unknown[]:[];return values.filter((v:unknown)=>String(v)===String(arg(1))).length;}
      if(fn==='SOMASE'||fn==='SUMIF'){const criteria:unknown[]=Array.isArray(arg(0))?arg(0) as unknown[]:[],sum:unknown[]=Array.isArray(arg(2))?arg(2) as unknown[]:criteria;return criteria.reduce((total:number,v:unknown,i:number)=>String(v)===String(arg(1))?total+(Number(sum[i])||0):total,0);}
      throw new Error(`A função ${fn} ainda não é executada neste laboratório.`);
    }
    const n=Number(t.replace(',','.')); return Number.isFinite(n)?n:t;
  };
  try { const value=run(input.trim().slice(1)); return String(value).replace('.',','); } catch(e) { return `⚠ ${e instanceof Error?e.message:'Fórmula inválida.'}`; }
}
function Pill({children,tone='plain'}:{children:React.ReactNode;tone?:'plain'|'green'|'blue'|'gold'}) { return <span className={`pill ${tone}`}>{children}</span>; }
function Heading({eyebrow,title,action}:{eyebrow:string;title:string;action?:React.ReactNode}) {return <div className="section-title"><div><p>{eyebrow}</p><h1>{title}</h1></div>{action}</div>;}

type CurrentUser = { id:string; username:string; role:'superadmin'|'admin'|'manager'|'collaborator'; mustChangePassword:boolean };
export default function DashboardClient({currentUser,initialProgress}:{currentUser:CurrentUser;initialProgress:Saved}) {
  const [view,setView]=useState<View>('home'),[activeId,setActiveId]=useState(1),[assessmentModule,setAssessmentModule]=useState(1),[data,setData]=useState<Saved>({...empty,...initialProgress}),[open,setOpen]=useState(false),[notice,setNotice]=useState(''),[renderDate]=useState(()=>Date.now());
  const progressRef=useRef(data);
  const progressInitialised=useRef(false);
  useEffect(()=>{progressRef.current=data;},[data]);
  useEffect(()=>{if(!progressInitialised.current){progressInitialised.current=true;return;}fetch('/api/progress',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({progress:data})}).then(r=>{if(!r.ok)setNotice('Seu progresso será sincronizado quando a conexão estiver disponível.');}).catch(()=>setNotice('Seu progresso será sincronizado quando a conexão estiver disponível.'));},[data]);
  useEffect(()=>{
    const context=(document as Document & { modelContext?: WebMCPContext }).modelContext;
    if(!context?.registerTool) return;
    const lifecycle=new AbortController();
    const register=(tool: Parameters<WebMCPContext['registerTool']>[0]) =>
      Promise.resolve(context.registerTool(tool,{signal:lifecycle.signal})).catch(()=>undefined);
    void register({
      name:'get_excelquest_progress',
      title:'Consultar progresso no ExcelQuest',
      description:'Mostra XP, sequência e número de aulas concluídas sem alterar o progresso.',
      inputSchema:{type:'object',properties:{},additionalProperties:false},
      annotations:{readOnlyHint:true,untrustedContentHint:false},
      execute:()=>({xp:progressRef.current.xp,completedLessons:progressRef.current.completed.length,totalLessons:lessons.length,currentStreak:streakFor(progressRef.current.studyDates)}),
    });
    void register({
      name:'start_excelquest_lesson',
      title:'Iniciar uma aula do ExcelQuest',
      description:'Abre uma aula desbloqueada da trilha de Excel.',
      inputSchema:{type:'object',properties:{lessonId:{type:'integer',minimum:1,maximum:35}},required:['lessonId'],additionalProperties:false},
      annotations:{readOnlyHint:false,untrustedContentHint:false},
      execute:(input)=>{
        const lessonId=typeof input==='object'&&input!==null?(input as {lessonId?:unknown}).lessonId:null;
        const nextUnlocked=nextLessonId(progressRef.current.completed,progressRef.current.moduleTests)??0;
        if(!Number.isInteger(lessonId)||Number(lessonId)<1||Number(lessonId)>nextUnlocked) throw new Error('A aula solicitada ainda está bloqueada.');
        setActiveId(Number(lessonId)); setView('lesson'); return {lessonId:Number(lessonId),status:'opened'};
      },
    });
    return()=>lifecycle.abort();
  },[]);
  const active=lessons.find(x=>x.id===activeId)||lessons[0], complete=data.completed.length, nextId=nextLessonId(data.completed,data.moduleTests), current=nextId?lessons.find((item)=>item.id===nextId):undefined,streak=streakFor(data.studyDates),mastery=Math.round(complete/lessons.length*100),moduleDone=(id:number)=>lessons.filter(x=>x.module===id&&data.completed.includes(x.id)).length;
  const pendingAssessment=modules.find((module)=>moduleDone(module.id)===5&&!data.moduleTests.includes(module.id));
  const badges=[
    {title:'Primeiro passo',text:'Conclua sua primeira aula',icon:'✦',unlocked:complete>=1},
    {title:'Módulo em foco',text:'Conclua as 5 aulas de um módulo',icon:'◉',unlocked:modules.some(x=>moduleDone(x.id)===5)},
    {title:'Em movimento',text:'Conclua 10 aulas',icon:'↗',unlocked:complete>=10},
    {title:'Ritmo de estudo',text:'Estude por 5 dias seguidos',icon:'♨',unlocked:data.bestStreak>=5},
    {title:'Fórmulas na ponta',text:'Conclua as fórmulas iniciais',icon:'ƒx',unlocked:[6,7,8,9,10].every(x=>data.completed.includes(x))},
    {title:'Excel Explorer',text:'Conclua todo o curso',icon:'★',unlocked:complete===lessons.length}];
  const openLesson=(id:number)=>{
    const target=lessons.find((lesson)=>lesson.id===id);
    if(!target) return;
    const allowed=nextLessonId(data.completed,data.moduleTests);
    if(!data.completed.includes(id)&&id!==allowed){setNotice(target.module>1&&!data.moduleTests.includes(target.module-1)?`Conclua a avaliação do módulo ${target.module-1} para desbloquear esta etapa.`:'Conclua as aulas anteriores para desbloquear esta etapa.');return;}
    setActiveId(id);setView('lesson');setOpen(false);scrollTo({top:0,behavior:'smooth'});
  };
  const openAssessment=(module:number)=>{
    if(moduleDone(module)!==5){setNotice('Conclua as cinco aulas deste módulo antes da avaliação.');return;}
    setAssessmentModule(module);setView('assessment');setOpen(false);scrollTo({top:0,behavior:'smooth'});
  };
  const conclude=(id:number,flawless=false)=>{if(data.completed.includes(id))return;const t=today();setData(old=>{const dates=old.studyDates.includes(t)?old.studyDates:[...old.studyDates,t];const perfect=flawless?[...old.flawless,id]:old.flawless;return{...old,completed:[...old.completed,id],flawless:perfect,xp:old.xp+20+(flawless?10:0),studyDates:dates,bestStreak:Math.max(old.bestStreak,streakFor(dates))};});setNotice(flawless?'Perfeito! +30 XP e uma nova aula foi liberada.':'Aula concluída! +20 XP e uma nova aula foi liberada.');};
  const mistake=(id:number)=>setData(old=>old.mistakes.includes(id)?old:{...old,mistakes:[...old.mistakes,id]});
  const nav=[['home',Home,'Hoje'],['map',Grid2X2,'Trilha'],['review',CircleHelp,'Revisar'],['achievements',Trophy,'Conquistas'],['profile',UserRound,'Perfil']] as const;
  const logout=async()=>{try{await fetch('/api/auth/logout',{method:'POST'});}finally{window.location.assign('/login');}};
  return <main className="app-shell">
    <aside className={`sidebar ${open?'mobile-show':''}`} aria-label="Navegação principal">
      <button className="brand" onClick={()=>setView('home')}><span className="brand-mark">X</span><span>Excel<span>Quest</span></span></button>
      <div className="level-card"><div><span>Nível {Math.floor(data.xp/100)+1}</span><strong>Explorador de dados</strong></div><div className="level-track"><i style={{width:`${data.xp%100}%`}}/></div><small>{data.xp%100}/100 XP para o próximo nível</small></div>
      <nav>{nav.map(([key,Icon,label])=><button key={key} className={view===key?'active':''} onClick={()=>{setView(key);setOpen(false);}}><Icon size={19}/>{label}</button>)}</nav>
      <div className="sidebar-bottom">{currentUser.role==='superadmin'&&<button onClick={()=>{setView('admin');setOpen(false)}}><Settings size={19}/>Administração</button>}<button onClick={()=>setView('profile')}><Settings size={19}/>Preferências</button><button onClick={logout}><LogOut size={19}/>Sair</button><div className="mini-profile"><div className="avatar">{currentUser.username.slice(0,2).toUpperCase()}</div><div><b>{currentUser.username}</b><span>{currentUser.role}</span></div></div></div>
    </aside>
    <div className="mobile-bar"><button className="brand" onClick={()=>setView('home')}><span className="brand-mark">X</span><span>Excel<span>Quest</span></span></button><button className="menu-button" onClick={()=>setOpen(v=>!v)} aria-label="Abrir menu">{open?<X/>:<Grid2X2/>}</button></div>{open&&<button className="backdrop" aria-label="Fechar menu" onClick={()=>setOpen(false)}/>}
    <section className="workspace"><header className="topbar"><div className="crumb"><span>{view==='lesson'? `Módulo ${active.module}`:'Seu espaço de aprendizagem'}</span>{view==='lesson'&&<><ChevronRight size={15}/><b>Aula {active.id}</b></>}</div><div className="top-stats"><ThemeToggle/><Pill tone="gold"><Flame size={15}/>{streak||'—'} dias</Pill><Pill tone="blue"><Zap size={15}/>{data.xp} XP</Pill><button className="help" onClick={()=>setNotice('Dica: conclua as aulas em ordem para ganhar XP e liberar a próxima etapa.')}><CircleHelp size={19}/></button></div></header>
      {notice&&<output className="notice"><Sparkles size={17}/>{notice}<button onClick={()=>setNotice('')}><X size={16}/></button></output>}
      <div className="content-area">
        {view==='home'&&<Dashboard current={current} pendingAssessment={pendingAssessment?.id} complete={complete} xp={data.xp} streak={streak} mastery={mastery} moduleDone={moduleDone} dates={data.studyDates} now={renderDate} start={openLesson} startAssessment={openAssessment} map={()=>setView('map')}/>}
        {view==='map'&&<Path completed={data.completed} moduleTests={data.moduleTests} moduleDone={moduleDone} open={openLesson} openAssessment={openAssessment}/>}
        {view==='lesson'&&<LessonPage lesson={active} done={data.completed.includes(active.id)} conclude={conclude} mistake={mistake} open={openLesson} openAssessment={openAssessment}/>}
        {view==='assessment'&&<ModuleTest module={assessmentModule} passed={data.moduleTests.includes(assessmentModule)} onPass={(module)=>{setData((old)=>old.moduleTests.includes(module)?old:{...old,moduleTests:[...old.moduleTests,module],xp:old.xp+40});if(module<7){setActiveId(module*5+1);setView('lesson');setNotice('Avaliação aprovada! +40 XP e o próximo módulo foi liberado.');}else{setView('achievements');setNotice('Curso concluído! Você dominou toda a trilha.');}}} back={()=>setView('map')}/>}
        {view==='review'&&<Review ids={data.mistakes} open={openLesson}/>}
        {view==='achievements'&&<Badges list={badges}/>}
        {view==='profile'&&<Profile user={currentUser} data={data} complete={complete} streak={streak} mastery={mastery} badges={badges}/>} 
        {view==='admin'&&currentUser.role==='superadmin'&&<Admin notice={setNotice}/>} 
      </div>
    </section>
  </main>;
}

function Dashboard({current,pendingAssessment,complete,xp,streak,mastery,moduleDone,dates,now,start,startAssessment,map}:{current?:Lesson;pendingAssessment?:number;complete:number;xp:number;streak:number;mastery:number;moduleDone:(id:number)=>number;dates:string[];now:number;start:(id:number)=>void;startAssessment:(module:number)=>void;map:()=>void}) {
  const week=[0,1,2,3,4,5,6].map(i=>dates.includes(new Date(now-(6-i)*86400000).toISOString().slice(0,10)));
  const assessment=moduleAssessments.find((item)=>item.module===pendingAssessment);
  const courseDone=complete===lessons.length&&!pendingAssessment;
  const heroTitle=assessment?`Avaliação: ${assessment.title}`:courseDone?'Curso concluído — excelente trabalho!':`Aula ${current?.id}: ${current?.title}`;
  const heroDescription=assessment?'Você concluiu as aulas do módulo. Acerte ao menos 2 de 3 perguntas para liberar a próxima etapa.':courseDone?'Você percorreu as 35 aulas e as avaliações de módulo. Use a revisão para manter as habilidades em dia.':current?.goal||'Seu próximo desafio está pronto.';
  return <><Heading eyebrow="Continue sua jornada" title="Bom estudo, Explorador(a)!" action={<Pill tone="green"><Zap size={15}/> +20 XP por aula</Pill>}/><section className="hero-card"><div className="hero-copy"><span className="hero-tag">{assessment?'MOMENTO DE DOMÍNIO':courseDone?'JORNADA COMPLETA':'PRÓXIMA MISSÃO'}</span><h2>{heroTitle}</h2><p>{heroDescription}</p><div className="hero-actions">{assessment?<button className="primary" onClick={()=>startAssessment(assessment.module)}><Target size={17}/>Fazer avaliação</button>:courseDone?<button className="primary" onClick={map}><Trophy size={17}/>Ver minha trilha</button>:<button className="primary" onClick={()=>current&&start(current.id)}><Play size={17} fill="currentColor"/>Começar aula</button>}<span><Clock3 size={16}/> {assessment?'4–6 min':courseDone?'Revisão disponível':'6–10 min'}</span></div></div><div className="hero-visual" aria-hidden="true"><div className="formula-float">=SOMA(B2:B5)</div><div className="sheet-art"><span>Receita</span><b>R$ 4.870</b><i/><i/><i/><strong>↗ +12,4%</strong></div><div className="spark spark-a">✦</div><div className="spark spark-b">✦</div></div></section>
    <div className="metric-grid"><article><span><BookOpen/></span><div><b>{complete}<small>/{lessons.length} aulas</small></b><p>Concluídas</p></div><div className="mini-progress"><i style={{width:`${mastery}%`}}/></div></article><article><span className="orange"><Flame/></span><div><b>{streak}<small> dias</small></b><p>Sequência atual</p></div><div className="week">{week.map((hit,i)=><i className={hit?'done':''} key={i}/>)}</div></article><article><span className="purple"><Medal/></span><div><b>{xp}<small> XP</small></b><p>Experiência total</p></div><strong className="level-number">Nv. {Math.floor(xp/100)+1}</strong></article></div>
    <section className="progress-section"><div className="inline-title"><div><p>SUA TRILHA</p><h2>Progresso por módulo</h2></div><button className="text-button" onClick={map}>Ver mapa completo <ChevronRight size={16}/></button></div><div className="module-summary">{modules.map(m=><button key={m.id} onClick={map}><span style={{background:m.color}}>{m.icon}</span><div><b>{m.title}</b><small>{moduleDone(m.id)}/5 aulas</small></div><i><em style={{width:`${moduleDone(m.id)*20}%`,background:m.color}}/></i></button>)}</div></section>
  </>;
}
function Path({completed,moduleTests,moduleDone,open,openAssessment}:{completed:number[];moduleTests:number[];moduleDone:(id:number)=>number;open:(id:number)=>void;openAssessment:(module:number)=>void}) {
  const current=nextLessonId(completed,moduleTests);
  return <><Heading eyebrow="Mapa de aprendizado" title="Sua trilha de Excel" action={<Pill tone="green"><Check size={14}/>{completed.length}/35 concluídas</Pill>}/><p className="page-intro">Cada etapa é curta e prática. Conclua as aulas em sequência e passe na avaliação do módulo para liberar a próxima etapa.</p><div className="learning-map">{modules.map(m=>{const list=lessons.filter(x=>x.module===m.id),moduleOpen=m.id===1||moduleTests.includes(m.id-1),passed=moduleTests.includes(m.id);return <section className="module-block" key={m.id} style={{'--module':m.color} as React.CSSProperties}><header><div className="module-icon">{m.icon}</div><div><span>MÓDULO {m.id} · {list[0].level.toUpperCase()}</span><h2>{m.title}</h2><p>{m.subtitle}</p></div><Pill>{moduleDone(m.id)}/5</Pill></header><div className="lesson-nodes">{list.map((l,i)=>{const done=completed.includes(l.id),active=l.id===current,locked=!moduleOpen||(!done&&l.id!==current);return <button disabled={locked} onClick={()=>open(l.id)} className={`lesson-node ${done?'done':''} ${active?'current':''} ${locked?'locked':''}`} key={l.id}><span>{done?<Check size={20}/>:locked?<Lock size={17}/>:l.id}</span><div><b>{l.title}</b><small>{done?'Concluída':active?'Pronta para começar':`${i+1}ª aula do módulo`}</small></div>{active&&<em>COMEÇAR</em>}</button>})}</div>{moduleDone(m.id)===5&&<div className="module-test"><Trophy size={18}/><span>{passed?'Avaliação aprovada — módulo dominado.':'Avaliação do módulo liberada — acerte 2 de 3 perguntas para avançar.'}</span>{!passed&&<button onClick={()=>openAssessment(m.id)}>Fazer avaliação <ChevronRight size={14}/></button>}</div>}</section>})}</div></>;
}
function LessonPage({lesson,done,conclude,mistake,open,openAssessment}:{lesson:Lesson;done:boolean;conclude:(id:number,flawless?:boolean)=>void;mistake:(id:number)=>void;open:(id:number)=>void;openAssessment:(module:number)=>void}) {
 const [tab,setTab]=useState<'learn'|'practice'|'quiz'>('learn'),[answer,setAnswer]=useState<number|null>(null),[checked,setChecked]=useState(false),[hadMistake,setHadMistake]=useState(false);useEffect(()=>{setTab('learn');setAnswer(null);setChecked(false);setHadMistake(false)},[lesson.id]);const correct=answer===lesson.answer;
 const check=()=>{if(checked&&!correct){setChecked(false);setAnswer(null);return;}if(answer===null)return;setChecked(true);if(!correct){setHadMistake(true);mistake(lesson.id);}};
 return <div className="lesson-page"><button className="back-link" onClick={()=>history.back()}><ChevronLeft size={17}/> Voltar à trilha</button><div className="lesson-header"><div><div className="lesson-meta"><Pill tone="green">Módulo {lesson.module}</Pill><span>Aula {lesson.id} de {lessons.length}</span><span>·</span><span>{lesson.level}</span></div><h1>{lesson.title}</h1><p>{lesson.goal}</p></div><div className="lesson-xp"><Zap size={18}/><b>{done?'Concluída':'+20 XP'}</b><small>{done?'Você já domina esta aula':'ao finalizar'}</small></div></div>
 <div className="lesson-tabs"><button className={tab==='learn'?'selected':''} onClick={()=>setTab('learn')}>1. Aprender</button><button className={tab==='practice'?'selected':''} onClick={()=>setTab('practice')}>2. Praticar</button><button className={tab==='quiz'?'selected':''} onClick={()=>setTab('quiz')}>3. Desafio</button></div>
 {tab==='learn'&&<div className="lesson-grid"><article className="lesson-card theory"><span className="eyebrow">OBJETIVO</span><h2>Ao final desta aula você vai conseguir</h2><p>{lesson.goal}</p><div className="concept"><span><BookOpen size={19}/></span><div><b>Entenda o conceito</b><p>{lesson.theory}</p></div></div><div className="example-box"><div><span>EXEMPLO PRÁTICO</span><b>{lesson.example}</b></div>{lesson.formula&&<code>{lesson.formula}</code>}<div className="example-result"><span>Resultado esperado</span><strong>{lesson.result}</strong></div></div><button className="primary" onClick={()=>setTab('practice')}>Ir para a prática <ChevronRight size={17}/></button></article><Demo lesson={lesson}/></div>}
 {tab==='practice'&&<Practice lesson={lesson} next={()=>setTab('quiz')}/>}
 {tab==='quiz'&&<article className="quiz-card"><div className="quiz-heading"><span><Target size={23}/></span><div><p>DESAFIO INDEPENDENTE</p><h2>Mostre que entendeu</h2></div><Pill tone="gold">+10 XP bônus sem erros</Pill></div><p className="question">{lesson.question}</p><div className="answers">{lesson.options.map((o,i)=><button key={o} disabled={checked} onClick={()=>setAnswer(i)} className={`${answer===i?'selected':''} ${checked&&i===lesson.answer?'correct':''} ${checked&&answer===i&&!correct?'incorrect':''}`}><span>{String.fromCharCode(65+i)}</span>{o}{checked&&i===lesson.answer&&<Check/>}</button>)}</div>{checked&&<div className={`feedback ${correct?'success':'error'}`}><span>{correct?<Check/>:<CircleHelp/>}</span><div><b>{correct?'Resposta correta!':'Ainda não é isso.'}</b><p>{lesson.feedback}</p></div></div>}<div className="quiz-actions">{checked&&correct?<button className="primary" onClick={()=>{conclude(lesson.id,!hadMistake);if(lesson.id%5===0)setTimeout(()=>openAssessment(lesson.module),350);else{const next=lessons[lesson.id];if(next)setTimeout(()=>open(next.id),350)}}}>{lesson.id%5===0?'Ir para a avaliação':'Concluir e continuar'} <ChevronRight size={17}/></button>:<button className="primary" disabled={answer===null} onClick={check}>{checked?'Tentar novamente':'Conferir resposta'}</button>}{done&&<span className="already-done"><Check size={16}/> Aula já concluída</span>}</div></article>}
 </div>;
}
function Demo({lesson}:{lesson:Lesson}) {const [step,setStep]=useState(0);useEffect(()=>setStep(0),[lesson.id]);return <aside className="demo-card"><div className="video-top"><span><Play size={15} fill="currentColor"/> Demonstração guiada</span><small>1:20</small></div><div className="demo-screen"><div className="fake-ribbon"><i/><i/><i/><i/></div><div className="demo-sheet"><div className="demo-cell active">{step===0?'B6':step===1?lesson.formula||'Dados':lesson.result}</div><div className="demo-gridlines">{Array.from({length:20}).map((_,i)=><i key={i}/>)}</div></div><div className="caption">{lesson.steps[step]}</div></div><div className="demo-controls"><div>{lesson.steps.map((_,i)=><i className={i<=step?'active':''} key={i}/>)}</div><button onClick={()=>setStep(s=>Math.min(s+1,lesson.steps.length-1))} disabled={step===lesson.steps.length-1}>{step===lesson.steps.length-1?'Demonstração concluída':'Próximo passo'} <ChevronRight size={15}/></button></div><p className="transcript"><b>Transcrição:</b> esta demonstração mostra uma forma de aplicar o conceito. Você pode rever cada passo antes de praticar.</p></aside>;}
function Practice({lesson,next}:{lesson:Lesson;next:()=>void}) {const [cells,setCells]=useState(initialCells),[selected,setSelected]=useState('B6'),[entry,setEntry]=useState('=SOMA(B2:B5)'),[result,setResult]=useState('');const cols=['A','B','C','D'],rows=[1,2,3,4,5,6];const select=(ref:string)=>{setSelected(ref);setEntry(cells[ref]||'');setResult('')};const apply=()=>{setCells(old=>({...old,[selected]:entry}));setResult(calculate(entry,cells));};return <div className="practice-layout"><article className="practice-card"><div className="practice-heading"><div><span className="eyebrow">LABORATÓRIO DE FÓRMULAS</span><h2>Pratique no simulador</h2><p>Selecione uma célula, edite o conteúdo e execute. Ele calcula as funções listadas no guia.</p></div><Pill tone="blue">Simulador ativo</Pill></div><div className="formula-bar"><b>{selected}</b><span>ƒx</span><input aria-label="Barra de fórmulas" value={entry} onChange={e=>setEntry(e.target.value)} onKeyDown={e=>e.key==='Enter'&&apply()}/><button onClick={apply}>Executar</button></div><div className="spreadsheet" aria-label="Planilha interativa"><div className="corner"/>{cols.map(c=><div className="column-label" key={c}>{c}</div>)}{rows.flatMap(row=>[<div className="row-label" key={'r'+row}>{row}</div>,...cols.map(col=>{const ref=col+row;return <button aria-label={'Célula '+ref} className={selected===ref?'selected-cell':''} key={ref} onClick={()=>select(ref)}>{cells[ref]||''}</button>})])}</div>{result&&<div className={`calc-result ${result.startsWith('⚠')?'error':''}`}><span>{result.startsWith('⚠')?<CircleHelp/>:<Check/>}</span><div><b>{result.startsWith('⚠')?'Verifique a fórmula':'Resultado calculado'}</b><p>{result}</p></div></div>}</article><aside className="practice-guide"><h3>Missão da aula</h3><p>{lesson.formula?`Use ${lesson.formula} em uma célula vazia e observe o efeito.`:'Explore os dados da tabela e aplique a ferramenta explicada.'}</p><div><b>Funções executadas aqui</b>{simulatorHelp.map(t=><p key={t}>• {t}</p>)}</div><button className="primary" onClick={next}>Ir para o desafio <ChevronRight size={17}/></button></aside></div>;}
function ModuleTest({module,passed,onPass,back}:{module:number;passed:boolean;onPass:(module:number)=>void;back:()=>void}) {
  const assessment=moduleAssessments.find((item)=>item.module===module)??moduleAssessments[0];
  const [answers,setAnswers]=useState<(number|null)[]>(()=>assessment.questions.map(()=>null));
  const [checked,setChecked]=useState(false);
  useEffect(()=>{setAnswers(assessment.questions.map(()=>null));setChecked(false);},[module]);
  const score=answers.reduce<number>((total,answer,index)=>total+(answer===assessment.questions[index].answer?1:0),0);
  const passedNow=score>=2;
  return <div className="assessment-page"><button className="back-link" onClick={back}><ChevronLeft size={17}/> Voltar à trilha</button><article className="quiz-card module-assessment"><div className="quiz-heading"><span><Trophy size={23}/></span><div><p>AVALIAÇÃO DO MÓDULO {module}</p><h2>{assessment.title}</h2></div><Pill tone="gold">+40 XP ao aprovar</Pill></div><p className="assessment-intro">Responda às três questões. Você precisa acertar pelo menos duas para liberar o próximo módulo.</p>{assessment.questions.map((question,index)=><section className="assessment-question" key={question.question}><b>{index+1}. {question.question}</b><div className="answers">{question.options.map((option,optionIndex)=><button key={option} disabled={checked||passed} onClick={()=>setAnswers((old)=>old.map((answer,position)=>position===index?optionIndex:answer))} className={`${answers[index]===optionIndex?'selected':''} ${checked&&optionIndex===question.answer?'correct':''} ${checked&&answers[index]===optionIndex&&answers[index]!==question.answer?'incorrect':''}`}><span>{String.fromCharCode(65+optionIndex)}</span>{option}{checked&&optionIndex===question.answer&&<Check/>}</button>)}</div>{checked&&<p className={answers[index]===question.answer?'answer-note good':'answer-note'}>{question.explanation}</p>}</section>)}{checked&&<div className={`feedback ${passedNow?'success':'error'}`}><span>{passedNow?<Check/>:<CircleHelp/>}</span><div><b>{passedNow?'Módulo aprovado!':'Quase lá — revise e tente outra vez.'}</b><p>Você acertou {score} de {assessment.questions.length}. {passedNow?'A próxima etapa está liberada.':'São necessários pelo menos 2 acertos para avançar.'}</p></div></div>}<div className="quiz-actions">{passed||checked&&passedNow?<button className="primary" onClick={()=>onPass(module)}>{passed?'Continuar na trilha':module===7?'Concluir curso':'Liberar próximo módulo'} <ChevronRight size={17}/></button>:<button className="primary" disabled={answers.some((answer)=>answer===null)} onClick={()=>checked?setChecked(false):setChecked(true)}>{checked?'Tentar novamente':'Conferir avaliação'}</button>}</div></article></div>;
}
function Review({ids,open}:{ids:number[];open:(id:number)=>void}) {const list=lessons.filter(x=>ids.includes(x.id));return <><Heading eyebrow="Revisão inteligente" title="Volte mais forte"/><p className="page-intro">Aqui ficam as aulas em que você errou uma questão. Rever é parte do processo — e também rende XP quando você concluir de novo.</p>{list.length?<div className="review-list">{list.map(l=><article key={l.id}><span><CircleHelp/></span><div><Pill>Módulo {l.module}</Pill><h2>{l.title}</h2><p>{l.goal}</p></div><button className="secondary" onClick={()=>open(l.id)}>Revisar <ChevronRight size={16}/></button></article>)}</div>:<div className="empty-state"><div>✓</div><h2>Nenhum erro para revisar</h2><p>Quando uma resposta não estiver certa, ela aparecerá aqui com um caminho de volta para a aula.</p><button className="primary" onClick={()=>open(1)}>Explorar a primeira aula</button></div>}</>;}
function Badges({list}:{list:{title:string;text:string;icon:string;unlocked:boolean}[]}) {return <><Heading eyebrow="Suas conquistas" title="Cada avanço conta" action={<Pill tone="gold"><Trophy size={15}/>{list.filter(x=>x.unlocked).length}/{list.length}</Pill>}/><div className="achievements-grid">{list.map(item=><article className={item.unlocked?'unlocked':''} key={item.title}><span>{item.icon}</span><div><h2>{item.title}</h2><p>{item.text}</p></div><b>{item.unlocked?<><Check size={15}/> Conquistada</>:<><Lock size={14}/> Em progresso</>}</b></article>)}</div></>;}
function Profile({user,data,complete,streak,mastery,badges}:{user:CurrentUser;data:Saved;complete:number;streak:number;mastery:number;badges:{unlocked:boolean}[]}) {return <><Heading eyebrow="Perfil de aprendizagem" title="Seu progresso, em números"/><div className="profile-hero"><div className="avatar large">{user.username.slice(0,2).toUpperCase()}</div><div><h2>{user.username}</h2><p>{user.role} · Nível {Math.floor(data.xp/100)+1}</p><div><Pill tone="blue"><Zap size={14}/>{data.xp} XP</Pill><Pill tone="gold"><Flame size={14}/>{streak} dias seguidos</Pill></div></div></div>{user.mustChangePassword&&<div className="admin-alert"><Lock size={18}/><div><b>Troca de senha recomendada</b><p>Esta conta usa uma senha inicial. Defina uma senha exclusiva antes de continuar.</p></div></div>}<div className="profile-stats"><article><b>{mastery}%</b><span>Domínio do curso</span></article><article><b>{complete}</b><span>Aulas concluídas</span></article><article><b>{badges.filter(x=>x.unlocked).length}</b><span>Conquistas</span></article><article><b>{data.bestStreak}</b><span>Melhor sequência</span></article></div><div className="profile-security"><PasswordForm/></div><section className="activity-card"><h2>Como o sistema registra seu avanço</h2><p>XP é concedido uma única vez por aula concluída. A sequência só cresce em dias com uma atividade válida concluída, usando o fuso local do seu dispositivo.</p><div className="activity-rule"><Check/> <span>O progresso é associado à sua conta autenticada e salvo no banco de dados.</span></div></section></>;}

function PasswordForm(){const [currentPassword,setCurrentPassword]=useState(''),[newPassword,setNewPassword]=useState(''),[message,setMessage]=useState(''),[pending,setPending]=useState(false);const submit=async(e:React.SyntheticEvent<HTMLFormElement>)=>{e.preventDefault();setPending(true);setMessage('');try{const r=await fetch('/api/auth/password',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({currentPassword,newPassword})}),v=await r.json().catch(()=>({}));if(!r.ok){setMessage(v.error||'Não foi possível alterar a senha.');return;}setMessage('Senha atualizada. Entre novamente para continuar.');setTimeout(()=>window.location.assign('/login'),850);}catch{setMessage('Não foi possível conectar ao sistema.');}finally{setPending(false);}};return <form className="password-form" onSubmit={submit}><h2>Segurança da conta</h2><p>Altere sua senha. Por segurança, todas as sessões serão encerradas.</p><label>Senha atual<input type="password" autoComplete="current-password" value={currentPassword} onChange={e=>setCurrentPassword(e.target.value)} required disabled={pending}/></label><label>Nova senha (mínimo de 12 caracteres)<input type="password" autoComplete="new-password" minLength={12} value={newPassword} onChange={e=>setNewPassword(e.target.value)} required disabled={pending}/></label>{message&&<output className="form-message">{message}</output>}<button className="primary" disabled={pending}>{pending?'Atualizando...':'Alterar senha'}</button></form>}

type ManagedUser={id:string;username:string;role:string;active:boolean;must_change_password:boolean};
function Admin({notice}:{notice:(s:string)=>void}) {const [users,setUsers]=useState<ManagedUser[]>([]),[loading,setLoading]=useState(true),[username,setUsername]=useState(''),[password,setPassword]=useState(''),[role,setRole]=useState('collaborator'),[pending,setPending]=useState(false);const load=()=>{setLoading(true);fetch('/api/admin/users').then(async r=>{const v=await r.json();if(!r.ok)throw new Error(v.error);setUsers(v.users||[]);}).catch(()=>notice('Não foi possível carregar os usuários.')).finally(()=>setLoading(false));};useEffect(()=>{load();},[]);const create=async(e:React.SyntheticEvent<HTMLFormElement>)=>{e.preventDefault();setPending(true);try{const r=await fetch('/api/admin/users',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({username,password,role})}),v=await r.json();if(!r.ok){notice(v.error||'Não foi possível criar o usuário.');return;}setUsername('');setPassword('');setRole('collaborator');notice('Usuário criado. A troca de senha será solicitada no primeiro acesso.');load();}catch{notice('Não foi possível conectar ao sistema.');}finally{setPending(false);}};const changeStatus=async(user:ManagedUser)=>{try{const r=await fetch(`/api/admin/users/${user.id}`,{method:'PATCH',headers:{'content-type':'application/json'},body:JSON.stringify({active:!user.active})}),v=await r.json();if(!r.ok){notice(v.error||'Não foi possível atualizar o usuário.');return;}notice(user.active?'Usuário desativado e sessões encerradas.':'Usuário reativado.');load();}catch{notice('Não foi possível conectar ao sistema.');}};return <><Heading eyebrow="Administração" title="Usuários e acesso"/><div className="admin-alert"><Lock size={18}/><div><b>Área administrativa protegida</b><p>As ações desta tela também são verificadas no servidor. Senhas nunca são exibidas ou registradas.</p></div></div><div className="admin-grid"><section><h2>Novo usuário</h2><form onSubmit={create}><label>Nome de usuário<input value={username} maxLength={64} onChange={e=>setUsername(e.target.value)} required/></label><label>Senha temporária<input value={password} type="password" minLength={12} autoComplete="new-password" onChange={e=>setPassword(e.target.value)} required/></label><label>Perfil<select value={role} onChange={e=>setRole(e.target.value)}><option value="collaborator">Colaborador</option><option value="manager">Gestor</option><option value="admin">Administrador</option><option value="superadmin">Superadministrador</option></select></label><button className="primary" disabled={pending}>{pending?'Criando...':'Criar usuário'}</button></form></section><section><h2>Contas cadastradas</h2>{loading?<p className="admin-empty">Carregando usuários...</p>:users.map(user=><div className="admin-row" key={user.id}><span>{user.username.slice(0,2).toUpperCase()}</span><div><b>{user.username} {!user.active&&'· desativado'}</b><small>{user.role}{user.must_change_password?' · troca de senha pendente':''}</small></div><button onClick={()=>changeStatus(user)}>{user.active?'Desativar':'Reativar'}</button></div>)}{!loading&&!users.length&&<p className="admin-empty">Nenhum usuário encontrado.</p>}</section></div></>;}
